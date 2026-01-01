import prisma from "../models/prismaClient.js";
import { getOwnerUserId } from "../utils/getAdminId.js";

/* ============================================================
   GET ALL BIKE INVOICES
   GET /api/bike-invoices
============================================================ */
export const getBikeInvoices = async (req, res) => {
  try {
    const ownerUserId = getOwnerUserId(req.user);

    const whereCondition =
      req.user.role === "user"
        ? { ownerUserId }
        : { ownerUserId, createdById: req.user.id };

    const invoices = await prisma.bikeInvoice.findMany({
      where: whereCondition,
      include: {
        bike: true,
        services: true,
      },
      orderBy: { createdAt: "desc" },
    });

    res.json(invoices);
  } catch (error) {
    console.error("getBikeInvoices error:", error);
    res.status(500).json({
      message: "Failed to fetch bike invoices",
    });
  }
};

/* ============================================================
   GET SINGLE BIKE INVOICE
   GET /api/bike-invoices/:id
============================================================ */
export const getBikeInvoiceById = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const ownerUserId = getOwnerUserId(req.user);

    const invoice = await prisma.bikeInvoice.findFirst({
      where:
        req.user.role === "user"
          ? { id, ownerUserId }
          : { id, ownerUserId, createdById: req.user.id },
      include: {
        bike: true,
        services: true,
      },
    });

    if (!invoice) {
      return res.status(404).json({ message: "Invoice not found" });
    }

    res.json(invoice);
  } catch (error) {
    console.error("getBikeInvoiceById error:", error);
    res.status(500).json({
      message: "Failed to fetch bike invoice",
    });
  }
};

/* ============================================================
   CREATE BIKE INVOICE
   POST /api/bike-invoices
============================================================ */
export const createBikeInvoice = async (req, res) => {
  try {
    const ownerUserId = getOwnerUserId(req.user);

    const {
      bikeId,
      vehicle,
      serviceCategory,
      serviceSubCategory,
      partsCost = 0,
      partsGst = 0,
      laborCost = 0,
      laborGst = 0,
      tax = 0,
      discount = 0,
      grandTotal,
      paymentMode,
      status = "Pending",
      notes,
    } = req.body;

    if (!bikeId || !grandTotal) {
      return res.status(400).json({
        message: "bikeId and grandTotal are required",
      });
    }

    // 🔐 Bike ownership check
    const bike = await prisma.bike.findFirst({
      where:
        req.user.role === "user"
          ? { id: Number(bikeId), ownerUserId }
          : {
              id: Number(bikeId),
              ownerUserId,
              createdById: req.user.id,
            },
    });

    if (!bike) {
      return res.status(403).json({
        message: "Unauthorized bike access",
      });
    }

    const invoiceNumber = `BIKE-INV-${Date.now()}`;

    const invoice = await prisma.bikeInvoice.create({
      data: {
        invoiceNumber,
        bikeId: Number(bikeId),
        vehicle,

        partsCost: Number(partsCost),
        partsGst: Number(partsGst),
        laborCost: Number(laborCost),
        laborGst: Number(laborGst),
        tax: Number(tax),
        discount: Number(discount),
        grandTotal: Number(grandTotal),

        paymentMode,
        status,
        paidAt: status === "Paid" ? new Date() : null,

        ownerUserId,
        createdById: req.user.id,
      },
      include: {
        bike: true,
      },
    });


    res.status(201).json({
      message: "Bike invoice created successfully",
      invoice,
    });
  } catch (error) {
    console.error("createBikeInvoice error:", error);
    res.status(500).json({
      message: "Failed to create bike invoice",
    });
  }
};

/* ============================================================
   UPDATE BIKE INVOICE
   PUT /api/bike-invoices/:id
============================================================ */
export const updateBikeInvoice = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const ownerUserId = getOwnerUserId(req.user);

    const existing = await prisma.bikeInvoice.findFirst({
      where:
        req.user.role === "user"
          ? { id, ownerUserId }
          : { id, ownerUserId, createdById: req.user.id },
    });

    if (!existing) {
      return res.status(404).json({ message: "Invoice not found" });
    }

    const updated = await prisma.bikeInvoice.update({
      where: { id },
      data: {
        partsCost: Number(req.body.partsCost || 0),
        partsGst: Number(req.body.partsGst || 0),
        laborCost: Number(req.body.laborCost || 0),
        laborGst: Number(req.body.laborGst || 0),
        tax: Number(req.body.tax || 0),
        discount: Number(req.body.discount || 0),
        grandTotal: Number(req.body.grandTotal || 0),
        paymentMode: req.body.paymentMode,
        status: req.body.status,
        paidAt: req.body.status === "Paid" ? new Date() : null,
         
      },
      include: {
        bike: true,
        services: true,
      },
    });

    res.json({
      message: "Bike invoice updated successfully",
      invoice: updated,
    });
  } catch (error) {
    console.error("updateBikeInvoice error:", error);
    res.status(500).json({
      message: "Failed to update bike invoice",
    });
  }
};

/* ============================================================
   DELETE BIKE INVOICE
   DELETE /api/bike-invoices/:id
============================================================ */
export const deleteBikeInvoice = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const ownerUserId = getOwnerUserId(req.user);

    const invoice = await prisma.bikeInvoice.findFirst({
      where:
        req.user.role === "user"
          ? { id, ownerUserId }
          : { id, ownerUserId, createdById: req.user.id },
    });

    if (!invoice) {
      return res.status(404).json({ message: "Invoice not found" });
    }

    // 🔁 Detach services
    await prisma.bikeService.updateMany({
      where: { invoiceId: invoice.id },
      data: { invoiceId: null, status: "Pending" },
    });

    await prisma.bikeInvoice.delete({
      where: { id: invoice.id },
    });

    res.json({
      message: "Bike invoice deleted successfully",
    });
  } catch (error) {
    console.error("deleteBikeInvoice error:", error);
    res.status(500).json({
      message: "Failed to delete bike invoice",
    });
  }
};
