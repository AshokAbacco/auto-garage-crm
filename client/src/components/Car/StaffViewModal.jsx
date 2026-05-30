// StaffViewModal.jsx
import React from "react";
import { X, TrendingUp, TrendingDown, User, Briefcase } from "lucide-react";
import { useTheme } from "../../contexts/ThemeContext";

export default function StaffViewModal({ staff, onClose }) {
  const { isDark } = useTheme();

  // =========================
  // ESTIMATED CALCULATIONS
  // (NO MONTHLY DATA HERE)
  // =========================
  const baseSalary = staff.baseSalary || 0;
  const bonusDefault = staff.bonusDefault || 0;
  const extraDeductionsDefault = staff.extraDeductionsDefault || 0;
  const advanceAmount = staff.advanceAmount || 0; // Fallback to 0 if not present

  const totalEarnings = baseSalary + bonusDefault;
  const totalDeductions = extraDeductionsDefault;
  const estimatedNetSalary = totalEarnings - totalDeductions;
  const yearlyProjection = estimatedNetSalary * 12;

  // Helper row
  const DetailRow = ({
    label,
    value,
    isNegative = false,
    highlightColor = "",
  }) => (
    <div className="flex justify-between items-center py-2 border-b border-dashed border-slate-200 dark:border-slate-700 last:border-0">
      <span
        className={`text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}
      >
        {label}
      </span>
      <span
        className={`text-sm font-medium ${
          highlightColor
            ? highlightColor
            : isNegative
              ? isDark
                ? "text-rose-400"
                : "text-rose-600"
              : isDark
                ? "text-slate-100"
                : "text-slate-900"
        }`}
      >
        {isNegative ? "- " : ""}₹{value.toLocaleString()}
      </span>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div
        className={`w-full max-w-2xl rounded-2xl shadow-2xl border overflow-hidden flex flex-col max-h-[90vh] ${
          isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
        }`}
      >
        {/* Header */}
        <div
          className={`relative p-6 border-b ${
            isDark
              ? "bg-slate-800/50 border-slate-800"
              : "bg-slate-50 border-slate-100"
          }`}
        >
          <button
            onClick={onClose}
            className={`absolute top-4 right-4 p-2 rounded-full ${
              isDark
                ? "text-slate-400 hover:bg-slate-700"
                : "text-slate-400 hover:bg-white"
            }`}
          >
            <X size={20} />
          </button>

          <div className="flex items-center gap-4">
            <div
              className={`w-14 h-14 rounded-full flex items-center justify-center text-indigo-600 ${
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
                    staff.login?.isActive
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-rose-100 text-rose-700"
                  }`}
                >
                  {staff.login?.isActive ? "Active" : "Inactive"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto">
          <div
            className={`rounded-xl border overflow-hidden ${
              isDark ? "border-slate-700" : "border-slate-200"
            }`}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x">
              {/* Earnings */}
              <div
                className={`p-5 ${isDark ? "bg-slate-800/20" : "bg-slate-50"}`}
              >
                <div className="flex items-center gap-2 mb-4 text-xs font-bold uppercase text-emerald-600">
                  <TrendingUp size={14} /> Earnings (Defaults)
                </div>
                <DetailRow label="Base Salary" value={baseSalary} />
                <DetailRow label="Monthly Bonus" value={bonusDefault} />

                <div className="flex justify-between pt-3 mt-3 border-t dark:border-slate-700">
                  <span className="text-sm font-semibold">Total Earnings</span>
                  <span className="text-base font-bold text-emerald-600">
                    ₹{totalEarnings.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Deductions & Loans */}
              <div className={`p-5 ${isDark ? "bg-slate-900" : "bg-white"}`}>
                <div className="flex items-center gap-2 mb-4 text-xs font-bold uppercase text-rose-600">
                  <TrendingDown size={14} /> Deductions & Balances
                </div>
                {/* 🔄 MOVED TO TOP: Outstanding Loan balance sits cleanly at the top of the block */}
                <DetailRow
                  label="Outstanding Loan"
                  value={advanceAmount}
                  highlightColor={
                    advanceAmount > 0
                      ? isDark
                        ? "text-amber-400"
                        : "text-amber-600"
                      : ""
                  }
                />
                <DetailRow
                  label="Extra Deductions"
                  value={extraDeductionsDefault}
                  isNegative
                />

                <div className="flex justify-between pt-3 mt-3 border-t dark:border-slate-700">
                  <span className="text-sm font-semibold">
                    Total Deductions
                  </span>
                  <span className="text-base font-bold text-rose-600">
                    - ₹{totalDeductions.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Footer Highlight */}
            <div className="p-5 bg-indigo-600 text-white flex justify-between items-center">
              <div>
                <p className="text-xs uppercase text-indigo-200 font-semibold mb-1">
                  Estimated Monthly Salary
                </p>
                <p className="text-3xl font-bold">
                  ₹{estimatedNetSalary.toLocaleString()}
                </p>
              </div>
              <div className="text-right hidden sm:block">
                <p className="text-xs uppercase text-indigo-200 font-semibold mb-1">
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
          className={`p-4 border-t flex justify-end ${
            isDark
              ? "border-slate-800 bg-slate-800/50"
              : "border-slate-100 bg-slate-50"
          }`}
        >
          <button
            onClick={onClose}
            className={`px-6 py-2 border rounded-lg font-medium text-sm ${
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
