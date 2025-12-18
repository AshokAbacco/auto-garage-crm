import React, { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FiEye,
  FiTrash2,
  FiPlus,
  FiDollarSign,
  FiCalendar,
  FiUser,
  FiFileText,
  FiCreditCard,
  FiCheckCircle,
  FiClock,
  FiAlertCircle,
  FiDownload,
  FiEdit,
  FiFilter,
  FiSearch,
} from "react-icons/fi";
import { useTheme } from "../../contexts/ThemeContext";

const API_URL = import.meta.env.VITE_API_BASE_URL;

const getAuthToken = () =>
  localStorage.getItem("token") || localStorage.getItem("authToken");

const fetchWithAuth = async (url, options = {}) => {
  const token = getAuthToken();
  if (!token) throw new Error("No authentication token found");

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
    ...options.headers,
  };
  const response = await fetch(url, { ...options, headers });
  if (response.status === 401) {
    localStorage.removeItem("token");
    localStorage.removeItem("authToken");
    window.location.href = "/login";
  }
  return response;
};

// Payment Status Config
const statusConfig = {
  paid: {
    label: "Paid",
    color: "text-blue-700 bg-blue-50",
    border: "border-blue-200",
    icon: FiCheckCircle,
  },
  pending: {
    label: "Pending",
    color: "text-yellow-700 bg-yellow-50",
    border: "border-yellow-200",
    icon: FiClock,
  },
  overdue: {
    label: "Overdue",
    color: "text-red-700 bg-red-50",
    border: "border-red-200",
    icon: FiAlertCircle,
  },
  default: {
    label: "Unknown",
    color: "text-slate-700 bg-slate-50",
    border: "border-slate-200",
    icon: FiFileText,
  },
};

