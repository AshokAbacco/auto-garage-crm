import { Calendar, Sparkles, ChevronDown } from "lucide-react";

const MONTHS = [
  { label: "January", value: 1 },
  { label: "February", value: 2 },
  { label: "March", value: 3 },
  { label: "April", value: 4 },
  { label: "May", value: 5 },
  { label: "June", value: 6 },
  { label: "July", value: 7 },
  { label: "August", value: 8 },
  { label: "September", value: 9 },
  { label: "October", value: 10 },
  { label: "November", value: 11 },
  { label: "December", value: 12 },
];

export default function SalaryFilters({
  month,
  year,
  onMonthChange,
  onYearChange,
  onGenerate,
}) {
  return (
    <div className="flex flex-col sm:flex-row items-end gap-4 w-full">
      {/* Month Selector */}
      <div className="w-full sm:w-auto relative group">
        <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5 ml-1">
          Month
        </label>
        <div className="relative">
          <select
            value={month ?? ""}
            onChange={(e) =>
              onMonthChange(e.target.value === "" ? "" : Number(e.target.value))
            }
            className="w-full sm:w-48 appearance-none bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 text-sm rounded-xl px-4 py-2.5 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer"
          >
            <option value="">Select Month</option>
            {MONTHS.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none group-hover:text-blue-500 transition-colors" />
        </div>
      </div>

      {/* Year Input */}
      <div className="w-full sm:w-auto">
        <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5 ml-1">
          Year
        </label>
        <div className="relative">
          <input
            type="number"
            value={year ?? ""}
            onChange={(e) =>
              onYearChange(e.target.value === "" ? "" : Number(e.target.value))
            }
            className="w-full sm:w-32 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 text-sm rounded-xl px-4 py-2.5 pl-10 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            placeholder="YYYY"
          />
          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        </div>
      </div>

      {/* Action Button */}
      <div className="w-full sm:w-auto sm:ml-auto">
        <button
          onClick={onGenerate}
          className="w-full sm:w-auto flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl text-sm font-medium shadow-lg shadow-blue-500/30 hover:shadow-blue-500/40 transform hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
        >
          <Sparkles className="w-4 h-4" />
          <span>Generate / Prepare</span>
        </button>
      </div>
    </div>
  );
}
