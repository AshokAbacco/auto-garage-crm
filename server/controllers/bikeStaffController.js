
import prisma from "../models/prismaClient.js";

/* ============================
   CREATE STAFF
============================ */
export const createStaff = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      address,
      annualSalary,
      role,
    } = req.body;

    // Check if staff with same email already exists
    if (email) {
      const existingStaff = await prisma.staff.findFirst({
        where: {
          email,
          userId: req.user.id,
        },
      });

      if (existingStaff) {
        return res.status(400).json({ message: "Staff with this email already exists" });
      }
    }

    const staff = await prisma.staff.create({
      data: {
        name,
        email,
        phone,
        address,
        annualSalary: Number(annualSalary),
        role,
        userId: req.user.id,
      },
    });

    res.json(staff);
  } catch (err) {
    console.error("createStaff error:", err);
    res.status(500).json({ message: err.message });
  }
};

/* ============================
   GET ALL STAFF
============================ */
export const getStaff = async (req, res) => {
  try {
    const staff = await prisma.staff.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: "desc" },
    });

    res.json(staff);
  } catch (err) {
    console.error("getStaff error:", err);
    res.status(500).json([]);
  }
};

/* ============================
   GET SINGLE STAFF
============================ */
export const getStaffById = async (req, res) => {
  try {
    const staff = await prisma.staff.findUnique({
      where: { id: Number(req.params.id) },
    });

    if (!staff) {
      return res.status(404).json({ message: "Staff not found" });
    }

    res.json(staff);
  } catch (err) {
    console.error("getStaffById error:", err);
    res.status(500).json({ message: err.message });
  }
};

/* ============================
   UPDATE STAFF
============================ */
export const updateStaff = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      address,
      annualSalary,
      role,
    } = req.body;

    // Check if email is being changed and if it already exists
    if (email) {
      const existingStaff = await prisma.staff.findFirst({
        where: {
          email,
          userId: req.user.id,
          NOT: {
            id: Number(req.params.id),
          },
        },
      });

      if (existingStaff) {
        return res.status(400).json({ message: "Staff with this email already exists" });
      }
    }

    const staff = await prisma.staff.update({
      where: { id: Number(req.params.id) },
      data: {
        name,
        email,
        phone,
        address,
        annualSalary: Number(annualSalary),
        role,
      },
    });

    res.json(staff);
  } catch (err) {
    console.error("updateStaff error:", err);
    res.status(500).json({ message: err.message });
  }
};

/* ============================
   DELETE STAFF
============================ */
export const deleteStaff = async (req, res) => {
  try {
    const staffId = Number(req.params.id);

    // Check if staff has any salary records
    const salaryRecords = await prisma.bikeStaff.findMany({
      where: { staffId },
    });

    if (salaryRecords.length > 0) {
      return res.status(400).json({
        message: "Cannot delete staff with existing salary records. Please delete salary records first.",
      });
    }

    await prisma.staff.delete({
      where: { id: staffId },
    });

    res.json({ success: true, message: "Staff deleted successfully" });
  } catch (err) {
    console.error("deleteStaff error:", err);
    res.status(500).json({ message: err.message });
  }
};