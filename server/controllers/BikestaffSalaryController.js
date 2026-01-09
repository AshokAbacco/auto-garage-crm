import prisma from "../models/prismaClient.js";

/* ============================
   CREATE SALARY ENTRY
============================ */
export const createBikeStaff = async (req, res) => {
  try {
    const {
      staffId,
      annualSalary,
      bonus = 0,
      leaves = 0,
      deductions = 0,
      status = "pending"
    } = req.body;

    // Verify staff exists and belongs to user
    const staff = await prisma.staff.findUnique({
      where: { id: Number(staffId) },
    });

    if (!staff || staff.userId !== req.user.id) {
      return res.status(404).json({ message: "Staff not found" });
    }

    const salaryEntry = await prisma.bikeStaff.create({
      data: {
        staffId: Number(staffId),
        annualSalary: Number(annualSalary),
        bonus: Number(bonus),
        leaves: Number(leaves),
        deductions: Number(deductions),
        status,
        userId: req.user.id,
      },
      include: {
        staff: true,
      },
    });

    res.json(salaryEntry);
  } catch (err) {
    console.error("createBikeStaff error:", err);
    res.status(500).json({ message: err.message });
  }
};

/* ============================
   GET ALL SALARY ENTRIES
============================ */
export const getBikeStaff = async (req, res) => {
  try {
    await autoManageSalaryStatus();

    const salaries = await prisma.bikeStaff.findMany({
      where: { userId: req.user.id },
      include: {
        staff: true,
      },
      orderBy: { createdAt: "desc" },
    });

    res.json(salaries);
  } catch (err) {
    console.error("getBikeStaff error:", err);
    res.status(500).json([]);
  }
};

/* ============================
   UPDATE SALARY ENTRY
============================ */
export const updateBikeStaff = async (req, res) => {
  try {
    const {
      annualSalary,
      bonus,
      leaves,
      deductions,
    } = req.body;

    const salary = await prisma.bikeStaff.update({
      where: { id: Number(req.params.id) },
      data: {
        annualSalary: Number(annualSalary),
        bonus: Number(bonus),
        leaves: Number(leaves),
        deductions: Number(deductions),
      },
      include: {
        staff: true,
      },
    });

    res.json(salary);
  } catch (err) {
    console.error("updateBikeStaff error:", err);
    res.status(500).json({ message: err.message });
  }
};

/* ============================
   PAY SALARY
============================ */
export const payBikeStaffSalary = async (req, res) => {
  try {
    const salary = await prisma.bikeStaff.findUnique({
      where: { id: Number(req.params.id) },
    });

    if (!salary) {
      return res.status(404).json({ message: "Salary entry not found" });
    }

    // ===== Salary Calculation =====
    const DAYS_IN_YEAR = 365;
    const perDaySalary = salary.annualSalary / DAYS_IN_YEAR;
    const leaveDeduction = Math.round(perDaySalary * salary.leaves);
    const monthlySalary = Math.round(salary.annualSalary / 12);

    const netSalary = Math.round(
      monthlySalary + salary.bonus - leaveDeduction
    );

    const today = new Date();
    const month = today.toLocaleString("default", {
      month: "short",
      year: "numeric",
    });

    // ===== Check existing history (HOLD) =====
    const existingHistory = await prisma.bikeSalaryHistory.findFirst({
      where: {
        bikeStaffId: salary.id,
        month,
      },
    });

    if (existingHistory) {
      // 🔄 HOLD → PAID
      await prisma.bikeSalaryHistory.update({
        where: { id: existingHistory.id },
        data: {
          baseSalary: monthlySalary,
          bonus: salary.bonus,
          deductions: leaveDeduction,
          netSalary,
          paidDate: today,
        },
      });
    } else {
      // ✅ Paid before day 6 → create PAID history
      await prisma.bikeSalaryHistory.create({
        data: {
          bikeStaffId: salary.id,
          month,
          baseSalary: monthlySalary,
          bonus: salary.bonus,
          deductions: leaveDeduction,
          netSalary,
          paidDate: today,
        },
      });
    }

    // ===== Update salary status =====
    await prisma.bikeStaff.update({
      where: { id: salary.id },
      data: {
        status: "paid",
        lastPaid: today,
      },
    });

    res.json({ success: true });
  } catch (err) {
    console.error("payBikeStaffSalary error:", err);
    res.status(500).json({ message: err.message });
  }
};


