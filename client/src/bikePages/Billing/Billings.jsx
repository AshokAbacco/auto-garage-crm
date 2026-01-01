import React, { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FiEye,
  FiTrash2,
  FiPlus,
  FiEdit,
  FiSearch,
  FiFileText,
  FiCheckCircle,
  FiClock,
  FiTrendingUp,
  FiAlertCircle,
  FiRefreshCw
} from "react-icons/fi";
import { useTheme } from "../../contexts/ThemeContext";
import { Toaster, toast } from "react-hot-toast";
import { IndianRupee } from "lucide-react";
import api from "../../utils/axiosInstance";

export default function BillingList() {
  const { isDark } = useTheme();
  const [invoices, setInvoices] = useState([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // LOAD BIKE INVOICES
  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const res = await api.get("/api/bike-invoices");
      setInvoices(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Fetch invoices error:", err);
      toast.error(err.response?.data?.message || "Failed to load invoices");
    } finally {
      setLoading(false);
    }
  };

  // SEARCH BY OWNER NAME / REG NUMBER / INVOICE NUMBER
  const filtered = useMemo(() => {
    return invoices.filter(inv =>
      inv.invoiceNumber?.toLowerCase().includes(query.toLowerCase()) ||
      inv.bike?.ownerName?.toLowerCase().includes(query.toLowerCase()) ||
      inv.bike?.regNumber?.toLowerCase().includes(query.toLowerCase())
    );
  }, [query, invoices]);

  // DELETE
  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this invoice?")) return;
    
    try {
      await api.delete(`/api/bike-invoices/${id}`);
      setInvoices(prev => prev.filter(i => i.id !== id));
      toast.success("Invoice deleted successfully");
    } catch (err) {
      console.error("Delete invoice error:", err);
      toast.error(err.response?.data?.message || "Failed to delete invoice");
    }
  };

  // Calculate stats
  const totalInvoices = invoices.length;
  const paidInvoices = invoices.filter(inv => inv.status === "Paid").length;
  const pendingInvoices = invoices.filter(inv => inv.status === "Pending").length;
  const totalRevenue = useMemo(() => {
    return invoices
      .filter(inv =>
        ["paid", "Paid", "PAID", "Completed"].includes(inv.status)
      )
      .reduce((sum, inv) => {
        const amount = String(inv.grandTotal || "0")
          .replace(/,/g, "")   // remove commas
          .replace(/₹/g, ""); // remove currency if any

        return sum + Number(amount);
      }, 0)
      .toFixed(2);
  }, [invoices]);

  return (
    <div className={`min-h-screen p-6 transition-colors duration-300 ${
      isDark ? "bg-gray-900" : "bg-gradient-to-br from-gray-50 to-gray-100"
    }`}>
      <Toaster position="top-right" />

      {/* Header Section */}
      <div className="mb-8 animate-fade-in">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className={`text-4xl font-bold mb-2 bg-gradient-to-r from-blue-500 to-blue-600 bg-clip-text text-transparent`}>
              Billing Management
            </h1>
            <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>
              Track and manage all invoices and payments
            </p>
          </div>

          <Link
            to="/bill/new"
            className="group flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-300 font-medium"
          >
            <FiPlus size={20} className="group-hover:rotate-90 transition-transform duration-300" />
            New Invoice
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 animate-slide-down">
        {/* Total Invoices */}
        <div className={`group rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 p-6 border-2 ${
          isDark
            ? "bg-gray-800 border-gray-700 hover:border-blue-500/50"
            : "bg-white border-gray-100 hover:border-blue-500/30"
        }`}>
          <div className="flex items-center justify-between mb-4">
            <div className={`p-3 rounded-xl ${
              isDark ? "bg-blue-500/20" : "bg-blue-50"
            }`}>
              <FiFileText size={24} className="text-blue-500" />
            </div>
            <FiTrendingUp size={20} className={`${isDark ? "text-gray-500" : "text-gray-400"} group-hover:text-blue-500 transition-colors`} />
          </div>
          <p className={`text-sm mb-1 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
            Total Invoices
          </p>
          <h2 className={`text-3xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
            {totalInvoices}
          </h2>
        </div>

        {/* Pending Invoices */}
        <div className={`group rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 p-6 border-2 ${
          isDark
            ? "bg-gray-800 border-gray-700 hover:border-blue-600/50"
            : "bg-white border-gray-100 hover:border-blue-600/30"
        }`}>
          <div className="flex items-center justify-between mb-4">
            <div className={`p-3 rounded-xl ${
              isDark ? "bg-blue-500/20" : "bg-blue-50"
            }`}>
              <FiClock size={24} className="text-blue-600" />
            </div>
            <FiAlertCircle size={20} className={`${isDark ? "text-gray-500" : "text-gray-400"} group-hover:text-blue-600 transition-colors`} />
          </div>
          <p className={`text-sm mb-1 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
            Pending Payments
          </p>
          <h2 className="text-3xl font-bold text-blue-600">
            {pendingInvoices}
          </h2>
        </div>

        {/* Paid Invoices */}
        <div className={`group rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 p-6 border-2 ${
          isDark
            ? "bg-gray-800 border-gray-700 hover:border-green-500/50"
            : "bg-white border-gray-100 hover:border-green-500/30"
        }`}>
          <div className="flex items-center justify-between mb-4">
            <div className={`p-3 rounded-xl ${
              isDark ? "bg-green-500/20" : "bg-green-50"
            }`}>
              <FiCheckCircle size={24} className="text-green-500" />
            </div>
            <FiCheckCircle size={20} className={`${isDark ? "text-gray-500" : "text-gray-400"} group-hover:text-green-500 transition-colors`} />
          </div>
          <p className={`text-sm mb-1 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
            Paid Invoices
          </p>
          <h2 className="text-3xl font-bold text-green-500">
            {paidInvoices}
          </h2>
        </div>

        {/* Total Revenue */}
        <div className={`group rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 p-6 border-2 ${
          isDark
            ? "bg-gradient-to-br from-blue-900/50 to-indigo-900/50 border-blue-700/50 hover:border-blue-500/50"
            : "bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-100 hover:border-blue-500/30"
        }`}>
          <div className="flex items-center justify-between mb-4">
            <div className={`p-3 rounded-xl ${
              isDark ? "bg-blue-500/30" : "bg-blue-100"
            }`}>
              <IndianRupee size={24} className="text-blue-600" />
            </div>
            <FiTrendingUp size={20} className={`${isDark ? "text-blue-400" : "text-blue-500"} group-hover:scale-110 transition-transform`} />
          </div>
          <p className={`text-sm mb-1 ${isDark ? "text-gray-300" : "text-gray-600"}`}>
            Total Revenue
          </p>
          <h2 className="text-3xl font-bold text-blue-600">
            ₹{totalRevenue}
          </h2>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-8 animate-slide-down" style={{ animationDelay: "100ms" }}>
        <div className="relative max-w-2xl">
          <FiSearch className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-300 ${
            isDark ? "text-gray-400" : "text-gray-500"
          }`} size={20} />
          <input
            type="text"
            placeholder="Search by invoice number, owner name, or registration..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className={`w-full pl-12 pr-4 py-4 rounded-xl border-2 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              isDark
                ? "bg-gray-800 border-gray-700 text-white placeholder-gray-400"
                : "bg-white border-gray-200 text-gray-900 placeholder-gray-400 shadow-sm"
            }`}
          />
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <div className="flex flex-col items-center gap-4">
            <FiRefreshCw className="animate-spin text-blue-500" size={40} />
            <p className={`text-lg ${isDark ? "text-gray-400" : "text-gray-600"}`}>
              Loading invoices...
            </p>
          </div>
        </div>
      )}

      {/* Invoices List */}
      {!loading && (
        <div className="space-y-4 animate-fade-in">
          {filtered.length === 0 ? (
            <div className={`flex flex-col items-center justify-center py-20 rounded-2xl border-2 border-dashed ${
              isDark ? "border-gray-700 bg-gray-800/50" : "border-gray-300 bg-white"
            }`}>
              <FiFileText size={64} className={isDark ? "text-gray-600" : "text-gray-400"} />
              <p className={`mt-4 text-lg font-medium ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                {query ? "No invoices found" : "No invoices yet"}
              </p>
              <p className={`mt-2 text-sm ${isDark ? "text-gray-500" : "text-gray-500"}`}>
                {query ? "Try adjusting your search" : "Create your first invoice to get started"}
              </p>
            </div>
          ) : (
            filtered.map((invoice, index) => (
              <InvoiceCard
                key={invoice.id}
                invoice={invoice}
                isDark={isDark}
                index={index}
                onView={() => navigate(`/bill/${invoice.id}`)}
                onEdit={() => navigate(`/bill/${invoice.id}/edit`)}
                onDelete={() => handleDelete(invoice.id)}
              />
            ))
          )}
        </div>
      )}

      {/* Custom Styles */}
      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slide-down {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }

        .animate-slide-down {
          animation: slide-down 0.5s ease-out;
        }

        .animate-slide-up {
          animation: slide-up 0.5s ease-out;
        }
      `}</style>
    </div>
  );
}

function InvoiceCard({ invoice, isDark, index, onView, onEdit, onDelete }) {
  const statusColors = {
    Paid: isDark
      ? "bg-green-500/20 text-green-400 border-green-500/50"
      : "bg-green-100 text-green-700 border-green-200",
    Pending: isDark
      ? "bg-blue-500/20 text-blue-400 border-blue-600/50"
      : "bg-blue-100 text-blue-700 border-blue-200",
  };

  return (
    <div
      className={`group flex flex-col md:flex-row gap-6 items-start md:items-center rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 p-6 border-2 animate-slide-up ${
        isDark
          ? "bg-gray-800 border-gray-700 hover:border-blue-500/50"
          : "bg-white border-gray-100 hover:border-blue-500/30"
      }`}
      style={{ animationDelay: `${index * 50}ms` }}
    >
      {/* Invoice Icon */}
      <div className={`p-4 rounded-xl ${
        isDark ? "bg-blue-500/20" : "bg-gradient-to-br from-blue-50 to-indigo-50"
      } group-hover:scale-110 transition-transform duration-300`}>
        <FiFileText size={32} className="text-blue-500" />
      </div>

      {/* Invoice Info */}
      <div className="flex-1 space-y-2 min-w-0">
        <div className="flex items-center gap-3">
          <h2 className={`text-xl font-bold ${
            isDark ? "text-white" : "text-gray-900"
          }`}>
            #{invoice.invoiceNumber}
          </h2>
          <span className={`px-3 py-1 rounded-lg text-xs font-semibold border-2 transition-all duration-300 ${
            statusColors[invoice.status] || statusColors.Pending
          }`}>
            {invoice.status}
          </span>
        </div>

        <div className="flex flex-col gap-1">
          <p className={`text-sm font-medium ${
            isDark ? "text-gray-300" : "text-gray-700"
          }`}>
            {invoice.bike?.ownerName}
          </p>
          <p className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}>
            {invoice.bike?.regNumber}
          </p>
        </div>

        {invoice.serviceCategory && (
          <p className={`text-xs ${isDark ? "text-gray-500" : "text-gray-400"}`}>
            {invoice.serviceCategory}
          </p>
        )}
      </div>

      {/* Amount and Actions */}
      <div className="flex flex-col items-end gap-3 min-w-fit">
        <div className="text-right">
          <p className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"} mb-1`}>
            Total Amount
          </p>
          <p className="text-2xl font-bold text-green-600">
            ₹{Number(invoice.grandTotal).toFixed(2)}
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={onView}
            className={`p-2.5 rounded-lg font-medium transition-all duration-300 hover:scale-110 active:scale-95 ${
              isDark
                ? "bg-blue-500/20 text-blue-400 hover:bg-blue-500/30"
                : "bg-blue-50 text-blue-600 hover:bg-blue-100"
            }`}
            title="View Invoice"
          >
            <FiEye size={18} />
          </button>

          <button
            onClick={onEdit}
            className={`p-2.5 rounded-lg font-medium transition-all duration-300 hover:scale-110 active:scale-95 ${
              isDark
                ? "bg-blue-500/20 text-blue-400 hover:bg-blue-500/30"
                : "bg-blue-50 text-blue-600 hover:bg-blue-100"
            }`}
            title="Edit Invoice"
          >
            <FiEdit size={18} />
          </button>

          <button
            onClick={onDelete}
            className={`p-2.5 rounded-lg font-medium transition-all duration-300 hover:scale-110 active:scale-95 ${
              isDark
                ? "bg-red-500/20 text-red-400 hover:bg-red-500/30"
                : "bg-red-50 text-red-600 hover:bg-red-100"
            }`}
            title="Delete Invoice"
          >
            <FiTrash2 size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}