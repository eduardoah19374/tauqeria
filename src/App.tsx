import React, { useState, useEffect } from "react";
import {
  Utensils,
  ChefHat,
  TrendingUp,
  Clock,
  Sparkles,
  RefreshCw,
  Bell,
  CheckCircle,
  HelpCircle,
  AlertCircle
} from "lucide-react";
import { Order, Waiter, Cook, OrderItem, TaqueriaStats } from "./types";
import { WaiterStation } from "./components/WaiterStation";
import { KitchenStation } from "./components/KitchenStation";
import { OwnerDashboard } from "./components/OwnerDashboard";

export default function App() {
  // Navigation Active view
  const [activeTab, setActiveTab] = useState<"waiter" | "kitchen" | "owner">("owner");

  // Server Entities State
  const [orders, setOrders] = useState<Order[]>([]);
  const [waiters, setWaiters] = useState<Waiter[]>([]);
  const [cooks, setCooks] = useState<Cook[]>([]);
  const [stats, setStats] = useState<TaqueriaStats>({
    totalRevenue: 3480,
    completedOrders: 42,
    averagePrepTimeMinutes: 8,
    popularTacos: [
      { name: "Al Pastor", count: 86 },
      { name: "Suadero", count: 54 },
      { name: "Bistec", count: 42 },
      { name: "Campechano (Bistec + Chorizo)", count: 31 },
      { name: "Gringa al Pastor (Con Queso)", count: 24 }
    ],
    activeOrdersToday: 0
  });

  // Connection and interactive states
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ msg: string; type: "success" | "info" } | null>(null);

  // Sync utilities
  const syncServerEntities = async (silent = false) => {
    if (!silent) setIsRefreshing(true);
    try {
      const [ordersRes, waitersRes, cooksRes, statsRes] = await Promise.all([
        fetch("/api/orders"),
        fetch("/api/waiters"),
        fetch("/api/cooks"),
        fetch("/api/stats")
      ]);

      if (!ordersRes.ok || !waitersRes.ok || !cooksRes.ok || !statsRes.ok) {
        throw new Error("Respuesta de servidor no satisfactoria.");
      }

      const ordersData = await ordersRes.json();
      const waitersData = await waitersRes.json();
      const cooksData = await cooksRes.json();
      const statsData = await statsRes.json();

      setOrders(ordersData);
      setWaiters(waitersData);
      setCooks(cooksData);
      setStats(statsData);
      setServerError(null);
    } catch (err: any) {
      console.warn("Fallo conexion del backend. Operando con estado local offline-first.", err);
      setServerError("Operando con base de datos local simulada. Levante el servidor tsx para tiempo real.");
    } finally {
      if (!silent) setIsRefreshing(false);
    }
  };

  // Poll server for active real-time updates of orders/stats
  useEffect(() => {
    // Initial sync
    syncServerEntities();

    // Setup active poll
    const interval = setInterval(() => {
      syncServerEntities(true); // silent syncing background
    }, 2800);

    return () => clearInterval(interval);
  }, []);

  // Post notifications helper
  const triggerNotification = (msg: string, type: "success" | "info" = "success") => {
    setNotification({ msg, type });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  // Actions

  const handleAddWaiter = async (name: string) => {
    try {
      const res = await fetch("/api/waiters", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name })
      });
      if (res.ok) {
        triggerNotification(`¡Mesero ${name} registrado con éxito!`);
        await syncServerEntities(true);
      }
    } catch (e) {
      // Local fallback
      const mockNew: Waiter = {
        id: "w-mock-" + Math.random(),
        name,
        status: "Activo",
        ordersCount: 0,
        totalSales: 0
      };
      setWaiters([...waiters, mockNew]);
    }
  };

  const handleAddCook = async (name: string) => {
    try {
      const res = await fetch("/api/cooks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name })
      });
      if (res.ok) {
        triggerNotification(`¡Chef papitas ${name} agregado a las parrillas!`);
        await syncServerEntities(true);
      }
    } catch (e) {
      const mockNew: Cook = {
        id: "c-mock-" + Math.random(),
        name,
        status: "Disponible",
        activeOrdersCount: 0,
        completedOrdersCount: 0
      };
      setCooks([...cooks, mockNew]);
    }
  };

  const handleCreateOrder = async (table: string, waiterId: string, items: OrderItem[], notes: string) => {
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ table, waiterId, items, notes })
      });
      if (res.ok) {
        triggerNotification(`Pedido para ${table} enviado a las brasas 🔥`);
        await syncServerEntities(true);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, status: Order["status"]) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        triggerNotification(`Comanda ${orderId} actualizada a: ${status}`);
        await syncServerEntities(true);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpdateOrderStatusWithCook = async (orderId: string, status: Order["status"], cookId: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, cookId })
      });
      if (res.ok) {
        const cookName = cooks.find(c => c.id === cookId)?.name || "Cocinero";
        triggerNotification(
          status === "Listo"
            ? `¡Comanda ${orderId} terminada por ${cookName}! 🌮`
            : `${cookName} tomó comanda ${orderId}`,
          status === "Listo" ? "success" : "info"
        );
        await syncServerEntities(true);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleTriggerSimulator = async () => {
    try {
      const res = await fetch("/api/orders/simulate", { method: "POST" });
      if (res.ok) {
        const orderData = await res.json();
        triggerNotification(
          `📞 Cliente Nuevo en la ${orderData.table}! (${orderData.waiterName} tomó orden) - $${orderData.total}`,
          "info"
        );
        await syncServerEntities(true);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Status counters for dashboard highlights
  const totalOutstanding = orders.filter(o => o.status !== "Pagado").length;
  const readyToServeCount = orders.filter(o => o.status === "Listo").length;

  return (
    <div className="min-h-screen flex flex-col transition-colors duration-300">
      
      {/* Dynamic Notifications Alerts */}
      {notification && (
        <div className="fixed bottom-5 right-5 z-50 max-w-sm bg-stone-900 border border-stone-800 text-white rounded-2xl p-4 shadow-xl flex items-center gap-3 animate-slide-up transition-all duration-300">
          {notification.type === "success" ? (
            <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400 shrink-0 border border-emerald-500/20">
              <CheckCircle className="w-5 h-5" />
            </div>
          ) : (
            <div className="w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-400 shrink-0 border border-amber-500/20 animate-bounce">
              <Bell className="w-5 h-5" />
            </div>
          )}
          <div className="flex flex-col">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400">Notificación en Vivo</span>
            <span className="text-xs text-stone-200 mt-0.5 leading-relaxed font-semibold">
              {notification.msg}
            </span>
          </div>
        </div>
      )}

      {/* Main Top Header */}
      <header className="bg-white border-b border-stone-200 sticky top-0 z-40 px-4 py-3 md:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Logo & Status */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center text-stone-950 font-black text-lg shadow-sm border border-amber-600/20">
              🌮
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="font-display font-black text-lg text-stone-900 tracking-tight">
                  El Pastorcito
                </h1>
                <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-[9px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded-full flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                  Servicio Abierto
                </span>
              </div>
              <p className="text-[10px] text-stone-400 font-medium uppercase tracking-wider">
                Sistema de Gestión en Tiempo Real
              </p>
            </div>
          </div>

          {/* Navigation Controls for Stations */}
          <div className="bg-stone-100 p-1 rounded-xl flex items-center gap-1 border border-stone-200/80">
            <button
              onClick={() => setActiveTab("owner")}
              className={`px-4 py-1.5 text-xs font-extrabold rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === "owner"
                  ? "bg-stone-900 text-white shadow-xs"
                  : "text-stone-600 hover:text-stone-950 hover:bg-stone-200/60"
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              Dueño Dashboard
            </button>

            <button
              onClick={() => setActiveTab("waiter")}
              className={`px-4 py-1.5 text-xs font-extrabold rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === "waiter"
                  ? "bg-amber-500 text-stone-950 shadow-xs"
                  : "text-stone-600 hover:text-stone-950 hover:bg-stone-200/60"
              }`}
            >
              <Utensils className="w-3.5 h-3.5" />
              Meseros ({waiters.length})
              {readyToServeCount > 0 && (
                <span className="bg-red-500 text-white font-mono text-[9px] w-4.5 h-4.5 rounded-full flex items-center justify-center animate-bounce shrink-0">
                  {readyToServeCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab("kitchen")}
              className={`px-4 py-1.5 text-xs font-extrabold rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === "kitchen"
                  ? "bg-orange-500 text-white shadow-xs"
                  : "text-stone-600 hover:text-stone-950 hover:bg-stone-200/60"
              }`}
            >
              <ChefHat className="w-3.5 h-3.5" />
              Cocina ({orders.filter(o => o.status === "Pendiente" || o.status === "Preparando").length})
            </button>
          </div>

          {/* Sync & Indicator Button */}
          <div className="flex items-center gap-3 shrink-0">
            {isRefreshing ? (
              <span className="text-[10px] text-stone-400 font-mono flex items-center gap-1">
                <RefreshCw className="w-3 h-3 animate-spin" /> sincronizando...
              </span>
            ) : (
              <button
                onClick={() => syncServerEntities(false)}
                className="text-[10px] text-stone-500 hover:text-stone-900 font-mono bg-stone-50 hover:bg-stone-100 border border-stone-200/80 px-2.5 py-1 rounded-lg flex items-center gap-1 transition-all"
              >
                <RefreshCw className="w-3 h-3" /> sincronizado
              </button>
            )}
          </div>

        </div>
      </header>

      {/* Main Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-8 flex flex-col gap-6 animate-fade-in">
        
        {/* Offline fallback warning banner */}
        {serverError && (
          <div className="bg-amber-50 border border-amber-200 text-amber-900 rounded-xl p-3 text-xs flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
            <span className="font-semibold">{serverError}</span>
          </div>
        )}

        {/* Dynamic Station Render based on Navigation Active Tab */}
        {activeTab === "waiter" && (
          <WaiterStation
            orders={orders}
            waiters={waiters}
            onCreateOrder={handleCreateOrder}
            onUpdateOrderStatus={handleUpdateOrderStatus}
            onAddWaiter={handleAddWaiter}
          />
        )}

        {activeTab === "kitchen" && (
          <KitchenStation
            orders={orders}
            cooks={cooks}
            onUpdateOrderStatusWithCook={handleUpdateOrderStatusWithCook}
            onAddCook={handleAddCook}
          />
        )}

        {activeTab === "owner" && (
          <OwnerDashboard
            orders={orders}
            waiters={waiters}
            cooks={cooks}
            stats={stats}
            onRefreshStats={() => syncServerEntities(false)}
            onTriggerSimulator={handleTriggerSimulator}
          />
        )}

      </main>

      {/* Footer information */}
      <footer className="bg-white border-t border-stone-200 mt-12 py-6 text-center text-xs text-stone-400 font-medium">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span>🌮 Taquería "El Pastorcito" — Con todo, con cebolla y cilantro en tiempo real.</span>
          <span>Desarrollado en AI Studio Build de Google Cloud</span>
        </div>
      </footer>

    </div>
  );
}
