import React from "react";

export default function ClientsReport({ clients, isDark }) {
  return (
    <div
      className={`rounded-2xl shadow-lg border overflow-hidden ${
        isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
      }`}
    >
      <div
        className={`p-6 border-b ${
          isDark ? "border-gray-700 bg-gray-700" : "border-gray-200 bg-gray-50"
        }`}
      >
        <h3
          className={`text-xl font-bold ${
            isDark ? "text-white" : "text-gray-900"
          }`}
        >
          Client Directory
        </h3>
        <p
          className={`text-sm mt-1 ${
            isDark ? "text-gray-300" : "text-gray-600"
          }`}
        >
          Complete list of all clients and their vehicles
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="">
            <tr
              className={`border-b ${
                isDark
                  ? "border-gray-100 bg-gray-700"
                  : "border-gray-200 bg-gray-50"
              }`}
            >
              <th
                className={`px-6 py-4 text-left text-sm font-semibold ${
                  isDark ? "text-gray-300" : "text-gray-900"
                }`}
              >
                Client
              </th>
              <th
                className={`px-6 py-4 text-left text-sm font-semibold ${
                  isDark ? "text-gray-300" : "text-gray-900"
                }`}
              >
                Phone
              </th>
              <th
                className={`px-6 py-4 text-left text-sm font-semibold ${
                  isDark ? "text-gray-300" : "text-gray-900"
                }`}
              >
                Email
              </th>
              <th
                className={`px-6 py-4 text-left text-sm font-semibold ${
                  isDark ? "text-gray-300" : "text-gray-900"
                }`}
              >
                Vehicle
              </th>
              <th
                className={`px-6 py-4 text-left text-sm font-semibold ${
                  isDark ? "text-gray-300" : "text-gray-900"
                }`}
              >
                Reg No
              </th>
            </tr>
          </thead>
          <tbody>
            {clients.length === 0 ? (
              <tr>
                <td
                  colSpan="5"
                  className={`px-6 py-12 text-center ${
                    isDark ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  No clients found.
                </td>
              </tr>
            ) : (
              clients.map((c) => (
                <tr
                  key={c.id}
                  className={`border-b transition-colors duration-150 ${
                    isDark
                      ? "border-gray-700 hover:bg-gray-700"
                      : "border-gray-100 hover:bg-blue-50"
                  }`}
                >
                  <td
                    className={`px-6 py-4 ${
                      isDark ? "text-white" : "text-gray-900"
                    }`}
                  >
                    <div className="font-medium">{c.fullName}</div>
                  </td>
                  <td
                    className={`px-6 py-4 ${
                      isDark ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    {c.phone || "—"}
                  </td>
                  <td
                    className={`px-6 py-4 ${
                      isDark ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    {c.email || "—"}
                  </td>
                  <td
                    className={`px-6 py-4 ${
                      isDark ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    {c.vehicleYear} {c.vehicleMake} {c.vehicleModel}
                  </td>
                  <td
                    className={`px-6 py-4 ${
                      isDark ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    {c.regNumber || "—"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
