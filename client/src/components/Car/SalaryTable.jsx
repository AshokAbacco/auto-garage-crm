// SalaryTable.jsx
import React from "react";
import {
  Eye,
  Wallet,
  User,
  CheckCircle,
  Clock,
  AlertCircle,
  Calendar,
} from "lucide-react";

export default function SalaryTable({ salaries, onPay, onView }) {
  // 1. Helper for Status Badges
  const StatusBadge = ({ status }) => {
    const styles = {
      PAID: "bg-emerald-100 text-emerald-700 border border-emerald-200",
      HOLD: "bg-amber-100 text-amber-700 border border-amber-200",
      UNPAID: "bg-rose-100 text-rose-700 border border-rose-200",
    };

    const icons = {
      PAID: <CheckCircle className="w-3.5 h-3.5 mr-1.5" />,
      HOLD: <Clock className="w-3.5 h-3.5 mr-1.5" />,
      UNPAID: <AlertCircle className="w-3.5 h-3.5 mr-1.5" />,
    };

    return (
      <span
        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide shadow-sm ${
          styles[status] || styles.UNPAID
        }`}
      >
        {icons[status]}
        {status}
      </span>
    );
  };

  // 2. Empty State
  if (!salaries || !salaries.length) {
    return (
      <div className="flex flex-col items-center justify-center py-16 bg-white rounded-xl shadow border border-gray-100">
        <div className="bg-indigo-50 p-4 rounded-full mb-3">
          <Wallet className="w-8 h-8 text-indigo-400" />
        </div>
        <h3 className="text-gray-900 font-semibold text-lg">
          No records found
        </h3>
        <p className="text-gray-500">
          No salary data available for this period.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          {/* Colorful Header */}
          <thead>
            <tr className="bg-indigo-600 text-white text-xs uppercase tracking-wider font-semibold">
              <th className="px-6 py-4 rounded-tl-lg">Staff Member</th>
              <th className="px-6 py-4">Base Pay</th>
              <th className="px-6 py-4 text-center">Leaves</th>
              <th className="px-6 py-4">Bonus</th>
              <th className="px-6 py-4">Deductions</th>
              <th className="px-6 py-4 bg-indigo-700">Net Salary</th>{" "}
              {/* Highlighted Header */}
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right rounded-tr-lg">Action</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {salaries.map((row, index) => (
              <tr
                key={row.id}
                className={`group transition-colors duration-200 ${
                  index % 2 === 0 ? "bg-white" : "bg-slate-50"
                } hover:bg-indigo-50/40`}
              >
                {/* Staff */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-3">
                    {/* Colorful Avatar Circle */}
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-sm">
                      <User className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="block font-bold text-gray-800">
                        {row.staff.name}
                      </span>
                      {/* <span className="text-xs text-gray-400">
                        ID: {row.staff.id || "---"}
                      </span> */}
                    </div>
                  </div>
                </td>

                {/* Base Salary */}
                <td className="px-6 py-4 whitespace-nowrap text-gray-600 font-medium">
                  ₹{row.baseSalary?.toLocaleString() || 0}
                </td>

                {/* Leaves - Showing 0 instead of dash */}
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <span
                    className={`inline-block px-2 py-1 rounded text-xs font-bold ${
                      row.leaves > 0
                        ? "bg-red-100 text-red-600"
                        : "bg-gray-100 text-gray-400"
                    }`}
                  >
                    {row.leaves || 0}
                  </span>
                </td>

                {/* Bonus - Showing 0 */}
                <td className="px-6 py-4 whitespace-nowrap text-emerald-600 font-medium">
                  ₹{row.bonus?.toLocaleString() || 0}
                </td>

                {/* Deductions - Showing 0 */}
                <td className="px-6 py-4 whitespace-nowrap text-rose-500 font-medium">
                  ₹{row.extraDeductions?.toLocaleString() || 0}
                </td>

                {/* Net Salary - Highlighted Column */}
                <td className="px-6 py-4 whitespace-nowrap bg-indigo-50/50 group-hover:bg-indigo-100/50 transition-colors">
                  <span className="text-green-600 font-extrabold text-base">
                    ₹{row.netSalary?.toLocaleString() || 0}
                  </span>
                </td>

                {/* Status */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <StatusBadge status={row.status} />
                </td>

                {/* Actions */}
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <div className="flex items-center justify-end gap-3">
                    {/* View Icon */}
                    <button
                      onClick={() => onView(row)}
                      className="p-2 text-blue-700 hover:text-indigo-600 hover:bg-white rounded-full transition-all shadow-sm border border-transparent hover:border-gray-200"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>

                    {/* Pay Button */}
                    {row.status === "UNPAID" && (
                      <button
                        onClick={() => onPay(row.id)}
                        className="flex items-center gap-1 bg-gradient-to-r from-green-600 to-green-600 hover:from-emerald-600 hover:to-emerald-700 text-white px-4 py-1.5 rounded-full text-xs font-bold shadow-md transform active:scale-95 transition-all"
                      >
                        <Wallet className="w-3 h-3" />
                        Pay
                      </button>
                    )}

                    {/* Paid Date Info */}
                    {row.status === "PAID" && row.paidAt && (
                      <div className="flex flex-col items-end">
                        <span className="text-[10px] text-gray-400 font-medium uppercase">
                          Paid On
                        </span>
                        <div className="flex items-center text-xs text-gray-600 font-medium">
                          <Calendar className="w-3 h-3 mr-1 text-gray-400" />
                          {new Date(row.paidAt).toLocaleDateString(undefined, {
                            month: "short",
                            day: "numeric",
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
