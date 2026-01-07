import React, { useState, useEffect } from "react";
import { X, History, Calendar } from "lucide-react";
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
      const res = await api.get(
        `/api/bike-staff-salary/${staff.id}/history`
      );
      setHistory(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Error fetching history:", err);
      setHistory([]);
    } finally {
      setLoadingHistory(false);
    }
  };

  if (!staff) return null;

  // ---------- Helpers ----------
  const getPaidLabel = (record) => {
    if (record.paidDate) {
      return new Date(record.paidDate).toLocaleDateString();
    }

    const [m, y] = record.month.split(" ");
    const recordDate = new Date(`${m} 1, ${y}`);
    const now = new Date();
    const currentMonthStart = new Date(
      now.getFullYear(),
      now.getMonth(),
      1
    );

    return recordDate < currentMonthStart ? "Hold" : "Pending";
  };

  // ---------- Sort latest first ----------
  const sortedHistory = [...history].sort((a, b) => {
    const getDate = (rec) => {
      const [m, y] = rec.month.split(" ");
      return new Date(`${m} 1, ${y}`);
    };
    return getDate(b) - getDate(a);
  });

  // ---------- Filter ----------
  const filteredHistory = showAll
    ? sortedHistory.filter((rec) =>
        rec.month.toLowerCase().includes(search.toLowerCase())
      )
    : sortedHistory.slice(0, 3);

  // ---------- UI ----------
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div
        className={`rounded-2xl w-full flex flex-col shadow-2xl transition-all duration-300
        ${showAll ? "max-w-6xl max-h-[95vh]" : "max-w-3xl max-h-[90vh]"}
        ${isDark ? "bg-gray-800" : "bg-white"}`}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-4 rounded-t-2xl flex justify-between items-center">
          <div>
            <h3 className="text-xl font-bold flex items-center gap-2">
              <History className="w-6 h-6" />
              Salary History
            </h3>
            <p className="text-blue-100 text-sm">{staff.name}</p>
          </div>
          <button onClick={onClose}>
            <X className="w-6 h-6 hover:scale-110 transition" />
          </button>
        </div>

        {/* Search */}
        {showAll && (
          <div className="px-6 pt-4">
            <input
              type="text"
              placeholder="Search by month or year (e.g. Jan 2026)"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={`w-full px-4 py-2 rounded-lg border text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none
              ${isDark
                ? "bg-gray-900 border-gray-700 text-white"
                : "bg-white border-gray-300 text-gray-900"}`}
            />
          </div>
        )}

        {/* Content */}
        <div className="overflow-y-auto flex-1 p-6">
          {loadingHistory ? (
            <div className="text-center py-8">
              <div className="animate-spin h-10 w-10 border-b-2 border-blue-500 rounded-full mx-auto"></div>
              <p className="mt-3 text-gray-400">Loading history...</p>
            </div>
          ) : filteredHistory.length > 0 ? (
            <div className="space-y-4">
              {filteredHistory.map((record, index) => (
                <div
                  key={index}
                  className={`border rounded-xl p-4 transition hover:shadow-lg
                  ${isDark
                    ? "bg-gray-900 border-gray-700"
                    : "bg-white border-gray-200"}`}
                >
                  <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center">
                        <Calendar className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <div className="font-semibold">{record.month}</div>
                        <div className="text-xs text-gray-500">
                          Paid: {getPaidLabel(record)}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-emerald-600">
                        ₹{Math.round(record.netSalary || 0).toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-500">Net Salary</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 border-t pt-3 text-sm">
                    <div>
                      <div className="text-xs text-gray-500">Base</div>
                      ₹{record.baseSalary.toLocaleString()}
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Bonus</div>
                      <span className="text-green-600">
                        +₹{record.bonus.toLocaleString()}
                      </span>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Deductions</div>
                      <span className="text-red-600">
                        -₹{record.deductions.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-400 py-8">
              No salary history found
            </div>
          )}
        </div>

        {/* Show All Button */}
        {history.length > 3 && (
          <div className="flex justify-end px-6 pb-4">
            <button
              onClick={() => {
                setShowAll(!showAll);
                setSearch("");
              }}
              className="text-sm font-semibold text-blue-600 hover:text-blue-700"
            >
              {showAll ? "Show Last 3 Months" : "Show All"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SalaryHistoryModal;
