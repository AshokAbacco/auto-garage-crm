// server/controllers/reportController.js
import prisma from "../models/prismaClient.js";

/**
 * @desc Revenue summary (total, paid, pending)
 * @route GET /api/reports/revenue
 * @access Private
 */
export const getRevenueSummary = async (req, res) => {
    try {
        // Only get invoices for the authenticated user's clients
        const invoices = await prisma.invoice.findMany({
            where: {
                client: {
                    userId: req.user.id // Filter by authenticated user
                }
            },
            select: { grandTotal: true, status: true, createdAt: true },
        });

        const totalRevenue = invoices.reduce((sum, inv) => sum + (Number(inv.grandTotal) || 0), 0);
        const paidRevenue = invoices
            .filter((i) => i.status === "Paid")
            .reduce((sum, inv) => sum + (Number(inv.grandTotal) || 0), 0);
        const pendingRevenue = totalRevenue - paidRevenue;

        res.json({
            totalRevenue,
            paidRevenue,
            pendingRevenue,
            invoiceCount: invoices.length,
        });
    } catch (error) {
        console.error("❌ Error fetching revenue report:", error);
        res.status(500).json({ message: "Error fetching revenue summary" });
    }
};

/**
 * @desc Top clients by revenue
 * @route GET /api/reports/top-clients
 * @access Private
 */
export const getTopClients = async (req, res) => {
    try {
        // Only get invoices for the authenticated user's clients
        const topClients = await prisma.invoice.groupBy({
            by: ["clientId"],
            _sum: { grandTotal: true },
            orderBy: { _sum: { grandTotal: "desc" } },
            take: 5,
            where: {
                client: {
                    userId: req.user.id // Filter by authenticated user
                }
            }
        });

        const clients = await Promise.all(
            topClients.map(async (item) => {
                // Verify the client belongs to the authenticated user
                const client = await prisma.client.findFirst({
                    where: {
                        id: item.clientId,
                        userId: req.user.id // Filter by authenticated user
                    },
                    select: { id: true, fullName: true, phone: true },
                });
                return {
                    id: client?.id || item.clientId,
                    fullName: client?.fullName || "Unknown",
                    phone: client?.phone || "N/A",
                    totalSpent: item._sum.grandTotal || 0,
                };
            })
        );

        res.json(clients);
    } catch (error) {
        console.error("❌ Error fetching top clients:", error);
        res.status(500).json({ message: "Error fetching top clients" });
    }
};

/**
 * @desc Service frequency report (by status instead of type)
 * @route GET /api/reports/services
 * @access Private
 */
export const getServiceStats = async (req, res) => {
    try {
        // Only get services for the authenticated user's clients
        const serviceStats = await prisma.service.groupBy({
            by: ["status"],
            _count: { status: true },
            orderBy: { _count: { status: "desc" } },
            take: 10,
            where: {
                client: {
                    userId: req.user.id // Filter by authenticated user
                }
            }
        });

        res.json(serviceStats);
    } catch (error) {
        console.error("❌ Error fetching service stats:", error);
        res.status(500).json({ message: "Error fetching service statistics" });
    }
};

/**
 * @desc Invoice summary (by status)
 * @route GET /api/reports/invoices
 * @access Private
 */
export const getInvoiceStatusSummary = async (req, res) => {
    try {
        // Only get invoices for the authenticated user's clients
        const counts = await prisma.invoice.groupBy({
            by: ["status"],
            _count: { status: true },
            where: {
                client: {
                    userId: req.user.id // Filter by authenticated user
                }
            }
        });

        res.json(counts);
    } catch (error) {
        console.error("❌ Error fetching invoice summary:", error);
        res.status(500).json({ message: "Error fetching invoice summary" });
    }
};

/**
 * @desc Full invoice details (used by reports list modal)
 * @route GET /api/reports/invoice/:id
 * @access Private
 */
export const getFullInvoiceDetails = async (req, res) => {
    try {
        const { id } = req.params;
        console.log(`🔍 Fetching full invoice #${id}`);

        // Only get invoice if it belongs to the authenticated user's client
        const invoice = await prisma.invoice.findFirst({
            where: {
                id: Number(id),
                client: {
                    userId: req.user.id // Filter by authenticated user
                }
            },
            include: {
                client: {
                    select: {
                        id: true,
                        fullName: true,
                        phone: true,
                        email: true,
                        address: true,
                        vehicleMake: true,
                        vehicleModel: true,
                        vehicleYear: true,
                        regNumber: true,
                        vin: true,
                    },
                },
                services: {
                    select: {
                        id: true,
                        date: true,
                        status: true,
                        partsCost: true,
                        laborCost: true,
                        cost: true,
                        notes: true,
                        category: { select: { name: true } },
                        subService: { select: { name: true } },
                    },
                },
            },
        });

        if (!invoice) {
            console.warn(`⚠️ Invoice #${id} not found or access denied`);
            return res.status(404).json({ message: "Invoice not found or access denied" });
        }

        res.json(invoice);
    } catch (error) {
        console.error("❌ Error fetching invoice details:", error);
        res.status(500).json({ message: "Error fetching invoice details" });
    }
};

/**
 * @desc Combined summary for all reports (invoices + services + clients + service stats)
 * @route GET /api/reports/summary
 * @access Private
 */
