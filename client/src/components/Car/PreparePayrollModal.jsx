import { useEffect, useState } from "react";
import { X, Lock } from "lucide-react";

export default function PreparePayrollModal({
  staffList,
  existingSalaries,
  month,
  year,
  onClose,
  onSubmit,
  isDark,
}) {
  const [inputs, setInputs] = useState({});

  useEffect(() => {
    const initial = {};

    staffList.forEach((s) => {
      const salary = existingSalaries.find((sal) => sal.staffId === s.id);

      initial[s.id] = {
        salaryId: salary?.id || null,
        leaves: salary ? salary.leaves : "",
        bonus: salary ? salary.bonus : "",
        extraDeductions: salary ? salary.extraDeductions : "",
        status: salary?.status || "UNPAID",
      };
    });

    setInputs(initial);
  }, [staffList, existingSalaries]);

  const updateField = (staffId, field, value) => {
    setInputs((prev) => ({
      ...prev,
      [staffId]: {
        ...prev[staffId],
        [field]: value === "" ? "" : Number(value),
      },
    }));
  };

  const handleGenerate = () => {
    const createPayload = {};
    const updatePayload = [];

    Object.entries(inputs).forEach(([staffId, data]) => {
      const payload = {
        leaves: Number(data.leaves) || 0,
        bonus: Number(data.bonus) || 0,
        extraDeductions: Number(data.extraDeductions) || 0,
      };

      if (data.salaryId && data.status !== "PAID") {
        updatePayload.push({
          id: data.salaryId,
          data: payload,
        });
      } else if (!data.salaryId) {
        createPayload[staffId] = payload;
      }
    });

    onSubmit({ createPayload, updatePayload });
  };

 const PaidSeal = () => (
   <div className="inline-flex items-center justify-center">
     <div className="relative w-20 h-20">
       <svg
         viewBox="0 0 100 100"
         className="w-full h-full transform -rotate-12"
       >
         {/* Outer circle */}
         <circle
           cx="50"
           cy="50"
           r="48"
           fill="none"
           stroke="#10b981"
           strokeWidth="2"
         />
         <circle
           cx="50"
           cy="50"
           r="45"
           fill="none"
           stroke="#10b981"
           strokeWidth="1"
         />

         {/* Inner background */}
         <circle cx="50" cy="50" r="42" fill="#10b981" opacity="0.1" />

         {/* PAID text */}
         <text
           x="50"
           y="58"
           textAnchor="middle"
           fill="#10b981"
           fontSize="24"
           fontWeight="bold"
           fontFamily="Arial, sans-serif"
         >
           PAID
         </text>

         {/* Checkmark */}
         <path
           d="M 35 48 L 43 56 L 65 34"
           fill="none"
           stroke="#10b981"
           strokeWidth="3"
           strokeLinecap="round"
           strokeLinejoin="round"
           opacity="0.3"
         />
       </svg>
     </div>
   </div>
 );

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div
        className={`w-full max-w-6xl rounded-2xl shadow-2xl overflow-hidden ${
          isDark ? "bg-slate-900 text-slate-100" : "bg-white text-slate-900"
        }`}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Prepare Payroll
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {month}/{year} — Edit or generate salaries
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Table */}
        <div className="p-6 overflow-auto max-h-[60vh]">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50 dark:bg-slate-700">
                  <th className="p-4 text-left font-semibold text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-600">
                    Staff
                  </th>
                  <th className="p-4 text-left font-semibold text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-600">
                    Base Salary
                  </th>
                  <th className="p-4 text-left font-semibold text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-600">
                    Deduction/Leave
                  </th>
                  <th className="p-4 text-left font-semibold text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-600">
                    Leaves
                  </th>
                  <th className="p-4 text-left font-semibold text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-600">
                    Bonus
                  </th>
                  <th className="p-4 text-left font-semibold text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-600">
                    Extra Deductions
                  </th>
                  <th className="p-4 text-center font-semibold text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-600">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {staffList.map((s) => {
                  const isLocked = inputs[s.id]?.status === "PAID";
                  const isPaid = inputs[s.id]?.status === "PAID";

                  return (
                    <tr
                      key={s.id}
                      className={`border-b border-gray-200 dark:border-gray-700 transition-colors ${
                        isPaid ? "bg-green-50 dark:bg-green-900/20" : ""
                      }`}
                    >
                      <td className="p-4 font-medium text-gray-900 dark:text-white">
                        <div className="flex items-center gap-2">
                          {isPaid && (
                            <Lock className="w-4 h-4 text-green-600 dark:text-green-400" />
                          )}
                          {s.name}
                        </div>
                      </td>
                      <td className="p-4 text-gray-700 dark:text-gray-300">
                        ₹{s.baseSalary.toLocaleString()}
                      </td>
                      <td className="p-4 text-gray-700 dark:text-gray-300">
                        ₹{s.deductionPerLeave.toLocaleString()}
                      </td>

                      <td className="p-4">
                        <div className="relative">
                          <input
                            type="number"
                            min="0"
                            disabled={isLocked}
                            value={inputs[s.id]?.leaves ?? ""}
                            onChange={(e) =>
                              updateField(s.id, "leaves", e.target.value)
                            }
                            className={`w-24 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors ${
                              isLocked
                                ? "bg-gray-100 dark:bg-gray-700 text-gray-500 cursor-not-allowed border-gray-300 dark:border-gray-600"
                                : "bg-white dark:bg-slate-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                            }`}
                          />
                        </div>
                      </td>

                      <td className="p-4">
                        <div className="relative">
                          <input
                            type="number"
                            min="0"
                            disabled={isLocked}
                            value={inputs[s.id]?.bonus ?? ""}
                            onChange={(e) =>
                              updateField(s.id, "bonus", e.target.value)
                            }
                            className={`w-24 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors ${
                              isLocked
                                ? "bg-gray-100 dark:bg-gray-700 text-gray-500 cursor-not-allowed border-gray-300 dark:border-gray-600"
                                : "bg-white dark:bg-slate-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                            }`}
                          />
                        </div>
                      </td>

                      <td className="p-4">
                        <div className="relative">
                          <input
                            type="number"
                            min="0"
                            disabled={isLocked}
                            value={inputs[s.id]?.extraDeductions ?? ""}
                            onChange={(e) =>
                              updateField(
                                s.id,
                                "extraDeductions",
                                e.target.value
                              )
                            }
                            className={`w-24 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors ${
                              isLocked
                                ? "bg-gray-100 dark:bg-gray-700 text-gray-500 cursor-not-allowed border-gray-300 dark:border-gray-600"
                                : "bg-white dark:bg-slate-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                            }`}
                          />
                        </div>
                      </td>

                      <td className="p-4 text-center">
                        {isPaid ? (
                          <div className="flex justify-center">
                            <PaidSeal />
                          </div>
                        ) : (
                          <span className="text-gray-500 dark:text-gray-400 text-sm">
                            Pending
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="px-6 py-2.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleGenerate}
            className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium shadow-sm hover:shadow-md"
          >
            Save / Update Salary
          </button>
        </div>
      </div>
    </div>
  );
}
