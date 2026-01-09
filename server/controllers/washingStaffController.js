import prisma from "../models/prismaClient.js";

/* ============================
   CREATE WASHING STAFF
============================ */
export const createWashingStaff = async (req, res) => {
  try {
    const { name, email, phone, address, role, annualSalary } = req.body;

    if (email) {
      const exists = await prisma.washingStaff.findFirst({
        where: { email, userId: req.user.id },
      });
      if (exists) {
        return res.status(400).json({ message: "Staff with this email already exists" });
      }
    }

    const staff = await prisma.washingStaff.create({
      data: {
        name,
        email,
        phone,
        address,
        role,
        annualSalary: Number(annualSalary),
        userId: req.user.id,
      },
    });

    res.json(staff);
  } catch (err) {
    console.error("createWashingStaff error:", err);
    res.status(500).json({ message: err.message });
  }
};

/* ============================
   GET ALL WASHING STAFF
============================ */
export const getWashingStaff = async (req, res) => {
  try {
    const staff = await prisma.washingStaff.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: "desc" },
    });
    res.json(staff);
  } catch (err) {
    console.error("getWashingStaff error:", err);
    res.status(500).json([]);
  }
};

/* ============================
   UPDATE WASHING STAFF
============================ */
export const updateWashingStaff = async (req, res) => {
  try {
    const { name, email, phone, address, role, annualSalary } = req.body;

    if (email) {
      const exists = await prisma.washingStaff.findFirst({
        where: {
          email,
          userId: req.user.id,
          NOT: { id: Number(req.params.id) },
        },
      });
      if (exists) {
        return res.status(400).json({ message: "Staff with this email already exists" });
      }
    }

    const staff = await prisma.washingStaff.update({
      where: { id: Number(req.params.id) },
      data: {
        name,
        email,
        phone,
        address,
        role,
        annualSalary: Number(annualSalary),
      },
    });

    res.json(staff);
  } catch (err) {
    console.error("updateWashingStaff error:", err);
    res.status(500).json({ message: err.message });
  }
};

/* ============================
   DELETE WASHING STAFF
============================ */
export const deleteWashingStaff = async (req, res) => {
  try {
    const staffId = Number(req.params.id);

    // 🔍 Check if salary exists for this staff
    const salaryExists = await prisma.washingStaffSalary.findFirst({
      where: { staffId },
    });

    if (salaryExists) {
      return res.status(400).json({
        message: "Cannot delete staff with salary records",
      });
    }

    await prisma.washingStaff.delete({
      where: { id: staffId },
    });

    res.json({ success: true });
  } catch (err) {
    console.error("deleteWashingStaff error:", err);
    res.status(500).json({ message: "Failed to delete staff" });
  }
};
