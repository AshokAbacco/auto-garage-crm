import { useEffect, useMemo, useState } from "react";
import {
  Wallet,
  CheckCircle2,
  Clock,
  Users,
  TrendingUp,
  AlertCircle,
} from "lucide-react";
import SalaryFilters from "../../components/Car/SalaryFilters";
import SalaryTable from "../../components/Car/SalaryTable";
import PreparePayrollModal from "../../components/Car/PreparePayrollModal";
import SalaryViewModal from "../../components/Car/SalaryViewModal";

import {
  getSalaries,
  generateSalary,
  markSalaryPaid,
  updateSalary,
} from "../../utils/salaryApi";
import { useTheme } from "../../contexts/ThemeContext";

export default function SalaryManagement() {
  const { isDark } = useTheme();
  const today = new Date();

  const [month, setMonth] = useState(today.getMonth() + 1);
  const [year, setYear] = useState(today.getFullYear());
  const [salaries, setSalaries] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [showPrepare, setShowPrepare] = useState(false);
  const [viewSalary, setViewSalary] = useState(null);
  const [companyName, setCompanyName] = useState("");

  /* ================= FETCH ================= */
  const loadSalaries = async () => {
    setSalaries(await getSalaries(month, year));
  };

  const loadStaff = async () => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/car-staff`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setStaffList(await res.json());
    } catch (error) {
      console.error("Failed to load staff", error);
    }
  };

  const loadProfile = async () => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/user/profile`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      const data = await res.json();
      setCompanyName(data.companyName || "");
    } catch (err) {
      console.error("Failed to load profile", err);
    }
  };


  useEffect(() => {
    loadSalaries();
    loadStaff();
    loadProfile(); 
  }, [month, year]);

  /* ================= GENERATE / UPDATE ================= */
  const handleGenerate = async ({ createPayload, updatePayload }) => {
    if (Object.keys(createPayload).length > 0) {
      await generateSalary(month, year, createPayload);
    }
    for (const item of updatePayload) {
      await updateSalary(item.id, item.data);
    }
    setShowPrepare(false);
    loadSalaries();
  };

  /* ================= PAY ================= */
  const handlePay = async (id) => {
    if (!confirm("Mark salary as paid?")) return;
    await markSalaryPaid(id);
    loadSalaries();
  };

  /* ================= STATS ================= */
  const stats = useMemo(() => {
    const total = salaries.reduce((s, r) => s + r.netSalary, 0);
    const paidList = salaries.filter((s) => s.status === "PAID");
    const paidAmount = paidList.reduce((s, r) => s + r.netSalary, 0);

    return {
      total,
      paid: paidAmount,
      pending: total - paidAmount,
      paidCount: paidList.length,
      totalCount: salaries.length,
    };
  }, [salaries]);

  // Helper for Month Name
  const currentMonthName = new Date(year, month - 1).toLocaleString("default", {
    month: "long",
  });

  return (
    <div
      className={`min-h-screen p-1 lg:ml-[5rem] transition-colors duration-300 ${
        isDark ? "bg-gray-900 text-gray-100" : "bg-gray-50 text-gray-800"
      }`}
    >
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-2">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Payroll Management
          </h1>
          <p
            className={`text-sm mt-1 ${
              isDark ? "text-gray-400" : "text-gray-500"
            }`}
          >
            Overview for{" "}
            <span className="font-semibold text-blue-500">
              {currentMonthName} {year}
            </span>
          </p>
        </div>

        {/* You could add a global export button here in the future */}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Payroll"
          value={stats.total}
          icon={Wallet}
          color="blue"
          isDark={isDark}
          showCurrency
        />
        <StatCard
          title="Paid Amount"
          value={stats.paid}
          icon={CheckCircle2}
          color="emerald"
          isDark={isDark}
          showCurrency
        />
        <StatCard
          title="Pending Amount"
          value={stats.pending}
          icon={Clock}
          color="amber"
          isDark={isDark}
          showCurrency
        />
        <StatCard
          title="Staff Status"
          value={`${stats.paidCount} / ${stats.totalCount}`}
          subLabel="Paid / Total"
          icon={Users}
          color="indigo"
          isDark={isDark}
        />
      </div>

      {/* Main Content Area */}
      <div
        className={`rounded-2xl shadow-sm border ${
          isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
        } overflow-hidden`}
      >
        {/* Filters Toolbar */}
        <div
          className={`p-5 border-b ${
            isDark ? "border-gray-700" : "border-gray-100"
          }`}
        >
          <SalaryFilters
            month={month}
            year={year}
            onMonthChange={setMonth}
            onYearChange={setYear}
            onGenerate={() => setShowPrepare(true)}
          />
        </div>

        {/* Table Container */}
        <div className="p-0">
          <SalaryTable
            salaries={salaries}
            onPay={handlePay}
            onView={setViewSalary}
          />
        </div>
      </div>

      {/* Modals */}
      {showPrepare && (
        <PreparePayrollModal
          staffList={staffList}
          existingSalaries={salaries}
          month={month}
          year={year}
          isDark={isDark}
          onClose={() => setShowPrepare(false)}
          onSubmit={handleGenerate}
        />
      )}

      {viewSalary && (
        <SalaryViewModal
          salary={viewSalary}
          companyName={companyName} // ✅ PASS HERE
          onClose={() => setViewSalary(null)}
        />
      )}
    </div>
  );
}

/* ================= MODERN STAT CARD ================= */
function StatCard({
  title,
  value,
  subLabel,
  icon: Icon,
  showCurrency,
  color = "blue",
  isDark,
}) {
  // Color mapping for dynamic styles
  const colors = {
    blue: "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400",
    emerald:
      "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400",
    amber:
      "bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400",
    indigo:
      "bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400",
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div
      className={`relative p-6 rounded-2xl border transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${
        isDark
          ? "bg-gray-800 border-gray-700 shadow-none"
          : "bg-white border-gray-100 shadow-sm"
      }`}
    >
      <div className="flex justify-between items-start">
        <div>
          <p
            className={`text-sm font-medium mb-1 ${
              isDark ? "text-gray-400" : "text-gray-500"
            }`}
          >
            {title}
          </p>
          <h3
            className={`text-2xl font-bold tracking-tight ${
              isDark ? "text-white" : "text-gray-900"
            }`}
          >
            {showCurrency ? formatCurrency(value) : value}
          </h3>
          {subLabel && <p className="text-xs text-gray-400 mt-1">{subLabel}</p>}
        </div>
        <div className={`p-3 rounded-xl ${colors[color]}`}>
          <Icon size={24} />
        </div>
      </div>
    </div>
  );
}
