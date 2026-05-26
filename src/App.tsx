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

  // Server Entities State - Initialized with high-fidelity seed data to prevent empty-UI lag!
  const [orders, setOrders] = useState<Order[]>([
    {
      id: "ord-101",
      table: "Mesa 4",
      waiterId: "m1",
      waiterName: "Don Juan",
      cookId: "c1",
      cookName: "Don Chuy",
      items: [
        {
          tacoId: "pastor",
          name: "Al Pastor",
          quantity: 5,
          price: 18,
          options: { onion: true, cilantro: true, salsa: "Roja (Súper Picosa)", doubleTortilla: false, extraQueso: false }
        },
        {
          tacoId: "bistec",
          name: "Bistec",
          quantity: 3,
          price: 20,
          options: { onion: true, cilantro: false, salsa: "Verde (Pica Poco)", doubleTortilla: true, extraQueso: true }
        },
        {
          tacoId: "refresco",
          name: "Refresco Mexicana 500ml",
          quantity: 2,
          price: 25,
          options: { onion: false, cilantro: false, salsa: "Ninguna", doubleTortilla: false, extraQueso: false }
        }
      ],
      status: "Pagado",
      createdAt: new Date(Date.now() - 45 * 60000).toISOString(),
      updatedAt: new Date(Date.now() - 15 * 60000).toISOString(),
      total: 200,
      notes: "Tacos de bistec bien cocidos"
    },
    {
      id: "ord-102",
      table: "Mesa 1",
      waiterId: "m2",
      waiterName: "Sofía",
      cookId: "c2",
      cookName: "Doña Lupe",
      items: [
        {
          tacoId: "suadero",
          name: "Suadero",
          quantity: 4,
          price: 18,
          options: { onion: true, cilantro: true, salsa: "Verde (Pica Poco)", doubleTortilla: false, extraQueso: false }
        },
        {
          tacoId: "agua-horchata",
          name: "Agua de Horchata Grande",
          quantity: 1,
          price: 28,
          options: { onion: false, cilantro: false, salsa: "Ninguna", doubleTortilla: false, extraQueso: false }
        }
      ],
      status: "Listo",
      createdAt: new Date(Date.now() - 25 * 60000).toISOString(),
      updatedAt: new Date(Date.now() - 5 * 60000).toISOString(),
      total: 100,
      notes: ""
    },
    {
      id: "ord-103",
      table: "Mesa 3",
      waiterId: "m3",
      waiterName: "Carlos",
      cookId: "c3",
      cookName: "Mateo",
      items: [
        {
          tacoId: "campechano",
          name: "Campechano (Bistec + Chorizo)",
          quantity: 3,
          price: 22,
          options: { onion: true, cilantro: true, salsa: "Habanero (Fuego)", doubleTortilla: true, extraQueso: false }
        },
        {
          tacoId: "gringa",
          name: "Gringa al Pastor (Con Queso)",
          quantity: 2,
          price: 35,
          options: { onion: true, cilantro: true, salsa: "Roja (Súper Picosa)", doubleTortilla: false, extraQueso: false }
        },
        {
          tacoId: "agua-jamaica",
          name: "Agua de Jamaica Grande",
          quantity: 2,
          price: 28,
          options: { onion: false, cilantro: false, salsa: "Ninguna", doubleTortilla: false, extraQueso: false }
        }
      ],
      status: "Preparando",
      createdAt: new Date(Date.now() - 12 * 60000).toISOString(),
      updatedAt: new Date(Date.now() - 10 * 60000).toISOString(),
      total: 192,
      notes: "Gringas doraditas"
    },
    {
      id: "ord-104",
      table: "Mesa 6",
      waiterId: "m1",
      waiterName: "Don Juan",
      items: [
        {
          tacoId: "tripa",
          name: "Tripa de Cerdo",
          quantity: 4,
          price: 24,
          options: { onion: true, cilantro: true, salsa: "Roja (Súper Picosa)", doubleTortilla: true, extraQueso: false }
        }
      ],
      status: "Pendiente",
      createdAt: new Date(Date.now() - 3 * 60000).toISOString(),
      updatedAt: new Date(Date.now() - 3 * 60000).toISOString(),
      total: 96,
      notes: "Tripa bien dorada, casi quemada por favor"
    }
  ]);

  const [waiters, setWaiters] = useState<Waiter[]>([
    { id: "m1", name: "Don Juan", status: "Activo", ordersCount: 14, totalSales: 2150 },
    { id: "m2", name: "Sofía", status: "Activo", ordersCount: 8, totalSales: 1240 },
    { id: "m3", name: "Carlos", status: "Activo", ordersCount: 11, totalSales: 1680 }
  ]);

  const [cooks, setCooks] = useState<Cook[]>([
    { id: "c1", name: "Don Chuy", status: "Disponible", activeOrdersCount: 0, completedOrdersCount: 22 },
    { id: "c2", name: "Doña Lupe", status: "Disponible", activeOrdersCount: 0, completedOrdersCount: 18 },
    { id: "c3", name: "Mateo", status: "Disponible", activeOrdersCount: 0, completedOrdersCount: 12 }
  ]);

  const [stats, setStats] = useState<TaqueriaStats>({
    totalRevenue: 3978,
    completedOrders: 44,
    averagePrepTimeMinutes: 10,
    popularTacos: [
      { name: "Al Pastor", count: 91 },
      { name: "Suadero", count: 58 },
      { name: "Bistec", count: 45 },
      { name: "Campechano (Bistec + Chorizo)", count: 34 },
      { name: "Gringa al Pastor (Con Queso)", count: 26 }
    ],
    activeOrdersToday: 2
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
        throw new Error("Respuesta del servidor no satisfactoria.");
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
      console.warn("Sincronización en segundo plano diferida:", err);
      // We do NOT wipe out our beautiful state. It guarantees the user interface never blacks out!
      setServerError("Estableciendo conexión en tiempo real con el servidor de la taquería...");
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
      } else {
        triggerNotification("No se pudo agregar el mesero en el servidor.", "info");
      }
    } catch (e) {
      triggerNotification("Error de red: No se pudo registrar el mesero.", "info");
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
      } else {
        triggerNotification("No se pudo agregar el cocinero en el servidor.", "info");
      }
    } catch (e) {
      triggerNotification("Error de red: No se pudo registrar el cocinero.", "info");
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
                {serverError ? (
                  <span className="bg-amber-50 text-amber-800 border border-amber-200 text-[9px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded-full flex items-center gap-1 shadow-xs animate-pulse">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
                    Buscando Servidor...
                  </span>
                ) : (
                  <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-[9px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded-full flex items-center gap-1 shadow-xs">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                    En Línea
                  </span>
                )}
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
        
        {/* Real-time sync status banner */}
        {serverError && (
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 text-amber-950 rounded-xl p-3.5 text-xs flex items-center justify-between gap-3 shadow-xs animate-fade-in">
            <div className="flex items-center gap-2.5">
              <span className="relative flex h-2 w-2 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
              </span>
              <span className="font-semibold leading-none">{serverError}</span>
            </div>
            <span className="text-[10px] font-bold text-amber-750 uppercase tracking-widest bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-md shrink-0 animate-pulse">
              Reconectando...
            </span>
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
