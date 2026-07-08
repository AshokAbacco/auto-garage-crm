import prisma from "../models/prismaClient.js";

/**
 * =====================================
 * 🧪 VALUE TYPE VALIDATION (shared by create + update)
 * =====================================
 */
const isValidValue = (type, value) => {
  if (value === null || value === undefined) return true;

  switch (type) {
    case "TEXT":
      return typeof value === "string";
    case "NUMBER":
      // Reject NaN explicitly — typeof NaN === "number" would otherwise pass.
      return typeof value === "number" && !Number.isNaN(value);
    case "BOOLEAN":
      return typeof value === "boolean";
    case "DATE":
      return !Number.isNaN(Date.parse(value));
    default:
      return false;
  }
};

/**
 * Validates a data payload against a table's columns.
 * Returns an error message string, or null if valid.
 */
const validateRowData = (columns, data) => {
  for (const column of columns) {
    if (
      column.required &&
      !(column.id in data && data[column.id] !== null && data[column.id] !== "")
    ) {
      return `Missing required field: ${column.name}`;
    }
  }

  for (const column of columns) {
    if (column.id in data) {
      const value = data[column.id];
      if (!isValidValue(column.type, value)) {
        return `Invalid value for column "${column.name}" (expected ${column.type})`;
      }
    }
  }

  return null;
};

export const createDynamicRow = async (req, res) => {
  try {
    const { tableId, data } = req.body;

    if (!tableId || typeof data !== "object") {
      return res.status(400).json({
        message: "tableId and data object are required",
      });
    }

    /**
     * =====================================
     * 🔐 RESOLVE OWNER USER ID
     * =====================================
     */
    let ownerUserId;

    if (req.user?.type === "owner") {
      ownerUserId = req.user.id;
    } else if (req.user?.type === "staff" || req.user?.type === "bike_team") {
      ownerUserId = req.user.ownerId;
    } else {
      return res.status(403).json({
        message: "You are not allowed to add rows",
      });
    }

    /**
     * =====================================
     * 🔍 VERIFY TABLE OWNERSHIP
     * =====================================
     */
    const table = await prisma.dynamicTable.findFirst({
      where: {
        id: tableId,
        userId: ownerUserId,
      },
      include: {
        columns: true,
      },
    });

    if (!table) {
      return res.status(404).json({
        message: "Dynamic table not found or access denied",
      });
    }

    /**
     * =====================================
     * ✅ VALIDATION (required + type)
     * =====================================
     */
    const validationError = validateRowData(table.columns, data);
    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    /**
     * =====================================
     * 💾 INSERT ROW
     * =====================================
     */
    const row = await prisma.dynamicRow.create({
      data: {
        tableId,
        data,
      },
    });

    return res.status(201).json({
      message: "Dynamic row created successfully",
      row,
    });
  } catch (error) {
    console.error("❌ Create Dynamic Row Error:", error);
    return res.status(500).json({
      message: "Failed to create dynamic row",
    });
  }
};

export const updateDynamicRow = async (req, res) => {
  try {
    const { id } = req.params;
    const { data } = req.body;

    if (!data || typeof data !== "object") {
      return res.status(400).json({ message: "Data object is required" });
    }

    // 🔐 resolve owner
    let ownerUserId;
    if (req.user?.type === "owner") ownerUserId = req.user.id;
    else if (req.user?.type === "staff" || req.user?.type === "bike_team")
      ownerUserId = req.user.ownerId;
    else return res.status(403).json({ message: "Access denied" });

    // 🔍 load row + table + columns
    const row = await prisma.dynamicRow.findUnique({
      where: { id },
      include: {
        table: {
          include: { columns: true },
        },
      },
    });

    if (!row || row.table.userId !== ownerUserId) {
      return res.status(404).json({ message: "Row not found" });
    }

    // ✅ required + type validation (now covers BOOLEAN and DATE too)
    const validationError = validateRowData(row.table.columns, data);
    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    const updated = await prisma.dynamicRow.update({
      where: { id },
      data: { data },
    });

    res.json({ message: "Row updated successfully", row: updated });
  } catch (error) {
    console.error("❌ Update Row Error:", error);
    res.status(500).json({ message: "Failed to update row" });
  }
};

export const deleteDynamicRow = async (req, res) => {
  try {
    const { id } = req.params;

    // 🔐 resolve owner
    let ownerUserId;
    if (req.user?.type === "owner") ownerUserId = req.user.id;
    else if (req.user?.type === "staff" || req.user?.type === "bike_team")
      ownerUserId = req.user.ownerId;
    else return res.status(403).json({ message: "Access denied" });

    // 🔍 verify ownership
    const row = await prisma.dynamicRow.findUnique({
      where: { id },
      include: {
        table: true,
      },
    });

    if (!row || row.table.userId !== ownerUserId) {
      return res.status(404).json({ message: "Row not found" });
    }

    await prisma.dynamicRow.delete({
      where: { id },
    });

    res.json({ message: "Row deleted successfully" });
  } catch (error) {
    console.error("❌ Delete Row Error:", error);
    res.status(500).json({ message: "Failed to delete row" });
  }
};
