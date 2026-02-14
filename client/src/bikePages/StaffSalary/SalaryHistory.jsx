import React, { useState, useEffect } from "react";
import { X, History, Calendar, IndianRupee, TrendingUp, Search, Sparkles } from "lucide-react";
import api from "../../utils/axiosInstance";

const SalaryHistoryModal = ({ staff, onClose, isDark }) => {
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [showAll, setShowAll] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (staff) fetchHistory();
  }, [staff]);

  const fetchHistory = async () => {
    try {
      setLoadingHistory(true);
      const res = await api.get(`/api/bike-staff-salary/${staff.id}/history`);
      setHistory(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Error fetching history:", err);
      setHistory([]);
    } finally {
      setLoadingHistory(false);
    }
  };

  if (!staff) return null;

  const getPaidLabel = (record) => {
    if (record.paidDate) {
      return new Date(record.paidDate).toLocaleDateString();
    }

    const [m, y] = record.month.split(" ");
    const recordDate = new Date(`${m} 1, ${y}`);
    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    return recordDate < currentMonthStart ? "Hold" : "Pending";
  };

  const sortedHistory = [...history].sort((a, b) => {
    const getDate = (rec) => {
      const [m, y] = rec.month.split(" ");
      return new Date(`${m} 1, ${y}`);
    };
    return getDate(b) - getDate(a);
  });

  const filteredHistory = showAll
    ? sortedHistory.filter((rec) => rec.month.toLowerCase().includes(search.toLowerCase()))
    : sortedHistory.slice(0, 3);

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4"
      style={{ animation: "fadeIn 0.3s ease-out" }}
    >
      <div
        className={`rounded-3xl w-full flex flex-col shadow-2xl transition-all duration-300 ${
          showAll ? "max-w-6xl max-h-[95vh]" : "max-w-4xl max-h-[90vh]"
        } ${isDark ? "bg-gradient-to-br from-gray-800 to-gray-900" : "bg-white"}`}
        style={{ animation: "slideUp 0.3s ease-out" }}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 text-white px-6 py-6 rounded-t-3xl flex justify-between items-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32"></div>
          <div className="relative z-10">
            <h3 className="text-2xl font-bold flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                <History size={24} />
              </div>
              Salary History
            </h3>
            <p className="text-blue-100 text-sm mt-2 flex items-center gap-2">
              <Sparkles size={16} />
              {staff.name}
            </p>
          </div>
          <button
            onClick={onClose}
            className="relative z-10 p-2 rounded-xl hover:bg-white/20 transition-all duration-300 hover:scale-110 hover:rotate-90 active:scale-95"
          >
            <X size={24} />
          </button>
        </div>

        {/* Search */}
        {showAll && (
          <div className="px-6 pt-5">
            <div className="relative">
              <Search className={`absolute left-4 top-1/2 -translate-y-1/2 ${isDark ? "text-gray-500" : "text-gray-400"}`} size={20} />
              <input
                type="text"
                placeholder="Search by month or year (e.g. Jan 2026)"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className={`w-full pl-12 pr-4 py-3.5 rounded-xl border-2 focus:ring-2 focus:ring-blue-500/50 focus:outline-none transition-all ${
                  isDark
                    ? "bg-gray-900/50 border-gray-700 text-white placeholder-gray-500 focus:bg-gray-900"
                    : "bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:bg-white"
                }`}
              />
            </div>
          </div>
        )}

        {/* Content */}
        <div className="overflow-y-auto flex-1 p-6">
          {loadingHistory ? (
            <div className="text-center py-12">
              <div className="relative inline-flex">
                <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                  <History className="text-blue-600" size={24} />
                </div>
              </div>
              <p className={`mt-4 font-medium ${isDark ? "text-gray-400" : "text-gray-600"}`}>Loading history...</p>
            </div>
          ) : filteredHistory.length > 0 ? (
            <div className={`grid gap-4 ${showAll ? "grid-cols-1 lg:grid-cols-2 xl:grid-cols-3" : "grid-cols-1"}`}>
              {filteredHistory.map((record, index) => (
                <div
                  key={index}
                  className={`group relative p-5 rounded-2xl border backdrop-blur-sm overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-xl ${
                    isDark
                      ? "bg-gradient-to-br from-gray-800/90 to-gray-900/90 border-gray-700 hover:border-blue-500/50"
                      : "bg-white/90 border-gray-200 hover:border-blue-400/50 hover:shadow-blue-100"
                  }`}
                  style={{ animation: `slideUp 0.3s ease-out ${index * 0.05}s backwards` }}
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full -translate-y-16 translate-x-16 group-hover:scale-150 transition-transform duration-500"></div>

                  <div className="relative flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                        <Calendar size={20} className="text-white" />
                      </div>
                      <div>
                        <div className={`font-bold text-lg ${isDark ? "text-white" : "text-gray-900"}`}>
                          {record.month}
                        </div>
                        <div className={`text-xs mt-1 ${isDark ? "text-gray-500" : "text-gray-600"}`}>
                          Paid: {getPaidLabel(record)}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1 text-xl font-bold text-emerald-600 group-hover:scale-110 transition-transform">
                        <IndianRupee size={18} />
                        {Math.round(record.netSalary || 0).toLocaleString()}
                      </div>
                      <div className={`text-xs mt-1 ${isDark ? "text-gray-500" : "text-gray-600"}`}>
                        Net Salary
                      </div>
                    </div>
                  </div>

                  <div className={`grid grid-cols-3 gap-3 border-t pt-4 text-sm ${isDark ? "border-gray-700" : "border-gray-200"}`}>
                    <div className={`p-2 rounded-lg ${isDark ? "bg-white/5" : "bg-gray-50"}`}>
                      <div className={`text-xs mb-1 ${isDark ? "text-gray-500" : "text-gray-600"}`}>Base</div>
                      <div className={`font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
                        ₹{record.baseSalary.toLocaleString()}
                      </div>
                    </div>
                    <div className={`p-2 rounded-lg ${isDark ? "bg-green-500/10" : "bg-green-50"}`}>
                      <div className={`text-xs mb-1 ${isDark ? "text-gray-500" : "text-gray-600"}`}>Bonus</div>
                      <div className="font-bold text-green-600">
                        +₹{record.bonus.toLocaleString()}
                      </div>
                    </div>
                    <div className={`p-2 rounded-lg ${isDark ? "bg-red-500/10" : "bg-red-50"}`}>
                      <div className={`text-xs mb-1 ${isDark ? "text-gray-500" : "text-gray-600"}`}>Deduct</div>
                      <div className="font-bold text-red-600">
                        -₹{record.deductions.toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <History size={56} className={`mx-auto mb-4 ${isDark ? "text-gray-600" : "text-gray-400"}`} />
              <p className={`text-lg font-medium ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                No salary history found
              </p>
            </div>
          )}
        </div>

        {/* Show All Button */}
        {history.length > 3 && (
          <div className={`flex justify-end px-6 pb-5 border-t ${isDark ? "border-gray-700" : "border-gray-200"}`}>
            <button
              onClick={() => {
                setShowAll(!showAll);
                setSearch("");
              }}
              className={`group relative mt-5 px-6 py-3 rounded-xl font-semibold overflow-hidden transition-all duration-300 hover:scale-105 active:scale-95 ${
                isDark
                  ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-lg hover:shadow-blue-500/50"
                  : "bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:shadow-lg hover:shadow-blue-400/50"
              }`}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
              <span className="relative flex items-center gap-2">
                <TrendingUp size={18} className="group-hover:scale-110 transition-transform" />
                {showAll ? "Show Last 3 Months" : "Show All History"}
              </span>
            </button>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
};

export default SalaryHistoryModal;