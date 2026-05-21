import React, { useState } from "react";
import { Plus, Trash2, ClipboardList, ShoppingBag, Check, CheckSquare, DollarSign, UserPlus, Flame } from "lucide-react";
import { Order, OrderItem, Waiter, TACOS_MENU, TacoItem } from "../types";

interface WaiterStationProps {
  orders: Order[];
  waiters: Waiter[];
  onCreateOrder: (table: string, waiterId: string, items: OrderItem[], notes: string) => Promise<void>;
  onUpdateOrderStatus: (orderId: string, status: Order["status"]) => Promise<void>;
  onAddWaiter: (name: string) => Promise<void>;
}

export function WaiterStation({
  orders,
  waiters,
  onCreateOrder,
  onUpdateOrderStatus,
  onAddWaiter,
}: WaiterStationProps) {
  // Waiter State
  const [selectedWaiterId, setSelectedWaiterId] = useState<string>(waiters[0]?.id || "");
  const [newWaiterName, setNewWaiterName] = useState("");
  const [showAddWaiter, setShowAddWaiter] = useState(false);

  // New Order State
  const [selectedTable, setSelectedTable] = useState("Mesa 1");
  const [cart, setCart] = useState<OrderItem[]>([]);
  const [notes, setNotes] = useState("");

  // Current Item Configuration
  const [selectedTaco, setSelectedTaco] = useState<TacoItem>(TACOS_MENU[0]);
  const [quantity, setQuantity] = useState(4);
  const [onion, setOnion] = useState(true);
  const [cilantro, setCilantro] = useState(true);
  const [salsa, setSalsa] = useState<OrderItem["options"]["salsa"]>("Verde (Pica Poco)");
  const [doubleTortilla, setDoubleTortilla] = useState(false);
  const [extraQueso, setExtraQueso] = useState(false);

  const handleAddWaiterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWaiterName.trim()) return;
    await onAddWaiter(newWaiterName.trim());
    setNewWaiterName("");
    setShowAddWaiter(false);
  };

  const handleAddToCart = () => {
    const newItem: OrderItem = {
      tacoId: selectedTaco.id,
      name: selectedTaco.name,
      quantity,
      price: selectedTaco.price,
      options: {
        onion,
        cilantro,
        salsa,
        doubleTortilla,
        extraQueso,
      },
    };
    setCart([...cart, newItem]);
    // Reset options for next item
    setQuantity(4);
    setOnion(true);
    setCilantro(true);
    setSalsa("Verde (Pica Poco)");
    setDoubleTortilla(false);
    setExtraQueso(false);
  };

  const handleRemoveFromCart = (index: number) => {
    setCart(cart.filter((_, i) => i !== index));
  };

  const handleSubmitOrder = async () => {
    if (!selectedWaiterId) {
      alert("Por favor selecciona un mesero de la lista.");
      return;
    }
    if (cart.length === 0) {
      alert("El pedido está vacío. Agrega tacos al pedido.");
      return;
    }
    await onCreateOrder(selectedTable, selectedWaiterId, cart, notes);
    // Reset
    setCart([]);
    setNotes("");
  };

  const calculateCartTotal = () => {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const getSalsaBadgeColor = (salsaType: string) => {
    switch (salsaType) {
      case "Ninguna": return "bg-stone-100 text-stone-700 border-stone-200";
      case "Verde (Pica Poco)": return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "Roja (Súper Picosa)": return "bg-amber-50 text-amber-700 border-amber-200";
      case "Habanero (Fuego)": return "bg-red-50 text-red-700 border-red-200";
      default: return "bg-orange-50 text-orange-700 border-orange-200";
    }
  };

  // Waiter's perspective orders (active today)
  const activeWaiterOrders = orders.filter(o => o.waiterId === selectedWaiterId && o.status !== "Pagado");

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Columna Izquierda: Selección de Mesero y Nuevo Pedido */}
      <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-stone-200 shadow-sm flex flex-col gap-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-stone-100 pb-4 gap-3">
          <div>
            <h2 className="text-xl font-display font-bold text-stone-900 tracking-tight flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-amber-500" />
              Tomar Nuevo Pedido
            </h2>
            <p className="text-xs text-stone-500">Registrar mesa, platillos y complementos</p>
          </div>
          
          <div className="flex items-center gap-2">
            <select
              value={selectedWaiterId}
              onChange={(e) => setSelectedWaiterId(e.target.value)}
              className="text-sm bg-stone-50 border border-stone-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              {waiters.map(w => (
                <option key={w.id} value={w.id}>{w.name} ({w.ordersCount} serv.)</option>
              ))}
            </select>
            
            <button
              onClick={() => setShowAddWaiter(!showAddWaiter)}
              className="p-1.5 bg-stone-100 hover:bg-stone-200 text-stone-600 rounded-lg transition-colors"
              title="Registrar Nuevo Mesero"
            >
              <UserPlus className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal/Formulario express para agregar mesero */}
        {showAddWaiter && (
          <form onSubmit={handleAddWaiterSubmit} className="bg-stone-50 border border-stone-200 p-3 rounded-lg flex items-center justify-between gap-3 animate-fade-in">
            <input
              type="text"
              placeholder="Nombre de Nuevo Mesero..."
              value={newWaiterName}
              onChange={(e) => setNewWaiterName(e.target.value)}
              className="text-xs w-full bg-white border border-stone-200 rounded px-2.5 py-1.5 focus:ring-1 focus:ring-amber-500 outline-none"
            />
            <button
              type="submit"
              className="bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold px-3 py-1.5 rounded transition-transform"
            >
              Agregar
            </button>
          </form>
        )}

        {/* Formulario de Configuración del Taco */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-3">
            <div>
              <label className="text-xs font-semibold text-stone-600">1. Mesa / Destino</label>
              <select
                value={selectedTable}
                onChange={(e) => setSelectedTable(e.target.value)}
                className="w-full mt-1 text-sm bg-stone-50 border border-stone-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-amber-500"
              >
                {Array.from({ length: 10 }, (_, i) => `Mesa ${i + 1}`).concat(["Para Llevar 🥡", "Barra 🌮"]).map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-stone-600">2. Escoger Platillo o Bebida</label>
              <div className="mt-1 h-44 overflow-y-auto border border-stone-100 rounded-lg p-1 bg-stone-50">
                {TACOS_MENU.map(t => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setSelectedTaco(t)}
                    className={`w-full text-left text-xs px-3 py-2 rounded-md flex items-center justify-between transition-colors ${
                      selectedTaco.id === t.id
                        ? "bg-amber-500 text-white font-medium"
                        : "hover:bg-amber-50 text-stone-700"
                    }`}
                  >
                    <span>{t.name}</span>
                    <span className={selectedTaco.id === t.id ? "text-white" : "text-stone-500 font-mono"}>
                      ${t.price}.00
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Opciones y Personalización */}
          <div className="bg-stone-50 border border-stone-100 p-4 rounded-xl flex flex-col gap-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-amber-600 flex items-center justify-between">
              <span>Personalizar Orden</span>
              <span className="bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded text-[10px] font-mono">
                ${selectedTaco.price}.00 c/u
              </span>
            </h3>

            {/* Quantity */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-stone-700">Cantidad:</span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-7 h-7 flex items-center justify-center bg-white border border-stone-200 rounded hover:bg-stone-100 text-stone-600 font-bold"
                >
                  -
                </button>
                <span className="w-8 text-center text-sm font-semibold font-mono">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-7 h-7 flex items-center justify-center bg-white border border-stone-200 rounded hover:bg-stone-100 text-stone-600 font-bold"
                >
                  +
                </button>
              </div>
            </div>

            {/* Condis */}
            {selectedTaco.category !== "Bebidas" && (
              <div className="border-t border-stone-200/60 pt-2 flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-stone-600">Cebolla</span>
                  <input
                    type="checkbox"
                    checked={onion}
                    onChange={(e) => setOnion(e.target.checked)}
                    className="accent-amber-500"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-stone-600">Cilantro</span>
                  <input
                    type="checkbox"
                    checked={cilantro}
                    onChange={(e) => setCilantro(e.target.checked)}
                    className="accent-amber-500"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-stone-600">Doble Tortilla</span>
                  <input
                    type="checkbox"
                    checked={doubleTortilla}
                    onChange={(e) => setDoubleTortilla(e.target.checked)}
                    className="accent-amber-500"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-stone-600">Qeso Extra (+ $5)</span>
                  <input
                    type="checkbox"
                    checked={extraQueso}
                    onChange={(e) => setExtraQueso(e.target.checked)}
                    className="accent-amber-500"
                  />
                </div>
              </div>
            )}

            {/* Salsa Selector */}
            <div className="border-t border-stone-200/60 pt-2 flex flex-col gap-1">
              <span className="text-xs font-medium text-stone-600 flex items-center gap-1">
                <Flame className="w-3 h-3 text-red-500" /> Salsa
              </span>
              <select
                value={salsa}
                onChange={(e) => setSalsa(e.target.value as any)}
                className="text-xs w-full bg-white border border-stone-200 rounded px-2 py-1 outline-none"
              >
                <option value="Ninguna">Ninguna</option>
                <option value="Verde (Pica Poco)">Verde (Pica Poco)</option>
                <option value="Roja (Súper Picosa)">Roja (Súper Picosa)</option>
                <option value="Habanero (Fuego)">Habanero (Súper Fuego! 💀)</option>
              </select>
            </div>

            <button
              type="button"
              onClick={handleAddToCart}
              className="mt-2 w-full py-2 bg-amber-500 hover:bg-amber-600 text-white font-semibold text-xs rounded-lg shadow-sm transition-all flex items-center justify-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              Agregar al Carrito (${(selectedTaco.price + (extraQueso ? 5 : 0)) * quantity}.00)
            </button>
          </div>
        </div>

        {/* Lista del Carrito */}
        <div className="border-t border-stone-100 pt-4 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-stone-800">Caja de Pedido Activo</h3>
            <span className="text-xs font-mono bg-stone-100 px-2 py-0.5 rounded text-stone-600">
              {cart.length} platillos en cola
            </span>
          </div>

          <div className="min-h-[120px] max-h-[180px] overflow-y-auto border border-stone-100 rounded-lg p-2 bg-stone-50 flex flex-col gap-2">
            {cart.length === 0 ? (
              <div className="py-8 flex flex-col items-center text-stone-400 gap-1.5 h-full justify-center">
                <ClipboardList className="w-8 h-8 stroke-1" />
                <span className="text-xs">El pedido está vacío. Configura tacos arriba.</span>
              </div>
            ) : (
              cart.map((item, idx) => (
                <div key={idx} className="bg-white p-2.5 rounded-lg border border-stone-200 flex items-start justify-between gap-1">
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-stone-900">
                      {item.quantity}x {item.name}{" "}
                      <span className="text-stone-500 font-mono font-normal">
                        (${item.price}.00)
                      </span>
                    </span>
                    <span className="text-[10px] text-stone-500 flex flex-wrap gap-x-1.5 gap-y-0.5 mt-0.5">
                      {item.options.onion && <span>• Cebolla</span>}
                      {item.options.cilantro && <span>• Cilantro</span>}
                      {item.options.doubleTortilla && <span>• Doble tor.</span>}
                      {item.options.extraQueso && <span className="text-amber-600 font-medium font-mono">+Queso</span>}
                      <span className={`px-1.5 py-0.2 rounded-full border ${getSalsaBadgeColor(item.options.salsa)}`}>
                        Salsa: {item.options.salsa}
                      </span>
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-stone-800">
                      ${item.price * item.quantity}.00
                    </span>
                    <button
                      onClick={() => handleRemoveFromCart(idx)}
                      className="p-1 text-red-500 hover:bg-red-50 rounded"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Notas y Despacho del pedido */}
          <div className="flex flex-col gap-2.5">
            <input
              type="text"
              placeholder="Notas del pedido (p. ej., Gringas bien tostadas, sin sal...)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="text-xs bg-stone-50 border border-stone-200 rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-amber-500"
            />

            <div className="flex items-center justify-between border-t border-stone-100 pt-3">
              <div className="flex flex-col">
                <span className="text-xs text-stone-500">Monto Total del Pedido:</span>
                <span className="text-xl font-display font-bold text-stone-900 font-mono">
                  ${calculateCartTotal()}.00
                </span>
              </div>

              <button
                type="button"
                onClick={handleSubmitOrder}
                disabled={cart.length === 0}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-stone-200 disabled:text-stone-400 text-white text-xs font-bold rounded-lg shadow-sm transition-transform cursor-pointer"
              >
                Mandar a Cocina (Fuego 🔥)
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Columna Derecha: Pedidos Activos del Mesero de turno */}
      <div className="lg:col-span-5 bg-stone-50/70 p-6 rounded-2xl border border-stone-200 flex flex-col gap-4">
        <div className="border-b border-stone-200 pb-3">
          <h2 className="text-lg font-display font-bold text-stone-900 flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-emerald-600" />
            Mis Mesas Activas
          </h2>
          <p className="text-xs text-stone-500">Seguimiento de pedidos para {waiters.find(w => w.id === selectedWaiterId)?.name || "el mesero seleccionado"}</p>
        </div>

        <div className="flex-1 overflow-y-auto max-h-[580px] flex flex-col gap-3 pr-1">
          {activeWaiterOrders.length === 0 ? (
            <div className="py-12 bg-white rounded-xl border border-stone-200 text-center flex flex-col items-center text-stone-400 gap-1.5">
              <Check className="w-8 h-8 text-emerald-500 stroke-[3]" />
              <span className="text-xs font-medium text-stone-800">¡Libre de pendientes!</span>
              <span className="text-[11px] text-stone-500 px-4">Toda tu gente ya tiene taco en mano o está pagando.</span>
            </div>
          ) : (
            activeWaiterOrders.map(order => (
              <div key={order.id} className="bg-white rounded-xl border border-stone-200 p-4 shadow-sm flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="bg-stone-900 text-white font-mono text-xs px-2 py-0.5 rounded">
                      {order.id}
                    </span>
                    <span className="text-sm font-bold text-stone-900">{order.table}</span>
                  </div>

                  {/* Status Badge */}
                  <span className={`text-[10px] font-bold px-2 py-0.5 uppercase tracking-wide rounded-full border ${
                    order.status === "Pendiente" ? "bg-amber-100 text-amber-800 border-amber-200" :
                    order.status === "Preparando" ? "bg-blue-100 text-blue-800 border-blue-200" :
                    order.status === "Listo" ? "bg-purple-100 text-purple-800 border-purple-200 animate-pulse" :
                    "bg-emerald-100 text-emerald-800 border-emerald-200"
                  }`}>
                    {order.status}
                  </span>
                </div>

                <div className="text-xs text-stone-600">
                  <div className="font-medium text-stone-800">Detalles:</div>
                  <ul className="list-disc pl-4 space-y-0.5 mt-1 font-mono">
                    {order.items.map((it, i) => (
                      <li key={i}>
                        {it.quantity}x {it.name} - Salsa {it.options.salsa}
                      </li>
                    ))}
                  </ul>
                  {order.notes && (
                    <div className="mt-1 bg-stone-50 p-1.5 rounded text-[11px] italic talk-bubble border-l-2 border-amber-400">
                      " {order.notes} "
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between border-t border-stone-100 pt-2.5">
                  <div className="text-xs">
                    <span className="text-stone-500">Cocinero:</span>{" "}
                    <span className="font-semibold text-stone-700">{order.cookName || "Pendiente"}</span>
                  </div>
                  <span className="text-sm font-bold font-mono text-stone-900">${order.total}.00</span>
                </div>

                {/* Status action buttons */}
                <div className="grid grid-cols-2 gap-2 mt-1 pt-1.5 border-t border-stone-100/70">
                  {order.status === "Listo" && (
                    <button
                      onClick={() => onUpdateOrderStatus(order.id, "Entregado")}
                      className="w-full py-1.5 text-[11px] font-bold text-slate-800 bg-purple-100 hover:bg-purple-200 border border-purple-200 rounded justify-center flex items-center gap-1 cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5" /> Servir a Mesa
                    </button>
                  )}
                  {order.status === "Entregado" && (
                    <button
                      onClick={() => onUpdateOrderStatus(order.id, "Pagado")}
                      className="w-full col-span-2 py-1.5 text-[11px] font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded justify-center flex items-center gap-1 cursor-pointer"
                    >
                      <DollarSign className="w-3.5 h-3.5" /> Cobrar Cuenta (Pagado)
                    </button>
                  )}
                  {order.status === "Pendiente" && (
                    <span className="text-[10px] text-stone-400 italic col-span-2 text-center py-1">
                      En espera de que el cocinero tome el pedido...
                    </span>
                  )}
                  {order.status === "Preparando" && (
                    <span className="text-[10px] text-blue-600 font-medium text-center col-span-2 py-1">
                      Los cocineros están dándole fuego a tus tacos 🍳
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
