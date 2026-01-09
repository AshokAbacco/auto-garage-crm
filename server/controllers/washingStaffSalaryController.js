import prisma from "../models/prismaClient.js";

const DAYS_IN_YEAR = 365;

/* ============================
   CREATE SALARY ENTRY
============================ */
export const createWashingStaffSalary = async (req, res) => {
  try {
    const {
      staffId,
      annualSalary,
      bonus = 0,
      leaves = 0,
      deductions = 0,
    } = req.body;

    // ✅ Validation (prevents NaN & crashes)
    if (!staffId || !annualSalary) {
      return res.status(400).json({
        message: "staffId and annualSalary are required",
      });
    }

    const salary = await prisma.washingStaffSalary.create({
      data: {
        annualSalary: Number(annualSalary),
        bonus: Number(bonus),
        leaves: Number(leaves),
        deductions: Number(deductions),
        status: "pending",

        // ✅ REQUIRED RELATIONS (MATCH MODEL)
        staff: {
          connect: { id: Number(staffId) },
        },
        user: {
          connect: { id: req.user.id },
        },
      },
      include: {
        staff: true,
      },
    });

    res.json(salary);
  } catch (error) {
    console.error("createWashingStaffSalary error:", error);
    res.status(500).json({ message: error.message });
  }
};


/* ============================
   GET ALL SALARIES
============================ */
export const getWashingStaffSalary = async (req, res) => {
  try {
    await autoManageWashingSalary();

    const salaries = await prisma.washingStaffSalary.findMany({
      where: { userId: req.user.id },
      include: { staff: true },
      orderBy: { createdAt: "desc" },
    });

    // ✅ ADD THIS NORMALIZATION
    const normalized = salaries.map((s) => ({
      ...s,
      bonus: s.bonus ?? 0,
      leaves: s.leaves ?? 0,
      deductions: s.deductions ?? 0,
      annualSalary: s.annualSalary ?? 0,
    }));

    res.json(normalized);
  } catch (err) {
    console.error("getWashingStaffSalary error:", err);
    res.status(500).json([]);
  }
};


/* ============================
   UPDATE SALARY
============================ */
export const updateWashingStaffSalary = async (req, res) => {
  try {
    const { bonus = 0, leaves = 0 } = req.body;

    const salary = await prisma.washingStaffSalary.findUnique({
      where: { id: Number(req.params.id) },
    });

    if (!salary) {
      return res.status(404).json({ message: "Salary not found" });
    }

    if (salary.status === "paid") {
      return res.status(400).json({
        message: "Paid salary cannot be edited",
      });
    }

    const perDay = salary.annualSalary / DAYS_IN_YEAR;
    const deductions = Math.round(perDay * Number(leaves));

    const updated = await prisma.washingStaffSalary.update({
      where: { id: salary.id },
      data: {
        bonus: Number(bonus),
        leaves: Number(leaves),
        deductions,
      },
      include: { staff: true },
    });

    res.json(updated);
  } catch (err) {
    console.error("updateWashingStaffSalary error:", err);
    res.status(500).json({ message: err.message });
  }
};


/* ============================
   PAY SALARY
============================ */
export const payWashingStaffSalary = async (req, res) => {
  try {
    const salary = await prisma.washingStaffSalary.findUnique({
      where: { id: Number(req.params.id) },
    });

    if (!salary) return res.status(404).json({ message: "Salary not found" });

    const perDay = salary.annualSalary / DAYS_IN_YEAR;
    const leaveDeduction = Math.round(perDay * salary.leaves);
    const monthlySalary = Math.round(salary.annualSalary / 12);
    const netSalary = Math.round(monthlySalary + salary.bonus - leaveDeduction);

    const today = new Date();
    const month = today.toLocaleString("default", {
      month: "short",
      year: "numeric",
    });

    const existing = await prisma.washingSalaryHistory.findFirst({
      where: {
        washingStaffSalaryId: salary.id,
        month,
      },
    });

    if (existing) {
      await prisma.washingSalaryHistory.update({
        where: { id: existing.id },
        data: {
          baseSalary: monthlySalary,
          bonus: salary.bonus,
          deductions: leaveDeduction,
          netSalary,
          paidDate: today,
        },
      });
    } else {
      await prisma.washingSalaryHistory.create({
        data: {
          washingStaffSalaryId: salary.id,
          month,
          baseSalary: monthlySalary,
          bonus: salary.bonus,
          deductions: leaveDeduction,
          netSalary,
          paidDate: today,
        },
      });
    }

    await prisma.washingStaffSalary.update({
      where: { id: salary.id },
      data: { status: "paid", lastPaid: today },
    });

    res.json({ success: true });
  } catch (err) {
    console.error("payWashingStaffSalary error:", err);
    res.status(500).json({ message: err.message });
  }
};

/* ============================
   AUTO HOLD / RESET
============================ */
export const autoManageWashingSalary = async () => {
  const now = new Date();
  const day = now.getDate();
  const monthKey = `${now.getMonth()}-${now.getFullYear()}`;
  const monthLabel = now.toLocaleString("default", { month: "short", year: "numeric" });

  const salaries = await prisma.washingStaffSalary.findMany();

  for (const s of salaries) {
    if (!s.lastUpdatedMonth) {
  await prisma.washingStaffSalary.update({
    where: { id: s.id },
    data: {
      lastUpdatedMonth: monthKey,
    },
  });
  continue;
}

if (s.lastUpdatedMonth !== monthKey) {
  await prisma.washingStaffSalary.update({
    where: { id: s.id },
    data: {
      status: "pending",
      bonus: 0,
      leaves: 0,
      deductions: 0,
      lastPaid: null,
      lastUpdatedMonth: monthKey,
    },
  });
}


    if (day < 6 || s.status === "paid") continue;

    const exists = await prisma.washingSalaryHistory.findFirst({
      where: { washingStaffSalaryId: s.id, month: monthLabel },
    });

    if (exists) continue;

    const monthlySalary = Math.round(s.annualSalary / 12);
    const netSalary = monthlySalary + s.bonus - s.deductions;

    await prisma.washingSalaryHistory.create({
      data: {
        washingStaffSalaryId: s.id,
        month: monthLabel,
        baseSalary: monthlySalary,
        bonus: s.bonus,
        deductions: s.deductions,
        netSalary,
        paidDate: null, // HOLD
      },
    });
  }
};

/* ============================
   SALARY HISTORY
============================ */
export const getWashingSalaryHistory = async (req, res) => {
  try {
    const staffId = Number(req.params.id);

    const salaries = await prisma.washingStaffSalary.findMany({
      where: { staffId },
    });

    const salaryIds = salaries.map((s) => s.id);

    const history = await prisma.washingSalaryHistory.findMany({
      where: { washingStaffSalaryId: { in: salaryIds } },
      orderBy: { paidDate: "desc" },
    });

    res.json(history);
  } catch (err) {
    console.error("getWashingSalaryHistory error:", err);
    res.status(500).json({ message: err.message });
  }
};

export const deleteWashingStaffSalary = async (req, res) => {
  try {
    const id = Number(req.params.id);

    await prisma.$transaction([
      prisma.washingSalaryHistory.deleteMany({
        where: { washingStaffSalaryId: id },
      }),
      prisma.washingStaffSalary.delete({
        where: { id },
      }),
    ]);

    res.json({ message: "Salary deleted successfully" });
  } catch (error) {
    console.error("deleteWashingStaffSalary error:", error);
    res.status(500).json({ message: "Failed to delete salary" });
  }
};