export default function BillingList() {
  const { isDark } = useTheme();
  const [invoices, setInvoices] = useState([]);
  const [filterStatus, setFilterStatus] = useState("all");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [stats, setStats] = useState({
    total: 0,
    paid: 0,
    pending: 0,
    overdue: 0,
    totalAmount: 0,
  });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const res = await fetchWithAuth(`${API_URL}/api/invoices`);
        const data = await res.json();
        if (!res.ok)
          throw new Error(data.message || "Failed to fetch invoices");
        setInvoices(data);

        // Calculate statistics
        const calculatedStats = data.reduce(
          (acc, inv) => {
            acc.total++;
            acc.totalAmount += Number(inv.grandTotal || 0);
            if (inv.status?.toLowerCase() === "paid") acc.paid++;
            if (inv.status?.toLowerCase() === "pending") acc.pending++;
            if (inv.status?.toLowerCase() === "overdue") acc.overdue++;
            return acc;
          },
          { total: 0, paid: 0, pending: 0, overdue: 0, totalAmount: 0 }
        );
        setStats(calculatedStats);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchInvoices();
  }, []);

  const filtered = useMemo(() => {
    const term = query.toLowerCase();
    return invoices.filter((inv) => {
      const matchesQuery =
        inv.invoiceNumber?.toLowerCase().includes(term) ||
        inv.client?.fullName?.toLowerCase().includes(term) ||
        inv.notes?.toLowerCase().includes(term);
      const matchesStatus =
        filterStatus === "all" ||
        inv.status?.toLowerCase() === filterStatus.toLowerCase();
      return matchesQuery && matchesStatus;
    });
  }, [query, invoices, filterStatus]);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this invoice?"))
      return;
    try {
      const res = await fetchWithAuth(`${API_URL}/api/invoices/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete invoice");
      setInvoices((prev) => prev.filter((inv) => inv.id !== id));
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading)
    return (
      <div
        className={`flex justify-center items-center h-screen ${
          isDark ? "bg-gray-900" : "bg-white"
        }`}
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-900 border-t-transparent mx-auto mb-4"></div>
          <p className={`text-lg ${isDark ? "text-white" : "text-gray-700"}`}>
            Loading Invoices...
          </p>
        </div>
      </div>
    );

  if (error)
    return (
      <div
        className={`text-center p-8 ${
          isDark ? "text-red-400" : "text-red-600"
        } font-semibold`}
      >
        Error: {error}
      </div>
    );

  return (
    <div className={`min-h-screen`}>
      <div className="lg: max-w-7xl  mx-auto px-4 sm:px-1 lg:px-6 py-6 space-y-6">
        {/* Compact Header */}
        <div
          className={`rounded-2xl shadow-lg border ${
            isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
          } p-4`}
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1
                className={`text-xl font-bold ${
                  isDark ? "text-white" : "text-gray-900"
                } mb-1`}
              >
                Billing & Invoices
              </h1>
              <div
                className={`flex flex-wrap gap-4 text-sm ${
                  isDark ? "text-gray-300" : "text-gray-600"
                }`}
              >
                <span className="flex items-center gap-1">
                  <FiFileText size={14} /> {stats.total} Invoices
                </span>
                <span className="flex items-center gap-1">
                  <FiDollarSign size={14} /> ₹{stats.totalAmount.toFixed(2)}
                </span>
                <span className="flex items-center gap-1">
                  <FiCheckCircle size={14} /> {stats.paid} Paid
                </span>
                <span className="flex items-center gap-1">
                  <FiClock size={14} /> {stats.pending} Pending
                </span>
              </div>
            </div>
            <Link
              to="/billing/new"
              className="bg-blue-900 text-white font-semibold px-4 py-2 rounded-lg shadow-md hover:shadow-lg transition-all flex items-center gap-2 text-sm"
            >
              <FiPlus size={16} /> New Invoice
            </Link>
          </div>
        </div>

        {/* Compact Filters */}
        <div
          className={`rounded-2xl shadow-lg border ${
            isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
          } p-3`}
        >
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <FiSearch
                className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
                  isDark ? "text-gray-400" : "text-gray-400"
                }`}
                size={16}
              />
              <input
                type="text"
                placeholder="Search invoice, client, notes..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className={`w-full pl-9 pr-3 py-2 text-sm rounded-lg border ${
                  isDark
                    ? "bg-gray-700 border-gray-600 text-white"
                    : "bg-gray-50 border-gray-300 text-gray-900"
                } focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
            </div>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className={`px-3 py-2 text-sm rounded-lg border ${
                isDark
                  ? "bg-gray-700 border-gray-600 text-white"
                  : "bg-gray-50 border-gray-300 text-gray-900"
              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
            >
              <option value="all">All</option>
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
              <option value="overdue">Overdue</option>
            </select>

            <button className="px-4 py-2 text-sm rounded-lg bg-blue-900 text-white hover:shadow-md transition-all flex items-center gap-2 font-medium">
              <FiDownload size={16} /> Export
            </button>
          </div>
        </div>

        {/* Compact Invoice Cards */}
        {filtered.length === 0 ? (
          <div
            className={`p-8 rounded-2xl text-center shadow-lg border ${
              isDark
                ? "bg-gray-800 border-gray-700"
                : "bg-white border-gray-200"
            }`}
          >
            <FiFileText
              className={`mx-auto text-3xl mb-3 ${
                isDark ? "text-gray-400" : "text-gray-300"
              }`}
            />
            <h3
              className={`text-lg font-bold mb-1 ${
                isDark ? "text-white" : "text-gray-900"
              }`}
            >
              No Invoices Found
            </h3>
            <p
              className={`text-sm mb-4 ${
                isDark ? "text-gray-400" : "text-gray-500"
              }`}
            >
              Try adjusting your filters or create a new invoice.
            </p>
            <Link
              to="/billing/new"
              className="inline-flex items-center gap-2 bg-blue-900 text-white px-4 py-2 rounded-lg font-semibold shadow-md hover:shadow-lg transition-all text-sm"
            >
              <FiPlus size={16} /> Create Invoice
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((inv) => {
              const status =
                statusConfig[inv.status?.toLowerCase()] || statusConfig.default;
              const StatusIcon = status.icon;

              return (
                <div
                  key={inv.id}
                  className={`rounded-xl shadow-lg border hover:shadow-xl transition-all ${
                    isDark
                      ? "bg-gray-800 border-gray-700"
                      : "bg-white border-gray-200"
                  }`}
                >
                  <div className="p-4">
                    <div className="flex flex-col lg:flex-row lg:items-center gap-3">
                      {/* Left Section - Invoice Info */}
                      <div className="flex items-center gap-3 lg:w-48 flex-shrink-0">
                        <div className="w-8 h-8 bg-blue-900 rounded-lg flex items-center justify-center flex-shrink-0">
                          <FiFileText className="text-white" size={14} />
                        </div>
                        <div className="min-w-0">
                          <h3
                            className={`font-bold text-sm ${
                              isDark ? "text-white" : "text-gray-900"
                            } truncate`}
                          >
                            #{inv.invoiceNumber}
                          </h3>
                          <p
                            className={`text-xs ${
                              isDark ? "text-gray-400" : "text-gray-500"
                            }`}
                          >
                            {new Date(inv.createdAt).toLocaleDateString(
                              "en-IN",
                              {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              }
                            )}
                          </p>
                        </div>
                      </div>

                      {/* Middle Section - Details */}
                      <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-2 min-w-0">
                        {/* Client */}
                        <div className="min-w-0">
                          <div className="flex items-center gap-1 mb-0.5">
                            <FiUser
                              className="text-blue-600 flex-shrink-0"
                              size={12}
                            />
                            <span
                              className={`text-xs font-medium ${
                                isDark ? "text-gray-400" : "text-gray-500"
                              }`}
                            >
                              Client
                            </span>
                          </div>
                          <p
                            className={`text-sm font-medium ${
                              isDark ? "text-white" : "text-gray-900"
                            } truncate`}
                          >
                            {inv.client?.fullName || "N/A"}
                          </p>
                          <p
                            className={`text-xs ${
                              isDark ? "text-gray-500" : "text-gray-400"
                            } truncate`}
                          >
                            {inv.client?.phone || "—"}
                          </p>
                        </div>

                        {/* Payment & Due Date */}
                        <div className="min-w-0">
                          <div className="flex items-center gap-1 mb-0.5">
                            <FiCalendar
                              className="text-blue-600 flex-shrink-0"
                              size={12}
                            />
                            <span
                              className={`text-xs font-medium ${
                                isDark ? "text-gray-400" : "text-gray-500"
                              }`}
                            >
                              Due Date
                            </span>
                          </div>
                          <p
                            className={`text-sm font-medium ${
                              isDark ? "text-white" : "text-gray-900"
                            }`}
                          >
                            {inv.dueDate
                              ? new Date(inv.dueDate).toLocaleDateString(
                                  "en-IN",
                                  { day: "2-digit", month: "short" }
                                )
                              : "—"}
                          </p>
                          <p
                            className={`text-xs ${
                              isDark ? "text-gray-500" : "text-gray-400"
                            } flex items-center gap-1`}
                          >
                            <FiCreditCard size={10} /> {inv.paymentMode || "—"}
                          </p>
                        </div>

                        {/* Amount & Status */}
                        <div className="min-w-0">
                          <div className="flex items-center gap-1 mb-0.5">
                            <FiDollarSign
                              className="text-blue-600 flex-shrink-0"
                              size={12}
                            />
                            <span
                              className={`text-xs font-medium ${
                                isDark ? "text-gray-400" : "text-gray-500"
                              }`}
                            >
                              Amount
                            </span>
                          </div>
                          <p className="text-lg font-bold bg-gradient-to-r from-blue-900 to-indigo-900 bg-clip-text text-transparent">
                            ₹{Number(inv.grandTotal || 0).toFixed(2)}
                          </p>
                          <div
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${status.color} mt-0.5`}
                          >
                            <StatusIcon size={10} /> {status.label}
                          </div>
                        </div>
                      </div>

                      {/* Right Section - Actions */}
                      <div className="flex lg:flex-col gap-2 lg:w-24 flex-shrink-0">
                        <button
                          onClick={() => navigate(`/billing/${inv.id}`)}
                          className="flex-1 lg:w-full px-3 py-1.5 text-xs rounded-md bg-blue-900 text-white font-medium hover:shadow-md transition-all flex items-center justify-center gap-1.5"
                        >
                          <FiEye size={12} /> View
                        </button>
                        <button
                          onClick={() => navigate(`/billing/${inv.id}/edit`)}
                          className="flex-1 lg:w-full px-3 py-1.5 text-xs rounded-md bg-blue-800 text-white font-medium hover:shadow-md transition-all flex items-center justify-center gap-1.5"
                        >
                          <FiEdit size={12} /> Edit
                        </button>
                        <button
                          onClick={() => handleDelete(inv.id)}
                          className="flex-1 lg:w-full px-3 py-1.5 text-xs rounded-md bg-red-600 text-white font-semibold hover:shadow-md transition-all flex items-center justify-center gap-1.5"
                        >
                          <FiTrash2 size={12} /> Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
