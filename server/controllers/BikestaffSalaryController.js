import prisma from "../models/prismaClient.js";

/* ============================
   CREATE STAFF
============================ */
export const createBikeStaff = async (req, res) => {
  try {
    const {
      name,
      role,
      baseSalary,
      bonus = 0,
      leaves = 0,
      deductions = 0,
      joiningDate,
      status = "pending"
    } = req.body;

    const staff = await prisma.bikeStaff.create({
      data: {
        name,
        role,
        baseSalary: Number(baseSalary),
        bonus: Number(bonus),
        leaves: Number(leaves),
        deductions: Number(deductions),
        joiningDate: new Date(joiningDate),
        status,
        userId: req.user.id
        // ❌ DO NOT send createdDate / createdAt
        // ✅ Prisma auto handles createdAt
      }
    });

    res.json(staff);
  } catch (err) {
    console.error("createBikeStaff error:", err);
    res.status(500).json({ message: err.message });
  }
};


/* ============================
   GET ALL STAFF
============================ */
export const getBikeStaff = async (req, res) => {
  try {
    const staff = await prisma.bikeStaff.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: "desc" }
    });

    // ✅ ALWAYS return array
    res.json(Array.isArray(staff) ? staff : []);
  } catch (err) {
    console.error("getBikeStaff error:", err);
    res.status(500).json([]);
  }
};

/* ============================
   UPDATE STAFF
============================ */
export const updateBikeStaff = async (req, res) => {
  try {
    const staff = await prisma.bikeStaff.update({
      where: { id: Number(req.params.id) },
      data: req.body
    });
    res.json(staff);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ============================
   PAY SALARY
============================ */
export const payBikeStaffSalary = async (req, res) => {
  try {
    const staff = await prisma.bikeStaff.findUnique({
      where: { id: Number(req.params.id) }
    });

    if (!staff) {
      return res.status(404).json({ message: "Staff not found" });
    }

    // 1️⃣ Calculate net salary
    const DAYS_IN_YEAR = 365;

    const annualSalary = staff.baseSalary * 12;
    const perDaySalary = annualSalary / DAYS_IN_YEAR;
    const leaveDeduction = perDaySalary * staff.leaves;

    const netSalary =
      staff.baseSalary + staff.bonus - leaveDeduction;


    const today = new Date();
    const month = today.toLocaleString("default", {
      month: "short",
      year: "numeric"
    });

    // 2️⃣ Save to salary history
    await prisma.bikeSalaryHistory.create({
      data: {
        bikeStaffId: staff.id,
        month,
        baseSalary: staff.baseSalary,
        bonus: staff.bonus,
        deductions: Math.round(leaveDeduction),
        netSalary,
        paidDate: today
      }
    });

    // 3️⃣ Mark CURRENT record as paid (freeze it)
    await prisma.bikeStaff.update({
      where: { id: staff.id },
      data: {
        status: "paid",
        lastPaid: today
      }
    });

    // 4️⃣ CREATE NEXT MONTH ENTRY (RESET VALUES)
    await prisma.bikeStaff.create({
      data: {
        userId: staff.userId,
        name: staff.name,
        role: staff.role,

        baseSalary: staff.baseSalary, // ✅ SAME
        bonus: 0,                     // ✅ RESET
        leaves: 0,                    // ✅ RESET
        deductions: 0,                // ✅ RESET

        status: "pending",
        joiningDate: staff.joiningDate,
        createdAt: new Date()
      }
    });

    res.json({ success: true });
  } catch (err) {
    console.error("payBikeStaffSalary error:", err);
    res.status(500).json({ message: err.message });
  }
};


/* ============================
   SALARY HISTORY
============================ */
export const getBikeSalaryHistory = async (req, res) => {
  try {
    const history = await prisma.bikeSalaryHistory.findMany({
      where: { bikeStaffId: Number(req.params.id) },
      orderBy: { paidDate: "desc" }
    });
    res.json(history);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


/* ============================
   DELETE SALARY (ONLY PENDING)
============================ */
export const deleteBikeStaff = async (req, res) => {
  try {
    const staff = await prisma.bikeStaff.findUnique({
      where: { id: Number(req.params.id) }
    });

    if (!staff) {
      return res.status(404).json({ message: "Salary record not found" });
    }

    // ❌ BLOCK delete if not pending
    if (staff.status !== "pending") {
      return res.status(400).json({
        message: "Only pending salary can be deleted"
      });
    }

    await prisma.bikeStaff.delete({
      where: { id: staff.id }
    });

    res.json({ success: true });
  } catch (err) {
    console.error("deleteBikeStaff error:", err);
    res.status(500).json({ message: err.message });
  }
};
