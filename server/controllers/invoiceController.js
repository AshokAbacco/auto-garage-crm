// server/controllers/invoiceController.js
import prisma from "../models/prismaClient.js";

function getOwnerUserId(req) {
  return req.user.type === "staff" ? req.user.ownerId : req.user.id;
}


/* ============================================================
   📄 Get All Invoices
   @route   GET /api/invoices
   @access  Private
============================================================ */
export const getInvoices = async (req, res) => {
  try {
    const ownerUserId = getOwnerUserId(req);

    const invoices = await prisma.invoice.findMany({
      where: {
        ownerUserId, // ✅ DIRECT & CORRECT
      },
      include: {
        ownerUser: {
          select: {
            companyName: true,
            email: true,
            phone: true,
            // gstNumber: true,
          },
        },
        client: {
          select: {
            id: true,
            fullName: true,
            phone: true,
            email: true,
            regNumber: true,
            vehicleMake: true,
            vehicleModel: true,
            vehicleYear: true,
          },
        },
        invoiceCostItems: {
          orderBy: { id: "asc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    res.status(200).json(invoices);
  } catch (error) {
    console.error("❌ Error fetching invoices:", error);
    res.status(500).json({
      message: "Error fetching invoices",
      error: String(error),
    });
  }
};



/* ============================================================
   📄 Get Invoice by ID
   @route   GET /api/invoices/:id
   @access  Private
============================================================ */
export const getInvoiceById = async (req, res) => {
  try {
    const { id } = req.params;
    const ownerUserId = getOwnerUserId(req);

    if (!id || isNaN(Number(id))) {
      return res.status(400).json({ message: "Invalid invoice ID" });
    }

    const invoice = await prisma.invoice.findFirst({
      where: {
        id: Number(id),
        ownerUserId, // ✅ DIRECT & CORRECT
      },
      include: {
        ownerUser: {
          select: {
            companyName: true,
            email: true,
            phone: true,
            // gstNumber: true,
            // address: true,
          },
        },
        client: {
          select: {
            id: true,
            fullName: true,
            phone: true,
            email: true,
            regNumber: true,
            vehicleMake: true,
            vehicleModel: true,
            vehicleYear: true,
          },
        },
        invoiceCostItems: {
          orderBy: { id: "asc" },
        },
      },
    });

    if (!invoice) {
      return res
        .status(404)
        .json({ message: "Invoice not found or access denied" });
    }

    res.status(200).json(invoice);
  } catch (error) {
    console.error("❌ Error fetching invoice:", error);
    res.status(500).json({
      message: "Error fetching invoice",
      error: String(error),
    });
  }
};

/* ============================================================
   ➕ Create Invoice
   @route   POST /api/invoices
   @access  Private
============================================================ */
export const createInvoice = async (req, res) => {
  try {
    const {
      clientId,
      vehicle,
      mechanic,
      paymentMode,
      status,
      dueDate,
      notes,
      serviceCategory,
      serviceSubCategory,
      serviceNotes,
      discount,
      costItems,
    } = req.body;

    const ownerUserId = getOwnerUserId(req);
    const createdById = req.user?.id ?? null;

    /* =======================
       Validation
    ======================= */
    if (!clientId || isNaN(Number(clientId))) {
      return res.status(400).json({ message: "Invalid clientId" });
    }

    if (!Array.isArray(costItems) || costItems.length === 0) {
      return res
        .status(400)
        .json({ message: "At least one cost item required" });
    }

    /* =======================
       Ownership check
    ======================= */
    const client = await prisma.client.findFirst({
      where: {
        id: Number(clientId),
        userId: ownerUserId,
      },
    });

    if (!client) {
      return res.status(403).json({ message: "Unauthorized client" });
    }

    /* =======================
       Calculate totals
    ======================= */
    let grandTotal = 0;

    const normalizedItems = costItems.map((item) => {
      const base = Number(item.quantity) * Number(item.unitPrice);
      const cgst = (base * Number(item.cgstRate || 0)) / 100;
      const sgst = (base * Number(item.sgstRate || 0)) / 100;
      const total = base + cgst + sgst;

      grandTotal += total;

      return {
        type: item.type,
        name: item.name,
        quantity: Number(item.quantity),
        unitPrice: Number(item.unitPrice),
        cgstRate: Number(item.cgstRate),
        sgstRate: Number(item.sgstRate),
        totalCost: total,
      };
    });

    const finalAmount = Math.floor(grandTotal - Number(discount || 0));

    if (finalAmount <= 0) {
      return res.status(400).json({ message: "Invalid total amount" });
    }

    /* =======================
       Create Invoice
    ======================= */
    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber: `INV-${Date.now()}`,
        clientId: Number(clientId),

        ownerUserId,
        createdById,

        vehicle: vehicle || null,
        mechanic: mechanic || null,

        discount: Number(discount || 0),
        grandTotal: finalAmount,

        paymentMode: paymentMode || null,
        status: status || "Pending",
        paidAt: status === "Paid" ? new Date() : null,
        dueDate: dueDate ? new Date(dueDate) : null,

        notes: notes || null,
        serviceCategory: serviceCategory || null,
        serviceSubCategory: serviceSubCategory || null,
        serviceNotes: serviceNotes || null,

        invoiceCostItems: {
          create: normalizedItems,
        },
      },
      include: {
        client: true,
        invoiceCostItems: true,
      },
    });

    return res.status(201).json({
      message: "✅ Invoice created successfully",
      invoice,
    });
  } catch (error) {
    console.error("❌ createInvoice error:", error);
    return res.status(500).json({
      message: "Failed to create invoice",
      error: String(error),
    });
  }
};

/* ============================================================
   ✏️ Update Invoice
   @route   PUT /api/invoices/:id
   @access  Private
============================================================ */
export const updateInvoice = async (req, res) => {
  try {
    const { id } = req.params;
    const ownerUserId = getOwnerUserId(req);

    if (!id || isNaN(Number(id))) {
      return res.status(400).json({ message: "Invalid invoice ID" });
    }

    const existing = await prisma.invoice.findFirst({
      where: {
        id: Number(id),
        ownerUserId, // ✅ CORRECT
      },
    });

    if (!existing) {
      return res.status(404).json({ message: "Invoice not found or access denied" });
    }

    const {
      clientId,
      vehicle,
      mechanic,
      paymentMode,
      status,
      dueDate,
      notes,
      serviceCategory,
      serviceSubCategory,
      serviceNotes,
      discount,
      costItems,
    } = req.body;

    if (!Array.isArray(costItems)) {
      return res.status(400).json({ message: "Invalid cost items" });
    }

    /* =======================
       Recalculate totals
    ======================= */
    let grandTotal = 0;

    const normalizedItems = costItems.map((item) => {
      const base = Number(item.quantity) * Number(item.unitPrice);
      const cgst = (base * Number(item.cgstRate || 0)) / 100;
      const sgst = (base * Number(item.sgstRate || 0)) / 100;
      const total = base + cgst + sgst;

      grandTotal += total;

      return {
        invoiceId: Number(id),
        type: item.type,
        name: item.name,
        quantity: Number(item.quantity),
        unitPrice: Number(item.unitPrice),
        cgstRate: Number(item.cgstRate),
        sgstRate: Number(item.sgstRate),
        totalCost: total,
      };
    });

    const finalAmount = Math.floor(grandTotal - Number(discount || 0));

    await prisma.invoice.update({
      where: { id: Number(id) },
      data: {
        clientId: clientId ? Number(clientId) : existing.clientId,
        vehicle: vehicle ?? existing.vehicle,
        mechanic: mechanic ?? existing.mechanic,

        discount: Number(discount || 0),
        grandTotal: finalAmount,

        paymentMode: paymentMode ?? existing.paymentMode,
        status: status ?? existing.status,
        paidAt: status === "Paid" ? new Date() : existing.paidAt,
        dueDate: dueDate ? new Date(dueDate) : existing.dueDate,

        notes: notes ?? existing.notes,
        serviceCategory: serviceCategory ?? existing.serviceCategory,
        serviceSubCategory: serviceSubCategory ?? existing.serviceSubCategory,
        serviceNotes: serviceNotes ?? existing.serviceNotes,
      },
    });

    /* =======================
       Replace cost items
    ======================= */
    await prisma.invoiceCostItem.deleteMany({
      where: { invoiceId: Number(id) },
    });

    if (normalizedItems.length) {
      await prisma.invoiceCostItem.createMany({
        data: normalizedItems,
      });
    }

    const updated = await prisma.invoice.findUnique({
      where: { id: Number(id) },
      include: {
        ownerUser: {
          select: {
            companyName: true,
            email: true,
            phone: true,
            gstNumber: true,
          },
        },
        client: true,
        invoiceCostItems: true,
      },
    });

    return res.status(200).json({
      message: "✅ Invoice updated successfully",
      invoice: updated,
    });
  } catch (error) {
    console.error("❌ updateInvoice error:", error);
    return res.status(500).json({
      message: "Failed to update invoice",
      error: String(error),
    });
  }
};

/* ============================================================
   🗑️ Delete Invoice
   @route   DELETE /api/invoices/:id
   @access  Private
============================================================ */
export const deleteInvoice = async (req, res) => {
  try {
    const { id } = req.params;
    const ownerUserId = getOwnerUserId(req);

    if (!id || isNaN(Number(id))) {
      return res.status(400).json({ message: "Invalid invoice ID" });
    }

    const invoice = await prisma.invoice.findFirst({
      where: {
        id: Number(id),
        ownerUserId, // ✅ CORRECT
      },
    });

    if (!invoice) {
      return res.status(404).json({ message: "Invoice not found or access denied" });
    }

    await prisma.invoice.delete({
      where: { id: Number(id) },
    });

    res.status(200).json({ message: "🗑️ Invoice deleted successfully" });
  } catch (error) {
    console.error("❌ Error deleting invoice:", error);
    res.status(500).json({
      message: "Error deleting invoice",
      error: String(error),
    });
  }
};

/* ============================================================
   📄 Get Clients (Paginated + Lightweight)
   @route   GET /api/clients
   @access  Private
============================================================ */
export const getClients = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page || "1"));
    const limit = Math.min(100, parseInt(req.query.limit || "50"));
    const skip = (page - 1) * limit;

    const where = { userId: getOwnerUserId(req) }; // Only get clients for the authenticated user

    if (req.query.q) {
      const q = String(req.query.q).trim().toLowerCase();
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
          createdAt: true,
          _count: { select: { services: true } },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
    ]);

    res.status(200).json({
      success: true,
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
      data: clients,
    });
  } catch (error) {
    console.error("❌ Error fetching clients:", error);
    res
      .status(500)
      .json({ message: "Error fetching clients", error: String(error) });
  }
};

