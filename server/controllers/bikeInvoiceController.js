import prisma from "../models/prismaClient.js";

/* ============================================================
   ✅ GET ALL BIKE INVOICES
============================================================ */
export const getBikeInvoices = async (req, res) => {
  try {
    const invoices = await prisma.bikeInvoice.findMany({
      where: {
        bike: {
          userId: req.user.id,
        },
      },
      include: {
        bike: true,
        services: true,
      },
      orderBy: { createdAt: "desc" },
    });

    res.json(invoices);
  } catch (error) {
    console.error("❌ getBikeInvoices error:", error);
    res.status(500).json({ message: "Failed to fetch bike invoices" });
  }
};

/* ============================================================
   ✅ GET SINGLE BIKE INVOICE
============================================================ */
export const getBikeInvoiceById = async (req, res) => {
  try {
    const { id } = req.params;

    const invoice = await prisma.bikeInvoice.findFirst({
      where: {
        id: Number(id),
        bike: {
          userId: req.user.id,
        },
      },
      include: {
        bike: true,
        services: true,
      },
    });

    if (!invoice)
      return res.status(404).json({ message: "Invoice not found" });

    res.json(invoice);
  } catch (error) {
    console.error("❌ getBikeInvoiceById error:", error);
    res.status(500).json({ message: "Failed to fetch bike invoice" });
  }
};

/* ============================================================
   ✅ CREATE BIKE INVOICE  (USED BY AddBilling.jsx)
============================================================ */
export const createBikeInvoice = async (req, res) => {
  try {
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
      return res.status(400).json({ message: "bikeId & grandTotal required" });
    }

    // ✅ Ownership Check
    const bike = await prisma.bike.findFirst({
      where: {
        id: Number(bikeId),
        userId: req.user.id,
      },
    });

    if (!bike)
      return res.status(403).json({ message: "Unauthorized bike access" });

    const invoiceNumber = `BIKE-INV-${Date.now()}`;

    const invoice = await prisma.bikeInvoice.create({
      data: {
        invoiceNumber,
        bikeId: Number(bikeId),

        vehicle,
        serviceCategory,
        serviceSubCategory,

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

        notes: notes || null,
      },
      include: {
        bike: true,
      },
    });

    res.status(201).json({
      message: "✅ Bike Invoice Created Successfully",
      invoice,
    });
  } catch (error) {
    console.error("❌ createBikeInvoice error:", error);
    res.status(500).json({ message: "Failed to create bike invoice" });
  }
};

/* ============================================================
   ✅ UPDATE BIKE INVOICE
============================================================ */
export const updateBikeInvoice = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      partsCost,
      partsGst,
      laborCost,
      laborGst,
      tax,
      discount,
      grandTotal,
      paymentMode,
      status,
      notes,
    } = req.body;

    const invoice = await prisma.bikeInvoice.findFirst({
      where: {
        id: Number(id),
        bike: {
          userId: req.user.id,
        },
      },
    });

    if (!invoice)
      return res.status(404).json({ message: "Invoice not found" });

    const updated = await prisma.bikeInvoice.update({
      where: { id: Number(id) },
      data: {
        partsCost: Number(partsCost || 0),
        partsGst: Number(partsGst || 0),
        laborCost: Number(laborCost || 0),
        laborGst: Number(laborGst || 0),
        tax: Number(tax || 0),
        discount: Number(discount || 0),
        grandTotal: Number(grandTotal || 0),
        paymentMode,
        status,
        paidAt: status === "Paid" ? new Date() : null,
        notes,
      },
      include: {
        bike: true,
        services: true,
      },
    });

    res.json({
      message: "✅ Bike Invoice Updated Successfully",
      invoice: updated,
    });
  } catch (error) {
    console.error("❌ updateBikeInvoice error:", error);
    res.status(500).json({ message: "Failed to update bike invoice" });
  }
};

/* ============================================================
   ✅ DELETE BIKE INVOICE
============================================================ */
export const deleteBikeInvoice = async (req, res) => {
  try {
    const { id } = req.params;

    const invoice = await prisma.bikeInvoice.findFirst({
      where: {
        id: Number(id),
        bike: {
          userId: req.user.id,
        },
      },
    });

    if (!invoice)
      return res.status(404).json({ message: "Invoice not found" });

    // ✅ Unlink services
    await prisma.bikeService.updateMany({
      where: { invoiceId: invoice.id },
      data: { invoiceId: null, status: "Pending" },
    });

    await prisma.bikeInvoice.delete({
      where: { id: invoice.id },
    });

    res.json({ message: "✅ Bike Invoice Deleted Successfully" });
  } catch (error) {
    console.error("❌ deleteBikeInvoice error:", error);
    res.status(500).json({ message: "Failed to delete bike invoice" });
  }
};
