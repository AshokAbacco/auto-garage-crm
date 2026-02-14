import React, { useState, useEffect } from "react";
import { useTheme } from "../../../contexts/ThemeContext";
import {
  Search,
  History,
  Edit2,
  Trash2,
  Calendar,
  Users,
  CheckCircle,
  Clock,
  IndianRupee,
  Sparkles,
  Wallet,
  ChevronDown,
  ChevronUp,
  FileText,
} from "lucide-react";
import { Toaster, toast } from "react-hot-toast";
import api from "../../../utils/axiosInstance";
import AddSalaryModal from "./AddWashSalaryModal";
import SalaryHistoryModal from "./WashSalaryHistory";
import PayslipModal from "./WashPayslipModal";

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
  const monthlySalary = salary.annualSalary ? Math.round(salary.annualSalary / 12) : 0;
  const deduction = calculateDeductions(salary.annualSalary, salary.leaves);
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
  const [showPayslip, setShowPayslip] = useState(false);
  const [payslipSalary, setPayslipSalary] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  useEffect(() => {
    fetchSalaries();
  }, []);

  const onViewPayslip = (salary) => {
    setPayslipSalary(salary);
    setShowPayslip(true);
  };

  const fetchSalaries = async () => {
    try {
      setLoading(true);
      const res = await api.get("/api/washing-staff-salary");
      setSalaries(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load salaries");
    } finally {
      setLoading(false);
    }
  };

  const handlePaySalary = async (salaryId) => {
    if (!window.confirm("Are you sure you want to mark this salary as paid?")) return;
    try {
      await api.post(`/api/washing-staff-salary/${salaryId}/pay`);
      toast.success("Salary marked as paid successfully");
      fetchSalaries();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to pay salary");
    }
  };

  const handleDeleteSalary = async (salaryId, staffName) => {
    if (!window.confirm(`Are you sure you want to delete salary record for ${staffName}?`)) return;
    try {
      await api.delete(`/api/washing-staff-salary/${salaryId}`);
      toast.success("Salary record deleted successfully");
      fetchSalaries();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete salary");
    }
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getSortedSalaries = (salaries) => {
    if (!sortConfig.key) return salaries;
    
    return [...salaries].sort((a, b) => {
      let aValue, bValue;
      
      switch(sortConfig.key) {
        case 'name':
          aValue = a.staff?.name || '';
          bValue = b.staff?.name || '';
          break;
        case 'role':
          aValue = a.staff?.role || '';
          bValue = b.staff?.role || '';
          break;
        case 'netSalary':
          aValue = calculateNetSalary(a);
          bValue = calculateNetSalary(b);
          break;
        case 'status':
          aValue = a.status;
          bValue = b.status;
          break;
        default:
          return 0;
      }
      
      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  };

  const filteredSalaries = getSortedSalaries(
    salaries.filter((s) =>
      [s.staff?.name, s.staff?.role].join(" ").toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  const pendingCount = salaries.filter((s) => s.status === "pending").length;
  const paidCount = salaries.filter((s) => s.status === "paid").length;
  const totalExpense = salaries.reduce((sum, s) => sum + calculateNetSalary(s), 0);

  return (
    <div className="p-4 md:p-6 space-y-6">
      <Toaster position="top-right" />

      {/* Header */}
      <div style={{ animation: "slideDown 0.5s ease-out" }}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-blue-500 to-blue-600 bg-clip-text text-transparent flex items-center gap-3">
              <Sparkles className="text-blue-500" size={32} />
              Salary Management
            </h1>
            <p className={`text-sm mt-2 ${isDark ? "text-gray-400" : "text-gray-600"}`}>
              Process and track employee compensation
            </p>
          </div>
          <button
            onClick={() => {
              setSelectedSalary(null);
              setShowAddModal(true);
            }}
            className={`group relative px-6 py-3 rounded-xl font-semibold shadow-lg overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-2xl active:scale-95 ${
              isDark
                ? "bg-blue-600 text-white hover:shadow-blue-500/50"
                : "bg-blue-600 text-white hover:shadow-blue-400/50"
            }`}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
            <span className="relative flex items-center gap-2">
              <IndianRupee size={20} className="group-hover:rotate-12 transition-transform duration-300" />
              Add Salary Entry
            </span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={<Users size={22} />} label="Total Entries" value={salaries.length} color="blue" isDark={isDark} />
        <StatCard icon={<Clock size={22} />} label="Pending Payments" value={pendingCount} color="orange" isDark={isDark} />
        <StatCard icon={<CheckCircle size={22} />} label="Paid" value={paidCount} color="green" isDark={isDark} />
        <StatCard icon={<Wallet size={22} />} label="Total Expense" value={`₹${totalExpense.toLocaleString()}`} color="emerald" isDark={isDark} />
      </div>

      {/* Search Bar */}
      <div
        className={`p-4 rounded-2xl border backdrop-blur-sm transition-all duration-300 ${
          isDark ? "bg-gray-800/50 border-gray-700 hover:bg-gray-800/70" : "bg-white/70 border-gray-200 hover:bg-white"
        }`}
      >
        <div className="relative">
          <Search className={`absolute left-4 top-1/2 -translate-y-1/2 ${isDark ? "text-gray-500" : "text-gray-400"}`} size={20} />
          <input
            type="text"
            placeholder="Search by staff name or role..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full pl-12 pr-4 py-3.5 rounded-xl border-0 bg-transparent focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all ${
              isDark ? "text-white placeholder-gray-500" : "text-gray-900 placeholder-gray-400"
            }`}
          />
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="text-center py-16">
          <div className="relative inline-flex">
            <div className="w-16 h-16 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
              <IndianRupee className="text-emerald-600" size={24} />
            </div>
          </div>
          <p className={`mt-4 font-medium ${isDark ? "text-gray-400" : "text-gray-600"}`}>Loading salaries...</p>
        </div>
      ) : filteredSalaries.length === 0 ? (
        <div
          className={`text-center py-16 rounded-2xl border ${
            isDark ? "bg-gray-800/50 border-gray-700" : "bg-white border-gray-200"
          }`}
        >
          <IndianRupee size={56} className={`mx-auto mb-4 ${isDark ? "text-gray-600" : "text-gray-400"}`} />
          <p className={`text-lg font-medium ${isDark ? "text-gray-400" : "text-gray-600"}`}>
            {searchQuery ? "No salary entries found" : "No salary entries yet"}
          </p>
        </div>
      ) : (
        <div className={`rounded-2xl border overflow-hidden ${
          isDark ? "bg-gray-800/50 border-gray-700" : "bg-white border-gray-200"
        }`}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className={`border-b ${isDark ? "bg-gray-800/80 border-gray-700" : "bg-gray-50 border-gray-200"}`}>
                  <SortableHeader label="Employee" sortKey="name" sortConfig={sortConfig} onSort={handleSort} isDark={isDark} />
                  <SortableHeader label="Role" sortKey="role" sortConfig={sortConfig} onSort={handleSort} isDark={isDark} />
                  <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                    Monthly Salary
                  </th>
                  <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                    Bonus
                  </th>
                  <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                    Deductions
                  </th>
                  <SortableHeader label="Net Salary" sortKey="netSalary" sortConfig={sortConfig} onSort={handleSort} isDark={isDark} />
                  <SortableHeader label="Status" sortKey="status" sortConfig={sortConfig} onSort={handleSort} isDark={isDark} />
                  <th className={`px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isDark ? "divide-gray-700" : "divide-gray-200"}`}>
                {filteredSalaries.map((salary, index) => (
                  <TableRow
                    key={salary.id}
                    salary={salary}
                    isDark={isDark}
                    index={index}
                    onPay={() => handlePaySalary(salary.id)}
                    onEdit={() => {
                      setSelectedSalary(salary);
                      setShowAddModal(true);
                    }}
                    onDelete={() => handleDeleteSalary(salary.id, salary.staff?.name)}
                    onViewHistory={() => {
                      setSelectedSalary(salary);
                      setShowHistoryModal(true);
                    }}
                    onViewPayslip={onViewPayslip}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

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

      {showHistoryModal && (
        <SalaryHistoryModal
          staff={selectedSalary?.staff}
          onClose={() => {
            setShowHistoryModal(false);
            setSelectedSalary(null);
          }}
          isDark={isDark}
        />
      )}

      {showPayslip && (
        <PayslipModal
          salary={payslipSalary}
          onClose={() => setShowPayslip(false)}
        />
      )}

      <style jsx>{`
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

const StatCard = ({ icon, label, value, color, isDark }) => {
  const colors = {
    blue: isDark ? "from-blue-600/20 to-blue-800/20 border-blue-500/30" : "from-blue-50 to-blue-100/50 border-blue-200",
    orange: isDark ? "from-orange-600/20 to-orange-800/20 border-orange-500/30" : "from-orange-50 to-orange-100/50 border-orange-200",
    green: isDark ? "from-green-600/20 to-green-800/20 border-green-500/30" : "from-green-50 to-green-100/50 border-green-200",
    emerald: isDark ? "from-emerald-600/20 to-emerald-800/20 border-emerald-500/30" : "from-emerald-50 to-emerald-100/50 border-emerald-200",
  };

  const iconColors = {
    blue: "text-blue-500",
    orange: "text-orange-500",
    green: "text-green-500",
    emerald: "text-emerald-500",
  };

  return (
    <div
      className={`group relative p-5 rounded-2xl border bg-gradient-to-br overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-xl cursor-pointer ${colors[color]}`}
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-16 translate-x-16 group-hover:scale-150 transition-transform duration-500"></div>
      <div className="relative flex items-center justify-between mb-4">
        <div className={`p-3 rounded-xl bg-white/10 backdrop-blur-sm ${iconColors[color]} group-hover:scale-110 group-hover:rotate-6 transition-all duration-300`}>
          {icon}
        </div>
      </div>
      <p className={`text-sm mb-1 ${isDark ? "text-gray-400" : "text-gray-600"}`}>{label}</p>
      <h3 className={`text-2xl font-bold ${isDark ? "text-white" : "text-gray-900"} group-hover:scale-105 transition-transform`}>
        {value}
      </h3>
    </div>
  );
};

const SortableHeader = ({ label, sortKey, sortConfig, onSort, isDark }) => {
  const isActive = sortConfig.key === sortKey;
  
  return (
    <th 
      onClick={() => onSort(sortKey)}
      className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider cursor-pointer transition-colors ${
        isDark ? "text-gray-400 hover:text-gray-300" : "text-gray-600 hover:text-gray-800"
      }`}
    >
      <div className="flex items-center gap-2">
        {label}
        <div className="flex flex-col">
          <ChevronUp 
            size={12} 
            className={`-mb-1 transition-colors ${isActive && sortConfig.direction === 'asc' ? 'text-blue-500' : 'text-gray-400'}`}
          />
          <ChevronDown 
            size={12} 
            className={`-mt-1 transition-colors ${isActive && sortConfig.direction === 'desc' ? 'text-blue-500' : 'text-gray-400'}`}
          />
        </div>
      </div>
    </th>
  );
};

const TableRow = ({ salary, isDark, index, onPay, onEdit, onDelete, onViewHistory, onViewPayslip }) => {
  const netSalary = calculateNetSalary(salary);
  const monthlySalary = salary.annualSalary ? Math.round(salary.annualSalary / 12) : 0;
  const deduction = calculateDeductions(salary.annualSalary, salary.leaves);

  return (
    <tr 
      className={`transition-all duration-200 ${
        isDark ? "hover:bg-gray-700/50" : "hover:bg-gray-50"
      }`}
      style={{ animation: `fadeIn 0.3s ease-out ${index * 0.05}s backwards` }}
    >
      {/* Employee */}
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-sm font-bold shadow-md">
            {salary.staff?.name?.charAt(0).toUpperCase() || "?"}
          </div>
          <div>
            <p className={`font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>
              {salary.staff?.name || "Unknown"}
            </p>
            {salary.status === "paid" && salary.lastPaid && (
              <p className={`text-xs flex items-center gap-1 mt-0.5 ${isDark ? "text-gray-500" : "text-gray-500"}`}>
                <Calendar size={12} />
                {new Date(salary.lastPaid).toLocaleDateString()}
              </p>
            )}
          </div>
        </div>
      </td>

      {/* Role */}
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`text-sm ${isDark ? "text-gray-300" : "text-gray-700"}`}>
          {salary.staff?.role || "No role"}
        </span>
      </td>

      {/* Monthly Salary */}
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center gap-1">
          <IndianRupee size={14} className={isDark ? "text-gray-400" : "text-gray-500"} />
          <span className={`font-medium ${isDark ? "text-gray-300" : "text-gray-700"}`}>
            {monthlySalary.toLocaleString()}
          </span>
        </div>
      </td>

      {/* Bonus */}
      <td className="px-6 py-4 whitespace-nowrap">
        <span className="text-green-600 font-medium">
          +₹{salary.bonus.toLocaleString()}
        </span>
      </td>

      {/* Deductions */}
      <td className="px-6 py-4 whitespace-nowrap">
        <div>
          <span className="text-red-600 font-medium">
            -₹{deduction.toLocaleString()}
          </span>
          <p className={`text-xs mt-0.5 ${isDark ? "text-gray-500" : "text-gray-500"}`}>
            {salary.leaves} days leave
          </p>
        </div>
      </td>

      {/* Net Salary */}
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center gap-1">
          <IndianRupee size={16} className="text-emerald-600" />
          <span className="text-lg font-bold text-emerald-600">
            {netSalary.toLocaleString()}
          </span>
        </div>
      </td>

      {/* Status */}
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
          salary.status === "paid"
            ? isDark ? "bg-green-500/20 text-green-400" : "bg-green-100 text-green-700"
            : isDark ? "bg-orange-500/20 text-orange-400" : "bg-orange-100 text-orange-700"
        }`}>
          {salary.status === "paid" ? "✓ Paid" : "⏱ Pending"}
        </span>
      </td>

      {/* Actions */}
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={onViewHistory}
            className={`p-2 rounded-lg transition-all duration-200 hover:scale-110 ${
              isDark ? "bg-blue-500/20 text-blue-400 hover:bg-blue-500/30" : "bg-blue-50 text-blue-600 hover:bg-blue-100"
            }`}
            title="View History"
          >
            <History size={16} />
          </button>

          {salary.status === "pending" && (
            <button
              onClick={onPay}
              className={`p-2 rounded-lg transition-all duration-200 hover:scale-110 ${
                isDark ? "bg-green-500/20 text-green-400 hover:bg-green-500/30" : "bg-green-50 text-green-600 hover:bg-green-100"
              }`}
              title="Mark as Paid"
            >
              <CheckCircle size={16} />
            </button>
          )}

          {salary.status === "paid" && (
            <button
              onClick={() => onViewPayslip(salary)}
              className={`p-2 rounded-lg transition-all duration-200 hover:scale-110 ${
                isDark ? "bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30" : "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
              }`}
              title="View Payslip"
            >
              <FileText size={16} />
            </button>
          )}

          <button
            onClick={onEdit}
            className={`p-2 rounded-lg transition-all duration-200 hover:scale-110 ${
              isDark ? "bg-blue-500/20 text-blue-400 hover:bg-blue-500/30" : "bg-blue-50 text-blue-600 hover:bg-blue-100"
            }`}
            title="Edit"
          >
            <Edit2 size={16} />
          </button>

          <button
            onClick={onDelete}
            className={`p-2 rounded-lg transition-all duration-200 hover:scale-110 ${
              isDark ? "bg-red-500/20 text-red-400 hover:bg-red-500/30" : "bg-red-50 text-red-600 hover:bg-red-100"
            }`}
            title="Delete"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </td>
    </tr>
  );
};

export default SalaryManagement;