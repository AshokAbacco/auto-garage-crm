// client/src/bikePages/StaffSalary/SalaryPage.jsx
import React, { useState, useEffect } from "react";
import { useTheme } from "../../contexts/ThemeContext";
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
} from "lucide-react";
import { Toaster, toast } from "react-hot-toast";
import api from "../../utils/axiosInstance";
import AddSalaryModal from "./AddStaff";
import SalaryHistoryModal from "./SalaryHistory";
import PayslipModal from "./Components/PayslipModal";

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
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    fetchSalaries();
    fetchCurrentUser();
  }, []);

  const onViewPayslip = (salary) => {
    setPayslipSalary(salary);
    setShowPayslip(true);
  };


  const fetchCurrentUser = async () => {
  try {
    const res = await api.get("/api/auth/profile");
    setCurrentUser(res.data);
  } catch (err) {
    console.error("Failed to load user profile");
  }
};

  const fetchSalaries = async () => {
    try {
      setLoading(true);
      const res = await api.get("/api/bike-staff-salary");
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
      await api.post(`/api/bike-staff-salary/${salaryId}/pay`);
      toast.success("Salary marked as paid successfully");
      fetchSalaries();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to pay salary");
    }
  };

  const handleDeleteSalary = async (salaryId, staffName) => {
    if (!window.confirm(`Are you sure you want to delete salary record for ${staffName}?`)) return;
    try {
      await api.delete(`/api/bike-staff-salary/${salaryId}`);
      toast.success("Salary record deleted successfully");
      fetchSalaries();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete salary");
    }
  };

  const filteredSalaries = salaries.filter((s) =>
    [s.staff?.name, s.staff?.role].join(" ").toLowerCase().includes(searchQuery.toLowerCase())
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

      {/* Salary Table */}
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
        <div 
          className={`rounded-2xl border overflow-hidden backdrop-blur-sm ${
            isDark ? "bg-gray-800/50 border-gray-700" : "bg-white border-gray-200"
          }`}
          style={{ animation: "slideUp 0.5s ease-out" }}
        >
          {/* Desktop Table View */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className={`${isDark ? "bg-gray-800/80 border-gray-700" : "bg-gray-50 border-gray-200"} border-b`}>
                  <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                    Employee
                  </th>
                  <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                    Monthly Salary
                  </th>
                  <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                    Bonus
                  </th>
                  <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                    Leaves
                  </th>
                  <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                    Deduction
                  </th>
                  <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                    Net Salary
                  </th>
                  <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                    Status
                  </th>
                  <th className={`px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isDark ? "divide-gray-700/50" : "divide-gray-200"}`}>
                {filteredSalaries.map((s, index) => {
                  const netSalary = calculateNetSalary(s);
                  const monthlySalary = s.annualSalary ? Math.round(s.annualSalary / 12) : 0;
                  const deduction = calculateDeductions(s.annualSalary, s.leaves);

                  return (
                    <tr
                      key={s.id}
                      className={`group transition-all duration-200 ${
                        isDark ? "hover:bg-gray-700/30" : "hover:bg-gray-50"
                      }`}
                      style={{ animation: `slideUp 0.3s ease-out ${index * 0.03}s backwards` }}
                    >
                      {/* Employee Info */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold shadow-md group-hover:scale-110 transition-transform">
                            {s.staff?.name?.charAt(0).toUpperCase() || "?"}
                          </div>
                          <div>
                            <div className={`font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>
                              {s.staff?.name || "Unknown"}
                            </div>
                            <div className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                              {s.staff?.role || "No role"}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Monthly Salary */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`font-semibold ${isDark ? "text-gray-200" : "text-gray-900"}`}>
                          ₹{monthlySalary.toLocaleString()}
                        </div>
                        <div className={`text-xs ${isDark ? "text-gray-500" : "text-gray-400"}`}>
                          ₹{Math.round(calculatePerDaySalary(s.annualSalary))}/day
                        </div>
                      </td>

                      {/* Bonus */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-green-600 font-semibold">
                          +₹{s.bonus.toLocaleString()}
                        </span>
                      </td>

                      {/* Leaves */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`font-medium ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                          {s.leaves} days
                        </span>
                      </td>

                      {/* Deduction */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-red-600 font-semibold">
                          -₹{deduction.toLocaleString()}
                        </span>
                      </td>

                      {/* Net Salary */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg font-bold text-emerald-600 ${
                          isDark ? "bg-emerald-500/10" : "bg-emerald-50"
                        }`}>
                          <IndianRupee size={16} />
                          {netSalary.toLocaleString()}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold border ${
                            s.status === "paid"
                              ? isDark
                                ? "bg-green-500/10 border-green-500/30 text-green-400"
                                : "bg-green-50 border-green-300 text-green-700"
                              : isDark
                              ? "bg-orange-500/10 border-orange-500/30 text-orange-400"
                              : "bg-orange-50 border-orange-300 text-orange-700"
                          }`}
                        >
                          {s.status === "paid" ? "✓ Paid" : "⏱ Pending"}
                        </span>
                        {s.status === "paid" && s.lastPaid && (
                          <div className={`text-xs mt-1 ${isDark ? "text-gray-500" : "text-gray-400"}`}>
                            {new Date(s.lastPaid).toLocaleDateString()}
                          </div>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center justify-center gap-2">
                          {/* History */}
                          <button
                            onClick={() => {
                              setSelectedSalary(s);
                              setShowHistoryModal(true);
                            }}
                            className={`p-2 rounded-lg transition-all hover:scale-110 ${
                              isDark ? "bg-blue-500/20 text-blue-400 hover:bg-blue-500/30" : "bg-blue-50 text-blue-600 hover:bg-blue-100"
                            }`}
                            title="View History"
                          >
                            <History size={16} />
                          </button>

                          {/* Pay Button (only for pending) */}
                          {s.status === "pending" && (
                            <button
                              onClick={() => handlePaySalary(s.id)}
                              className={`p-2 rounded-lg transition-all hover:scale-110 ${
                                isDark ? "bg-green-500/20 text-green-400 hover:bg-green-500/30" : "bg-green-50 text-green-600 hover:bg-green-100"
                              }`}
                              title="Mark as Paid"
                            >
                              <CheckCircle size={16} />
                            </button>
                          )}

                          {/* Payslip Button (only for paid) */}
                          {s.status === "paid" && (
                            <button
                              onClick={() => onViewPayslip(s)}
                              className={`p-2 rounded-lg transition-all hover:scale-110 ${
                                isDark ? "bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30" : "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                              }`}
                              title="View Payslip"
                            >
                              <Wallet size={16} />
                            </button>
                          )}

                          {/* Edit */}
                          <button
                            onClick={() => {
                              setSelectedSalary(s);
                              setShowAddModal(true);
                            }}
                            className={`p-2 rounded-lg transition-all hover:scale-110 ${
                              isDark ? "bg-blue-500/20 text-blue-400 hover:bg-blue-500/30" : "bg-blue-50 text-blue-600 hover:bg-blue-100"
                            }`}
                            title="Edit"
                          >
                            <Edit2 size={16} />
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => handleDeleteSalary(s.id, s.staff?.name)}
                            className={`p-2 rounded-lg transition-all hover:scale-110 ${
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
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="lg:hidden divide-y divide-gray-700/50">
            {filteredSalaries.map((s, index) => {
              const netSalary = calculateNetSalary(s);
              const monthlySalary = s.annualSalary ? Math.round(s.annualSalary / 12) : 0;
              const deduction = calculateDeductions(s.annualSalary, s.leaves);

              return (
                <div
                  key={s.id}
                  className={`p-4 transition-all ${isDark ? "hover:bg-gray-700/30" : "hover:bg-gray-50"}`}
                  style={{ animation: `slideUp 0.3s ease-out ${index * 0.03}s backwards` }}
                >
                  {/* Mobile Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold shadow-md">
                        {s.staff?.name?.charAt(0).toUpperCase() || "?"}
                      </div>
                      <div>
                        <div className={`font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>
                          {s.staff?.name || "Unknown"}
                        </div>
                        <div className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                          {s.staff?.role || "No role"}
                        </div>
                      </div>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-lg text-xs font-semibold border ${
                        s.status === "paid"
                          ? isDark
                            ? "bg-green-500/10 border-green-500/30 text-green-400"
                            : "bg-green-50 border-green-300 text-green-700"
                          : isDark
                          ? "bg-orange-500/10 border-orange-500/30 text-orange-400"
                          : "bg-orange-50 border-orange-300 text-orange-700"
                      }`}
                    >
                      {s.status === "paid" ? "✓ Paid" : "⏱ Pending"}
                    </span>
                  </div>

                  {/* Mobile Details Grid */}
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div className={`p-3 rounded-lg ${isDark ? "bg-gray-700/30" : "bg-gray-50"}`}>
                      <div className={`text-xs mb-1 ${isDark ? "text-gray-400" : "text-gray-500"}`}>Monthly</div>
                      <div className={`font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>
                        ₹{monthlySalary.toLocaleString()}
                      </div>
                    </div>
                    <div className={`p-3 rounded-lg ${isDark ? "bg-gray-700/30" : "bg-gray-50"}`}>
                      <div className={`text-xs mb-1 ${isDark ? "text-gray-400" : "text-gray-500"}`}>Bonus</div>
                      <div className="font-semibold text-green-600">+₹{s.bonus.toLocaleString()}</div>
                    </div>
                    <div className={`p-3 rounded-lg ${isDark ? "bg-gray-700/30" : "bg-gray-50"}`}>
                      <div className={`text-xs mb-1 ${isDark ? "text-gray-400" : "text-gray-500"}`}>Leaves</div>
                      <div className={`font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>{s.leaves} days</div>
                    </div>
                    <div className={`p-3 rounded-lg ${isDark ? "bg-gray-700/30" : "bg-gray-50"}`}>
                      <div className={`text-xs mb-1 ${isDark ? "text-gray-400" : "text-gray-500"}`}>Deduction</div>
                      <div className="font-semibold text-red-600">-₹{deduction.toLocaleString()}</div>
                    </div>
                  </div>

                  {/* Net Salary */}
                  <div className={`p-3 rounded-lg mb-3 ${isDark ? "bg-emerald-500/10" : "bg-emerald-50"}`}>
                    <div className={`text-xs mb-1 ${isDark ? "text-emerald-400" : "text-emerald-700"}`}>Net Salary</div>
                    <div className="flex items-center gap-1 font-bold text-emerald-600 text-lg">
                      <IndianRupee size={18} />
                      {netSalary.toLocaleString()}
                    </div>
                  </div>

                  {/* Mobile Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setSelectedSalary(s);
                        setShowHistoryModal(true);
                      }}
                      className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                        isDark ? "bg-blue-500/20 text-blue-400 hover:bg-blue-500/30" : "bg-blue-50 text-blue-600 hover:bg-blue-100"
                      }`}
                    >
                      <History size={14} className="inline mr-1" />
                      History
                    </button>

                    {s.status === "pending" && (
                      <button
                        onClick={() => handlePaySalary(s.id)}
                        className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                          isDark ? "bg-green-500/20 text-green-400 hover:bg-green-500/30" : "bg-green-50 text-green-600 hover:bg-green-100"
                        }`}
                      >
                        <CheckCircle size={14} className="inline mr-1" />
                        Pay
                      </button>
                    )}

                    {s.status === "paid" && (
                      <button
                        onClick={() => onViewPayslip(s)}
                        className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                          isDark ? "bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30" : "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                        }`}
                      >
                        <Wallet size={14} className="inline mr-1" />
                        Payslip
                      </button>
                    )}

                    <button
                      onClick={() => {
                        setSelectedSalary(s);
                        setShowAddModal(true);
                      }}
                      className={`p-2 rounded-lg transition-all ${
                        isDark ? "bg-blue-500/20 text-blue-400 hover:bg-blue-500/30" : "bg-blue-50 text-blue-600 hover:bg-blue-100"
                      }`}
                    >
                      <Edit2 size={14} />
                    </button>

                    <button
                      onClick={() => handleDeleteSalary(s.id, s.staff?.name)}
                      className={`p-2 rounded-lg transition-all ${
                        isDark ? "bg-red-500/20 text-red-400 hover:bg-red-500/30" : "bg-red-50 text-red-600 hover:bg-red-100"
                      }`}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

                  {s.status === "paid" && s.lastPaid && (
                    <div className={`text-xs mt-3 pt-3 border-t flex items-center gap-1 ${isDark ? "border-gray-700 text-gray-500" : "border-gray-200 text-gray-400"}`}>
                      <Calendar size={12} />
                      Paid on {new Date(s.lastPaid).toLocaleDateString()}
                    </div>
                  )}
                </div>
              );
            })}
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
          user={currentUser}
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
      style={{ animation: `slideUp 0.5s ease-out forwards` }}
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

export default SalaryManagement;