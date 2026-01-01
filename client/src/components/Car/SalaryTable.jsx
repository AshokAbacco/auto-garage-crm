export default function SalaryTable({ salaries, onPay }) {
  if (!salaries.length) {
    return (
      <div className="text-center text-gray-500 py-10">
        No salary records found for this month.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto bg-white rounded shadow">
      <table className="w-full border-collapse">
        <thead className="bg-gray-100 text-left">
          <tr>
            <th className="p-3 border">Staff</th>
            <th className="p-3 border">Base</th>
            <th className="p-3 border">Leaves</th>
            <th className="p-3 border">Bonus</th>
            <th className="p-3 border">Deductions</th>
            <th className="p-3 border">Net Salary</th>
            <th className="p-3 border">Status</th>
            <th className="p-3 border text-center">Action</th>
          </tr>
        </thead>
        <tbody>
          {salaries.map((row) => (
            <tr key={row.id} className="hover:bg-gray-50">
              <td className="p-3 border">{row.staff.name}</td>
              <td className="p-3 border">{row.baseSalary}</td>
              <td className="p-3 border">{row.leaves}</td>
              <td className="p-3 border">{row.bonus}</td>
              <td className="p-3 border">{row.extraDeductions}</td>
              <td className="p-3 border font-semibold">{row.netSalary}</td>
              <td className="p-3 border">
                {row.status === "PAID" ? (
                  <span className="text-green-600 font-medium">Paid</span>
                ) : (
                  <span className="text-red-600 font-medium">Unpaid</span>
                )}
              </td>
              <td className="p-3 border text-center">
                {row.status === "UNPAID" && (
                  <button
                    onClick={() => onPay(row.id)}
                    className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                  >
                    Mark Paid
                  </button>
                )}
                {row.status === "PAID" && (
                  <span className="text-sm text-gray-500">
                    Paid on {new Date(row.paidAt).toLocaleDateString()}
                  </span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
