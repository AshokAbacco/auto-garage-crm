// server/controllers/clientController.js
import prisma from "../models/prismaClient.js";
import { z } from "zod";
import {
  sendWhatsAppTemplate,
  sendWhatsAppImage,
} from "../services/whatsappService.js";
import { uploadToR2 } from "../utils/r2Upload.js";

/**
 * ===========================
 * Validation Schemas (Zod)
 * ===========================
 */

const clientBaseSchema = z.object({
  fullName: z.string().min(2),
  phone: z.string().min(6),
  email: z.string().email().optional().nullable(),
  address: z.string().optional().nullable(),
  vehicleMake: z.string().min(1),
  vehicleModel: z.string().min(1),
  vehicleYear: z
    .preprocess(
      (val) => (val ? Number(val) : val),
      z.number().int().gte(1900).lte(2100),
    )
    .optional()
    .nullable(),
  regNumber: z.string().min(1),
  vin: z.string().optional().nullable(),
  fuel: z.string().optional().nullable(), // NEW
  seats: z.preprocess(
    (v) => (v ? Number(v) : null),
    z.number().int().optional().nullable(),
  ), // NEW
  carImage: z.string().optional().nullable(),
  adImage: z.string().optional().nullable(),
  staffPerson: z.string().optional().nullable(),
  receiverName: z.string().optional().nullable(),
  damageImages: z.array(z.string()).optional().nullable(),
});

const clientCreateSchema = clientBaseSchema;
const clientUpdateSchema = clientBaseSchema.partial();

const triggerVehicleReceivedWhatsApp = async (client, ownerId) => {
  try {
    const owner = await prisma.user.findUnique({
      where: { id: ownerId },
      select: { companyName: true },
    });

    if (!client?.phone) {
      console.log("❌ WhatsApp skipped — phone missing");
      return;
    }

    // Normalize phone to E.164 (India example)
    let rawPhone = client.phone.replace(/\D/g, "");

    if (rawPhone.length === 10) {
      rawPhone = `91${rawPhone}`;
    }

    if (!rawPhone.startsWith("91")) {
      rawPhone = `91${rawPhone}`;
    }

    const to = rawPhone;

    await sendWhatsAppTemplate({
      to,
      templateName: "vehicle_receive",
      languageCode: "en",
      variables: [
        client.fullName || "Customer",
        client.regNumber || "N/A",
        owner?.companyName || "Motor Desk",
      ],
    });

    console.log(`✅ Opt-in template sent to ${to}`);
  } catch (error) {
    console.error(
      `❌ Failed to send WhatsApp template to ${client?.phone}`,
      error?.response?.data || error.message,
    );
  }
};

/**
 * ===========================
 * GET all clients (with pagination & search)
 * @route GET /api/clients?page=1&limit=20&q=search
 * @access Private
 * ===========================
 */
