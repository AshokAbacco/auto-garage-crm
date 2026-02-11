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

// import dashboardRoutes from "./routes/dashboardRoutes.js";
import carDashboardRoutes from "./routes/carDashboardRoutes.js";

import referralRoutes from "./routes/referral.js";

//washing crm import statements
import washingClientRoutes from "./routes/washingRoutes.js";
import washingServiceRoutes from "./routes/washingserviceRoutes.js";
import washBillingRoutes from "./routes/washInvoiceRoutes.js";
import teamsRoutes from "./routes/teamsRoutes.js"; // adjust path if needed
import washingStaffRoutes from "./routes/washingStaffRoutes.js";
import washingStaffSalaryRoutes from "./routes/washingStaffSalaryRoutes.js";

//bike routes
import bikeRoutes from "./routes/bikeRoutes.js";
import bikeServiceRoutes from "./routes/bikeServiceRoutes.js";
import bikeInvoiceRoutes from "./routes/bikeInvoiceRoutes.js";
import bikeReminderRoutes from "./routes/bikeRemindersRoutes.js";
import carStaffRoutes from "./routes/carStaffRoutes.js";
import bikeOCRRoutes from "./routes/BikeOCRRoutes.js";
import bikeStaffSalaryRoutes from "./routes/BikeStaffSalaryRoutes.js";
import staffRoutes from "./routes/bikeStaffRoutes.js";
import bikeMetaRoutes from "./routes/bikeMetaRoutes.js";
import bikeTeamRoutes from "./routes/bikeTeamRoutes.js";
import { protect } from "./middleware/authMiddleware.js";

import carRoutes from "./routes/carRoutes.js";
import staffAuthRoutes from "./routes/staffAuthRoutes.js";
import carstaffSalaryRoutes from "./routes/carStaffSalaryRoutes.js";
import serviceApprovalRoutes from "./routes/serviceApprovalRoutes.js";
import whatsappRoutes from "./routes/whatsappRoutes.js";
import whatsappWebhookRoutes from "./routes/whatsappWebhookRoutes.js";
import dynamicTableRoutes from "./routes/dynamic-table.routes.js";
import dynamicColumnRoutes from "./routes/dynamic-column.routes.js";
import dynamicRowRoutes from "./routes/dynamic-row.routes.js";
import dynamicReadRoutes from "./routes/dynamic-read.routes.js";
import testRoutes from "./routes/test.routes.js";
import serviceMediaRoutes from "./routes/serviceMedia.routes.js";
import invoiceRenderRoutes from "./routes/invoiceRender.routes.js";




// console.log("Models in Prisma:", Object.keys(prisma));

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;
const NODE_ENV = process.env.NODE_ENV || "development";

// Enable CORS (allow frontend connection)
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "https://auto-garage-crm-r7l4.onrender.com",
  "https://themotordesk.com",
  "https://www.themotordesk.com",
  "https://ld3bgq17-5173.inc1.devtunnels.ms",
  "https://xkdtp4zp-5173.inc1.devtunnels.ms",
  "https://86w0932d-5173.inc1.devtunnels.ms",
];

// app.use(
//   cors({
//     origin: function (origin, callback) {
//       // Allow requests with no origin (like mobile apps or curl)
//       if (!origin) return callback(null, true);
//       if (allowedOrigins.includes(origin)) {
//         return callback(null, true);
//       } else {
//         return callback(new Error("Not allowed by CORS"));
//       }
//     },
//     credentials: true,
//   })
// );

app.use(
  cors({
    origin: function (origin, callback) {
      // ✅ Allow mobile apps, Postman, curl, server-to-server (no origin)
      if (!origin) {
        return callback(null, true);
      }

      // ✅ Allow known browser frontends
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      // ✅ IMPORTANT: do NOT block API clients
      return callback(null, true);
    },
  }),
);

// 🔥 RAW BODY for Razorpay webhook (/api/payments)
app.post(
  "/api/payments/razorpay-webhook",
  express.raw({ type: "application/json" }),
);
app.use("/api/whatsapp", whatsappWebhookRoutes);

/* -----------------------------------------------------
   🧩 Middleware Configuration
----------------------------------------------------- */

// Security HTTP headers
app.use(helmet());

// Logging (Morgan)
app.use(morgan(NODE_ENV === "production" ? "combined" : "dev"));

// Parse JSON and URL-encoded payloads (with base64 image support)
const BODY_LIMIT = process.env.BODY_LIMIT || "10mb";
app.use(express.json({ limit: BODY_LIMIT }));
app.use(express.urlencoded({ extended: true, limit: BODY_LIMIT }));

app.use("/api/payments", paymentRoutes);

/* -----------------------------------------------------
   🧠 Health Check Route
----------------------------------------------------- */
app.get("/api/health", (req, res) =>
  res.json({
    status: "ok",
    environment: NODE_ENV,
    timestamp: new Date().toISOString(),
  }),
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

// bike routes
app.use("/api/bikes", bikeRoutes);
app.use("/api/bike-services", bikeServiceRoutes);
app.use("/api/bike-invoices", protect, bikeInvoiceRoutes);
app.use("/api/bike-reminders", bikeReminderRoutes);
app.use("/api/bike-ocr", bikeOCRRoutes);
app.use("/api/bike-staff-salary", protect, bikeStaffSalaryRoutes);
app.use("/api/staff", staffRoutes);
app.use("/api/bikes-meta", bikeMetaRoutes);
app.use("/api/bikes-team", bikeTeamRoutes);

//car company names and models
app.use("/api/cars", carRoutes);

app.use("/api/car-staff", carStaffRoutes);
app.use("/api/staff-auth", staffAuthRoutes);
app.use("/api/carstaff-salary", carstaffSalaryRoutes);

app.use("/api", serviceApprovalRoutes);
app.use("/api", whatsappRoutes);

app.use("/api/dynamic-tables", dynamicTableRoutes);
app.use("/api/dynamic-columns", dynamicColumnRoutes);
app.use("/api/dynamic-rows", dynamicRowRoutes);
app.use("/api/dynamic", dynamicReadRoutes);
app.use("/api", invoiceRenderRoutes);


/* -----------------------------------------------------
   🚀 Mount API Routes
----------------------------------------------------- */
app.use("/api/user", userRoutes);
app.use("/api/auth", authRoutes); // 🔑 Auth routes (login/register/profile)
app.use("/api/clients", clientRoutes); // 👥 Client routes
app.use("/api/services", serviceRoutes); // 🧰 Service routes

app.use("/api/invoices", invoiceRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/reminders", reminderRoutes);
// server/index.js OR app.js
app.use("/uploads", express.static("uploads"));

app.use("/api/ocr", ocrRoutes);
// app.use("/api/dashboard", dashboardRoutes);
app.use("/api/dashboard", carDashboardRoutes);
app.use("/api/referral", referralRoutes);

//washing washing related routes
app.use("/api/washing-clients", washingClientRoutes);
app.use("/api/washing-services", washingServiceRoutes);
app.use("/api/wash-billing", washBillingRoutes);
app.use("/api/teams", teamsRoutes);
app.use("/api/washing-staff", washingStaffRoutes);
app.use("/api/washing-staff-salary", washingStaffSalaryRoutes);
app.use("/api/test", testRoutes);
app.use("/api", serviceMediaRoutes);

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
