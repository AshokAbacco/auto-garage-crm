import React from "react";
import {
  BarChart2,
  TrendingUp,
  Wrench,
  Users,
  Receipt,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { useTheme } from "../../contexts/ThemeContext";

const Reports = () => {
  const { isDark } = useTheme();

  const topServices = [
    { name: "General Service", count: 45, revenue: "₹18,000" },
    { name: "Engine Repair", count: 28, revenue: "₹28,400" },
    { name: "Brake Service", count: 32, revenue: "₹12,800" },
    { name: "Electrical Work", count: 22, revenue: "₹15,200" },
  ];

  const recentReports = [
    {
      id: "#RPT-2083",
      title: "Monthly Financial Summary",
      date: "01 Dec 2025",
      status: "completed",
    },
    {
      id: "#RPT-2084",
      title: "Service Performance Overview",
      date: "28 Nov 2025",
      status: "completed",
    },
    {
      id: "#RPT-2085",
      title: "Customer Growth Analysis",
      date: "26 Nov 2025",
      status: "pending",
    },
  ];

  const getStatusBadge = (status) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
      case "pending":
        return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400";
    }
  };

  return (
    <div
      className={`min-h-screen p-6 ${
        isDark
          ? "bg-gray-900"
          : "bg-gradient-to-br from-slate-50 via-orange-50 to-slate-100"
      }`}
    >
      {/* Header */}
      <div className="animate-fade-in mb-8">
        <h1 className="text-4xl py-5 font-bold bg-gradient-to-r from-orange-600 to-red-600 text-transparent bg-clip-text">
          Reports
        </h1>
        <p className={`${isDark ? "text-gray-400" : "text-gray-600"}`}>
          Analyze performance, revenue & service trends
        </p>
      </div>

      {/* Insight Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div
          className={`rounded-2xl p-6 shadow-lg hover:-translate-y-1 transition-all duration-300 ${
            isDark ? "bg-gray-800" : "bg-white"
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-xl text-white">
              <TrendingUp className="w-6 h-6" />
            </div>
            <span className="text-green-500 font-medium flex items-center gap-1">
              <ArrowUpRight className="w-4 h-4" /> +18%
            </span>
          </div>
          <p className="mt-3 text-sm text-gray-400">Monthly Revenue</p>
          <p className={`text-3xl font-bold ${isDark ? "text-white" : "text-gray-800"}`}>
            ₹68,450
          </p>
        </div>

        <div
          className={`rounded-2xl p-6 shadow-lg hover:-translate-y-1 transition-all duration-300 ${
            isDark ? "bg-gray-800" : "bg-white"
          }`}
        >
          <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl text-white">
            <Users className="w-6 h-6" />
          </div>
          <p className="mt-3 text-sm text-gray-400">New Customers</p>
          <p className={`text-3xl font-bold ${isDark ? "text-white" : "text-gray-800"}`}>
            128
          </p>
        </div>

        <div
          className={`rounded-2xl p-6 shadow-lg hover:-translate-y-1 transition-all duration-300 ${
            isDark ? "bg-gray-800" : "bg-white"
          }`}
        >
          <div className="p-3 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl text-white">
            <Wrench className="w-6 h-6" />
          </div>
          <p className="mt-3 text-sm text-gray-400">Total Services</p>
          <p className={`text-3xl font-bold ${isDark ? "text-white" : "text-gray-800"}`}>
            142
          </p>
        </div>
      </div>

      {/* Top Services */}
      <div
        className={`rounded-2xl shadow-lg p-6 mb-10 ${
          isDark ? "bg-gray-800 border border-gray-700" : "bg-white"
        }`}
      >
        <h2 className={`text-2xl font-bold mb-6 ${isDark ? "text-white" : "text-gray-800"}`}>
          Top Services
        </h2>

        <div className="space-y-5">
          {topServices.map((s, i) => (
            <div
              key={i}
              className="flex items-center justify-between border-b pb-4 last:border-none"
            >
              <div>
                <p className={`font-semibold ${isDark ? "text-white" : "text-gray-800"}`}>
                  {s.name}
                </p>
                <p className={`${isDark ? "text-gray-400" : "text-gray-600"} text-sm`}>
                  {s.count} repairs
                </p>
              </div>

              <p className="font-bold text-orange-600 dark:text-orange-400">
                {s.revenue}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Previous Reports Table */}
      <div
        className={`rounded-2xl shadow-lg p-6 ${
          isDark ? "bg-gray-800 border border-gray-700" : "bg-white"
        }`}
      >
        <h2 className={`text-2xl font-bold mb-6 ${isDark ? "text-white" : "text-gray-800"}`}>
          Recent Reports
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full table-auto">
            <thead>
              <tr
                className={`text-left ${
                  isDark ? "bg-gray-700 text-gray-300" : "bg-gray-100 text-gray-700"
                }`}
              >
                <th className="py-3 px-6">Report ID</th>
                <th className="py-3 px-6">Title</th>
                <th className="py-3 px-6">Date</th>
                <th className="py-3 px-6">Status</th>
              </tr>
            </thead>

            <tbody>
              {recentReports.map((r, index) => (
                <tr
                  key={index}
                  className={`transition-all ${
                    isDark ? "hover:bg-gray-700" : "hover:bg-orange-50"
                  }`}
                >
                  <td className="py-4 px-6 font-medium">{r.id}</td>
                  <td className="py-4 px-6">{r.title}</td>
                  <td className="py-4 px-6">{r.date}</td>
                  <td className="py-4 px-6">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(
                        r.status
                      )}`}
                    >
                      {r.status.toUpperCase()}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Animations */}
      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }
      `}</style>
    </div>
  );
};

export default Reports;
