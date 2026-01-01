export default function SalaryFilters({
  month,
  year,
  onMonthChange,
  onYearChange,
  onGenerate,
}) {
  return (
    <div className="flex flex-wrap items-end gap-4 bg-white p-4 rounded shadow">
      <div>
        <label className="block text-sm font-medium">Month</label>
        <input
          type="number"
          min="1"
          max="12"
          value={month}
          onChange={(e) => onMonthChange(Number(e.target.value))}
          className="border rounded px-3 py-1 w-24"
        />
      </div>

      <div>
        <label className="block text-sm font-medium">Year</label>
        <input
          type="number"
          value={year}
          onChange={(e) => onYearChange(Number(e.target.value))}
          className="border rounded px-3 py-1 w-32"
        />
      </div>

      <button
        onClick={onGenerate}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Generate Salary
      </button>
    </div>
  );
}
