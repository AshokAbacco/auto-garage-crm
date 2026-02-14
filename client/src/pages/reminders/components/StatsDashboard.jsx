import React from "react";
import { FiBell, FiAlertCircle, FiClock, FiCalendar } from "react-icons/fi";
import { useTheme } from "../../../contexts/ThemeContext";

/* =========================================
   Simple Metric Item
========================================= */
const Metric = ({ title, value, icon: Icon, colorClass, isLast }) => {
  const { isDark } = useTheme();

  return (
    <div
      className={`flex flex-1 items-center gap-4 px-6 py-4 ${
        !isLast
          ? isDark
            ? "border-r border-gray-800"
            : "border-r border-gray-100"
          : ""
      } min-w-[200px]`}
    >
      <div className={`p-2.5 rounded-lg ${colorClass} bg-opacity-10`}>
        <Icon size={20} className={colorClass.replace("bg-", "text-")} />
      </div>
      <div>
        <p
          className={`text-[11px] uppercase tracking-widest font-bold ${
            isDark ? "text-gray-500" : "text-gray-400"
          }`}
        >
          {title}
        </p>
        <p
          className={`text-xl font-semibold leading-none mt-1 ${
            isDark ? "text-white" : "text-gray-900"
          }`}
        >
          {value ?? 0}
        </p>
      </div>
    </div>
  );
};

/* =========================================
   Dashboard (Simplified)
========================================= */
export default function StatsDashboard({ reminders = [], stats }) {
  const { isDark } = useTheme();

  // Use stats from props if available (passed from parent),
  // otherwise calculate locally as a fallback
  const displayStats = stats || {
    total: reminders.length,
    pending: reminders.filter((r) => !r.sent).length,
    overdue: reminders.filter(
      (r) => !r.sent && new Date(r.serviceDate) < new Date(),
    ).length,
    upcoming: reminders.filter((r) => {
      const diff =
        (new Date(r.serviceDate) - new Date()) / (1000 * 60 * 60 * 24);
      return diff >= 0 && diff <= 7;
    }).length,
  };

  return (
    <div
      className={`flex flex-wrap items-center rounded-xl border shadow-sm overflow-hidden transition-all ${
        isDark ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200"
      }`}
    >
      <Metric
        title="Total"
        value={displayStats.total}
        icon={FiBell}
        colorClass="bg-blue-500"
      />
      <Metric
        title="Pending"
        value={displayStats.pending || displayStats.today}
        icon={FiClock}
        colorClass="bg-indigo-500"
      />
      <Metric
        title="Overdue"
        value={displayStats.overdue}
        icon={FiAlertCircle}
        colorClass="bg-red-500"
      />
      <Metric
        title="Next 7 Days"
        value={displayStats.upcoming}
        icon={FiCalendar}
        colorClass="bg-emerald-500"
        isLast={true}
      />
    </div>
  );
}