/* ============================================================
   📄 Get Client by ID (Detailed)
   @route   GET /api/clients/:id
   @access  Private
============================================================ */
export const getClientById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id || isNaN(Number(id))) {
      return res.status(400).json({ message: "Invalid client ID" });
    }

    // Check that the client belongs to the authenticated user
    const client = await prisma.client.findFirst({
      where: {
        id: parseInt(id),
        userId: getOwnerUserId(req), // Filter by authenticated user
      },
      include: {
        services: {
          select: {
            id: true,
            notes: true,
            partsCost: true,
            partsGst: true,
            laborCost: true,
            laborGst: true,
            cost: true,
            status: true,
            date: true,
            invoiceId: true,
            category: {
              select: {
                name: true,
              },
            },
            subService: {
              select: {
                name: true,
              },
            },
          },
          orderBy: { date: "desc" },
        },
        invoices: {
          select: {
            id: true,
            invoiceNumber: true,
            totalAmount: true,
            grandTotal: true,
            paymentMode: true,
            status: true,
            dueDate: true,
            createdAt: true,
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!client) {
      return res
        .status(404)
        .json({ message: "Client not found or access denied" });
    }

    res.status(200).json({
      success: true,
      data: client,
    });
  } catch (error) {
    console.error("❌ Error fetching client:", error);
    res
      .status(500)
      .json({ message: "Error fetching client", error: String(error) });
  }
};

/* ============================================================
   🔄 Create Invoice from Service
   @route   POST /api/services/:id/create-invoice
   @access  Private
============================================================ */
export const createInvoiceFromService = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(Number(id))) {
      return res.status(400).json({ message: "Invalid service ID" });
    }

    const ownerUserId = getOwnerUserId(req);
    const createdById = req.user?.id ?? null;

    const service = await prisma.service.findFirst({
      where: {
        id: Number(id),
        client: { userId: ownerUserId },
      },
      include: {
        client: true,
        category: true,
        subService: true,
        serviceCostItems: true,
      },
    });

    if (!service) {
      return res
        .status(404)
        .json({ message: "Service not found or access denied" });
    }

    if (!service.serviceCostItems.length) {
      return res.status(400).json({
        message: "Service has no cost items to generate invoice",
      });
    }

    /* =======================
       Calculate totals
    ======================= */
    let grandTotal = 0;

    const normalizedItems = service.serviceCostItems.map((item) => {
      const base = Number(item.quantity) * Number(item.unitPrice);
      const cgst = (base * Number(item.cgstRate || 0)) / 100;
      const sgst = (base * Number(item.sgstRate || 0)) / 100;
      const total = base + cgst + sgst;

      grandTotal += total;

      return {
        type: item.type,
        name: item.name,
        quantity: Number(item.quantity),
        unitPrice: Number(item.unitPrice),
        cgstRate: Number(item.cgstRate),
        sgstRate: Number(item.sgstRate),
        totalCost: total,
      };
    });

    /* =======================
       Create Invoice
    ======================= */
    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber: `INV-${Date.now()}`,
        clientId: service.clientId,

        ownerUserId,
        createdById,

        vehicle: `${service.client.vehicleMake} ${service.client.vehicleModel}`,
        mechanic: service.mechanic || null,

        discount: 0,
        grandTotal,

        paymentMode: null,
        status: "Pending",

        serviceCategory: service.category?.name || null,
        serviceSubCategory: service.subService?.name || null,
        serviceNotes: service.notes || null,

        invoiceCostItems: {
          create: normalizedItems,
        },
      },
      include: {
        client: true,
        invoiceCostItems: true,
      },
    });

    /* =======================
       Mark service billed
    ======================= */
    await prisma.service.update({
      where: { id: service.id },
      data: {
        invoiceId: invoice.id,
        status: "Billed",
      },
    });

    return res.status(201).json({
      message: "✅ Invoice created from service successfully",
      invoice,
    });
  } catch (error) {
    console.error("❌ Error creating invoice from service:", error);
    return res.status(500).json({
      message: "Error creating invoice from service",
      error: String(error),
    });
  }
};



