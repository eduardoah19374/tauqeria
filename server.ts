import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import { Order, Waiter, Cook, OrderItem, TACOS_MENU } from "./src/types.js";

// Lazy-initialized Gemini Client
let aiInstance: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!aiInstance) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === "MY_GEMINI_API_KEY" || apiKey.trim() === "") {
      console.warn("GEMINI_API_KEY is not set. AI insights will use local simulations.");
      return null;
    }
    aiInstance = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiInstance;
}

const app = express();
app.use(express.json());

const PORT = 3000;

// Memory database
let waiters: Waiter[] = [
  { id: "m1", name: "Don Juan", status: "Activo", ordersCount: 14, totalSales: 2150 },
  { id: "m2", name: "Sofía", status: "Activo", ordersCount: 8, totalSales: 1240 },
  { id: "m3", name: "Carlos", status: "Activo", ordersCount: 11, totalSales: 1680 }
];

let cooks: Cook[] = [
  { id: "c1", name: "Don Chuy", status: "Disponible", activeOrdersCount: 0, completedOrdersCount: 22 },
  { id: "c2", name: "Doña Lupe", status: "Disponible", activeOrdersCount: 0, completedOrdersCount: 18 },
  { id: "c3", name: "Mateo", status: "Disponible", activeOrdersCount: 0, completedOrdersCount: 12 }
];

// Seed initial orders
let orders: Order[] = [
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
    total: 200, // (5*18 = 90) + (3*20 = 60) + (2*25 = 50) = 200
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
    total: 100, // (4*18) + 28 = 72 + 28 = 100
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
    total: 192, // (3*22 = 66) + (2*35 = 70) + (2*28 = 56) = 192
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
];

