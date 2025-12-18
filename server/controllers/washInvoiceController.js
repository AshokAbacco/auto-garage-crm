import prisma from "../models/prismaClient.js";

/* =========================================================
   GET ALL WASH BILLINGS
========================================================= */
export const getWashBillings = async (req, res) => {
  try {
    const billings = await prisma.washBilling.findMany({
      where: {
        washingClient: {
          userId: req.user.id,
        },
      },
      include: {
        washingClient: true,
        services: {
          include: {
            washingService: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    res.status(200).json(billings);
  } catch (error) {
    console.error("❌ getWashBillings error:", error);
    res.status(500).json({ message: "Failed to fetch wash billings" });
  }
};

/* =========================================================
   GET SINGLE WASH BILLING
========================================================= */
export const getWashBillingById = async (req, res) => {
  try {
    const { id } = req.params;

    const billing = await prisma.washBilling.findFirst({
      where: {
        id: Number(id),
        washingClient: {
          userId: req.user.id,
        },
      },
      include: {
        washingClient: true,
        services: {
          include: {
            washingService: true,
          },
        },
      },
    });

    if (!billing) {
      return res.status(404).json({ message: "Billing not found" });
    }

    res.status(200).json(billing);
  } catch (error) {
    console.error("❌ getWashBillingById error:", error);
    res.status(500).json({ message: "Failed to fetch wash billing" });
  }
};

/* =========================================================
   CREATE WASH BILLING
========================================================= */
export const createWashBilling = async (req, res) => {
  try {
    const {
      washingClientId,
      serviceIds = [],

      partsCost = 0,
      partsGst = 0,
      grandTotal,

      paymentMode,
      status = "PENDING",
      dueDate,
      notes,
    } = req.body;

    if (!washingClientId || !grandTotal) {
      return res
        .status(400)
        .json({ message: "washingClientId & grandTotal are required" });
    }

    /* ✅ Ownership check */
    const client = await prisma.washingClient.findFirst({
      where: {
        id: Number(washingClientId),
        userId: req.user.id,
      },
    });

    if (!client) {
      return res.status(403).json({ message: "Unauthorized client access" });
    }

    const invoiceNumber = `WASH-${Date.now()}`;

    /* ✅ Create billing */
    const billing = await prisma.washBilling.create({
      data: {
        invoiceNumber,
        washingClientId: Number(washingClientId),
        userId: req.user.id,

        partsCost: Number(partsCost),
        partsGst: Number(partsGst),
        grandTotal: Number(grandTotal),

        paymentMode,
        status,
        paidAt: status === "PAID" ? new Date() : null,
        dueDate: dueDate ? new Date(dueDate) : null,
        notes,
      },
    });

    /* ✅ Link services */
    if (serviceIds.length > 0) {
      await prisma.washBillingService.createMany({
        data: serviceIds.map(id => ({
          washBillingId: billing.id,
          washingServiceId: Number(id),
        })),
      });

      /* If invoice paid, mark services PAID */
      if (status === "PAID") {
        await prisma.washingService.updateMany({
          where: { id: { in: serviceIds.map(Number) } },
          data: { status: "PAID" },
        });
      }
    }

    res.status(201).json({
      message: "✅ Wash billing created successfully",
      billingId: billing.id,
    });
  } catch (error) {
    console.error("❌ createWashBilling error:", error);
    res.status(500).json({ message: "Failed to create wash billing" });
  }
};

/* =========================================================
   UPDATE WASH BILLING
========================================================= */
export const updateWashBilling = async (req, res) => {
  try {
    const { id } = req.params;

    const billing = await prisma.washBilling.findFirst({
      where: {
        id: Number(id),
        washingClient: {
          userId: req.user.id,
        },
      },
    });

    if (!billing) {
      return res.status(404).json({ message: "Billing not found" });
    }

    const updated = await prisma.washBilling.update({
      where: { id: Number(id) },
      data: {
        partsCost: Number(req.body.partsCost || 0),
        partsGst: Number(req.body.partsGst || 0),
        grandTotal: Number(req.body.grandTotal || 0),

        paymentMode: req.body.paymentMode,
        status: req.body.status,
        paidAt: req.body.status === "PAID" ? new Date() : null,
        dueDate: req.body.dueDate ? new Date(req.body.dueDate) : null,
        notes: req.body.notes,
      },
    });

    /* If marked PAID → update services */
    if (req.body.status === "PAID") {
      const links = await prisma.washBillingService.findMany({
        where: { washBillingId: updated.id },
      });

      await prisma.washingService.updateMany({
        where: {
          id: { in: links.map(l => l.washingServiceId) },
        },
        data: { status: "PAID" },
      });
    }

    res.json({
      message: "✅ Wash billing updated successfully",
      billing: updated,
    });
  } catch (error) {
    console.error("❌ updateWashBilling error:", error);
    res.status(500).json({ message: "Failed to update wash billing" });
  }
};

/* =========================================================
   DELETE WASH BILLING
========================================================= */
export const deleteWashBilling = async (req, res) => {
  try {
    const { id } = req.params;

    const billing = await prisma.washBilling.findFirst({
      where: {
        id: Number(id),
        washingClient: {
          userId: req.user.id,
        },
      },
    });

    if (!billing) {
      return res.status(404).json({ message: "Billing not found" });
    }

    /* unlink services */
    await prisma.washBillingService.deleteMany({
      where: { washBillingId: billing.id },
    });

    await prisma.washBilling.delete({
      where: { id: billing.id },
    });

    res.json({ message: "🗑️ Wash billing deleted successfully" });
  } catch (error) {
    console.error("❌ deleteWashBilling error:", error);
    res.status(500).json({ message: "Failed to delete wash billing" });
  }
};
