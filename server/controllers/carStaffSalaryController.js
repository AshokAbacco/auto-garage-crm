import prisma from "../models/prismaClient.js";

/**
 * Generate monthly salary for all staff
 */
const generateMonthlySalary = async (req, res) => {
  try {
    const ownerId = req.user.id; // ✅ FIXED
    const { month, year } = req.body;

    if (!month || !year) {
      return res.status(400).json({ message: "Month and year are required" });
    }

    const staffList = await prisma.carStaff.findMany({
      where: { ownerId },
    });

    let generatedCount = 0;

    for (const staff of staffList) {
      const exists = await prisma.carStaffSalary.findUnique({
        where: {
          staffId_month_year: {
            staffId: staff.id,
            month,
            year,
          },
        },
      });

      if (exists) continue;

      const netSalary =
        staff.baseSalary -
        staff.leaves * staff.deductionPerLeave -
        staff.extraDeductions +
        staff.bonus;

      await prisma.carStaffSalary.create({
        data: {
          ownerId,
          staffId: staff.id,
          month,
          year,
          baseSalary: staff.baseSalary,
          bonus: staff.bonus,
          leaves: staff.leaves,
          deductionPerLeave: staff.deductionPerLeave,
          extraDeductions: staff.extraDeductions,
          netSalary,
        },
      });

      generatedCount++;
    }

    return res.json({ success: true, generated: generatedCount });
  } catch (error) {
    console.error("Generate salary error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};


/**
 * Get salaries by month & year
 */
const getSalaryByMonthYear = async (req, res) => {
  try {
    const ownerId = req.owner.id;
    const month = Number(req.query.month);
    const year = Number(req.query.year);

    if (!month || !year) {
      return res.status(400).json({ message: "Month and year are required" });
    }

    const salaries = await prisma.carStaffSalary.findMany({
      where: {
        ownerId,
        month,
        year,
      },
      include: {
        staff: {
          select: { name: true },
        },
      },
      orderBy: {
        staff: { name: "asc" },
      },
    });

    return res.json(salaries);
  } catch (error) {
    console.error("Fetch salary error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * Mark salary as PAID
 */
const markSalaryAsPaid = async (req, res) => {
  try {
    const ownerId = req.owner.id;
    const salaryId = Number(req.params.id);

    const salary = await prisma.carStaffSalary.findFirst({
      where: {
        id: salaryId,
        ownerId,
      },
    });

    if (!salary) {
      return res.status(404).json({ message: "Salary record not found" });
    }

    if (salary.status === "PAID") {
      return res.status(400).json({ message: "Salary already paid" });
    }

    await prisma.carStaffSalary.update({
      where: { id: salaryId },
      data: {
        status: "PAID",
        paidAt: new Date(),
      },
    });

    return res.json({ success: true });
  } catch (error) {
    console.error("Mark paid error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export default {
  generateMonthlySalary,
  getSalaryByMonthYear,
  markSalaryAsPaid,
};
