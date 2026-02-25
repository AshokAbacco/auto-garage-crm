import React, { useEffect, useState, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  FiTool,
  FiPlus,
  FiSearch,
  FiDollarSign,
  FiFileText,
  FiAlertCircle,
  FiFilter,
  FiCalendar,
  FiUser,
  FiTag,
} from "react-icons/fi";
import { FaEye } from "react-icons/fa6";
import { FaRupeeSign } from "react-icons/fa";
import { useTheme } from "../../contexts/ThemeContext";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5001";

const apiRequest = async (url) => {
  const token = localStorage.getItem("token");
  const res = await fetch(`${API_BASE}${url}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res;
};

export default function ServicesList() {
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

  useEffect(() => {
    const loadServices = async () => {
      try {
        const res = await apiRequest("/api/services");
        const data = await res.json();
        if (!res.ok)
          throw new Error(data.message || "Failed to fetch services");
        setServices(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    const loadCategories = async () => {
      try {
        const res = await apiRequest("/api/services/list");
        const data = await res.json();
        if (res.ok) setCategories(data);
      } catch (err) {
        console.error("Error loading categories:", err);
      }
    };

    loadServices();
    loadCategories();
  }, []);

  // Filtering Logic
  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return services.filter((s) => {
      const matchesSearch =
        s.client?.fullName?.toLowerCase().includes(q) ||
        s.client?.regNumber?.toLowerCase().includes(q) ||
        s.status?.toLowerCase().includes(q) ||
        s.category?.name?.toLowerCase().includes(q) ||
        s.subService?.name?.toLowerCase().includes(q);

      const matchesCategory = selectedCategory
        ? s.category?.id === Number(selectedCategory)
        : true;

      const matchesStatus = selectedStatus
        ? s.status?.toLowerCase() === selectedStatus.toLowerCase()
        : true;

      const serviceDate = new Date(s.date);
      const matchesDate =
        (!startDate || serviceDate >= new Date(startDate)) &&
        (!endDate || serviceDate <= new Date(endDate));

      return matchesSearch && matchesCategory && matchesStatus && matchesDate;
    });
  }, [search, services, selectedCategory, selectedStatus, startDate, endDate]);

  const totalRevenue = services.reduce(
    (sum, s) =>
      sum +
      (Number(s.cost) || Number(s.partsCost || 0) + Number(s.laborCost || 0)),
    0,
  );

  // Helper for Status Badges
  const getStatusBadge = (status) => {
    const s = status?.toLowerCase();
    let style = {};
    let label = status || "Unknown";

    if (s === "pending") {
      style = {
        backgroundColor: isDark ? "rgba(239, 68, 68, 0.2)" : "#FEF2F2",
        color: "#DC2626",
        border: isDark
          ? "1px solid rgba(239, 68, 68, 0.3)"
          : "1px solid #FECACA",
      };
    } else if (s === "paid") {
      style = {
        backgroundColor: isDark ? "rgba(16, 185, 129, 0.2)" : "#ECFDF5",
        color: "#059669",
        border: isDark
          ? "1px solid rgba(16, 185, 129, 0.3)"
          : "1px solid #D1FAE5",
      };
    } else if (s === "processing") {
      style = {
        backgroundColor: isDark ? "rgba(59, 130, 246, 0.2)" : "#EFF6FF",
        color: "#2563EB",
        border: isDark
          ? "1px solid rgba(59, 130, 246, 0.3)"
          : "1px solid #BFDBFE",
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
        className="px-2.5 py-1 rounded-full text-xs font-semibold uppercase w-fit"
        style={style}
      >
        {label}
      </span>
    );
  };

  // Helper for WhatsApp Approval Badges
  const getApprovalBadge = (status) => {
    if (!status) {
      return (
        <span
          className="px-2 py-0.5 rounded text-xs font-medium"
          style={{ color: colors.textSecondary }}
        >
          WhatsApp: Not Sent
        </span>
      );
    }

    let style = {};
    let label = "";

    if (status === "PENDING") {
      label = "Waiting Approval";
      style = {
        color: "#D97706",
        backgroundColor: isDark ? "rgba(245, 158, 11, 0.15)" : "#FFFBEB",
      };
    } else if (status === "APPROVED") {
      label = "Approved";
      style = {
        color: "#059669",
        backgroundColor: isDark ? "rgba(16, 185, 129, 0.15)" : "#ECFDF5",
      };
    } else if (status === "REJECTED") {
      label = "Rejected";
      style = {
        color: "#DC2626",
        backgroundColor: isDark ? "rgba(239, 68, 68, 0.15)" : "#FEF2F2",
      };
    } else if (status === "READY_SENT") {
      label = "Vehicle Ready";
      style = {
        color: "#2563EB",
        backgroundColor: isDark ? "rgba(37, 99, 235, 0.15)" : "#EFF6FF",
      };
    }

    return (
      <span
        className={`px-2 py-0.5 rounded text-xs font-semibold border w-fit`}
        style={{
          ...style,
          borderColor: style.color.replace("0.15", "0.3").replace("0.2", "0.4"),
        }}
      >
        {label}
      </span>
    );
  };

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
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1
              className="text-2xl font-bold"
              style={{ color: colors.textPrimary }}
            >
              Services
            </h1>
            <p className="text-sm mt-1" style={{ color: colors.textSecondary }}>
              Manage service records and vehicle status.
            </p>
          </div>
          <Link
            to="/services/new"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg shadow-sm font-semibold text-sm transition-all hover:shadow-md"
            style={{
              backgroundColor: colors.accent,
              color: "white",
            }}
          >
            <FiPlus size={18} /> New Service
          </Link>
        </div>

        {/* Filters & Search Bar */}
        <div
          className="rounded-xl border p-4 shadow-sm transition-all duration-300"
          style={{ backgroundColor: colors.cardBg, borderColor: colors.border }}
        >
          {/* 1. Changed grid to handle mobile (1 col), tablet (2 col), and desktop (4 col).
      2. Removed 'items-end' to allow elements to align naturally.
      3. Added 'gap-y-5' for better vertical breathing room on mobile.
  */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
            {/* Search - Full width on mobile */}
            <div className="flex flex-col gap-1.5">
              <label
                className="text-[10px] font-bold uppercase tracking-wider opacity-60 ml-1"
                style={{ color: colors.textSecondary }}
              >
                Search Vehicle
              </label>
              <div className="relative">
                <FiSearch
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 opacity-50"
                  size={18}
                  style={{ color: colors.textSecondary }}
                />
                <input
                  type="text"
                  placeholder="Client name, reg number..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all shadow-sm"
                  style={{
                    backgroundColor: isDark ? "#0F172A" : "#FFFFFF",
                    borderColor: colors.border,
                    color: colors.textPrimary,
                  }}
                />
              </div>
            </div>

            {/* Category Filter */}
            <div className="flex flex-col gap-1.5">
              <label
                className="text-[10px] font-bold uppercase tracking-wider opacity-60 ml-1"
                style={{ color: colors.textSecondary }}
              >
                Category
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-2.5 text-sm rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none shadow-sm cursor-pointer"
                style={{
                  backgroundColor: isDark ? "#0F172A" : "#FFFFFF",
                  borderColor: colors.border,
                  color: colors.textPrimary,
                }}
              >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div className="flex flex-col gap-1.5">
              <label
                className="text-[10px] font-bold uppercase tracking-wider opacity-60 ml-1"
                style={{ color: colors.textSecondary }}
              >
                Payment Status
              </label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-4 py-2.5 text-sm rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none shadow-sm cursor-pointer"
                style={{
                  backgroundColor: isDark ? "#0F172A" : "#FFFFFF",
                  borderColor: colors.border,
                  color: colors.textPrimary,
                }}
              >
                <option value="">All Status</option>
                <option value="Pending">Pending</option>
                <option value="Processing">Processing</option>
                <option value="Paid">Paid</option>
              </select>
            </div>

            {/* Date Range - Improved for Mobile */}
            <div className="flex flex-col gap-1.5">
              <label
                className="text-[10px] font-bold uppercase tracking-wider opacity-60 ml-1"
                style={{ color: colors.textSecondary }}
              >
                Date Range
              </label>
              <div className="grid grid-cols-2 gap-2">
                <div className="relative">
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-2 py-2.5 text-xs sm:text-sm rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                    style={{
                      backgroundColor: isDark ? "#0F172A" : "#FFFFFF",
                      borderColor: colors.border,
                      color: colors.textPrimary,
                    }}
                  />
                </div>
                <div className="relative">
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-2 py-2.5 text-xs sm:text-sm rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                    style={{
                      backgroundColor: isDark ? "#0F172A" : "#FFFFFF",
                      borderColor: colors.border,
                      color: colors.textPrimary,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard
            title="Total Services"
            value={services.length}
            icon={<FiTool />}
            colors={colors}
          />
          <StatCard
            title="Filtered Results"
            value={filtered.length}
            icon={<FiFileText />}
            colors={colors}
          />
          <StatCard
            title="Total Revenue"
            value={`₹${totalRevenue.toFixed(2)}`}
            icon={<FaRupeeSign />}
            colors={colors}
          />
        </div>

        {/* Table Container */}
        <div
          className="rounded-xl border shadow-sm overflow-hidden"
          style={{ backgroundColor: colors.cardBg, borderColor: colors.border }}
        >
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent"></div>
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center">
              <FiAlertCircle
                size={48}
                className="mx-auto mb-4 opacity-20"
                style={{ color: colors.textSecondary }}
              />
              <h3
                className="text-lg font-medium mb-2"
                style={{ color: colors.textPrimary }}
              >
                No services found
              </h3>
              <p
                className="text-sm mb-6"
                style={{ color: colors.textSecondary }}
              >
                {search ||
                selectedCategory ||
                selectedStatus ||
                startDate ||
                endDate
                  ? "Try adjusting your search filters."
                  : "Get started by creating a new service record."}
              </p>
              <Link
                to="/services/new"
                className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all"
                style={{
                  backgroundColor: colors.hoverBg,
                  color: colors.accent,
                }}
              >
                <FiPlus size={16} /> Create Service
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
                      className="p-4 text-xs font-bold uppercase tracking-wider whitespace-nowrap"
                      style={{ color: colors.textSecondary }}
                    >
                      Service Type
                    </th>
                    <th
                      className="p-4 text-xs font-bold uppercase tracking-wider whitespace-nowrap"
                      style={{ color: colors.textSecondary }}
                    >
                      Client / Vehicle
                    </th>
                    <th
                      className="p-4 text-xs font-bold uppercase tracking-wider whitespace-nowrap hidden md:table-cell"
                      style={{ color: colors.textSecondary }}
                    >
                      Date
                    </th>
                    <th
                      className="p-4 text-xs font-bold uppercase tracking-wider whitespace-nowrap hidden lg:table-cell"
                      style={{ color: colors.textSecondary }}
                    >
                      WhatsApp Status
                    </th>
                    <th
                      className="p-4 text-xs font-bold uppercase tracking-wider text-right whitespace-nowrap"
                      style={{ color: colors.textSecondary }}
                    >
                      Amount
                    </th>
                    <th
                      className="p-4 text-xs font-bold uppercase tracking-wider text-center"
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
                  {filtered.map((s) => {
                    const estimatedTotal =
                      Number(s.cost) ||
                      Number(s.partsCost || 0) + Number(s.laborCost || 0);

                    return (
                      <tr
                        key={s.id}
                        className="transition-colors group"
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.backgroundColor =
                            colors.hoverBg)
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.backgroundColor =
                            "transparent")
                        }
                      >
                        {/* Service Type */}
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
                              <FiTool
                                size={16}
                                style={{ color: colors.accent }}
                              />
                            </div>
                            <div>
                              <p
                                className="font-bold text-sm"
                                style={{ color: colors.textPrimary }}
                              >
                                {s.subService?.name ||
                                  s.type ||
                                  "General Service"}
                              </p>
                              <p
                                className="text-xs"
                                style={{ color: colors.textSecondary }}
                              >
                                {s.category?.name || "Uncategorized"}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Client */}
                        <td className="p-4">
                          <p
                            className="font-medium text-sm"
                            style={{ color: colors.textPrimary }}
                          >
                            {s.client?.fullName || "Unknown Client"}
                          </p>
                          <p
                            className="text-xs flex items-center gap-1"
                            style={{ color: colors.textSecondary }}
                          >
                            <FiTag size={10} /> {s.client?.regNumber || "N/A"}
                          </p>
                        </td>

                        {/* Date */}
                        <td className="p-4 hidden md:table-cell">
                          <p
                            className="text-sm"
                            style={{ color: colors.textPrimary }}
                          >
                            {new Date(s.date).toLocaleDateString("en-IN", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })}
                          </p>
                        </td>

                        {/* WhatsApp Status */}
                        <td className="p-4 hidden lg:table-cell">
                          {getApprovalBadge(s.approvalStatus)}
                        </td>

                        {/* Amount */}
                        <td className="p-4 text-right">
                          <p
                            className="text-sm font-bold"
                            style={{ color: colors.textPrimary }}
                          >
                            ₹{estimatedTotal.toFixed(2)}
                          </p>
                        </td>

                        {/* Status Badge */}
                        <td className="p-4 text-center">
                          {getStatusBadge(s.status)}
                        </td>

                        {/* Actions */}
                        <td className="p-4 text-right">
                          <button
                            onClick={() => navigate(`/services/${s.id}`)}
                            className="inline-flex items-center justify-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all hover:shadow-sm"
                            style={{
                              backgroundColor: isDark
                                ? "rgba(59, 130, 246, 0.1)"
                                : "#EFF6FF",
                              color: colors.accent,
                              borderColor: isDark
                                ? "rgba(59, 130, 246, 0.3)"
                                : "#BFDBFE",
                            }}
                          >
                            <FaEye size={12} /> View
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, colors }) {
  return (
    <div
      className="rounded-xl border shadow-sm p-4 flex items-center justify-between"
      style={{ backgroundColor: colors.cardBg, borderColor: colors.border }}
    >
      <div>
        <p
          className="text-xs font-bold uppercase tracking-wider mb-1"
          style={{ color: colors.textSecondary }}
        >
          {title}
        </p>
        <p className="text-2xl font-bold" style={{ color: colors.textPrimary }}>
          {value}
        </p>
      </div>
      <div
        className="w-10 h-10 rounded-lg flex items-center justify-center opacity-80"
        style={{
          backgroundColor: isDarkModeBg(colors.cardBg),
          color: colors.accent,
        }}
      >
        {icon}
      </div>
    </div>
  );
}

// Helper to determine icon bg opacity based on card color
function isDarkModeBg(bg) {
  return bg === "#1E293B" ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)";
}
