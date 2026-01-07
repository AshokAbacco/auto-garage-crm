import prisma from "../models/prismaClient.js";
import { getOwnerUserId } from "../utils/getAdminId.js";

/* ============================================================
   GET ALL BIKE INVOICES
   GET /api/bike-invoices
============================================================ */
export const getBikeInvoices = async (req, res) => {
  try {
    const ownerUserId = getOwnerUserId(req.user);

   const role = String(req.user.role).toLowerCase();

    const whereCondition =
      role === "user"
        ? { ownerUserId }
        : { ownerUserId, createdById: req.user.id };


    const invoices = await prisma.bikeInvoice.findMany({
      where: whereCondition,
      include: {
        bike: true,
        bikeServices: true,
        invoiceItems: true,
      },
      orderBy: { createdAt: "desc" },
    });

    // Calculate totals for each invoice
    const fixedInvoices = invoices.map((inv) => {
      const partsSubtotal = inv.invoiceItems
        ?.filter(item => item.type === 'Part')
        .reduce((sum, item) => sum + (Number(item.quantity) * Number(item.unitPrice)), 0) || 0;
      
      const laborSubtotal = inv.invoiceItems
        ?.filter(item => item.type === 'Labor')
        .reduce((sum, item) => sum + (Number(item.quantity) * Number(item.unitPrice)), 0) || 0;
      
      const cgstTotal = inv.invoiceItems
        ?.reduce((sum, item) => sum + ((Number(item.quantity) * Number(item.unitPrice)) * Number(item.cgst) / 100), 0) || 0;
      
      const sgstTotal = inv.invoiceItems
        ?.reduce((sum, item) => sum + ((Number(item.quantity) * Number(item.unitPrice)) * Number(item.sgst) / 100), 0) || 0;
      
      const grandTotal = partsSubtotal + laborSubtotal + cgstTotal + sgstTotal - (Number(inv.discount) || 0);
      const balanceDue = grandTotal - (Number(inv.advancePaid) || 0);

      return {
        ...inv,
        partsSubtotal: Number(partsSubtotal.toFixed(2)),
        laborSubtotal: Number(laborSubtotal.toFixed(2)),
        cgstTotal: Number(cgstTotal.toFixed(2)),
        sgstTotal: Number(sgstTotal.toFixed(2)),
        grandTotal: Number(grandTotal.toFixed(2)),
        balanceDue: Number(balanceDue.toFixed(2)),
      };
    });

    res.json(fixedInvoices);
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
    const role = String(req.user.role).toLowerCase();

    const invoice = await prisma.bikeInvoice.findFirst({
     where:
      role === "user"
        ? { id, ownerUserId }
        : { id, ownerUserId, createdById: req.user.id },

      include: {
        bike: true,
        bikeServices: true,
        invoiceItems: true,
      },
    });

    if (!invoice) {
      return res.status(404).json({ message: "Invoice not found" });
    }

    // Calculate complete billing summary
    const partsSubtotal = invoice.invoiceItems
      ?.filter(item => item.type === 'Part')
      .reduce((sum, item) => sum + (Number(item.quantity) * Number(item.unitPrice)), 0) || 0;
    
    const laborSubtotal = invoice.invoiceItems
      ?.filter(item => item.type === 'Labor')
      .reduce((sum, item) => sum + (Number(item.quantity) * Number(item.unitPrice)), 0) || 0;
    
    const cgstTotal = invoice.invoiceItems
      ?.reduce((sum, item) => sum + ((Number(item.quantity) * Number(item.unitPrice)) * Number(item.cgst) / 100), 0) || 0;
    
    const sgstTotal = invoice.invoiceItems
      ?.reduce((sum, item) => sum + ((Number(item.quantity) * Number(item.unitPrice)) * Number(item.sgst) / 100), 0) || 0;
    
    const grandTotal = partsSubtotal + laborSubtotal + cgstTotal + sgstTotal - (Number(invoice.discount) || 0);
    const balanceDue = grandTotal - (Number(invoice.advancePaid) || 0);

    res.json({
      ...invoice,
      partsSubtotal: Number(partsSubtotal.toFixed(2)),
      laborSubtotal: Number(laborSubtotal.toFixed(2)),
      cgstTotal: Number(cgstTotal.toFixed(2)),
      sgstTotal: Number(sgstTotal.toFixed(2)),
      grandTotal: Number(grandTotal.toFixed(2)),
      balanceDue: Number(balanceDue.toFixed(2)),
    });
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
    const role = String(req.user.role).toLowerCase();

    const {
      bikeId,
      serviceId,              // ✅ NEW (optional)
      vehicle,
      serviceCategory,
      serviceSubCategory,
      notes,
      parsedInvoiceItems,
      discountType,
      discountValue,
      advancePaid,
      paymentMode,
      status = "Pending",
    } = req.body;

    /* ===============================
       NORMALIZE INVOICE ITEMS
    =============================== */
    let normalizedItems = parsedInvoiceItems;

    if (typeof normalizedItems === "string") {
      try {
        normalizedItems = JSON.parse(normalizedItems);
      } catch {
        return res.status(400).json({
          message: "Invalid parsedInvoiceItems format",
        });
      }
    }

    if (!Array.isArray(normalizedItems)) {
      normalizedItems = [];
    }

    if (!bikeId) {
      return res.status(400).json({ message: "bikeId is required" });
    }

    /* ===============================
       BIKE OWNERSHIP CHECK
    =============================== */
   const bike = await prisma.bike.findFirst({
      where:
        role === "user"
          ? { id: Number(bikeId), ownerUserId }
          : { id: Number(bikeId), ownerUserId, createdById: req.user.id },
    });


    if (!bike) {
      return res.status(403).json({ message: "Unauthorized bike access" });
    }

    /* ===============================
       🔥 FETCH SERVICE BILLING (FIX)
    =============================== */
    let serviceDiscount = 0;
    let serviceDiscountType = "Fixed Amount";
    let serviceAdvancePaid = 0;

    if (serviceId) {
      const service = await prisma.bikeService.findFirst({
        where:
          role === "user"
            ? { id: Number(serviceId), ownerUserId }
            : { id: Number(serviceId), ownerUserId, createdById: req.user.id },
        select: {
          discount: true,
          discountType: true,
          advancePaid: true,
        },
      });

      if (service) {
        serviceDiscount = Number(service.discount || 0);
        serviceDiscountType = service.discountType || "Fixed Amount";
        serviceAdvancePaid = Number(service.advancePaid || 0);
      }
    }

    /* ===============================
       CALCULATE TOTALS
    =============================== */
    const partsSubtotal =
      normalizedItems
        ?.filter(i => i.type === "Part")
        .reduce((s, i) => s + Number(i.quantity) * Number(i.unitPrice), 0) || 0;

    const laborSubtotal =
      normalizedItems
        ?.filter(i => i.type === "Labor")
        .reduce((s, i) => s + Number(i.quantity) * Number(i.unitPrice), 0) || 0;

    const cgstTotal =
      normalizedItems
        ?.reduce((s, i) => s + (Number(i.quantity) * Number(i.unitPrice) * Number(i.cgst || 0)) / 100, 0) || 0;

    const sgstTotal =
      normalizedItems
        ?.reduce((s, i) => s + (Number(i.quantity) * Number(i.unitPrice) * Number(i.sgst || 0)) / 100, 0) || 0;

    const baseAmount = partsSubtotal + laborSubtotal + cgstTotal + sgstTotal;

    /* ===============================
       DISCOUNT & ADVANCE (FIX)
    =============================== */
    const finalDiscountType = discountType || serviceDiscountType;

    const discount =
      discountValue !== undefined
        ? finalDiscountType === "Fixed Amount"
          ? Number(discountValue || 0)
          : (baseAmount * Number(discountValue || 0)) / 100
        : serviceDiscount;

    const finalAdvancePaid =
      advancePaid !== undefined ? Number(advancePaid || 0) : serviceAdvancePaid;

    const grandTotal = baseAmount - discount;
    const balanceDue = grandTotal - finalAdvancePaid;

    /* ===============================
       CREATE INVOICE
    =============================== */
    const invoice = await prisma.bikeInvoice.create({
      data: {
        invoiceNumber: `BIKE-INV-${Date.now()}`,
        bikeId: Number(bikeId),
        vehicle,
        serviceCategory,
        serviceSubCategory,
        notes,

        partsSubtotal: Number(partsSubtotal.toFixed(2)),
        laborSubtotal: Number(laborSubtotal.toFixed(2)),
        cgstTotal: Number(cgstTotal.toFixed(2)),
        sgstTotal: Number(sgstTotal.toFixed(2)),

        discountType: finalDiscountType,
        discount: Number(discount.toFixed(2)),
        advancePaid: Number(finalAdvancePaid.toFixed(2)),

        grandTotal: Number(grandTotal.toFixed(2)),
        balanceDue: Number(balanceDue.toFixed(2)),

        paymentMode,
        status,
        paidAt: status === "Paid" ? new Date() : null,

        ownerUserId,
        createdById: req.user.id,

        invoiceItems: {
          create: normalizedItems.map(item => ({
            type: item.type,
            name: item.type === "Labor" ? "Labor" : item.name || "Unnamed Part",
            quantity: Number(item.quantity),
            unitPrice: Number(item.unitPrice),
            cgst: Number(item.cgst || 0),
            sgst: Number(item.sgst || 0),
            total: Number(
              (
                Number(item.quantity) *
                Number(item.unitPrice) *
                (1 + (Number(item.cgst || 0) + Number(item.sgst || 0)) / 100)
              ).toFixed(2)
            ),
          })),
        },
      },
      include: {
        bike: true,
        invoiceItems: true,
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
      error: error.message,
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
    const role = String(req.user.role).toLowerCase();

    const {
      bikeId,
      vehicle,
      serviceCategory,
      serviceSubCategory,
      notes,
      parsedInvoiceItems,
      discountType = "Fixed Amount",
      discountValue = 0,
      advancePaid = 0,
      paymentMode,
      status = "Pending",
    } = req.body;

    /* 🔒 VERIFY OWNERSHIP */
    const invoice = await prisma.bikeInvoice.findFirst({
      where:
        role === "user"
          ? { id, ownerUserId }
          : { id, ownerUserId, createdById: req.user.id },
    });

    if (!invoice) {
      return res.status(404).json({ message: "Invoice not found or unauthorized" });
    }

    /* 🔁 NORMALIZE ITEMS */
    let items = parsedInvoiceItems;
    if (typeof items === "string") {
      try { items = JSON.parse(items); } catch { items = []; }
    }
    if (!Array.isArray(items)) items = [];

    /* 🔢 ONE-LINE TOTAL CALCULATION */
const partsSubtotal = items
  .filter(i => i.type === "Part")
  .reduce((s, i) => s + Number(i.quantity) * Number(i.unitPrice), 0);

const laborSubtotal = items
  .filter(i => i.type === "Labor")
  .reduce((s, i) => s + Number(i.quantity) * Number(i.unitPrice), 0);

const cgstTotal = items.reduce(
  (s, i) =>
    s + (Number(i.quantity) * Number(i.unitPrice) * Number(i.cgst || 0)) / 100,
  0
);

const sgstTotal = items.reduce(
  (s, i) =>
    s + (Number(i.quantity) * Number(i.unitPrice) * Number(i.sgst || 0)) / 100,
  0
);

const baseAmount = partsSubtotal + laborSubtotal + cgstTotal + sgstTotal;

const discount =
  discountType === "Percentage"
    ? (baseAmount * Number(discountValue || 0)) / 100
    : Number(discountValue || 0);

const grandTotal = baseAmount - discount;
const balanceDue = grandTotal - Number(advancePaid || 0);

    /* 💾 UPDATE INVOICE */
    const updatedInvoice = await prisma.bikeInvoice.update({
      where: { id },
      data: {
        bikeId: Number(bikeId),
        vehicle,
        serviceCategory,
        serviceSubCategory,
        notes,

        partsSubtotal,
        laborSubtotal,
        cgstTotal,
        sgstTotal,
        discountType,
        discount,
        advancePaid,
        grandTotal,
        balanceDue,

        paymentMode,
        status,
        paidAt: status === "Paid" ? new Date() : null,

        invoiceItems: {
          deleteMany: {},
          create: items.map(i => ({
            type: i.type,
            name: i.type === "Labor" ? "Labor" : i.name || "Unnamed Part",
            quantity: Number(i.quantity),
            unitPrice: Number(i.unitPrice),
            cgst: Number(i.cgst || 0),
            sgst: Number(i.sgst || 0),
            total: Number(
              (Number(i.quantity) * Number(i.unitPrice)) *
              (1 + (Number(i.cgst || 0) + Number(i.sgst || 0)) / 100)
            ),
          })),
        },
      },
      include: { bike: true, invoiceItems: true },
    });

    res.json({ message: "Invoice updated successfully", invoice: updatedInvoice });
  } catch (err) {
    console.error("updateBikeInvoice error:", err);
    res.status(500).json({ message: "Failed to update invoice", error: err.message });
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
    const role = String(req.user.role).toLowerCase();

    const invoice = await prisma.bikeInvoice.findFirst({
      where:
        role === "user"
          ? { id, ownerUserId }
          : { id, ownerUserId, createdById: req.user.id },
    });

    if (!invoice) {
      return res.status(404).json({ message: "Invoice not found" });
    }

    // Delete invoice items first
    await prisma.invoiceItem.deleteMany({
      where: { bikeInvoiceId: invoice.id },
    });

    // 🔒 Detach services
    await prisma.bikeService.updateMany({
      where: { bikeInvoiceId: invoice.id },
      data: { bikeInvoiceId: null, status: "Pending" },
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