/* ============================
   AUTO MANAGE SALARY STATUS
============================ */
export const autoManageSalaryStatus = async () => {
  const now = new Date();
  const currentDay = now.getDate();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const currentMonthLabel = now.toLocaleString("default", {
    month: "short",
    year: "numeric",
  });

  const salaryList = await prisma.bikeStaff.findMany();

  for (const salary of salaryList) {

    /* =========================
       RESET FOR NEW MONTH
       (PAID OR UNPAID)
    ========================= */
  if (
  salary.lastUpdatedMonth !== `${currentMonth}-${currentYear}` &&
  salary.status === "paid"
) {
  await prisma.bikeStaff.update({
    where: { id: salary.id },
    data: {
      bonus: 0,
      leaves: 0,
      deductions: 0,
      status: "pending",
      lastPaid: null,
      lastUpdatedMonth: `${currentMonth}-${currentYear}`,
    },
  });
}


    /* =========================
       HOLD LOGIC (UNPAID AFTER DAY 5)
    ========================= */
    if (currentDay < 6) continue;

    // If already paid this month → skip hold
    if (salary.status === "paid") continue;

    const existingHistory = await prisma.bikeSalaryHistory.findFirst({
      where: {
        bikeStaffId: salary.id,
        month: currentMonthLabel,
      },
    });

    if (existingHistory) continue;

    const monthlySalary = Math.round(salary.annualSalary / 12);
    const netSalary = Math.round(
      monthlySalary + salary.bonus - salary.deductions
    );

    await prisma.bikeSalaryHistory.create({
      data: {
        bikeStaffId: salary.id,
        month: currentMonthLabel,
        baseSalary: monthlySalary,
        bonus: salary.bonus,
        deductions: salary.deductions,
        netSalary,
        paidDate: null, // HOLD
      },
    });
  }
};


/* ============================
   SALARY HISTORY
============================ */
export const getBikeSalaryHistory = async (req, res) => {
  try {
    // Note: req.params.id is the staffId (from Staff table), not bikeStaff id
    const staffId = Number(req.params.id);
    
    // Get all salary entries for this staff
    const salaryEntries = await prisma.bikeStaff.findMany({
      where: { staffId },
    });

    if (salaryEntries.length === 0) {
      return res.json([]);
    }

    // Get history for all salary entries of this staff
    const bikeStaffIds = salaryEntries.map(entry => entry.id);
    
    const history = await prisma.bikeSalaryHistory.findMany({
      where: {
        bikeStaffId: {
          in: bikeStaffIds,
        },
      },
      orderBy: { paidDate: "desc" },
    });

    res.json(history);
  } catch (err) {
    console.error("getBikeSalaryHistory error:", err);
    res.status(500).json({ message: err.message });
  }
};

/* ============================
   DELETE SALARY ENTRY
============================ */
export const deleteBikeStaff = async (req, res) => {
  try {
    const salaryId = Number(req.params.id);

    const salary = await prisma.bikeStaff.findUnique({
      where: { id: salaryId },
      include: {
        salaryHistory: true,
      },
    });

    if (!salary) {
      return res.status(404).json({ message: "Salary record not found" });
    }

    // Pending → always allowed
    if (salary.status === "pending") {
      await prisma.bikeStaff.delete({ where: { id: salaryId } });
      return res.json({ success: true });
    }

    // Paid → conditional delete
    if (salary.status === "paid") {
      if (!salary.lastPaid) {
        return res.status(400).json({
          message: "Paid record missing payment date",
        });
      }

      const lastPaidDate = new Date(salary.lastPaid);
      const now = new Date();

      const sameMonth =
        lastPaidDate.getMonth() === now.getMonth() &&
        lastPaidDate.getFullYear() === now.getFullYear();

      if (!sameMonth) {
        return res.status(400).json({
          message: "Paid salary can only be deleted in the same month",
        });
      }

      // Remove salary history first
      await prisma.bikeSalaryHistory.deleteMany({
        where: { bikeStaffId: salaryId },
      });

      await prisma.bikeStaff.delete({ where: { id: salaryId } });

      return res.json({ success: true });
    }

    return res.status(400).json({
      message: "This salary record cannot be deleted",
    });
  } catch (err) {
    console.error("deleteBikeStaff error:", err);
    res.status(500).json({ message: err.message });
  }
};