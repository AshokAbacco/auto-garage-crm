import React from "react";
import { X, TrendingUp, TrendingDown, User, Briefcase } from "lucide-react";
import { useTheme } from "../../contexts/ThemeContext";

export default function StaffViewModal({ staff, onClose }) {
  const { isDark } = useTheme();

  // Calculations
  const leaveDeduction = (staff.leaves || 0) * (staff.deductionPerLeave || 0);
  const totalDeductions = leaveDeduction + (staff.extraDeductions || 0);
  const grossSalary = (staff.baseSalary || 0) + (staff.bonus || 0);
  const staffBaseSalary = staff.baseSalary;
  const netSalary = grossSalary - totalDeductions;
  const yearlyProjection = staffBaseSalary * 12;

  // Helper for row items
  const DetailRow = ({
    label,
    value,
    colorClass = isDark ? "text-slate-100" : "text-slate-900",
    isNegative = false,
  }) => (
    <div className="flex justify-between items-center py-2 border-b border-dashed border-slate-200 dark:border-slate-700 last:border-0">
      <span
        className={`text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}
      >
        {label}
      </span>
      <span
        className={`text-sm font-medium ${
          isNegative ? (isDark ? "text-rose-400" : "text-rose-600") : colorClass
        }`}
      >
        {isNegative ? "-" : ""} ₹{value?.toLocaleString()}
      </span>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity">
      {/* Changed max-w-md to max-w-2xl for wider modal */}
      <div
        className={`w-full max-w-2xl rounded-2xl shadow-2xl border overflow-hidden flex flex-col max-h-[90vh] ${
          isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
        }`}
      >
        {/* Header */}
        <div
          className={`relative p-6 border-b flex-shrink-0 ${
            isDark
              ? "bg-slate-800/50 border-slate-800"
              : "bg-slate-50 border-slate-100"
          }`}
        >
          <button
            onClick={onClose}
            className={`absolute top-4 right-4 p-2 rounded-full transition-colors ${
              isDark
                ? "text-slate-400 hover:text-slate-300 hover:bg-slate-700"
                : "text-slate-400 hover:text-slate-600 hover:bg-white"
            }`}
          >
            <X size={20} />
          </button>

          <div className="flex items-center gap-4">
            <div
              className={`w-14 h-14 rounded-full flex items-center justify-center text-indigo-600 flex-shrink-0 ${
                isDark ? "bg-indigo-900/30" : "bg-indigo-100"
              }`}
            >
              <User size={28} />
            </div>
            <div>
              <h2
                className={`text-xl font-bold ${
                  isDark ? "text-slate-100" : "text-slate-900"
                }`}
              >
                {staff.name}
              </h2>
              <div className="flex items-center gap-2 mt-1">
                <span
                  className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded ${
                    isDark
                      ? "bg-slate-700 text-slate-300"
                      : "bg-slate-200 text-slate-600"
                  }`}
                >
                  <Briefcase size={12} />
                  {staff.role || "Staff"}
                </span>
                <span
                  className={`text-xs font-medium px-2 py-0.5 rounded ${
                    staff.isActive
                      ? isDark
                        ? "bg-emerald-900/30 text-emerald-400"
                        : "bg-emerald-100 text-emerald-700"
                      : "bg-rose-100 text-rose-700"
                  }`}
                >
                  {staff.isActive ? "Active" : "Inactive"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-6 overflow-y-auto custom-scrollbar">
          <div
            className={`rounded-xl shadow-sm border overflow-hidden ${
              isDark
                ? "bg-slate-900 border-slate-700"
                : "bg-white border-slate-200"
            }`}
          >
            {/* Grid Layout: Side by Side on Desktop */}
            <div
              className={`grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x ${
                isDark ? "divide-slate-700" : "divide-slate-200"
              }`}
            >
              {/* Left: Earnings */}
              <div
                className={`p-5 ${
                  isDark ? "bg-slate-800/20" : "bg-slate-50/50"
                }`}
              >
                <div className="flex items-center gap-2 mb-4 text-xs font-bold uppercase tracking-wider text-emerald-600">
                  <TrendingUp size={14} /> Earnings
                </div>
                <div className="space-y-1">
                  <DetailRow label="Base Salary" value={staff.baseSalary} />
                  <DetailRow label="Monthly Bonus" value={staff.bonus} />
                </div>
                <div
                  className={`flex justify-between items-center pt-3 mt-3 border-t ${
                    isDark ? "border-slate-700" : "border-slate-200"
                  }`}
                >
                  <span
                    className={`text-sm font-semibold ${
                      isDark ? "text-slate-300" : "text-slate-700"
                    }`}
                  >
                    Total Earnings
                  </span>
                  <span className="text-base font-bold text-emerald-600">
                    ₹{grossSalary.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Right: Deductions */}
              <div className={`p-5 ${isDark ? "bg-slate-900" : "bg-white"}`}>
                <div className="flex items-center gap-2 mb-4 text-xs font-bold uppercase tracking-wider text-rose-600">
                  <TrendingDown size={14} /> Deductions
                </div>
                <div className="space-y-1">
                  <div
                    className={`flex justify-between items-center py-2 border-b border-dashed ${
                      isDark ? "border-slate-700" : "border-slate-200"
                    }`}
                  >
                    <span
                      className={`text-sm ${
                        isDark ? "text-slate-400" : "text-slate-500"
                      } flex items-center gap-1`}
                    >
                      Leaves{" "}
                      <span
                        className={`px-1.5 rounded text-xs font-medium ${
                          isDark
                            ? "bg-slate-800 text-slate-400"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {staff.leaves}
                      </span>
                    </span>
                    <span
                      className={`text-sm font-medium ${
                        isDark ? "text-rose-400" : "text-rose-600"
                      }`}
                    >
                      - ₹{leaveDeduction.toLocaleString()}
                    </span>
                  </div>
                  <DetailRow
                    label="Extra Deductions"
                    value={staff.extraDeductions}
                    isNegative={true}
                  />
                </div>
                <div
                  className={`flex justify-between items-center pt-3 mt-3 border-t ${
                    isDark ? "border-slate-700" : "border-slate-200"
                  }`}
                >
                  <span
                    className={`text-sm font-semibold ${
                      isDark ? "text-slate-300" : "text-slate-700"
                    }`}
                  >
                    Total Deductions
                  </span>
                  <span className="text-base font-bold text-rose-600">
                    - ₹{totalDeductions.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Net Pay Highlight Bar */}
            <div className="p-5 bg-indigo-600 text-white flex justify-between items-center">
              <div>
                <p className="text-xs text-indigo-200 uppercase font-semibold mb-1">
                  Net Payable Salary
                </p>
                <p className="text-3xl font-bold">
                  ₹{netSalary.toLocaleString()}
                </p>
              </div>
              <div className="text-right hidden sm:block">
                <p className="text-xs text-indigo-200 uppercase font-semibold mb-1">
                  Projected Yearly
                </p>
                <p className="text-lg font-medium opacity-90">
                  ₹{yearlyProjection.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          className={`p-4 border-t flex justify-end flex-shrink-0 ${
            isDark
              ? "border-slate-800 bg-slate-800/50"
              : "border-slate-100 bg-slate-50"
          }`}
        >
          <button
            onClick={onClose}
            className={`px-6 py-2 border rounded-lg transition-colors font-medium text-sm shadow-sm ${
              isDark
                ? "bg-slate-700 text-slate-100 border-slate-600 hover:bg-slate-600"
                : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
            }`}
          >
            Close View
          </button>
        </div>
      </div>
    </div>
  );
}
