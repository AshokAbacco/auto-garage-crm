import React, { useState, useEffect } from "react";
import { useTheme } from "../../contexts/ThemeContext";
import {
  Search,
  DollarSign,
  History,
  Edit2,
  Trash2,
  Calendar,
  Users,
  TrendingUp,
  CheckCircle,
  Clock,
  AlertCircle,
  IndianRupee,
} from "lucide-react";
import { Toaster, toast } from "react-hot-toast";
import api from "../../utils/axiosInstance";
import AddSalaryModal from "./AddStaff";
import SalaryHistoryModal from "./SalaryHistory";

const DAYS_IN_YEAR = 365;

const calculatePerDaySalary = (annualSalary) => {
  if (!annualSalary) return 0;
  return annualSalary / DAYS_IN_YEAR;
};

const calculateDeductions = (annualSalary, leaves) => {
  if (!annualSalary || !leaves) return 0;
  const perDay = calculatePerDaySalary(annualSalary);
  return Math.round(perDay * leaves);
};

const calculateNetSalary = (salary) => {
  const monthlySalary = salary.annualSalary
    ? Math.round(salary.annualSalary / 12)
    : 0;

  const deduction = calculateDeductions(
    salary.annualSalary,
    salary.leaves
  );

  return Math.round(monthlySalary + salary.bonus - deduction);
};