export const getClients = async (req, res) => {
  const ownerId = req.user.type === "staff" ? req.user.ownerId : req.user.id;

  try {
    const page = Math.max(1, parseInt(req.query.page || "1"));
    const limit = Math.min(100, parseInt(req.query.limit || "50"));
    const skip = (page - 1) * limit;

    const where = {};

    // ✅ Show only current user's clients, unless admin
    if (req.user?.role !== "admin") {
      where.userId = ownerId;
    }

    // ✅ Optional search query
    if (req.query.q) {
      const q = String(req.query.q).trim();
      where.OR = [
        { fullName: { contains: q, mode: "insensitive" } },
        { phone: { contains: q, mode: "insensitive" } },
        { email: { contains: q, mode: "insensitive" } },
        { regNumber: { contains: q, mode: "insensitive" } },
        { vehicleMake: { contains: q, mode: "insensitive" } },
        { vehicleModel: { contains: q, mode: "insensitive" } },
      ];
    }

    const [total, clients] = await Promise.all([
      prisma.client.count({ where }),
      prisma.client.findMany({
        where,
        select: {
          id: true,
          fullName: true,
          phone: true,
          email: true,
          regNumber: true,
          vehicleMake: true,
          vehicleModel: true,
          vehicleYear: true,
          carImage: true,
          receiverName: true,
          createdAt: true,
          _count: { select: { services: true } },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
    ]);

    return res.status(200).json({
      data: clients,
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("❌ getClients error:", error);
    return res.status(500).json({
      message: error.message || "Error fetching clients",
      data: [],
      total: 0,
      page: 1,
    });
  }
};

/**
 * ===========================
 * GET client by ID
 * @route GET /api/clients/:id
 * @access Private
 * ===========================
 */
export const getClientById = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!id) return res.status(400).json({ error: "Invalid client id" });

    const client = await prisma.client.findUnique({
      where: { id },
      include: {
        services: { orderBy: { date: "desc" } },
        invoices: { orderBy: { createdAt: "desc" } },
        reminders: true,
      },
    });

    if (!client) return res.status(404).json({ error: "Client not found" });
    return res.json(client);
  } catch (err) {
    console.error("getClientById err:", err);
    return res.status(500).json({ error: "Server error" });
  }
};

/**
 * ===========================
 * CREATE new client
 * @route POST /api/clients
 * @access Private
 * ===========================
 */

/**
 * ===========================
 * CREATE new client
 * ===========================
 */
export const createClient = async (req, res) => {
  const ownerId = req.user.type === "staff" ? req.user.ownerId : req.user.id;
  try {
    // 1. Separate the WhatsApp flag from the Zod-validated data
    const { sendWhatsApp, ...rest } = req.body;
    const parsed = clientCreateSchema.parse(rest);

    const existing = await prisma.client.findFirst({
      where: {
        regNumber: parsed.regNumber,
        userId: ownerId,
      },
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        duplicate: true,
        message: `Already registered.`,
      });
    }

    const client = await prisma.client.create({
      data: {
        ...parsed,
        userId: ownerId || null,
        damageImages: parsed.damageImages ?? null,
      },
    });

    // 2. TRIGGER WHATSAPP IF FLAG IS TRUE
    if (sendWhatsApp) {
      // We don't 'await' this to prevent slowing down the HTTP response
      triggerVehicleReceivedWhatsApp(client, ownerId).catch(console.error);
    }

    return res.status(201).json(client);
  } catch (err) {
    console.error("createClient err:", err);
    if (err?.errors) return res.status(400).json({ error: err.errors });
    return res.status(500).json({ error: "Server error" });
  }
};

/**
 * ===========================
 * UPDATE client
 * ===========================
 */
export const updateClient = async (req, res) => {
  const ownerId = req.user.type === "staff" ? req.user.ownerId : req.user.id;
  try {
    const id = Number(req.params.id);
    if (!id) return res.status(400).json({ error: "Invalid client id" });

    // 1. Separate the WhatsApp flag from the update data
    const { sendWhatsApp, ...rest } = req.body;
    const parsed = clientUpdateSchema.parse(rest);

    const client = await prisma.client.update({
      where: { id },
      data: {
        ...parsed,
        damageImages: parsed.damageImages ?? undefined,
      },
    });

    // 2. TRIGGER WHATSAPP IF FLAG IS TRUE (Handles manual button & edit confirmation)
    if (sendWhatsApp) {
      triggerVehicleReceivedWhatsApp(client, ownerId).catch(console.error);
    }

    return res.json(client);
  } catch (err) {
    console.error("updateClient err:", err);
    if (err?.errors) return res.status(400).json({ error: err.errors });
    return res.status(500).json({ error: "Server error" });
  }
};

/**
 * ===========================
 * DELETE client
 * @route DELETE /api/clients/:id
 * @access Private
 * ===========================
 */
export const deleteClient = async (req, res) => {
  const ownerId = req.user.type === "staff" ? req.user.ownerId : req.user.id;

  try {
    const parsedId = parseInt(req.params.id);
    if (isNaN(parsedId)) {
      return res.status(400).json({ message: "Invalid client ID" });
    }

    const client = await prisma.client.findUnique({
      where: { id: parsedId },
      include: { services: true, invoices: true },
    });

    if (!client) {
      return res.status(404).json({ message: "Client not found" });
    }

    if (
      client.userId &&
      ownerId !== client.userId &&
      req.user?.role !== "admin"
    ) {
      return res
        .status(403)
        .json({ message: "Forbidden: you don't own this client" });
    }

    await prisma.service.deleteMany({ where: { clientId: parsedId } });
    await prisma.invoice.deleteMany({ where: { clientId: parsedId } });
    await prisma.client.delete({ where: { id: parsedId } });

    res
      .status(200)
      .json({ message: "Client and related records deleted successfully" });
  } catch (error) {
    console.error("Error deleting client:", error);
    res.status(500).json({ message: "Error deleting client" });
  }
};
