import React from "react";
import {
  Receipt,
  Search,
  PlusCircle,
  IndianRupee,
  CheckCircle,
  XCircle,
  Clock,
} from "lucide-react";
import { useTheme } from "../../contexts/ThemeContext";

const Billing = () => {
  const { isDark } = useTheme();

  const invoices = [
    {
      id: "#INV-1023",
      customer: "Rajesh Kumar",
      amount: "₹1,200",
      service: "General Service",
      date: "02 Dec 2025",
      status: "paid",
    },
    {
      id: "#INV-1024",
      customer: "Priya Sharma",
      amount: "₹4,500",
      service: "Engine Repair",
      date: "01 Dec 2025",
      status: "pending",
    },
    {
      id: "#INV-1025",
      customer: "Amit Patel",
      amount: "₹850",
      service: "Brake Service",
      date: "30 Nov 2025",
      status: "failed",
    },
    {
      id: "#INV-1026",
      customer: "Sneha Reddy",
      amount: "₹600",
      service: "Electrical Work",
      date: "28 Nov 2025",
      status: "paid",
    },
  ];

  const getStatusBadge = (status) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
      case "pending":
        return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400";
      case "failed":
        return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "paid":
        return <CheckCircle className="w-4 h-4" />;
      case "pending":
        return <Clock className="w-4 h-4" />;
      case "failed":
        return <XCircle className="w-4 h-4" />;
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
      <div className="animate-fade-in mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-4xl py-5 font-bold bg-gradient-to-r from-orange-600 to-red-600 text-transparent bg-clip-text">
            Billing
          </h1>
          <p className={`${isDark ? "text-gray-400" : "text-gray-600"}`}>
            Manage invoices, payments & billing history
          </p>
        </div>

        {/* Add Invoice Button */}
        <button className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-xl shadow-lg hover:scale-105 transition-all duration-300">
          <PlusCircle className="w-5 h-5" />
          Create Invoice
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        <div
          className={`rounded-2xl p-6 shadow-lg ${
            isDark ? "bg-gray-800" : "bg-white"
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="p-3 rounded-xl bg-gradient-to-r from-green-500 to-green-600 text-white">
              <IndianRupee className="w-6 h-6" />
            </div>
          </div>
          <p className={`${isDark ? "text-gray-400" : "text-gray-600"} text-sm`}>
            Total Revenue
          </p>
          <p className={`text-3xl font-bold ${isDark ? "text-white" : "text-gray-800"}`}>
            ₹6,850
          </p>
        </div>

        <div
          className={`rounded-2xl p-6 shadow-lg ${
            isDark ? "bg-gray-800" : "bg-white"
          }`}
        >
          <div className="p-3 rounded-xl bg-gradient-to-r from-yellow-500 to-yellow-600 text-white">
            <Clock className="w-6 h-6" />
          </div>
          <p className={`${isDark ? "text-gray-400" : "text-gray-600"} text-sm`}>
            Pending Payments
          </p>
          <p className={`text-3xl font-bold ${isDark ? "text-white" : "text-gray-800"}`}>
            ₹4,500
          </p>
        </div>

        <div
          className={`rounded-2xl p-6 shadow-lg ${
            isDark ? "bg-gray-800" : "bg-white"
          }`}
        >
          <div className="p-3 rounded-xl bg-gradient-to-r from-red-500 to-red-600 text-white">
            <XCircle className="w-6 h-6" />
          </div>
          <p className={`${isDark ? "text-gray-400" : "text-gray-600"} text-sm`}>
            Failed Transactions
          </p>
          <p className={`text-3xl font-bold ${isDark ? "text-white" : "text-gray-800"}`}>
            ₹850
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-6 flex justify-between items-center">
        <div
          className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg w-full max-w-md ${
            isDark ? "bg-gray-800 border border-gray-700" : "bg-white border border-gray-200"
          }`}
        >
          <Search className="w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search invoices..."
            className={`w-full outline-none bg-transparent ${
              isDark ? "text-white" : "text-gray-700"
            }`}
          />
        </div>
      </div>

      {/* Invoice Table */}
      <div
        className={`rounded-2xl shadow-lg overflow-hidden ${
          isDark ? "bg-gray-800 border border-gray-700" : "bg-white"
        }`}
      >
        <table className="w-full table-auto">
          <thead>
            <tr
              className={`text-left ${
                isDark ? "bg-gray-700 text-gray-300" : "bg-gray-100 text-gray-700"
              }`}
            >
              <th className="py-3 px-6">Invoice ID</th>
              <th className="py-3 px-6">Customer</th>
              <th className="py-3 px-6">Service</th>
              <th className="py-3 px-6">Amount</th>
              <th className="py-3 px-6">Date</th>
              <th className="py-3 px-6">Status</th>
            </tr>
          </thead>

          <tbody>
            {invoices.map((invoice, index) => (
              <tr
                key={index}
                className={`transition-all ${
                  isDark ? "hover:bg-gray-700" : "hover:bg-orange-50"
                }`}
              >
                <td className="py-4 px-6 font-medium">{invoice.id}</td>
                <td className="py-4 px-6">{invoice.customer}</td>
                <td className="py-4 px-6">{invoice.service}</td>
                <td className="py-4 px-6 font-semibold">{invoice.amount}</td>
                <td className="py-4 px-6">{invoice.date}</td>

                <td className="py-4 px-6">
                  <span
                    className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(
                      invoice.status
                    )}`}
                  >
                    {getStatusIcon(invoice.status)}
                    {invoice.status.toUpperCase()}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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
          animation: fade-in 0.7s ease-out;
        }
      `}</style>
    </div>
  );
};

export default Billing;
