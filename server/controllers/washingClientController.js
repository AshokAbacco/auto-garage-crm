// server/controllers/washingClientController.js
import prisma from "../models/prismaClient.js";
import { z } from "zod";
import { sendWhatsAppTemplate } from "../services/whatsappService.js";
/**
 * ===========================
 * Validation Schemas
 * ===========================
 */

/* ===========================
   WHATSAPP HELPER (WASH)
=========================== */
const triggerWashingReceivedWhatsApp = async (client) => {
  try {
    if (!client?.phone) {
      console.log("❌ WhatsApp skipped — phone missing");
      return;
    }

    // Normalize phone (India example)
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
      templateName: "vehicle_receive", // same template or create wash-specific
      languageCode: "en",
      variables: [
        client.fullName || "Customer",
        client.regNumber || "N/A",
        "Your Wash Center",
      ],
    });

    console.log(`✅ Wash opt-in template sent to ${to}`);
  } catch (error) {
    console.error(
      `❌ Failed to send WhatsApp template to ${client?.phone}`,
      error?.response?.data || error.message,
    );
  }
};

const washingClientSchema = z.object({
  fullName: z.string().min(2),
  phone: z.string().min(6),
  address: z.string().optional().nullable(),
  vehicleMake: z.string().min(1),
  vehicleModel: z.string().min(1),

  email: z.string().email().optional().nullable(), // <-- ADDED
  regNumber: z.string().optional().nullable(), // <-- ADDED

  mainImage: z.string().optional().nullable(),
  additionalImages: z.array(z.string()).optional().nullable(),
});

/**
 * ===========================
 * GET all washing clients
 * GET /api/washing-clients
 * ===========================
 * FIXED: Removed userId filter so all clients return
 */
export const getWashingClients = async (req, res) => {
  try {
    let where = {};

    // OWNER → all own clients
    if (req.user.type === "owner") {
      where.userId = req.user.id;
    }

    // WASH STAFF → team-based clients
    if (req.user.type === "wash-staff") {
      where.washTeamId = req.user.teamId;
    }

    const clients = await prisma.washingClient.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    res.json(clients);
  } catch (err) {
    console.error("getWashingClients error:", err);
    res.status(500).json({ message: "Failed to fetch washing clients" });
  }
};

/**
 * ===========================
 * GET washing client by ID
 * GET /api/washing-clients/:id
 * ===========================
 */
export const getWashingClientById = async (req, res) => {
  try {
    const id = Number(req.params.id);

    const client = await prisma.washingClient.findUnique({ where: { id } });
    if (!client) {
      return res.status(404).json({ message: "Client not found" });
    }

    res.json(client);
  } catch (err) {
    res.status(500).json({ message: "Error fetching client" });
  }
};

/**
 * ===========================
 * CREATE washing client
 * POST /api/washing-clients
 * ===========================
 */
export const createWashingClient = async (req, res) => {
  try {
    const { sendWhatsApp, ...body } = req.body;

    const parsed = washingClientSchema.parse(body);

    const data = { ...parsed };

    if (req.user.type === "owner") {
      data.userId = req.user.id;
    }

    if (req.user.type === "wash-staff") {
      data.washTeamId = req.user.teamId;
    }

    const client = await prisma.washingClient.create({ data });

    // ✅ Trigger WhatsApp
    if (sendWhatsApp) {
      triggerWashingReceivedWhatsApp(client).catch(console.error);
    }

    res.status(201).json(client);
  } catch (err) {
    console.error("createWashingClient error:", err);

    if (err?.errors) {
      return res.status(400).json({ error: err.errors });
    }

    res.status(500).json({ message: "Failed to create washing client" });
  }
};

/**
 * ===========================
 * UPDATE washing client
 * PUT /api/washing-clients/:id
 * ===========================
 */
export const updateWashingClient = async (req, res) => {
  try {
    const id = Number(req.params.id);

    const { sendWhatsApp, ...body } = req.body;

    const parsed = washingClientSchema.partial().parse(body);

    const updated = await prisma.washingClient.update({
      where: { id },
      data: parsed,
    });

    // ✅ Trigger WhatsApp
    if (sendWhatsApp) {
      triggerWashingReceivedWhatsApp(updated).catch(console.error);
    }

    return res.json(updated);
  } catch (err) {
    console.error("updateWashingClient error:", err);
    return res.status(500).json({ message: "Failed to update washing client" });
  }
};


/**
 * ===========================
 * DELETE washing client
 * DELETE /api/washing-clients/:id
 * ===========================
 */
export const deleteWashingClient = async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!id) {
      return res.status(400).json({ message: "Invalid client ID" });
    }

    await prisma.$transaction([
      // 🔹 WashingService uses clientId
      prisma.washingService.deleteMany({
        where: { clientId: id },
      }),

      // 🔹 WashBilling uses washingClientId
      prisma.washBilling.deleteMany({
        where: { washingClientId: id },
      }),

      // 🔹 Finally delete client
      prisma.washingClient.delete({
        where: { id },
      }),
    ]);

    res.json({ message: "Washing client deleted" });
  } catch (err) {
    console.error("DELETE ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};
