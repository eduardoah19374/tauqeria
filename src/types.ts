export interface TacoItem {
  id: string;
  name: string;
  category: "Tacos" | "Especialidades" | "Bebidas";
  price: number;
}

export const TACOS_MENU: TacoItem[] = [
  { id: "pastor", name: "Al Pastor", category: "Tacos", price: 18 },
  { id: "suadero", name: "Suadero", category: "Tacos", price: 18 },
  { id: "bistec", name: "Bistec", category: "Tacos", price: 20 },
  { id: "tripa", name: "Tripa de Cerdo", category: "Tacos", price: 24 },
  { id: "chorizo", name: "Chorizo", category: "Tacos", price: 18 },
  { id: "campechano", name: "Campechano (Bistec + Chorizo)", category: "Especialidades", price: 22 },
  { id: "gringa", name: "Gringa al Pastor (Con Queso)", category: "Especialidades", price: 35 },
  { id: "quesadilla", name: "Quesadilla de Bistec", category: "Especialidades", price: 32 },
  { id: "refresco", name: "Refresco Mexicana 500ml", category: "Bebidas", price: 25 },
  { id: "agua-horchata", name: "Agua de Horchata Grande", category: "Bebidas", price: 28 },
  { id: "agua-jamaica", name: "Agua de Jamaica Grande", category: "Bebidas", price: 28 },
];

export interface OrderItem {
  tacoId: string;
  name: string;
  quantity: number;
  price: number;
  options: {
    onion: boolean;
    cilantro: boolean;
    salsa: "Ninguna" | "Verde (Pica Poco)" | "Roja (Súper Picosa)" | "Habanero (Fuego)";
    doubleTortilla: boolean;
    extraQueso: boolean;
  };
}

export interface Order {
  id: string;
  table: string; // e.g., "Mesa 1", "Mesa 5", "Para Llevar"
  waiterId: string;
  waiterName: string;
  cookId?: string;
  cookName?: string;
  items: OrderItem[];
  status: "Pendiente" | "Preparando" | "Listo" | "Entregado" | "Pagado";
  createdAt: string; // ISO date
  updatedAt: string; // ISO date
  total: number;
  notes?: string;
}

export interface Waiter {
  id: string;
  name: string;
  status: "Activo" | "Descanso";
  ordersCount: number;
  totalSales: number;
}

export interface Cook {
  id: string;
  name: string;
  status: "Disponible" | "Cocina Llena" | "Descanso";
  activeOrdersCount: number;
  completedOrdersCount: number;
}

export interface TaqueriaStats {
  totalRevenue: number;
  completedOrders: number;
  averagePrepTimeMinutes: number; // minutes
  popularTacos: { name: string; count: number }[];
  activeOrdersToday: number;
}
