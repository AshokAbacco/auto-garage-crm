import prisma from "../models/prismaClient.js";

/**
 * =====================================
 * 🔐 OWNER RESOLUTION (SHARED)
 * =====================================
 */
const resolveOwnerUserId = (req) => {
  if (req.user?.type === "owner") return req.user.id;
  if (req.user?.type === "staff" || req.user?.type === "bike_team")
    return req.user.ownerId;
  return null;
};

/**
 * =====================================
 * 📋 GET ALL TABLES
 * =====================================
 */
export const getDynamicTables = async (req, res) => {
  try {
    const ownerUserId = resolveOwnerUserId(req);

    if (!ownerUserId) {
      return res.status(403).json({ message: "Access denied" });
    }

    const tables = await prisma.dynamicTable.findMany({
      where: { userId: ownerUserId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        createdAt: true,
      },
    });

    res.json(tables);
  } catch (error) {
    console.error("❌ Get Tables Error:", error);
    res.status(500).json({ message: "Failed to fetch tables" });
  }
};

/**
 * =====================================
 * 🧱 GET TABLE SCHEMA + ROWS
 * =====================================
 */
export const getDynamicTableDetails = async (req, res) => {
  try {
    const { tableId } = req.params;
    const ownerUserId = resolveOwnerUserId(req);

    if (!ownerUserId) {
      return res.status(403).json({ message: "Access denied" });
    }

    const table = await prisma.dynamicTable.findFirst({
      where: {
        id: tableId,
        userId: ownerUserId,
      },
      include: {
        columns: {
          orderBy: { createdAt: "asc" },
        },
        rows: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!table) {
      return res.status(404).json({
        message: "Dynamic table not found",
      });
    }

    return res.json({
      table: {
        id: table.id,
        name: table.name,
      },
      columns: table.columns,
      rows: table.rows.map((row) => ({
        id: row.id,
        values: row.data,
        createdAt: row.createdAt,
      })),
    });
  } catch (error) {
    console.error("❌ Get Table Details Error:", error);
    res.status(500).json({ message: "Failed to fetch table details" });
  }
};
