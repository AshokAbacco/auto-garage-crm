import prisma from "../models/prismaClient.js";

const ALLOWED_COLUMN_TYPES = ["TEXT", "NUMBER", "BOOLEAN", "DATE"];

export const createDynamicColumn = async (req, res) => {
  try {
    const { tableId, name, type, required = false } = req.body;

    if (!tableId || !name || !type) {
      return res.status(400).json({
        message: "tableId, name and type are required",
      });
    }

    if (!ALLOWED_COLUMN_TYPES.includes(type)) {
      return res.status(400).json({
        message: "Invalid column type",
        allowedTypes: ALLOWED_COLUMN_TYPES,
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
        message: "You are not allowed to add columns",
      });
    }

    // 🔍 Verify table ownership
    const table = await prisma.dynamicTable.findFirst({
      where: {
        id: tableId,
        userId: ownerUserId,
      },
    });

    if (!table) {
      return res.status(404).json({
        message: "Dynamic table not found or access denied",
      });
    }

    // ✅ Create column
    const column = await prisma.dynamicColumn.create({
      data: {
        tableId,
        name: name.trim(),
        type,
        required,
      },
    });

    return res.status(201).json({
      message: "Dynamic column created successfully",
      column,
    });
  } catch (error) {
    // Unique constraint: (tableId, name)
    if (error.code === "P2002") {
      return res.status(409).json({
        message: "Column with this name already exists in the table",
      });
    }

    console.error("❌ Create Dynamic Column Error:", error);
    return res.status(500).json({
      message: "Failed to create dynamic column",
    });
  }
};


export const updateDynamicColumn = async (req, res) => {
  const { id } = req.params;
  const { name, required } = req.body;

  const column = await prisma.dynamicColumn.findUnique({
    where: { id },
    include: { table: true },
  });

  const ownerUserId =
    req.user.type === "owner" ? req.user.id : req.user.ownerId;

  if (!column || column.table.userId !== ownerUserId) {
    return res.status(404).json({ message: "Column not found" });
  }

  const updated = await prisma.dynamicColumn.update({
    where: { id },
    data: { name, required },
  });

  res.json(updated);
};


export const deleteDynamicColumn = async (req, res) => {
  const { id } = req.params;

  const column = await prisma.dynamicColumn.findUnique({
    where: { id },
    include: { table: true },
  });

  const ownerUserId =
    req.user.type === "owner" ? req.user.id : req.user.ownerId;

  if (!column || column.table.userId !== ownerUserId) {
    return res.status(404).json({ message: "Column not found" });
  }

  await prisma.dynamicColumn.delete({ where: { id } });

  res.json({ message: "Column deleted" });
};
