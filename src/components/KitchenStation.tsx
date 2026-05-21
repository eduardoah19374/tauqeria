import React, { useState, useEffect } from "react";
import { ChefHat, Clock, Flame, Check, UserPlus } from "lucide-react";
import { Order, Cook } from "../types";

interface KitchenStationProps {
  orders: Order[];
  cooks: Cook[];
  onUpdateOrderStatusWithCook: (orderId: string, status: Order["status"], cookId: string) => Promise<void>;
  onAddCook: (name: string) => Promise<void>;
}

export function KitchenStation({
  orders,
  cooks,
  onUpdateOrderStatusWithCook,
  onAddCook,
}: KitchenStationProps) {
  const [selectedCookId, setSelectedCookId] = useState<string>(cooks[0]?.id || "");
  const [newCookName, setNewCookName] = useState("");
  const [showAddCook, setShowAddCook] = useState(false);

  // Re-render tick to update the elapsed time tickers
  const [timeTick, setTimeTick] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeTick(t => t + 1);
    }, 15000); // refresh elapsed calculations every 15s
    return () => clearInterval(interval);
  }, []);

  const handleAddCookSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCookName.trim()) return;
    await onAddCook(newCookName.trim());
    setNewCookName("");
    setShowAddCook(false);
  };

  // Kitchen cares about orders in "Pendiente" or "Preparando"
  const kitchenOrders = orders.filter(
    o => o.status === "Pendiente" || (o.status === "Preparando" && o.cookId === selectedCookId)
  );

  const calculateMinutesElapsed = (isoString: string) => {
    const created = new Date(isoString).getTime();
    const now = Date.now();
    return Math.max(0, Math.floor((now - created) / 60000));
  };

  const getTimeColorClass = (minutes: number) => {
    if (minutes >= 12) return "text-red-600 bg-red-50 border-red-200 animate-pulse";
    if (minutes >= 6) return "text-amber-600 bg-amber-50 border-amber-200";
    return "text-emerald-600 bg-emerald-50 border-emerald-200";
  };

  const getSalsaEmoji = (salsa: string) => {
    if (salsa.includes("Ninguna")) return "";
    if (salsa.includes("Verde")) return "🟢";
    if (salsa.includes("Roja")) return "🔴";
    if (salsa.includes("Habanero")) return "🔥💀";
    return "";
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Selector de Cocinero Activo */}
      <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-display font-bold text-stone-900 flex items-center gap-2">
            <ChefHat className="w-5 h-5 text-amber-500" />
            Pantalla de Cocina ("Fuego y Carbón")
          </h2>
          <p className="text-xs text-stone-500">
            Administra comandas, despacha tacos y toma pedidos en preparación.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex flex-col">
            <label className="text-[10px] text-stone-400 uppercase font-semibold">Cocinero de Turno:</label>
            <select
              value={selectedCookId}
              onChange={(e) => setSelectedCookId(e.target.value)}
              className="mt-0.5 text-sm bg-stone-50 border border-stone-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-amber-500 font-semibold"
            >
              {cooks.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.completedOrdersCount} desc.)
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => setShowAddCook(!showAddCook)}
            className="mt-4 p-2 bg-stone-100 hover:bg-stone-200 text-stone-600 rounded-lg transition-all"
            title="Registrar Nuevo Cocinero"
          >
            <UserPlus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {showAddCook && (
        <form onSubmit={handleAddCookSubmit} className="bg-stone-50 border border-stone-200 p-4 rounded-xl flex items-center justify-between gap-4 animate-fade-in">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Nombre del nuevo cocinero (p. ej., Don Beto)..."
              value={newCookName}
              onChange={(e) => setNewCookName(e.target.value)}
              className="text-xs w-full bg-white border border-stone-200 rounded px-3 py-2 outline-none focus:ring-1 focus:ring-amber-500"
            />
          </div>
          <button
            type="submit"
            className="bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors cursor-pointer"
          >
            Registrar Cocinero
          </button>
        </form>
      )}

      {/* Grid de Pedidos de Cocina */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {kitchenOrders.length === 0 ? (
          <div className="col-span-full py-16 bg-white rounded-2xl border border-stone-200 text-center flex flex-col items-center justify-center text-stone-400 gap-2">
            <div className="w-12 h-12 bg-amber-50 rounded-full flex items-center justify-center text-amber-500 border border-amber-100">
              <Check className="w-6 h-6 stroke-[3]" />
            </div>
            <h3 className="font-display font-bold text-stone-800 text-sm mt-1">¡Sin comandas pendientes!</h3>
            <p className="text-xs text-stone-500 max-w-sm px-6">
              Todos los tacos han sido despachados. Buen trabajo de equipo. Que descansen un ratito de la lumbre.
            </p>
          </div>
        ) : (
          kitchenOrders.map(order => {
            const minutes = calculateMinutesElapsed(order.createdAt);
            const isAssignedToMe = order.cookId === selectedCookId;

            return (
              <div
                key={order.id}
                className={`bg-white rounded-2xl border transition-all ${
                  order.status === "Preparando"
                    ? "border-amber-400 ring-2 ring-amber-400/20 shadow-md"
                    : "border-stone-200 hover:border-stone-300 shadow-sm"
                }`}
              >
                {/* Header Comanda */}
                <div className="p-4 border-b border-stone-100 flex items-center justify-between bg-stone-50/70 rounded-t-2xl">
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-xs font-black bg-stone-950 text-white px-2 py-0.5 rounded">
                      {order.id}
                    </span>
                    <span className="font-bold text-sm text-stone-900">{order.table}</span>
                  </div>

                  <div className={`flex items-center gap-1 text-[11px] font-bold font-mono px-2 py-0.5 rounded border ${getTimeColorClass(minutes)}`}>
                    <Clock className="w-3.5 h-3.5" />
                    <span>hace {minutes} min</span>
                  </div>
                </div>

                {/* Lista de tacos a cocinar */}
                <div className="p-4 flex flex-col gap-3 min-h-[140px]">
                  <div className="flex-1 flex flex-col gap-2">
                    {order.items.map((it, idx) => (
                      <div key={idx} className="border-b border-stone-100/80 pb-2 last:border-none last:pb-0">
                        <div className="flex items-start justify-between">
                          <span className="text-sm font-black text-stone-900">
                            {it.quantity}x <span className="underline decoration-amber-400/80 decoration-2">{it.name}</span>
                          </span>
                        </div>

                        {/* Modifiers (Cebolla/Cilantro, Doble tortilla, salsa) */}
                        <div className="text-[11px] text-stone-600 mt-1 flex flex-wrap gap-1.5">
                          {it.options.onion && (
                            <span className="bg-stone-100 text-stone-700 px-1.5 py-0.3 rounded">Cebolla 🧅</span>
                          )}
                          {it.options.cilantro && (
                            <span className="bg-stone-100 text-stone-700 px-1.5 py-0.3 rounded">Cilantro 🌿</span>
                          )}
                          {it.options.doubleTortilla && (
                            <span className="bg-stone-100 text-stone-700 px-1.5 py-0.3 rounded">Doble Tort. 🫓</span>
                          )}
                          {it.options.extraQueso && (
                            <span className="bg-amber-100 text-amber-800 px-1.5 py-0.3 rounded font-bold font-mono">+Queso 🧀</span>
                          )}
                          <span className="bg-stone-100 text-stone-800 px-1.5 py-0.3 rounded border border-stone-200">
                            {getSalsaEmoji(it.options.salsa)} {it.options.salsa}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {order.notes && (
                    <div className="mt-1 bg-amber-50/50 text-amber-800 p-2.5 rounded-lg border-l-4 border-amber-500 font-sans text-[11px] font-medium leading-relaxed">
                      💡 Regla especial: "{order.notes}"
                    </div>
                  )}

                  <div className="text-[10px] text-stone-400 flex items-center justify-between border-t border-stone-100/80 pt-2.5">
                    <span>Mesero: {order.waiterName}</span>
                    <span>Platillos: {order.items.length}</span>
                  </div>
                </div>

                {/* Acciones de Cocina */}
                <div className="p-3 bg-stone-50 rounded-b-2xl border-t border-stone-100">
                  {order.status === "Pendiente" ? (
                    <button
                      onClick={() => onUpdateOrderStatusWithCook(order.id, "Preparando", selectedCookId)}
                      className="w-full py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold text-xs rounded-xl shadow-sm transition-all transform hover:scale-[1.01] flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Flame className="w-4 h-4 text-white animate-bounce" />
                      Empezar a Cocinar (Tomar Comanda)
                    </button>
                  ) : isAssignedToMe ? (
                    <button
                      onClick={() => onUpdateOrderStatusWithCook(order.id, "Listo", selectedCookId)}
                      className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all transform hover:scale-[1.01] flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Check className="w-4 h-4 text-white" />
                      Tacos Listos (¡Despachar comanda!)
                    </button>
                  ) : (
                    <div className="text-center py-2 text-xs text-stone-500 font-medium">
                      🛠️ Preparando por: {order.cookName}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
