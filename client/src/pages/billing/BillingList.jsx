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
  FiCheckCircle,
  FiClock,
  FiAlertCircle,
  FiEdit,
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

// Helper component for Stat Cards in the header
function StatHeader({ label, value, subValue, color, isDark }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-lg border-b sm:border-b-0 sm:border-r border-gray-100 dark:border-gray-700 last:border-0">
      <div>
        <p
          className={`text-xs font-bold uppercase tracking-wider ${
            isDark ? "text-gray-400" : "text-gray-500"
          }`}
        >
          {label}
        </p>
        <h3
          className={`text-xl font-bold mt-1 ${isDark ? "text-white" : "text-gray-900"}`}
        >
          {value}
        </h3>
      </div>
      {subValue && (
        <span className={`text-sm font-medium mt-2 sm:mt-0 ${color}`}>
          {subValue}
        </span>
      )}
    </div>
  );
}

export default function BillingList() {
  const { isDark } = useTheme();
  const navigate = useNavigate();

  // Theme Configuration
  const colors = useMemo(
    () => ({
      mainBg: isDark ? "#020617" : "#F8FAFC",
      cardBg: isDark ? "#1E293B" : "#FFFFFF",
      textPrimary: isDark ? "#F1F5F9" : "#0F172A",
      textSecondary: isDark ? "#94A3B8" : "#64748B",
      border: isDark ? "#334155" : "#E2E8F0",
      hoverBg: isDark ? "#0F172A" : "#F1F5F9",
      accent: "#3B82F6",
    }),
    [isDark],
  );

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

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const res = await fetchWithAuth(`${API_URL}/api/invoices`);
        const data = await res.json();
        if (!res.ok)
          throw new Error(data.message || "Failed to fetch invoices");
        setInvoices(data);

        const calculatedStats = data.reduce(
          (acc, inv) => {
            acc.total++;
            acc.totalAmount += Number(inv.grandTotal || 0);
            if (inv.status?.toLowerCase() === "paid") acc.paid++;
            if (inv.status?.toLowerCase() === "pending") acc.pending++;
            if (inv.status?.toLowerCase() === "overdue") acc.overdue++;
            return acc;
          },
          { total: 0, paid: 0, pending: 0, overdue: 0, totalAmount: 0 },
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

  const getStatusBadge = (status) => {
    const s = status?.toLowerCase();
    let style = {};
    let label = status || "Unknown";

    if (s === "paid") {
      style = {
        backgroundColor: isDark ? "rgba(16, 185, 129, 0.2)" : "#ECFDF5",
        color: "#059669",
        border: isDark
          ? "1px solid rgba(16, 185, 129, 0.3)"
          : "1px solid #D1FAE5",
      };
    } else if (s === "pending") {
      style = {
        backgroundColor: isDark ? "rgba(245, 158, 11, 0.2)" : "#FFFBEB",
        color: "#D97706",
        border: isDark
          ? "1px solid rgba(245, 158, 11, 0.3)"
          : "1px solid #FDE68A",
      };
    } else if (s === "overdue") {
      style = {
        backgroundColor: isDark ? "rgba(239, 68, 68, 0.2)" : "#FEF2F2",
        color: "#DC2626",
        border: isDark
          ? "1px solid rgba(239, 68, 68, 0.3)"
          : "1px solid #FECACA",
      };
    } else {
      style = {
        backgroundColor: isDark ? "rgba(148, 163, 184, 0.2)" : "#F3F4F6",
        color: colors.textSecondary,
        border: isDark
          ? "1px solid rgba(148, 163, 184, 0.3)"
          : "1px solid #E5E7EB",
      };
    }
    return (
      <span
        className="px-2.5 py-1 rounded-full text-xs font-semibold uppercase"
        style={style}
      >
        {label}
      </span>
    );
  };

  if (loading)
    return (
      <div
        className="flex justify-center items-center h-screen"
        style={{ backgroundColor: colors.mainBg }}
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
          <p
            className="text-lg font-medium"
            style={{ color: colors.textPrimary }}
          >
            Loading Invoices...
          </p>
        </div>
      </div>
    );

  if (error)
    return (
      <div
        className="text-center p-8 rounded-xl"
        style={{
          color: "#DC2626",
          backgroundColor: colors.cardBg,
          border: `1px solid ${colors.border}`,
        }}
      >
        Error: {error}
      </div>
    );

  return (
    <div
      className="lg:ml-16 min-h-screen p-4 sm:p-6 lg:p-8"
      style={{ backgroundColor: colors.mainBg }}
    >
      <div className="mx-auto space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1
              className="text-2xl font-bold"
              style={{ color: colors.textPrimary }}
            >
              Invoices
            </h1>
            <p className="text-sm mt-1" style={{ color: colors.textSecondary }}>
              Manage your billing history and payments.
            </p>
          </div>
          <Link
            to="/billing/new"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg shadow-sm font-semibold text-sm transition-all hover:shadow-md"
            style={{
              backgroundColor: colors.accent,
              color: "white",
            }}
          >
            <FiPlus size={18} /> New Invoice
          </Link>
        </div>

        {/* Stats Row */}
        <div
          className="rounded-xl border shadow-sm grid grid-cols-2 sm:grid-cols-4"
          style={{ backgroundColor: colors.cardBg, borderColor: colors.border }}
        >
          <StatHeader
            label="Total Invoices"
            value={stats.total}
            isDark={isDark}
          />
          <StatHeader
            label="Total Revenue"
            value={`₹${stats.totalAmount.toLocaleString()}`}
            isDark={isDark}
          />
          <StatHeader
            label="Paid"
            value={stats.paid}
            subValue={`₹${(stats.totalAmount * (stats.paid / stats.total || 0)).toFixed(0)}`}
            color="text-green-500"
            isDark={isDark}
          />
          <StatHeader
            label="Pending"
            value={stats.pending + stats.overdue}
            color="text-amber-500"
            isDark={isDark}
          />
        </div>

        {/* Filters & Search */}
        <div
          className="rounded-xl border p-4 shadow-sm"
          style={{ backgroundColor: colors.cardBg, borderColor: colors.border }}
        >
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <FiSearch
                className="absolute left-3 top-1/2 transform -translate-y-1/2 opacity-50"
                size={18}
                style={{ color: colors.textSecondary }}
              />
              <input
                type="text"
                placeholder="Search invoice, client name..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
                style={{
                  backgroundColor: isDark ? "#0F172A" : "#FFFFFF",
                  borderColor: colors.border,
                  color: colors.textPrimary,
                }}
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 text-sm rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[150px]"
              style={{
                backgroundColor: isDark ? "#0F172A" : "#FFFFFF",
                borderColor: colors.border,
                color: colors.textPrimary,
              }}
            >
              <option value="all">All Status</option>
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
              <option value="overdue">Overdue</option>
            </select>
          </div>
        </div>

        {/* Table Container - Classic View */}
        <div
          className="rounded-xl border shadow-sm overflow-hidden"
          style={{ backgroundColor: colors.cardBg, borderColor: colors.border }}
        >
          {filtered.length === 0 ? (
            <div className="p-12 text-center">
              <FiFileText
                size={48}
                className="mx-auto mb-4 opacity-20"
                style={{ color: colors.textSecondary }}
              />
              <h3
                className="text-lg font-medium mb-2"
                style={{ color: colors.textPrimary }}
              >
                No invoices found
              </h3>
              <p
                className="text-sm mb-6"
                style={{ color: colors.textSecondary }}
              >
                {query || filterStatus !== "all"
                  ? "Try adjusting your search filters."
                  : "Get started by creating your first invoice."}
              </p>
              <Link
                to="/billing/new"
                className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all"
                style={{
                  backgroundColor: colors.hoverBg,
                  color: colors.accent,
                }}
              >
                <FiPlus size={16} /> Create Invoice
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr
                    style={{
                      borderBottom: `2px solid ${colors.border}`,
                      backgroundColor: isDark
                        ? "rgba(255,255,255,0.02)"
                        : "rgba(0,0,0,0.02)",
                    }}
                  >
                    <th
                      className="p-4 text-xs font-bold uppercase tracking-wider"
                      style={{ color: colors.textSecondary }}
                    >
                      Invoice #
                    </th>
                    <th
                      className="p-4 text-xs font-bold uppercase tracking-wider"
                      style={{ color: colors.textSecondary }}
                    >
                      Client
                    </th>
                    <th
                      className="p-4 text-xs font-bold uppercase tracking-wider hidden sm:table-cell"
                      style={{ color: colors.textSecondary }}
                    >
                      Date
                    </th>
                    <th
                      className="p-4 text-xs font-bold uppercase tracking-wider hidden md:table-cell"
                      style={{ color: colors.textSecondary }}
                    >
                      Due Date
                    </th>
                    <th
                      className="p-4 text-xs font-bold uppercase tracking-wider text-right"
                      style={{ color: colors.textSecondary }}
                    >
                      Amount
                    </th>
                    <th
                      className="p-4 text-xs font-bold uppercase tracking-wider text-center hidden sm:table-cell"
                      style={{ color: colors.textSecondary }}
                    >
                      Status
                    </th>
                    <th
                      className="p-4 text-xs font-bold uppercase tracking-wider text-right"
                      style={{ color: colors.textSecondary }}
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody
                  className="divide-y"
                  style={{ borderColor: colors.border }}
                >
                  {filtered.map((inv) => (
                    <tr
                      key={inv.id}
                      className="transition-colors hover:bg-opacity-50 group"
                      style={{ hoverBg: colors.hoverBg }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.backgroundColor = colors.hoverBg)
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.backgroundColor = "transparent")
                      }
                    >
                      {/* Invoice Number */}
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center"
                            style={{
                              backgroundColor: isDark
                                ? "rgba(59, 130, 246, 0.2)"
                                : "#DBEAFE",
                            }}
                          >
                            <FiFileText
                              size={16}
                              style={{ color: colors.accent }}
                            />
                          </div>
                          <div>
                            <p
                              className="font-bold text-sm"
                              style={{ color: colors.textPrimary }}
                            >
                              {inv.invoiceNumber}
                            </p>
                            {/* <p
                              className="text-xs hidden sm:block"
                              style={{ color: colors.textSecondary }}
                            >
                              {getStatusBadge(inv.status)}
                            </p> */}
                          </div>
                        </div>
                      </td>

                      {/* Client */}
                      <td className="p-4">
                        <p
                          className="font-medium text-sm"
                          style={{ color: colors.textPrimary }}
                        >
                          {inv.client?.fullName || "Unknown Client"}
                        </p>
                        <p
                          className="text-xs"
                          style={{ color: colors.textSecondary }}
                        >
                          {inv.client?.phone || "No Phone"}
                        </p>
                      </td>

                      {/* Date */}
                      <td className="p-4 hidden sm:table-cell">
                        <p
                          className="text-sm"
                          style={{ color: colors.textPrimary }}
                        >
                          {new Date(inv.createdAt).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </p>
                      </td>

                      {/* Due Date */}
                      <td className="p-4 hidden md:table-cell">
                        <p
                          className="text-sm font-medium"
                          style={{ color: colors.textPrimary }}
                        >
                          {inv.dueDate
                            ? new Date(inv.dueDate).toLocaleDateString(
                                "en-IN",
                                {
                                  day: "2-digit",
                                  month: "short",
                                },
                              )
                            : "—"}
                        </p>
                      </td>

                      {/* Amount */}
                      <td className="p-4 text-right">
                        <p
                          className="text-sm font-bold"
                          style={{ color: colors.textPrimary }}
                        >
                          ₹{Number(inv.grandTotal || 0).toFixed(2)}
                        </p>
                      </td>

                      {/* Status (Mobile Hidden) */}
                      <td className="p-4 text-center hidden sm:table-cell">
                        {getStatusBadge(inv.status)}
                      </td>

                      {/* Actions */}
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => navigate(`/billing/${inv.id}`)}
                            className="p-2 rounded-lg text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                            title="View"
                          >
                            <FiEye size={18} />
                          </button>
                          <button
                            onClick={() => navigate(`/billing/${inv.id}/edit`)}
                            className="p-2 rounded-lg text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors"
                            title="Edit"
                          >
                            <FiEdit size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(inv.id)}
                            className="p-2 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                            title="Delete"
                          >
                            <FiTrash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
