import React, { useState, useEffect } from "react";
import {
  Sparkles,
  TrendingUp,
  Clock,
  DollarSign,
  Activity,
  Play,
  Square,
  Users,
  ChefHat,
  ShoppingBag,
  Utensils,
  RefreshCw,
  Zap
} from "lucide-react";
import { Order, Waiter, Cook, TaqueriaStats } from "../types";

interface OwnerDashboardProps {
  orders: Order[];
  waiters: Waiter[];
  cooks: Cook[];
  stats: TaqueriaStats;
  onRefreshStats: () => Promise<void>;
  onTriggerSimulator: () => Promise<void>;
}

interface AIConsultantResult {
  summary: string;
  insights: string[];
  promotions: string[];
  chefJoke: string;
}

export function OwnerDashboard({
  orders,
  waiters,
  cooks,
  stats,
  onRefreshStats,
  onTriggerSimulator,
}: OwnerDashboardProps) {
  // Simulator State
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationSpeed, setSimulationSpeed] = useState(6); // generation frequency in seconds
  
  // AI Insights State
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState<AIConsultantResult | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);

  // Active Simulating ticker
  useEffect(() => {
    if (!isSimulating) return;
    const interval = setInterval(async () => {
      await onTriggerSimulator();
    }, simulationSpeed * 1000);
    return () => clearInterval(interval);
  }, [isSimulating, simulationSpeed, onTriggerSimulator]);

  const fetchAIRecommendations = async () => {
    setAiLoading(true);
    setAiError(null);
    try {
      const response = await fetch("/api/gemini/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) {
        throw new Error("No se pudo obtener el análisis del servidor");
      }
      const data = await response.json();
      setAiResult(data);
    } catch (err: any) {
      console.error(err);
      setAiError(err.message || "Fallo el servicio de consultor de IA");
    } finally {
      setAiLoading(false);
    }
  };

  // Convert stats populares into visual percentage helper
  const popularTacosWithPercentage = stats.popularTacos.map(item => {
    const totalCount = stats.popularTacos.reduce((acc, t) => acc + t.count, 0) || 1;
    const percentage = Math.round((item.count / totalCount) * 100);
    return { ...item, percentage };
  });

  // Logs live changes from the current session
  const activeLogs = orders
    .slice()
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 8)
    .map(order => {
      const timeStr = new Date(order.updatedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
      let statusMsg = "";
      let dotColor = "bg-amber-500";
      
      switch (order.status) {
        case "Pendiente":
          statusMsg = `Pedido nuevo ${order.id} creado para ${order.table} ($${order.total})`;
          dotColor = "bg-blue-400";
          break;
        case "Preparando":
          statusMsg = `Cocinero ${order.cookName} comenzó a preparar el pedido ${order.id} (${order.table})`;
          dotColor = "bg-amber-400";
          break;
        case "Listo":
          statusMsg = `¡Pedido ${order.id} terminado en cocina! Listo para servir a ${order.table}`;
          dotColor = "bg-purple-500 animate-pulse";
          break;
        case "Entregado":
          statusMsg = `Mesero ${order.waiterName} sirvió el pedido ${order.id} a la ${order.table}`;
          dotColor = "bg-blue-600";
          break;
        case "Pagado":
          statusMsg = `¡Cuenta Pagada! Pago de $${order.total} de la ${order.table} registrado`;
          dotColor = "bg-emerald-500";
          break;
      }

      return { id: order.id, time: timeStr, msg: statusMsg, dot: dotColor };
    });

  return (
    <div className="flex flex-col gap-6">
      {/* Simulation Controls & Notification banner */}
      <div className="bg-gradient-to-r from-stone-900 via-stone-800 to-amber-900 text-white p-5 rounded-2xl shadow-sm border border-stone-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-amber-500 text-stone-950 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded">
              Tiempo Real Activo
            </span>
            <Activity className="w-4 h-4 text-emerald-400 animate-ping" />
          </div>
          <h2 className="text-xl font-display font-bold mt-1 text-white">Consola de Control del Dueño</h2>
          <p className="text-xs text-stone-300">Monitorea mesas, rendimiento del personal y ventas acumuladas.</p>
        </div>

        {/* Simulador Automático */}
        <div className="bg-white/10 backdrop-blur-md px-4 py-3 rounded-xl border border-white/15 flex flex-col md:flex-row items-center gap-3.5">
          <div className="flex flex-col">
            <span className="text-[10px] text-amber-400 font-extrabold uppercase tracking-wider flex items-center gap-1">
              <Zap className="w-3 h-3" /> Generador de Clientes
            </span>
            <span className="text-xs text-stone-100">Simulación automática de pedidos</span>
          </div>

          <div className="flex items-center gap-2">
            {isSimulating ? (
              <button
                onClick={() => setIsSimulating(false)}
                className="px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-lg shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Square className="w-3.5 h-3.5 fill-white" /> Detener
              </button>
            ) : (
              <button
                onClick={() => setIsSimulating(true)}
                className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-white" /> Simular Pedidos
              </button>
            )}

            <div className="flex items-center gap-1.5 bg-black/25 px-2.5 py-1 rounded">
              <label className="text-[10px] text-stone-300 font-mono">c/ </label>
              <select
                value={simulationSpeed}
                onChange={(e) => setSimulationSpeed(Number(e.target.value))}
                className="text-xs font-mono bg-transparent text-white border-none outline-none cursor-pointer"
              >
                <option value={3} className="bg-stone-900 text-white">3s (Locura)</option>
                <option value={6} className="bg-stone-900 text-white">6s (Rápido)</option>
                <option value={12} className="bg-stone-900 text-white">12s (Normal)</option>
                <option value={20} className="bg-stone-900 text-white">20s (Lento)</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Grid Bento de Métricas del Negocio */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 border border-emerald-100 shrink-0">
            <DollarSign className="w-6 h-6" />
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-stone-500 font-medium">Ventas Acumuladas</span>
            <span className="text-2xl font-display font-extrabold text-stone-900 font-mono mt-0.5">
              ${stats.totalRevenue}.00
            </span>
            <div className="text-[10px] text-emerald-600 flex items-center gap-0.5 mt-0.5">
              <TrendingUp className="w-3 h-3" /> +15% vs ayer
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600 border border-amber-100 shrink-0">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-stone-500 font-medium">Pedidos Despachados</span>
            <span className="text-2xl font-display font-extrabold text-stone-900 font-mono mt-0.5">
              {stats.completedOrders}
            </span>
            <div className="text-[10px] text-stone-500 mt-0.5">
              Ordenes entregadas con éxito
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 border border-blue-100 shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-stone-500 font-medium">Prep. Promedio Cocina</span>
            <span className="text-2xl font-display font-extrabold text-stone-900 font-mono mt-0.5">
              {stats.averagePrepTimeMinutes} min
            </span>
            <div className="text-[10px] text-emerald-600 font-medium mt-0.5">
              • Óptimo de despacho
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center text-purple-600 border border-purple-100 shrink-0">
            <Activity className="w-6 h-6" />
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-stone-500 font-medium">Pedidos Activos</span>
            <span className="text-2xl font-display font-extrabold text-stone-900 font-mono mt-0.5">
              {stats.activeOrdersToday}
            </span>
            <div className="text-[10px] text-purple-600 font-bold mt-0.5">
              En mesa o preparación
            </div>
          </div>
        </div>
      </div>

      {/* Grid Principal con Analíticas Avanzadas + IA insights */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Lado Izquierdo: Desempeño Personal, Popularidad de tacos, feed */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          
          {/* Bento Block: Popularidad de Tacos */}
          <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div className="flex items-center gap-2">
                <Utensils className="w-5 h-5 text-amber-500" />
                <h3 className="text-sm font-display font-bold text-stone-900">Popularidad del Menú (Tacos Vendidos)</h3>
              </div>
              <button
                onClick={onRefreshStats}
                className="text-stone-400 hover:text-stone-600"
                title="Sincronizar estadísticas"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>

            {/* SVG Native Craft Chart (No recharts React 19 error risks, purely robust) */}
            <div className="flex flex-col gap-3">
              {popularTacosWithPercentage.map((item, idx) => (
                <div key={idx} className="flex flex-col gap-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-stone-800">{item.name}</span>
                    <span className="text-stone-500 font-semibold font-mono">{item.count} tacos ({item.percentage}%)</span>
                  </div>
                  {/* Progress Bar styled with beautiful master taquería gradients */}
                  <div className="w-full bg-stone-100 rounded-full h-2.5 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        idx === 0 ? "bg-gradient-to-r from-amber-400 to-amber-600" :
                        idx === 1 ? "bg-gradient-to-r from-emerald-400 to-emerald-600" :
                        idx === 2 ? "bg-gradient-to-r from-orange-400 to-orange-500" :
                        "bg-gradient-to-r from-stone-400 to-stone-500"
                      }`}
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bento Block: Meseros y Cocineros */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            
            {/* Meseros */}
            <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm flex flex-col gap-3">
              <h3 className="text-xs font-display font-bold text-stone-900 uppercase tracking-wide border-b border-stone-100 pb-2 flex items-center gap-1.5">
                <Users className="w-4 h-4 text-emerald-500" /> Desempeño Meseros
              </h3>

              <div className="flex flex-col gap-2.5">
                {waiters.map(w => (
                  <div key={w.id} className="flex items-center justify-between text-xs">
                    <div className="flex flex-col">
                      <span className="font-bold text-stone-800">{w.name}</span>
                      <span className="text-[10px] text-stone-400 font-mono">{w.ordersCount} pedidos atendidos</span>
                    </div>
                    <span className="font-bold font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                      ${w.totalSales}.00
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Cocineros */}
            <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm flex flex-col gap-3">
              <h3 className="text-xs font-display font-bold text-stone-900 uppercase tracking-wide border-b border-stone-100 pb-2 flex items-center gap-1.5">
                <ChefHat className="w-4 h-4 text-amber-500" /> Rendimiento de Parrilla
              </h3>

              <div className="flex flex-col gap-2.5">
                {cooks.map(c => (
                  <div key={c.id} className="flex items-center justify-between text-xs">
                    <div className="flex flex-col">
                      <span className="font-bold text-stone-800">{c.name}</span>
                      <span className="text-[9px] font-bold text-amber-600 bg-amber-50 px-1.5 rounded w-max mt-0.5">
                        {c.status}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold font-mono text-stone-800">
                        {c.completedOrdersCount}
                      </span>
                      <span className="text-[10px] text-stone-400"> comandas</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Bento Block: Live Operations Feed */}
          <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm flex flex-col gap-3">
            <h3 className="text-sm font-display font-bold text-stone-900 border-b border-stone-100 pb-2 flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-600 animate-pulse" />
              Bitácora de Pedidos en Tiempo Real
            </h3>

            <div className="flex flex-col gap-3 h-[240px] overflow-y-auto pr-1">
              {activeLogs.length === 0 ? (
                <div className="h-full flex items-center justify-center text-xs text-stone-400 italic">
                  Esperando actividad de comandas...
                </div>
              ) : (
                activeLogs.map((log, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 text-xs">
                    <span className="text-[10px] text-stone-400 font-mono mt-0.5 select-none shrink-0">
                      {log.time}
                    </span>
                    <span className={`w-2 h-2 rounded-full shrink-0 ${log.dot} mt-1.5`} />
                    <span className="text-stone-700 leading-relaxed">{log.msg}</span>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

        {/* Lado Derecho: AI Consultant Insights Desk */}
        <div className="lg:col-span-5 bg-gradient-to-b from-amber-50 to-stone-50 p-6 rounded-2xl border border-amber-200/80 shadow-md flex flex-col gap-4">
          
          <div className="border-b border-amber-200/60 pb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500 fill-amber-500/10" />
              <div>
                <h3 className="text-base font-display font-extrabold text-stone-900">Consultor de IA Taquera</h3>
                <p className="text-[11px] text-stone-500">Impulsado por Gemini 3.5-Flash</p>
              </div>
            </div>

            <button
              onClick={fetchAIRecommendations}
              className="text-xs bg-amber-500 hover:bg-amber-600 transition-colors text-stone-950 font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 shadow-sm cursor-pointer"
            >
              <RefreshCw className="w-3 h-3" /> Generar
            </button>
          </div>

          <div className="flex-1 flex flex-col gap-4">
            {aiLoading ? (
              <div className="py-20 flex flex-col items-center justify-center gap-3 text-stone-500 h-full">
                <RefreshCw className="w-8 h-8 text-amber-500 animate-spin" />
                <span className="text-xs font-semibold">Gemini está analizando las finanzas, comandas y popularidad...</span>
                <span className="text-[10px] text-stone-400">Armando plan de promoción especial...</span>
              </div>
            ) : aiError ? (
              <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-center flex flex-col gap-2">
                <span className="text-xs font-bold text-red-700">Hubo un contratiempo con la IA</span>
                <span className="text-[11px] text-red-600 leading-relaxed">{aiError}</span>
                <button
                  onClick={fetchAIRecommendations}
                  className="mt-1 text-xs underline font-semibold text-stone-700 hover:text-stone-950"
                >
                  Intentar de nuevo
                </button>
              </div>
            ) : aiResult ? (
              <div className="flex flex-col gap-4 text-stone-800">
                
                {/* Breve diagnóstico */}
                <div className="bg-white p-4 rounded-xl border border-amber-200/50 shadow-xs">
                  <h4 className="text-xs font-bold text-amber-800 uppercase tracking-wider mb-1">Diagnóstico General</h4>
                  <p className="text-xs leading-relaxed text-stone-800 font-sans italic">
                    "{aiResult.summary}"
                  </p>
                </div>

                {/* Insights Clave */}
                <div>
                  <h4 className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">Insights Clave</h4>
                  <ul className="space-y-2">
                    {aiResult.insights.map((ins, i) => (
                      <li key={i} className="bg-white/40 p-2.5 rounded-lg border border-stone-200/50 text-xs flex gap-2">
                        <span className="font-bold text-amber-600">0{i+1}.</span>
                        <span className="text-stone-700 leading-relaxed font-sans">{ins}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Promociones / Combos Recomendados */}
                <div>
                  <h4 className="text-xs font-bold text-emerald-800 uppercase tracking-wider mb-2">Promociones Sugeridas</h4>
                  <div className="space-y-2">
                    {aiResult.promotions.map((promo, i) => (
                      <div key={i} className="bg-emerald-50 border border-emerald-100 p-3 rounded-lg flex items-start gap-2 text-xs">
                        <span className="text-emerald-500 mt-0.5">🌟</span>
                        <span className="text-emerald-800 font-medium leading-relaxed font-sans">{promo}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Chiste del Taquero */}
                <div className="bg-amber-100/40 p-3 rounded-xl border border-amber-200/30 text-center">
                  <span className="text-lg">🤣 Chiste de Taquería</span>
                  <p className="text-xs mt-1 text-stone-600 leading-relaxed font-sans italic">
                    {aiResult.chefJoke}
                  </p>
                </div>

              </div>
            ) : (
              <div className="py-16 text-center flex flex-col items-center justify-center gap-3 text-stone-400 h-full">
                <Sparkles className="w-10 h-10 text-amber-300 stroke-1" />
                <h4 className="font-display font-semibold text-stone-800 text-xs">¡Consultoría de Negocio con un solo Click!</h4>
                <p className="text-[11px] text-stone-500 leading-relaxed max-w-xs px-2">
                  Haz click en "Generar" para que la IA escudriñe las métricas de tu taquería, proponga combos ganadores y te de tips de optimización.
                </p>
                <button
                  type="button"
                  onClick={fetchAIRecommendations}
                  className="mt-2 text-xs bg-stone-900 border border-stone-950 text-white font-bold px-4 py-2 rounded-lg hover:bg-stone-800 transition-colors shadow-sm cursor-pointer"
                >
                  Consultar con IA 🌮
                </button>
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
