// server/controllers/invoiceController.js
import prisma from "../models/prismaClient.js";

/* ============================================================
   📄 Get All Invoices
   @route   GET /api/invoices
   @access  Private
============================================================ */
export const getInvoices = async (req, res) => {
  try {
    // Only get invoices for the authenticated user's clients
    const invoices = await prisma.invoice.findMany({
      where: {
        client: {
          userId: req.user.id, // Only get invoices for this user's clients
        },
      },
      include: {
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
        services: {
          select: {
            id: true,
            date: true,
            notes: true,
            partsCost: true,
            partsGst: true,
            laborCost: true,
            laborGst: true,
            cost: true,
            status: true,
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
        },
        invoiceCostItems: true,
      },
      orderBy: { createdAt: "desc" },
    });

    res.status(200).json(invoices);
  } catch (error) {
    console.error("❌ Error fetching invoices:", error);
    res
      .status(500)
      .json({ message: "Error fetching invoices", error: String(error) });
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

    if (!id || isNaN(Number(id))) {
      return res.status(400).json({ message: "Invalid or missing invoice ID" });
    }

    // Check that the invoice belongs to a client of the authenticated user
    const invoice = await prisma.invoice.findFirst({
      where: {
        id: parseInt(id),
        client: {
          userId: req.user.id, // Ensure invoice belongs to current user's client
        },
      },
      include: {
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
        services: {
          select: {
            id: true,
            date: true,
            notes: true,
            partsCost: true,
            partsGst: true,
            laborCost: true,
            laborGst: true,
            cost: true,
            status: true,
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
        },
        invoiceCostItems: true,
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
    res
      .status(500)
      .json({ message: "Error fetching invoice", error: String(error) });
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
      partsCost,
      partsGst,
      laborCost,
      laborGst,
      totalAmount,
      tax,
      discount,
      grandTotal,
      paymentMode,
      status,
      dueDate,
      notes,
      serviceCategory,
      serviceSubCategory,
      serviceNotes,
      costItems,
    } = req.body;

    /* =======================
       🔎 Validation
    ======================= */
    if (!clientId || Number.isNaN(Number(clientId))) {
      return res
        .status(400)
        .json({ message: "clientId is required and must be a number" });
    }

    if (!grandTotal || Number(grandTotal) <= 0) {
      return res
        .status(400)
        .json({ message: "grandTotal must be greater than 0" });
    }

    /* =======================
       🔐 Ownership check
    ======================= */
    const client = await prisma.client.findFirst({
      where: {
        id: Number(clientId),
        userId: req.user.id,
      },
    });

    if (!client) {
      return res.status(403).json({
        message: "You are not authorized to create an invoice for this client",
      });
    }

    /* =======================
       🧾 Generate invoice number
    ======================= */
    const invoiceNumber = `INV-${new Date()
      .toISOString()
      .slice(0, 10)
      .replace(/-/g, "")}-${Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, "0")}`;

    /* =======================
       🧠 Create Invoice
    ======================= */
    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber,
        clientId: Number(clientId),

        totalAmount: Number(totalAmount) || 0,
        partsCost: Number(partsCost) || 0,
        partsGst: Number(partsGst) || 0,
        laborCost: Number(laborCost) || 0,
        laborGst: Number(laborGst) || 0,

        tax: Number(tax) || 0,
        discount: Number(discount) || 0,
        grandTotal: Number(grandTotal),

        paymentMode: paymentMode || null,
        status: status || "Pending",
        paidAt: status === "Paid" ? new Date() : null,
        dueDate: dueDate ? new Date(dueDate) : null,

        notes: notes || null,
        serviceCategory: serviceCategory || null,
        serviceSubCategory: serviceSubCategory || null,
        serviceNotes: serviceNotes || null,
        mechanic: mechanic || null,
        vehicle: vehicle || null,
      },
    });

    /* =======================
       📦 Cost Items (optional)
    ======================= */
    if (Array.isArray(costItems) && costItems.length > 0) {
      await prisma.invoiceCostItem.createMany({
        data: costItems.map((item) => ({
          invoiceId: invoice.id,
          partName: item.partName || "",
          partCost: Number(item.partCost) || 0,
          partGst: Number(item.partGst) || 0,
          laborCost: Number(item.laborCost) || 0,
          laborGst: Number(item.laborGst) || 0,
          totalCost:
            (Number(item.partCost) || 0) +
            ((Number(item.partCost) || 0) * (Number(item.partGst) || 0)) / 100 +
            (Number(item.laborCost) || 0) +
            ((Number(item.laborCost) || 0) * (Number(item.laborGst) || 0)) /
              100,
        })),
      });
    }

    /* =======================
       📤 Response
    ======================= */
    const fullInvoice = await prisma.invoice.findUnique({
      where: { id: invoice.id },
      include: {
        client: true,
        invoiceCostItems: true,
      },
    });

    return res.status(201).json({
      message: "✅ Invoice created successfully",
      invoice: fullInvoice,
    });
  } catch (error) {
    console.error("❌ Error creating invoice:", error);
    return res.status(500).json({
      message: "Error creating invoice",
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

    if (!id || isNaN(Number(id))) {
      return res.status(400).json({ message: "Invalid invoice ID" });
    }

    // Check that the invoice belongs to a client of the authenticated user
    const existingInvoice = await prisma.invoice.findFirst({
      where: {
        id: parseInt(id),
        client: {
          userId: req.user.id, // Ensure invoice belongs to current user's client
        },
      },
    });

    if (!existingInvoice) {
      return res
        .status(404)
        .json({ message: "Invoice not found or access denied" });
    }

    const {
      invoiceNumber,
      date,
      vehicle,
      mechanic,
      description,
      partsCost,
      partsGst,
      laborCost,
      laborGst,
      totalAmount,
      tax,
      discount,
      grandTotal,
      paymentMode,
      status,
      dueDate,
      notes,
      serviceType,
      serviceCategory,
      serviceSubCategory,
      serviceNotes,
      costItems, // Array of cost items
    } = req.body;

    // Validation
    if (!grandTotal) {
      return res
        .status(400)
        .json({ message: "Total amount must be greater than 0" });
    }

    // If changing client, verify the new client belongs to the authenticated user
    if (
      req.body.clientId &&
      parseInt(req.body.clientId) !== existingInvoice.clientId
    ) {
      const client = await prisma.client.findFirst({
        where: {
          id: parseInt(req.body.clientId),
          userId: req.user.id, // Ensure new client belongs to current user
        },
      });

      if (!client) {
        return res.status(403).json({
          message:
            "You are not authorized to assign this invoice to the specified client",
        });
      }
    }

    // Update the invoice
    const updatedInvoice = await prisma.invoice.update({
      where: { id: parseInt(id) },
      data: {
        invoiceNumber: invoiceNumber || existingInvoice.invoiceNumber,
        totalAmount: parseFloat(totalAmount) || existingInvoice.totalAmount,
        partsCost: parseFloat(partsCost) || existingInvoice.partsCost,
        partsGst: parseFloat(partsGst) || existingInvoice.partsGst,
        laborCost: parseFloat(laborCost) || existingInvoice.laborCost,
        laborGst: parseFloat(laborGst) || existingInvoice.laborGst,
        tax: parseFloat(tax) || existingInvoice.tax,
        discount: parseFloat(discount) || existingInvoice.discount,
        grandTotal: parseFloat(grandTotal) || existingInvoice.grandTotal,
        paymentMode: paymentMode || existingInvoice.paymentMode,
        status: status || existingInvoice.status,
        paidAt: status === "Paid" ? new Date() : existingInvoice.paidAt,
        dueDate: dueDate ? new Date(dueDate) : existingInvoice.dueDate,
        notes: notes !== undefined ? notes : existingInvoice.notes,
        // Service details
        serviceType: serviceType || existingInvoice.serviceType,
        serviceCategory: serviceCategory || existingInvoice.serviceCategory,
        serviceSubCategory:
          serviceSubCategory || existingInvoice.serviceSubCategory,
        serviceNotes: serviceNotes || existingInvoice.serviceNotes,
        mechanic: mechanic || existingInvoice.mechanic,
        vehicle: vehicle || existingInvoice.vehicle,
        clientId: req.body.clientId
          ? parseInt(req.body.clientId)
          : existingInvoice.clientId,
      },
    });

    // Handle cost items if provided
    // Handle cost items if provided
    if (Array.isArray(costItems)) {
      const invoiceId = parseInt(id);

      // Delete existing cost items
      await prisma.invoiceCostItem.deleteMany({
        where: { invoiceId },
      });

      // Recreate cost items
      if (costItems.length > 0) {
        await prisma.invoiceCostItem.createMany({
          data: costItems.map((item) => ({
            invoiceId,
            partName: item.partName || "",
            partCost: Number(item.partCost) || 0,
            partGst: Number(item.partGst) || 0,
            laborCost: Number(item.laborCost) || 0,
            laborGst: Number(item.laborGst) || 0,
            totalCost:
              (Number(item.partCost) || 0) +
              ((Number(item.partCost) || 0) * Number(item.partGst || 0)) / 100 +
              (Number(item.laborCost) || 0) +
              ((Number(item.laborCost) || 0) * Number(item.laborGst || 0)) /
                100,
          })),
        });
      }
    }

    // Return the updated invoice with details
    const result = await prisma.invoice.findUnique({
      where: { id: parseInt(id) },
      include: {
        client: true,
        invoiceCostItems: true,
      },
    });

    res.status(200).json({
      message: "✅ Invoice updated successfully",
      invoice: result,
    });
  } catch (error) {
    console.error("❌ Error updating invoice:", error);
    res
      .status(500)
      .json({ message: "Error updating invoice", error: String(error) });
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

    if (!id || isNaN(Number(id))) {
      return res.status(400).json({ message: "Invalid invoice ID" });
    }

    // Check that the invoice belongs to a client of the authenticated user
    const invoice = await prisma.invoice.findFirst({
      where: {
        id: parseInt(id),
        client: {
          userId: req.user.id, // Ensure invoice belongs to current user's client
        },
      },
    });

    if (!invoice) {
      return res
        .status(404)
        .json({ message: "Invoice not found or access denied" });
    }

    // Delete the invoice (cascade will delete related cost items)
    await prisma.invoice.delete({
      where: { id: parseInt(id) },
    });

    res.status(200).json({ message: "🗑️ Invoice deleted successfully" });
  } catch (error) {
    console.error("❌ Error deleting invoice:", error);
    res
      .status(500)
      .json({ message: "Error deleting invoice", error: String(error) });
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

    const where = { userId: req.user.id }; // Only get clients for the authenticated user

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
        userId: req.user.id, // Filter by authenticated user
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

    // Verify the service belongs to the authenticated user
    const service = await prisma.service.findFirst({
      where: {
        id: parseInt(id),
        client: {
          userId: req.user.id,
        },
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

    // Generate invoice number
    const invoiceNumber = `INV-${new Date()
      .toISOString()
      .slice(0, 10)
      .replace(/-/g, "")}-${Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, "0")}`;

    // Create the invoice from service data
    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber,
        clientId: service.clientId,

        totalAmount: service.cost,
        partsCost: service.partsCost || 0,
        partsGst: service.partsGst || 0,
        laborCost: service.laborCost || 0,
        laborGst: service.laborGst || 0,

        tax: 0,
        discount: 0,
        grandTotal: service.cost,

        paymentMode: null,
        status: "Pending",

        serviceCategory: service.category?.name || null,
        serviceSubCategory: service.subService?.name || null,
        serviceNotes: service.notes || null,
        mechanic: service.mechanic || null,
        vehicle: `${service.client.vehicleMake} ${service.client.vehicleModel}`,
      },
    });

    // Update service status to billed
    await prisma.service.update({
      where: { id: service.id },
      data: { invoiceId: invoice.id, status: "Billed" },
    });

    res.status(201).json({
      message: "✅ Invoice created from service successfully",
      invoice,
    });
  } catch (error) {
    console.error("❌ Error creating invoice from service:", error);
    res.status(500).json({
      message: "Error creating invoice from service",
      error: String(error),
    });
  }
};