const SalaryManagement = () => {
  const { isDark } = useTheme();
  const [salaries, setSalaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [selectedSalary, setSelectedSalary] = useState(null);

  useEffect(() => {
    fetchSalaries();
  }, []);

  const fetchSalaries = async () => {
    try {
      setLoading(true);
      const res = await api.get("/api/bike-staff-salary");
      setSalaries(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Fetch salaries error:", err);
      toast.error(err.response?.data?.message || "Failed to load salaries");
    } finally {
      setLoading(false);
    }
  };

  const handlePaySalary = async (salaryId) => {
    if (!window.confirm("Are you sure you want to mark this salary as paid?"))
      return;

    try {
      await api.post(`/api/bike-staff-salary/${salaryId}/pay`);
      toast.success("Salary marked as paid successfully");
      fetchSalaries();
    } catch (err) {
      console.error("Pay salary error:", err);
      toast.error(err.response?.data?.message || "Failed to pay salary");
    }
  };

  const handleDeleteSalary = async (salaryId, staffName) => {
    if (
      !window.confirm(`Are you sure you want to delete salary record for ${staffName}?`)
    )
      return;

    try {
      await api.delete(`/api/bike-staff-salary/${salaryId}`);
      toast.success("Salary record deleted successfully");
      fetchSalaries();
    } catch (err) {
      console.error("Delete salary error:", err);
      toast.error(err.response?.data?.message || "Failed to delete salary");
    }
  };

  const filteredSalaries = salaries.filter((s) =>
    [s.staff?.name, s.staff?.role]
      .join(" ")
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  const pendingCount = salaries.filter((s) => s.status === "pending").length;
  const paidCount = salaries.filter((s) => s.status === "paid").length;
  const totalExpense = salaries.reduce(
    (sum, s) => sum + calculateNetSalary(s),
    0
  );

  return (
    <div className="p-4 md:p-6">
      <Toaster position="top-right" />

      {/* Header */}
      <div className="mb-6 animate-fadeIn">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="transform transition-all duration-300 hover:translate-x-1">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent">
              Salary Management
            </h1>
            <p
              className={`text-sm mt-1 transition-colors duration-300 ${
                isDark ? "text-gray-400" : "text-gray-600"
              }`}
            >
              Manage and process employee salaries
            </p>
          </div>

          <button
            onClick={() => {
              setSelectedSalary(null);
              setShowAddModal(true);
            }}
            className="group relative flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-lg hover:shadow-xl hover:shadow-blue-500/50 hover:scale-105 active:scale-95 transition-all duration-300 font-medium overflow-hidden"
          >
            <span className="absolute inset-0 w-full h-full bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300"></span>
            <DollarSign
              size={18}
              className="transition-transform duration-300 group-hover:rotate-12"
            />
            <span className="relative">Add Salary Entry</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          icon={<Users size={20} />}
          label="Total Entries"
          value={salaries.length}
          color="blue"
          isDark={isDark}
        />
        <StatCard
          icon={<Clock size={20} />}
          label="Pending Payments"
          value={pendingCount}
          color="orange"
          isDark={isDark}
        />
        <StatCard
          icon={<CheckCircle size={20} />}
          label="Paid"
          value={paidCount}
          color="green"
          isDark={isDark}
        />
        <StatCard
          icon={<IndianRupee size={20} />}
          label="Total Expense"
          value={`₹${totalExpense.toLocaleString()}`}
          color="emerald"
          isDark={isDark}
        />
      </div>

      {/* Search Bar */}
      <div
        className={`p-4 rounded-xl border mb-6 transition-all duration-300 ${
          isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
        }`}
      >
        <div className="relative">
          <Search
            className={`absolute left-4 top-1/2 transform -translate-y-1/2 transition-colors duration-300 ${
              isDark ? "text-gray-500" : "text-gray-400"
            }`}
            size={18}
          />
          <input
            type="text"
            placeholder="Search by staff name or role..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full pl-12 pr-4 py-3 rounded-lg border transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              isDark
                ? "bg-gray-900 border-gray-700 text-white placeholder-gray-500"
                : "bg-white border-gray-300 text-gray-900 placeholder-gray-400"
            }`}
          />
        </div>
      </div>

      {/* Salary Cards */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p
            className={`mt-4 transition-colors duration-300 ${
              isDark ? "text-gray-400" : "text-gray-600"
            }`}
          >
            Loading salaries...
          </p>
        </div>
      ) : filteredSalaries.length === 0 ? (
        <div
          className={`text-center py-12 rounded-xl border transition-all duration-300 ${
            isDark
              ? "bg-gray-800 border-gray-700"
              : "bg-white border-gray-200"
          }`}
        >
          <DollarSign
            size={48}
            className={`mx-auto mb-4 transition-colors duration-300 ${
              isDark ? "text-gray-600" : "text-gray-400"
            }`}
          />
          <p
            className={`transition-colors duration-300 ${
              isDark ? "text-gray-400" : "text-gray-600"
            }`}
          >
            {searchQuery ? "No salary entries found" : "No salary entries yet"}
          </p>
          {!searchQuery && (
            <button
              onClick={() => {
                setSelectedSalary(null);
                setShowAddModal(true);
              }}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-300"
            >
              Add Your First Salary Entry
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredSalaries.map((salary, index) => (
            <SalaryCard
              key={salary.id}
              salary={salary}
              isDark={isDark}
              index={index}
              onEdit={() => {
                setSelectedSalary(salary);
                setShowAddModal(true);
              }}
              onDelete={() =>
                handleDeleteSalary(salary.id, salary.staff?.name || "Staff")
              }
              onPay={() => handlePaySalary(salary.id)}
              onViewHistory={() => {
                setSelectedSalary(salary);
                setShowHistoryModal(true);
              }}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      {showAddModal && (
        <AddSalaryModal
          salary={selectedSalary}
          onClose={() => {
            setShowAddModal(false);
            setSelectedSalary(null);
          }}
          onSave={fetchSalaries}
          isDark={isDark}
        />
      )}
      {showHistoryModal && selectedSalary && (
        <SalaryHistoryModal
          staff={{ id: selectedSalary.staffId, name: selectedSalary.staff?.name }}
          onClose={() => {
            setShowHistoryModal(false);
            setSelectedSalary(null);
          }}
          isDark={isDark}
        />
      )}
    </div>
  );
};

// Stats Card Component
const StatCard = ({ icon, label, value, color, isDark }) => {
  const colors = {
    blue: isDark
      ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
      : "bg-blue-50 text-blue-600 border-blue-100",
    orange: isDark
      ? "bg-orange-500/10 text-orange-400 border-orange-500/20"
      : "bg-orange-50 text-orange-600 border-orange-100",
    green: isDark
      ? "bg-green-500/10 text-green-400 border-green-500/20"
      : "bg-green-50 text-green-600 border-green-100",
    emerald: isDark
      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
      : "bg-emerald-50 text-emerald-600 border-emerald-100",
  };

  return (
    <div
      className={`group p-4 rounded-lg border transform transition-all duration-300 hover:scale-105 hover:shadow-xl cursor-pointer animate-slideUp ${
        isDark
          ? "bg-gray-800 border-gray-700 hover:bg-gray-750 hover:border-gray-600"
          : "bg-white border-gray-200 hover:shadow-blue-100"
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <div
          className={`p-2 rounded-lg transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 ${colors[color]}`}
        >
          {icon}
        </div>
        <TrendingUp
          size={16}
          className={`transition-all duration-300 group-hover:translate-y-[-2px] ${
            isDark ? "text-gray-600" : "text-gray-400"
          }`}
        />
      </div>
      <p
        className={`text-xs mb-1 transition-colors duration-300 ${
          isDark ? "text-gray-400" : "text-gray-500"
        }`}
      >
        {label}
      </p>
      <h3
        className={`text-2xl font-bold transition-all duration-300 group-hover:scale-105 ${
          isDark ? "text-white" : "text-gray-900"
        }`}
      >
        {value}
      </h3>
    </div>
  );
};

// Salary Card Component
const SalaryCard = ({ salary, isDark, index, onEdit, onDelete, onPay, onViewHistory }) => {
  const netSalary = calculateNetSalary(salary);
  const monthlySalary = salary.annualSalary
  ? Math.round(salary.annualSalary / 12)
  : 0;
  const deduction = calculateDeductions(salary.annualSalary, salary.leaves);

  const statusColors = {
    pending: isDark
      ? "bg-orange-500/10 text-orange-400 border-orange-500/30"
      : "bg-orange-50 text-orange-700 border-orange-200",
    paid: isDark
      ? "bg-green-500/10 text-green-400 border-green-500/30"
      : "bg-green-50 text-green-700 border-green-200",
  };

  return (
    <div
      className={`group p-5 rounded-xl border transform transition-all duration-300 hover:scale-[1.02] hover:shadow-xl animate-slideUp ${
        isDark
          ? "bg-gray-800 border-gray-700 hover:bg-gray-750 hover:border-blue-500/30 hover:shadow-blue-500/10"
          : "bg-white border-gray-200 hover:border-blue-500/30 hover:shadow-blue-100"
      }`}
      style={{ animationDelay: `${index * 50}ms` }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-lg font-bold transform transition-all duration-300 group-hover:scale-110 group-hover:rotate-6">
            {salary.staff?.name?.charAt(0).toUpperCase() || "?"}
          </div>
          <div>
            <h3
              className={`font-bold text-lg transition-colors duration-300 ${
                isDark
                  ? "text-white group-hover:text-blue-400"
                  : "text-gray-900 group-hover:text-blue-600"
              }`}
            >
              {salary.staff?.name || "Unknown"}
            </h3>
            <p
              className={`text-sm transition-colors duration-300 ${
                isDark ? "text-gray-400" : "text-gray-600"
              }`}
            >
              {salary.staff?.role || "No role"}
            </p>
          </div>
        </div>

        {/* Status Badge */}
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium border transition-all duration-300 ${
            statusColors[salary.status]
          }`}
        >
          {salary.status === "paid" ? "Paid" : "Pending"}
        </span>
      </div>

      {/* Salary Details */}
      <div className="space-y-3 mb-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p
              className={`text-xs transition-colors duration-300 ${
                isDark ? "text-gray-500" : "text-gray-600"
              }`}
            >
              Monthly Salary
            </p>
            <p
              className={`font-bold transition-colors duration-300 ${
                isDark ? "text-white" : "text-gray-900"
              }`}
            >
              ₹{monthlySalary.toLocaleString()}
            </p>
          </div>
          <div>
            <p
              className={`text-xs transition-colors duration-300 ${
                isDark ? "text-gray-500" : "text-gray-600"
              }`}
            >
              Bonus
            </p>
            <p className="font-bold text-green-600">
              +₹{salary.bonus.toLocaleString()}
            </p>
          </div>
          <div>
            <p
              className={`text-xs transition-colors duration-300 ${
                isDark ? "text-gray-500" : "text-gray-600"
              }`}
            >
              Leaves ({salary.leaves} days)
            </p>
            <p className="font-bold text-red-600">
              -₹{deduction.toLocaleString()}
            </p>
          </div>
          <div>
            <p
              className={`text-xs transition-colors duration-300 ${
                isDark ? "text-gray-500" : "text-gray-600"
              }`}
            >
              Per Day
            </p>
            <p
              className={`text-sm font-medium transition-colors duration-300 ${
                isDark ? "text-gray-300" : "text-gray-700"
              }`}
            >
              ₹{Math.round(calculatePerDaySalary(salary.annualSalary))}
            </p>
          </div>
        </div>
      </div>

      {/* Net Salary */}
      <div
        className={`p-3 rounded-lg border mb-4 transition-colors duration-300 ${
          isDark
            ? "bg-emerald-500/10 border-emerald-500/30"
            : "bg-emerald-50 border-emerald-200"
        }`}
      >
        <p
          className={`text-xs mb-1 transition-colors duration-300 ${
            isDark ? "text-emerald-400" : "text-emerald-700"
          }`}
        >
          Net Salary
        </p>
        <p className="text-2xl font-bold text-emerald-600">
          ₹{netSalary.toLocaleString()}
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2">
        <button
          onClick={onViewHistory}
          className={`group/btn relative overflow-hidden flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 hover:scale-105 active:scale-95 ${
            isDark
              ? "bg-blue-500/10 text-blue-400 hover:bg-blue-500/20"
              : "bg-blue-50 text-blue-600 hover:bg-blue-100"
          }`}
          title="View History"
        >
          <span className="absolute inset-0 w-full h-full bg-blue-500 opacity-0 group-hover/btn:opacity-10 transition-opacity duration-300"></span>
          <History size={16} className="inline mr-1" />
          <span className="relative">History</span>
        </button>

        {salary.status === "pending" && (
          <button
            onClick={onPay}
            className={`group/btn relative overflow-hidden flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 hover:scale-105 active:scale-95 ${
              isDark
                ? "bg-green-500/10 text-green-400 hover:bg-green-500/20"
                : "bg-green-50 text-green-600 hover:bg-green-100"
            }`}
            title="Pay Salary"
          >
            <span className="absolute inset-0 w-full h-full bg-green-500 opacity-0 group-hover/btn:opacity-10 transition-opacity duration-300"></span>
            <DollarSign size={16} className="inline mr-1" />
            <span className="relative">Pay</span>
          </button>
        )}

        <button
          onClick={onEdit}
          className={`group/btn relative overflow-hidden p-2 rounded-lg transition-all duration-300 hover:scale-110 active:scale-95 ${
            isDark
              ? "bg-blue-500/10 text-blue-400 hover:bg-blue-500/20"
              : "bg-blue-50 text-blue-600 hover:bg-blue-100"
          }`}
          title="Edit"
        >
          <span className="absolute inset-0 w-full h-full bg-blue-500 opacity-0 group-hover/btn:opacity-10 transition-opacity duration-300"></span>
          <Edit2
            size={16}
            className="relative transition-transform duration-300 group-hover/btn:rotate-12"
          />
        </button>

        <button
          onClick={onDelete}
          className={`group/btn relative overflow-hidden p-2 rounded-lg transition-all duration-300 hover:scale-110 hover:rotate-12 active:scale-95 active:rotate-0 ${
            isDark
              ? "bg-red-500/10 text-red-400 hover:bg-red-500/20"
              : "bg-red-50 text-red-600 hover:bg-red-100"
          }`}
          title="Delete"
        >
          <span className="absolute inset-0 w-full h-full bg-red-500 opacity-0 group-hover/btn:opacity-10 transition-opacity duration-300"></span>
          <Trash2
            size={16}
            className="relative transition-transform duration-300 group-hover/btn:scale-110"
          />
        </button>
      </div>

      {/* Last Paid Date */}
      {salary.status === "paid" && salary.lastPaid && (
        <div
          className={`mt-3 pt-3 border-t text-xs transition-colors duration-300 ${
            isDark
              ? "border-gray-700 text-gray-500"
              : "border-gray-200 text-gray-600"
          }`}
        >
          <Calendar size={12} className="inline mr-1" />
          Paid on {new Date(salary.lastPaid).toLocaleDateString()}
        </div>
      )}
    </div>
  );
};

export default SalaryManagement;