import { useEffect, useState } from "react";
import SalaryFilters from "../components/Car/SalaryFilters";
import SalaryTable from "../components/Car/SalaryTable";
import {
  getSalaries,
  generateSalary,
  markSalaryPaid,
} from "../../src/utils/salaryApi";

export default function SalaryManagement() {
  const today = new Date();

  const [month, setMonth] = useState(today.getMonth() + 1);
  const [year, setYear] = useState(today.getFullYear());
  const [salaries, setSalaries] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadSalaries = async () => {
    setLoading(true);
    try {
      const data = await getSalaries(month, year);
      setSalaries(data);
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    if (!confirm("Generate salary for this month?")) return;
    try {
      await generateSalary(month, year);
      loadSalaries();
    } catch (err) {
      alert(err.message);
    }
  };

  const handlePay = async (id) => {
    if (!confirm("Mark this salary as paid?")) return;
    try {
      await markSalaryPaid(id);
      loadSalaries();
    } catch (err) {
      alert(err.message);
    }
  };

  useEffect(() => {
    loadSalaries();
  }, [month, year]);

  return (
    <div className="ml-12 p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-1">Salary Management</h1>
        <p className="text-gray-600">Monthly payroll & payment history</p>
      </div>

      <SalaryFilters
        month={month}
        year={year}
        onMonthChange={setMonth}
        onYearChange={setYear}
        onGenerate={handleGenerate}
      />

      {loading ? (
        <div className="text-center py-10 text-gray-500">
          Loading salaries...
        </div>
      ) : (
        <SalaryTable salaries={salaries} onPay={handlePay} />
      )}
    </div>
  );
}
