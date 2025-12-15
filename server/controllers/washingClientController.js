// server/controllers/washingClientController.js
import prisma from "../models/prismaClient.js";
import { z } from "zod";

/**
 * ===========================
 * Validation Schemas
 * ===========================
 */
const washingClientSchema = z.object({
  fullName: z.string().min(2),
  phone: z.string().min(6),
  address: z.string().optional().nullable(),
  vehicleMake: z.string().min(1),
  vehicleModel: z.string().min(1),
  mainImage: z.string().optional().nullable(),
  additionalImages: z.array(z.string()).optional().nullable(),
});

/**
 * ===========================
 * GET all washing clients
 * GET /api/washing-clients
 * ===========================
 */
export const getWashingClients = async (req, res) => {
  try {
    const clients = await prisma.washingClient.findMany({
      where: {
        userId: req.user?.id,
      },
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
    const parsed = washingClientSchema.parse(req.body);

    const client = await prisma.washingClient.create({
      data: {
        ...parsed,
        userId: req.user?.id,
      },
    });

    res.status(201).json(client);
  } catch (err) {
    console.error("createWashingClient error:", err);
    if (err?.errors) {
      return res.status(400).json({ error: err.errors });
    }
    res.status(500).json({ message: "Failed to create washing client" });
  }
};

export const updateWashingClient = async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!id) {
      return res.status(400).json({ message: "Invalid client ID" });
    }

    const parsed = washingClientSchema.partial().parse(req.body);

    const updated = await prisma.washingClient.update({
      where: { id },
      data: {
        ...parsed,
      },
    });

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

    await prisma.washingClient.delete({
      where: { id },
    });

    res.json({ message: "Washing client deleted" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete client" });
  }
};
