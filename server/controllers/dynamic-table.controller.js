// server/controllers/dynamic-table.controller.js
import prisma from "../models/prismaClient.js";

export const createDynamicTable = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name || typeof name !== "string") {
      return res.status(400).json({
        message: "Table name is required",
      });
    }

    /**
     * =====================================
     * 🔐 RESOLVE OWNER USER ID
     * =====================================
     * Dynamic tables always belong to OWNER
     */
    let ownerUserId;

    if (req.user?.type === "owner") {
      ownerUserId = req.user.id;
    } else if (req.user?.type === "staff" || req.user?.type === "bike_team") {
      ownerUserId = req.user.ownerId;
    } else {
      return res.status(403).json({
        message: "You are not allowed to create dynamic tables",
      });
    }

    if (!ownerUserId) {
      return res.status(401).json({
        message: "Invalid user context",
      });
    }

    const table = await prisma.dynamicTable.create({
      data: {
        name: name.trim(),
        userId: ownerUserId,
      },
    });

    return res.status(201).json({
      message: "Dynamic table created successfully",
      table,
    });
  } catch (error) {
    // Prisma unique constraint (userId + name)
    if (error.code === "P2002") {
      return res.status(409).json({
        message: "Table with this name already exists",
      });
    }

    console.error("❌ Create Dynamic Table Error:", error);
    return res.status(500).json({
      message: "Failed to create dynamic table",
    });
  }
};

export const renameDynamicTable = async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;

  const ownerUserId =
    req.user.type === "owner" ? req.user.id : req.user.ownerId;

  const table = await prisma.dynamicTable.findFirst({
    where: { id, userId: ownerUserId },
  });

  if (!table) {
    return res.status(404).json({ message: "Table not found" });
  }

  const updated = await prisma.dynamicTable.update({
    where: { id },
    data: { name },
  });

  res.json(updated);
};

// export const renameDynamicTable = async (req, res) => {
//   const { id } = req.params;
//   const { name } = req.body;

//   const ownerUserId =
//     req.user.type === "owner" ? req.user.id : req.user.ownerId;

//   const table = await prisma.dynamicTable.findFirst({
//     where: { id, userId: ownerUserId },
//   });

//   if (!table) {
//     return res.status(404).json({ message: "Table not found" });
//   }

//   const updated = await prisma.dynamicTable.update({
//     where: { id },
//     data: { name },
//   });

//   res.json(updated);
// };

export const deleteDynamicTable = async (req, res) => {
  const { id } = req.params;

  const ownerUserId =
    req.user.type === "owner" ? req.user.id : req.user.ownerId;

  const table = await prisma.dynamicTable.findFirst({
    where: { id, userId: ownerUserId },
  });

  if (!table) {
    return res.status(404).json({ message: "Table not found" });
  }

  await prisma.dynamicTable.delete({ where: { id } });

  res.json({ message: "Table deleted" });
};
