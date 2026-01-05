import prisma from "../models/prismaClient.js";

/**
 * =================================================
 * GENERATE / UPDATE MONTHLY SALARY
 * =================================================
 */
const generateMonthlySalary = async (req, res) => {
  try {
    const ownerId = req.user.id;
    const { month, year, payrollInputs } = req.body;

    if (!month || !year) {
      return res.status(400).json({ message: "Month and year are required" });
    }

    const staffList = await prisma.carStaff.findMany({
      where: {
        ownerId,
        isActive: true,
        includeInPayroll: true,
      },
    });

    let processed = 0;

    for (const staff of staffList) {
      const input = payrollInputs?.[staff.id] || {};

      const leaves = Number(input.leaves || 0);
      const bonus = Number(input.bonus || 0);
      const extraDeductions = Number(input.extraDeductions || 0);

      const deductionPerLeave = Number(staff.deductionPerLeave || 0);
      const leaveDeduction = leaves * deductionPerLeave;

      const netSalary =
        Number(staff.baseSalary || 0) +
        bonus -
        leaveDeduction -
        extraDeductions;

      const existing = await prisma.carStaffSalary.findUnique({
        where: {
          staffId_month_year: {
            staffId: staff.id,
            month,
            year,
          },
        },
      });

      // ❌ PAID salary is locked
      if (existing && existing.status === "PAID") continue;

      if (existing) {
        // ✅ UPDATE (UNPAID / HOLD)
        await prisma.carStaffSalary.update({
          where: { id: existing.id },
          data: {
            leaves,
            bonus,
            extraDeductions,
            deductionPerLeave,
            leaveDeduction,
            netSalary,
            updatedAt: new Date(),
          },
        });
      } else {
        // ✅ CREATE
        await prisma.carStaffSalary.create({
          data: {
            ownerId,
            staffId: staff.id,
            month,
            year,
            baseSalary: staff.baseSalary,
            leaves,
            bonus,
            extraDeductions,
            deductionPerLeave,
            leaveDeduction,
            netSalary,
            status: "UNPAID",
          },
        });
      }

      processed++;
    }

    return res.json({ success: true, processed });
  } catch (err) {
    console.error("❌ Generate Salary Error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * =================================================
 * GET SALARIES
 * =================================================
 */
const getSalaryByMonthYear = async (req, res) => {
  try {
    const ownerId = req.user.id;
    const month = Number(req.query.month);
    const year = Number(req.query.year);

    const salaries = await prisma.carStaffSalary.findMany({
      where: { ownerId, month, year },
      include: {
        staff: { select: { name: true, role: true } },
      },
      orderBy: { staff: { name: "asc" } },
    });

    return res.json(salaries);
  } catch (err) {
    return res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * =================================================
 * MARK AS PAID
 * =================================================
 */
const markSalaryAsPaid = async (req, res) => {
  try {
    const ownerId = req.user.id;
    const salaryId = Number(req.params.id);

    const salary = await prisma.carStaffSalary.findFirst({
      where: { id: salaryId, ownerId },
    });

    if (!salary) {
      return res.status(404).json({ message: "Salary not found" });
    }

    if (salary.status === "PAID") {
      return res.status(400).json({ message: "Already paid" });
    }

    await prisma.carStaffSalary.update({
      where: { id: salaryId },
      data: {
        status: "PAID",
        paidAt: new Date(),
        paidBy: ownerId,
      },
    });

    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * =================================================
 * UPDATE SALARY (UNPAID / HOLD ONLY)
 * PUT /api/car-salary/:id
 * =================================================
 */
const updateSalary = async (req, res) => {
  try {
    const ownerId = req.user.id;
    const salaryId = Number(req.params.id);

    const { leaves, bonus, extraDeductions } = req.body;

    const salary = await prisma.carStaffSalary.findFirst({
      where: {
        id: salaryId,
        ownerId,
      },
      include: {
        staff: true,
      },
    });

    if (!salary) {
      return res.status(404).json({ message: "Salary record not found" });
    }

    // 🔒 PAID salary is locked
    if (salary.status === "PAID") {
      return res
        .status(400)
        .json({ message: "Paid salary cannot be edited" });
    }

    const safeLeaves = Number(leaves || 0);
    const safeBonus = Number(bonus || 0);
    const safeExtra = Number(extraDeductions || 0);

    const deductionPerLeave = salary.deductionPerLeave;
    const leaveDeduction = safeLeaves * deductionPerLeave;

    const netSalary =
      Number(salary.baseSalary) +
      safeBonus -
      leaveDeduction -
      safeExtra;

    const updated = await prisma.carStaffSalary.update({
      where: { id: salaryId },
      data: {
        leaves: safeLeaves,
        bonus: safeBonus,
        extraDeductions: safeExtra,
        leaveDeduction,
        netSalary,
        updatedAt: new Date(),
      },
    });

    return res.json(updated);
  } catch (error) {
    console.error("❌ Update Salary Error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};


export default {
  generateMonthlySalary,
  getSalaryByMonthYear,
  markSalaryAsPaid,
  updateSalary,
};