export const getReportsSummary = async (req, res) => {
    try {
        // Only get data for the authenticated user's clients
        const [invoices, serviceGroups, topClientsGroup, invoiceStatus] = await Promise.all([
            prisma.invoice.findMany({
                where: {
                    client: {
                        userId: req.user.id // Filter by authenticated user
                    }
                },
                select: { grandTotal: true, status: true, createdAt: true },
            }),
            prisma.service.groupBy({
                by: ["status"],
                _count: { status: true },
                orderBy: { _count: { status: "desc" } },
                take: 10,
                where: {
                    client: {
                        userId: req.user.id // Filter by authenticated user
                    }
                }
            }),
            prisma.invoice.groupBy({
                by: ["clientId"],
                _sum: { grandTotal: true },
                orderBy: { _sum: { grandTotal: "desc" } },
                take: 5,
                where: {
                    client: {
                        userId: req.user.id // Filter by authenticated user
                    }
                }
            }),
            prisma.invoice.groupBy({
                by: ["status"],
                _count: { status: true },
                where: {
                    client: {
                        userId: req.user.id // Filter by authenticated user
                    }
                }
            }),
        ]);

        // Revenue calculations
        const totalRevenue = invoices.reduce((sum, i) => sum + (Number(i.grandTotal) || 0), 0);
        const paidRevenue = invoices
            .filter((i) => i.status === "Paid")
            .reduce((sum, i) => sum + (Number(i.grandTotal) || 0), 0);
        const pendingRevenue = totalRevenue - paidRevenue;

        // Top clients
        const topClients = await Promise.all(
            topClientsGroup.map(async (tc) => {
                // Verify the client belongs to the authenticated user
                const client = await prisma.client.findFirst({
                    where: {
                        id: tc.clientId,
                        userId: req.user.id // Filter by authenticated user
                    },
                    select: { id: true, fullName: true, phone: true },
                });
                return {
                    id: client?.id || tc.clientId,
                    fullName: client?.fullName || "Unknown",
                    phone: client?.phone || "N/A",
                    totalSpent: tc._sum.grandTotal || 0,
                };
            })
        );

        // Invoice status normalization
        const invoiceStatusSummary = invoiceStatus.map((s) => ({
            status: s.status,
            count: s._count.status || 0,
        }));

        // Services summary - only for the authenticated user's clients
        const servicesRaw = await prisma.service.findMany({
            where: {
                client: {
                    userId: req.user.id // Filter by authenticated user
                }
            },
            select: { id: true, status: true, cost: true, date: true, categoryId: true, subServiceId: true },
        });

        const totalServices = servicesRaw.length;
        const completedServices = servicesRaw.filter((s) => s.status === "Completed").length;
        const pendingServices = servicesRaw.filter((s) => s.status === "Pending").length;
        const cancelledServices = servicesRaw.filter((s) => s.status === "Cancelled" || s.status === "Void").length;

        const totalServiceRevenue = servicesRaw.reduce((sum, s) => sum + (Number(s.cost) || 0), 0);
        const averageServiceCost = totalServices > 0 ? totalServiceRevenue / totalServices : 0;

        // Revenue grouped by category (instead of type)
        const categoryRevenueMap = {};
        for (const s of servicesRaw) {
            const key = s.categoryId ? `Category #${s.categoryId}` : "Uncategorized";
            categoryRevenueMap[key] = (categoryRevenueMap[key] || 0) + (Number(s.cost) || 0);
        }
        const topServiceCategories = Object.entries(categoryRevenueMap)
            .map(([category, total]) => ({ category, total }))
            .sort((a, b) => b.total - a.total)
            .slice(0, 10);

        // Frequency by service status
        const serviceStats = serviceGroups.map((g) => ({
            status: g.status || "Unknown",
            count: g._count.status || 0,
        }));

        // Final payload
        res.json({
            revenueSummary: { totalRevenue, paidRevenue, pendingRevenue },
            invoiceCount: invoices.length,
            serviceStats,
            topClients,
            invoiceStatusSummary,
            serviceSummary: {
                totalServices,
                completedServices,
                pendingServices,
                cancelledServices,
                totalServiceRevenue,
                averageServiceCost,
                topServiceCategories,
            },
        });
    } catch (error) {
        console.error("❌ Error fetching reports summary:", error);
        res.status(500).json({ message: error.message || "Error fetching reports summary" });
    }
};

/**
 * @desc All services list (simple) - useful for frontend recent services
 * @route GET /api/reports/all-services
 * @access Private
 */
export const getServicesList = async (req, res) => {
    try {
        // Only get services for the authenticated user's clients
        const services = await prisma.service.findMany({
            where: {
                client: {
                    userId: req.user.id // Filter by authenticated user
                }
            },
            include: {
                client: { select: { id: true, fullName: true } },
                invoice: { select: { id: true } },
                category: { select: { name: true } },
                subService: { select: { name: true } },
            },
            orderBy: { date: "desc" },
            take: 200,
        });

        res.json(services);
    } catch (error) {
        console.error("❌ Error fetching services list:", error);
        res.status(500).json({ message: "Error fetching services list" });
    }
};

// server/controllers/reportController.js
export const getClientsDetails = async (req, res) => {
  try {
    const clients = await prisma.client.findMany({
      where: {
        userId: req.user.id
      },
      select: {
        id: true,
        fullName: true,
        phone: true,
        email: true,
        vehicleMake: true,
        vehicleModel: true,
        vehicleYear: true,
        regNumber: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" }
    });

    res.json(clients);
  } catch (error) {
    console.error("❌ Error fetching clients report:", error);
    res.status(500).json({ message: "Failed to fetch clients report" });
  }
};


export default {
  getRevenueSummary,
  getTopClients,
  getServiceStats,
  getInvoiceStatusSummary,
  getFullInvoiceDetails,
  getReportsSummary,
  getServicesList,
  getClientsDetails,
};