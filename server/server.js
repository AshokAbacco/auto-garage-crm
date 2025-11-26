// server/server.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import morgan from "morgan";
import prisma from "./models/prismaClient.js";
import path from "path";
import authRoutes from "./routes/authRoutes.js";
import clientRoutes from "./routes/clientRoutes.js";
import serviceRoutes from "./routes/serviceRoutes.js";
import invoiceRoutes from "./routes/invoiceRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";
import reminderRoutes from "./routes/reminderRoutes.js";
import ocrRoutes from "./routes/OCRRoutes.js";
import paymentRoutes from "./routes/payments.js";
import userRoutes from "./routes/userRoutes.js";

import dashboardRoutes from './routes/dashboardRoutes.js';
import referralRoutes from "./routes/referral.js";

console.log("Models in Prisma:", Object.keys(prisma));


// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || "development";

/* -----------------------------------------------------
   🧩 Middleware Configuration
----------------------------------------------------- */

// Security HTTP headers
app.use(helmet());


  // Enable CORS (allow frontend connection)
  const allowedOrigins = [
    "http://localhost:5173",
    "https://auto-garage-crm-r7l4.onrender.com",
    "https://themotordesk.com",
    "https://www.themotordesk.com",

    "https://tm04xn0p-5173.inc1.devtunnels.ms"
  ];

  app.use(
    cors({
      origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl)
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin)) {
          return callback(null, true);
        } else {
          return callback(new Error("Not allowed by CORS"));
        }
      },
      credentials: true,
    })
  );

// Logging (Morgan)
app.use(morgan(NODE_ENV === "production" ? "combined" : "dev"));

// Parse JSON and URL-encoded payloads (with base64 image support)
const BODY_LIMIT = process.env.BODY_LIMIT || "10mb";
app.use(express.json({ limit: BODY_LIMIT }));
app.use(express.urlencoded({ extended: true, limit: BODY_LIMIT }));

/* -----------------------------------------------------
   🧠 Health Check Route
----------------------------------------------------- */
app.get("/api/health", (req, res) =>
  res.json({
    status: "ok",
    environment: NODE_ENV,
    timestamp: new Date().toISOString(),
  })
);
app.use(helmet());

// 🔥 Add this fix
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
  res.setHeader("Cross-Origin-Embedder-Policy", "unsafe-none");
  next();
});

app.use("/uploads", express.static("uploads"));

/* -----------------------------------------------------
   🚀 Mount API Routes
----------------------------------------------------- */
app.use("/api/user", userRoutes);
app.use("/api/auth", authRoutes); // 🔑 Auth routes (login/register/profile)
app.use("/api/clients", clientRoutes); // 👥 Client routes
app.use("/api/services", serviceRoutes); // 🧰 Service routes
app.use("/api/payments", paymentRoutes);

app.use("/api/invoices", invoiceRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/reminders", reminderRoutes);

app.use("/api/ocr", ocrRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use("/api/referral", referralRoutes);

app.use('/api/payments/razorpay-webhook', express.raw({ type: 'application/json' }));

/* -----------------------------------------------------
   ⚠️ 404 Handler (For undefined routes)
----------------------------------------------------- */
app.use((req, res, next) => {
  res.status(404).json({
    message: `Route not found: ${req.originalUrl}`,
  });
});

/* -----------------------------------------------------
   ❗ Global Error Handler
----------------------------------------------------- */
app.use((err, req, res, next) => {
  console.error("❌ Unhandled Error:", err);

  if (res.headersSent) return next(err);

  res.status(err.status || 500).json({
    message: err.message || "Internal Server Error",
    stack: NODE_ENV === "development" ? err.stack : undefined,
  });
});

/* -----------------------------------------------------
   🧩 Start Server
----------------------------------------------------- */
const server = app.listen(PORT, () => {
  console.log(`✅ Server running in ${NODE_ENV} mode on port ${PORT}`);
});

/* -----------------------------------------------------
   🧹 Graceful Shutdown (Prisma disconnect + server close)
----------------------------------------------------- */
const gracefulShutdown = async (signal) => {
  console.log(`\n🛑 ${signal} received: closing server...`);

  server.close(async () => {
    console.log("🧩 Disconnecting Prisma...");
    await prisma.$disconnect();
    console.log("✅ Server gracefully shut down.");
    process.exit(0);
  });
};

process.on("SIGINT", () => gracefulShutdown("SIGINT"));
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));

export default app;