// Helper to update statistics dynamically
function getStatsSummary() {
  const completed = orders.filter(o => o.status === "Pagado" || o.status === "Entregado");
  const totalRevenue = completed.reduce((sum, o) => sum + o.total, 0);
  
  // Calculate average prep time (minutes) for orders that have been prepared or delivered
  const prepTimes = orders
    .filter(o => o.status !== "Pendiente" && o.status !== "Preparando")
    .map(o => {
      const created = new Date(o.createdAt).getTime();
      const updated = new Date(o.updatedAt).getTime();
      return Math.max(1, Math.round((updated - created) / 60000));
    });
  const averagePrepTimeMinutes = prepTimes.length > 0
    ? Math.round(prepTimes.reduce((s, val) => s + val, 0) / prepTimes.length)
    : 8;

  // Taco popularity counts
  const tacoCounts: { [name: string]: number } = {};
  orders.forEach(o => {
    o.items.forEach(it => {
      tacoCounts[it.name] = (tacoCounts[it.name] || 0) + it.quantity;
    });
  });

  const popularTacos = Object.keys(tacoCounts)
    .map(name => ({ name, count: tacoCounts[name] }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const activeOrdersToday = orders.filter(o => o.status !== "Pagado").length;

  return {
    totalRevenue: totalRevenue + 3480, // Adding seeded historical base to look like a busy business day
    completedOrders: completed.length + 42,
    averagePrepTimeMinutes,
    popularTacos: popularTacos.length > 0 ? popularTacos : [
      { name: "Al Pastor", count: 86 },
      { name: "Suadero", count: 54 },
      { name: "Bistec", count: 42 },
      { name: "Campechano (Bistec + Chorizo)", count: 31 },
      { name: "Gringa al Pastor (Con Queso)", count: 24 }
    ],
    activeOrdersToday
  };
}

// REST API Endpoints

// Waiters
app.get("/api/waiters", (req, res) => {
  res.json(waiters);
});

app.post("/api/waiters", (req, res) => {
  const { name } = req.body;
  if (!name) {
    return res.status(400).json({ error: "Falta el nombre del mesero" });
  }
  const newWaiter: Waiter = {
    id: "m-" + Math.random().toString(36).substring(2, 9),
    name,
    status: "Activo",
    ordersCount: 0,
    totalSales: 0
  };
  waiters.push(newWaiter);
  res.status(201).json(newWaiter);
});

app.delete("/api/waiters/:id", (req, res) => {
  const { id } = req.params;
  waiters = waiters.filter(w => w.id !== id);
  res.json({ success: true });
});

// Cooks
app.get("/api/cooks", (req, res) => {
  res.json(cooks);
});

app.post("/api/cooks", (req, res) => {
  const { name } = req.body;
  if (!name) {
    return res.status(400).json({ error: "Falta el nombre del cocinero" });
  }
  const newCook: Cook = {
    id: "c-" + Math.random().toString(36).substring(2, 9),
    name,
    status: "Disponible",
    activeOrdersCount: 0,
    completedOrdersCount: 0
  };
  cooks.push(newCook);
  res.status(201).json(newCook);
});

app.delete("/api/cooks/:id", (req, res) => {
  const { id } = req.params;
  cooks = cooks.filter(c => c.id !== id);
  res.json({ success: true });
});

// Orders
app.get("/api/orders", (req, res) => {
  res.json(orders);
});

app.post("/api/orders", (req, res) => {
  const { table, waiterId, items, notes } = req.body;
  if (!table || !waiterId || !items || items.length === 0) {
    return res.status(400).json({ error: "Datos de pedido incompletos" });
  }

  const waiter = waiters.find(w => w.id === waiterId);
  if (!waiter) {
    return res.status(404).json({ error: "Mesero no encontrado" });
  }

  const calculatedTotal = items.reduce((sum: number, it: any) => sum + (it.price * it.quantity), 0);

  const newOrder: Order = {
    id: "ord-" + Math.floor(100 + Math.random() * 900),
    table,
    waiterId,
    waiterName: waiter.name,
    items,
    status: "Pendiente",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    total: calculatedTotal,
    notes: notes || ""
  };

  orders.push(newOrder);

  // Update waiter stats
  waiter.ordersCount += 1;
  waiter.totalSales += calculatedTotal;

  res.status(201).json(newOrder);
});

app.put("/api/orders/:id", (req, res) => {
  const { id } = req.params;
  const { status, cookId } = req.body;

  const orderIndex = orders.findIndex(o => o.id === id);
  if (orderIndex === -1) {
    return res.status(404).json({ error: "Pedido no encontrado" });
  }

  const order = orders[orderIndex];
  
  if (cookId) {
    const cook = cooks.find(c => c.id === cookId);
    if (cook) {
      order.cookId = cookId;
      order.cookName = cook.name;
    }
  }

  if (status) {
    order.status = status;
    order.updatedAt = new Date().toISOString();

    // Adjust cook stats if active/completed
    if (order.cookId) {
      const cook = cooks.find(c => c.id === order.cookId);
      if (cook) {
        if (status === "Preparando") {
          cook.status = "Cocina Llena";
          cook.activeOrdersCount = 1;
        } else if (status === "Listo" || status === "Entregado" || status === "Pagado") {
          cook.status = "Disponible";
          cook.activeOrdersCount = 0;
          cook.completedOrdersCount += 1;
        }
      }
    }
  }

  orders[orderIndex] = order;
  res.json(order);
});

app.delete("/api/orders/:id", (req, res) => {
  const { id } = req.params;
  orders = orders.filter(o => o.id !== id);
  res.json({ success: true });
});

// Stats
app.get("/api/stats", (req, res) => {
  res.json(getStatsSummary());
});

// Simulated active client orders in background
app.post("/api/orders/simulate", (req, res) => {
  // Random tables, random waiters, random tacos
  const randomTableNum = Math.floor(1 + Math.random() * 12);
  const randomTable = `Mesa ${randomTableNum}`;
  const randomWaiter = waiters[Math.floor(Math.random() * waiters.length)] || { id: "m1", name: "Don Juan" };
  
  const selectedTacos = [];
  const qtyTacos = Math.floor(1 + Math.random() * 3);
  for (let i = 0; i < qtyTacos; i++) {
    const randomProduct = TACOS_MENU[Math.floor(Math.random() * 8)]; // Pick any taco or drink
    selectedTacos.push({
      tacoId: randomProduct.id,
      name: randomProduct.name,
      quantity: Math.floor(2 + Math.random() * 5),
      price: randomProduct.price,
      options: {
        onion: Math.random() > 0.1,
        cilantro: Math.random() > 0.1,
        salsa: ["Ninguna", "Verde (Pica Poco)", "Roja (Súper Picosa)", "Habanero (Fuego)"][Math.floor(Math.random() * 4)],
        doubleTortilla: Math.random() > 0.5,
        extraQueso: Math.random() > 0.7
      }
    });
  }

  const calculatedTotal = selectedTacos.reduce((sum, it) => sum + (it.price * it.quantity), 0);
  const notesMock = [
    "Mucha cebollita asada",
    "Limones extra por favor",
    "Salsa roja aparte",
    "Bien doraditos",
    "",
    ""
  ];

  const newOrder: Order = {
    id: "ord-" + Math.floor(100 + Math.random() * 900),
    table: randomTable,
    waiterId: randomWaiter.id,
    waiterName: randomWaiter.name,
    items: selectedTacos as any,
    status: "Pendiente",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    total: calculatedTotal,
    notes: notesMock[Math.floor(Math.random() * notesMock.length)]
  };

  orders.push(newOrder);

  // Update waiter
  const w = waiters.find(item => item.id === randomWaiter.id);
  if (w) {
    w.ordersCount += 1;
    w.totalSales += calculatedTotal;
  }

  res.status(201).json(newOrder);
});

// Gemini Analysis Endpoint for Business Insights
app.post("/api/gemini/analyze", async (req, res) => {
  const ai = getGeminiClient();
  const summary = getStatsSummary();

  const businessContext = `
  Eres un consultor experto de negocios gastronómicos mexicanos, especialista en Taquerías tradicionales en México. Estás analizando el estado financiero y operativo en tiempo real de la taquería "El Pastorcito".
  
  Métricas actuales hoy:
  - Ventas acumuladas estimadas hoy: $${summary.totalRevenue} MXN
  - Pedidos completados: ${summary.completedOrders}
  - Tiempo promedio de preparación de cocina: ${summary.averagePrepTimeMinutes} minutos
  - Platillos/Tacos más populares: ${JSON.stringify(summary.popularTacos)}
  - Pedidos activos actualmente en cola: ${summary.activeOrdersToday}
  - Personal activo: ${waiters.length} meseros, ${cooks.length} cocineros.
  
  Quiero que analices minuciosamente esta información y escribas un reporte conciso en español como un consultor ingenioso, motivador pero directo y profesional. Tu respuesta debe estar estructurada en formato JSON con la siguiente estructura:
  {
    "summary": "Breve diagnóstico del negocio en 2-3 oraciones animadas.",
    "insights": [
      "Insight 1 sobre los tacos más vendidos y sugerencia de inventario.",
      "Insight 2 sobre el tiempo de cocina de los cocineros y eficiencia.",
      "Insight 3 sobre ventas totales de hoy contra un objetivo simulado de $5,000 MXN."
    ],
    "promotions": [
      "Idea de combo recomendada, p. ej. 'Combo Familiar Pastorcito: 10 al pastor + 2 refresco'",
      "Idea creativa de fidelización para clientes o incentivo para el mesero estrella."
    ],
    "chefJoke": "Un chiste corto y gracioso sobre tacos, taqueros o cebollitas para animar al dueño."
  }
  
  No agregues texto explicativo fuera del JSON. Devuelve EXACTAMENTE el objeto JSON de respuesta solicitado.
  `;

  if (!ai) {
    // Return a mock beautiful response if Gemini key is missing
    return res.json({
      summary: "¡La taquería va viento en popa! El movimiento de clientes demuestra que 'El Pastorcito' tiene de los tacos más codiciados del rumbo. Con un buen ritmo de pedidos, estamos capturando excelente rentabilidad.",
      insights: [
        `Los tacos "${summary.popularTacos[0]?.name || "Al Pastor"}" son reyes indiscutibles hoy representando la mayor demanda. Asegura buena provisión de carne y limones frescos.`,
        `El tiempo promedio de preparación es de ${summary.averagePrepTimeMinutes} minutos, dentro del rango ideal tradicional de tacos rápidos (menor a 10 min). ¡Don Chuy y el equipo están rifándosela!`,
        `Llevamos $${summary.totalRevenue} MXN de venta acumulada hoy. Estamos muy cerca de superar el récord histórico de fin de semana si mantenemos las mesas activas.`
      ],
      promotions: [
        `Combo "El Taquero Veloz": Paquete de 5 Tacos al Pastor + 1 Gringa + Agua de Horchata por un precio con 10% de descuento para agilizar el despacho en horas pico.`,
        "Incentivo 'Mesero de Oro': Ofrecer bono del 5% de propina extra directo de la caja al mesero destacado que complete más pedidos con salsas habaneras ordenadas."
      ],
      chefJoke: "¿Qué le dice un taquero al pastor a un cliente que tiene prisa? ¡No te preocupes marchante, que de aquí sales bien cenado y con todo! 🌮"
    });
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: businessContext,
      config: {
        responseMimeType: "application/json",
      },
    });

    const text = response.text.trim();
    const data = JSON.parse(text);
    res.json(data);
  } catch (error: any) {
    console.error("Gemini context analysis error:", error);
    res.status(500).json({ error: "Fallo la generación del análisis con IA", details: error.message });
  }
});

// Configure Vite or Serve static built assets
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Taquería El Pastorcito backend running on http://localhost:${PORT}`);
  });
}

startServer();
