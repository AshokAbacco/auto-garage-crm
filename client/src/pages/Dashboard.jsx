import React, { useState, useEffect, Suspense, lazy, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  IndianRupee,
  Wrench,
  Users,
  AlertCircle,
  Clock,
  Calendar,
  CheckCircle,
  Star,
  ChevronRight,
} from "lucide-react";
// Ensure this path matches your actual project structure
import { useTheme } from "../contexts/ThemeContext";

const API_URL = import.meta.env.VITE_API_BASE_URL;

const RevenueChart = lazy(() => import("../components/Dashboard/RevenueChart"));
const Appointments30DaysChart = lazy(
  () => import("../components/Dashboard/WeeklyAppointmentsChart"),
);
const ServiceStatusPieChart = lazy(
  () => import("../components/Dashboard/ServiceTypesPieChart"),
);
const ReviewAnalyticsChart = lazy(
  () => import("../components/Dashboard/CustomerOverviewChart"),
);

const getAuthToken = () => localStorage.getItem("token");

const fetchWithAuth = async (url) => {
  const token = getAuthToken();
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (response.status === 401) {
    localStorage.removeItem("token");
    window.location.href = "/login";
  }

  return response;
};

/**
 * THEME-AWARE STAT CARD
 * Adapts background, text, and borders based on theme.
 */
const StatCard = ({
  title,
  value,
  icon: Icon,
  isCurrency = false,
  colorClass = "text-blue-600",
  colors, // Theme colors passed as prop
}) => {
  const safeValue =
    typeof value === "number" || typeof value === "string" ? value : 0;

  return (
    <div
      className="rounded-xl border shadow-sm transition-all duration-200 hover:shadow-md"
      style={{
        backgroundColor: colors.cardBg,
        borderColor: colors.border,
      }}
    >
      <div className="flex items-start justify-between p-5">
        <div>
          <p
            className="text-xs font-bold uppercase tracking-wider"
            style={{ color: colors.textSecondary }}
          >
            {title}
          </p>
          <h3
            className="mt-2 text-2xl font-bold"
            style={{ color: colors.textPrimary }}
          >
            {isCurrency ? (
              <span className="flex items-baseline">
                <span className="mr-0.5 text-lg font-medium opacity-70">₹</span>
                {Number(safeValue).toLocaleString()}
              </span>
            ) : (
              Number(safeValue).toLocaleString()
            )}
          </h3>
        </div>

        <div
          className={`rounded-lg p-2.5 ${colorClass}`}
          style={{
            // Use a subtle background for the icon container based on theme
            backgroundColor: isDarkModeBg(colors.cardBg),
          }}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
};

// Helper to determine icon bg opacity based on card color
function isDarkModeBg(bg) {
  return bg === "#1E293B" ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)";
}

export default function Dashboard() {
  const { isDark } = useTheme();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Define colors based on theme
  const colors = useMemo(
    () => ({
      mainBg: isDark ? "#020617" : "#F8FAFC", // Page background
      cardBg: isDark ? "#1E293B" : "#FFFFFF", // Card/Element background
      textPrimary: isDark ? "#F1F5F9" : "#0F172A",
      textSecondary: isDark ? "#94A3B8" : "#64748B",
      border: isDark ? "#334155" : "#E2E8F0",
      hoverBg: isDark ? "#0F172A" : "#F1F5F9", // For list items
      accent: "#3B82F6", // Brand blue
    }),
    [isDark],
  );

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetchWithAuth(`${API_URL}/api/dashboard`);
        const json = await res.json();
        setData(json);
      } catch (error) {
        console.error("Dashboard load failed", error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading)
    return (
      <div
        className="flex flex-col items-center justify-center min-h-screen"
        style={{ backgroundColor: colors.mainBg }}
      >
        <div
          className="h-10 w-10 animate-spin rounded-full border-4 border-t-transparent mb-4"
          style={{ borderColor: colors.accent, borderTopColor: "transparent" }}
        ></div>
        <p className="font-medium" style={{ color: colors.textSecondary }}>
          Loading Dashboard...
        </p>
      </div>
    );

  const {
    stats,
    charts,
    reviewStats = { averageRating: 0, totalReviews: 0, ratingDistribution: [] },
  } = data;

  return (
    <div
      className="lg:ml-[4rem] min-h-screen px-4 py-8 md:px-8"
      style={{ backgroundColor: colors.mainBg }}
    >
      <div className="mx-auto space-y-10">
        {/* HEADER */}
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h1
              className="text-3xl font-extrabold"
              style={{ color: colors.textPrimary }}
            >
              Dashboard
            </h1>
            <p style={{ color: colors.textSecondary }}>
              Overview of your business performance and daily tasks.
            </p>
          </div>
          <div
            className="text-sm font-medium px-4 py-2 rounded-lg border shadow-sm self-start"
            style={{
              backgroundColor: colors.cardBg,
              color: colors.textSecondary,
              borderColor: colors.border,
            }}
          >
            {new Date().toLocaleDateString("en-IN", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </div>
        </div>

        {/* SECTION: FINANCIAL KPIs */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <div
              className="h-4 w-1 rounded-full"
              style={{ backgroundColor: colors.accent }}
            ></div>
            <h2
              className="text-sm font-bold uppercase tracking-widest"
              style={{ color: colors.textSecondary }}
            >
              Financials
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Total Revenue"
              value={stats.totalRevenue}
              icon={IndianRupee}
              isCurrency
              colorClass="text-emerald-600"
              colors={colors}
            />
            <StatCard
              title="Pending"
              value={stats.pendingRevenue}
              icon={Clock}
              isCurrency
              colorClass="text-amber-600"
              colors={colors}
            />
            <StatCard
              title="Overdue"
              value={stats.overdueRevenue}
              icon={AlertCircle}
              isCurrency
              colorClass="text-rose-600"
              colors={colors}
            />
            <StatCard
              title="Total Invoices"
              value={stats.totalInvoices}
              icon={CheckCircle}
              colorClass="text-blue-600"
              colors={colors}
            />
          </div>
        </section>

        {/* SECTION: OPERATIONS & CUSTOMERS */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          <div className="space-y-4">
            <h2
              className="text-sm font-bold uppercase tracking-widest"
              style={{ color: colors.textSecondary }}
            >
              Operations
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <StatCard
                title="Total Services"
                value={stats.totalServices}
                icon={Wrench}
                colors={colors}
              />
              <StatCard
                title="Active"
                value={stats.activeServices}
                icon={Clock}
                colors={colors}
              />
            </div>
          </div>
          <div className="space-y-4">
            <h2
              className="text-sm font-bold uppercase tracking-widest"
              style={{ color: colors.textSecondary }}
            >
              Customer Satisfaction
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <StatCard
                title="Total Clients"
                value={stats.totalClients}
                icon={Users}
                colors={colors}
              />
              <StatCard
                title="Avg Rating"
                value={reviewStats.averageRating.toFixed(1)}
                icon={Star}
                colorClass="text-yellow-500"
                colors={colors}
              />
            </div>
          </div>
        </div>

        {/* CHARTS ROW 1 */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div
            className="rounded-2xl border p-6 lg:col-span-2 shadow-sm"
            style={{
              backgroundColor: colors.cardBg,
              borderColor: colors.border,
            }}
          >
            <h3
              className="mb-6 text-lg font-bold"
              style={{ color: colors.textPrimary }}
            >
              Revenue Trend
            </h3>
            <Suspense
              fallback={
                <div
                  className="h-72 w-full animate-pulse rounded-lg"
                  style={{ backgroundColor: colors.hoverBg }}
                />
              }
            >
              {/* Pass isDark state to chart */}
              <RevenueChart data={charts.monthlyRevenue} isDark={isDark} />
            </Suspense>
          </div>
          <div
            className="rounded-2xl border p-6 shadow-sm"
            style={{
              backgroundColor: colors.cardBg,
              borderColor: colors.border,
            }}
          >
            <h3
              className="mb-6 text-lg font-bold"
              style={{ color: colors.textPrimary }}
            >
              Service Status
            </h3>
            <Suspense
              fallback={
                <div
                  className="h-72 w-full animate-pulse rounded-lg"
                  style={{ backgroundColor: colors.hoverBg }}
                />
              }
            >
              <ServiceStatusPieChart
                data={charts.serviceStatusDistribution}
                isDark={isDark}
              />
            </Suspense>
          </div>
        </div>

        {/* CHARTS ROW 2 & TODAY'S PANEL */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div
            className="rounded-2xl border p-6 shadow-sm"
            style={{
              backgroundColor: colors.cardBg,
              borderColor: colors.border,
            }}
          >
            <h3
              className="mb-6 text-lg font-bold"
              style={{ color: colors.textPrimary }}
            >
              Appointment Planning (30 Days)
            </h3>
            <Suspense
              fallback={
                <div
                  className="h-72 w-full animate-pulse rounded-lg"
                  style={{ backgroundColor: colors.hoverBg }}
                />
              }
            >
              <Appointments30DaysChart
                data={charts.appointments30Days}
                isDark={isDark}
              />
            </Suspense>
          </div>

          <div
            className="flex flex-col rounded-2xl border overflow-hidden shadow-sm"
            style={{
              backgroundColor: colors.cardBg,
              borderColor: colors.border,
            }}
          >
            {/* Header */}
            <div
              className="p-6"
              style={{ borderBottom: `1px solid ${colors.border}` }}
            >
              <h3
                className="text-lg font-bold"
                style={{ color: colors.textPrimary }}
              >
                Today's Services
              </h3>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-6">
              {data.data.todayAppointments.length === 0 ? (
                <div
                  className="flex flex-col items-center justify-center h-full py-10"
                  style={{ color: colors.textSecondary }}
                >
                  <Calendar className="h-10 w-10 mb-2 opacity-20" />
                  <p className="font-medium">
                    No services scheduled for today.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {data.data.todayAppointments.map((item) => (
                    <div
                      key={item.id}
                      className="group flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border p-4 transition-all hover:shadow-md"
                      style={{
                        backgroundColor: colors.hoverBg,
                        borderColor: colors.border,
                      }}
                    >
                      {/* Left Side: Avatar & Info */}
                      <div className="flex items-center gap-4">
                        <div
                          className="hidden h-12 w-12 shrink-0 items-center justify-center rounded-full border font-bold shadow-sm sm:flex"
                          style={{
                            backgroundColor: colors.cardBg,
                            borderColor: colors.border,
                            color: "#2563EB", // Brand Blue
                          }}
                        >
                          {item.name.charAt(0)}
                        </div>

                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                            <p
                              className="font-bold text-base leading-tight"
                              style={{ color: colors.textPrimary }}
                            >
                              {item.name}
                            </p>
                            <span
                              className="text-sm font-medium px-2 py-0.5 rounded-md border"
                              style={{
                                color: "#2563EB",
                                backgroundColor: isDark
                                  ? "rgba(37, 99, 235, 0.15)"
                                  : "#EFF6FF",
                                borderColor: isDark
                                  ? "rgba(37, 99, 235, 0.3)"
                                  : "#BFDBFE",
                              }}
                            >
                              {item.phone}
                            </span>
                          </div>

                          <div
                            className="flex items-center text-xs font-medium"
                            style={{ color: colors.textSecondary }}
                          >
                            <span className="uppercase tracking-wider">
                              {item.vehicle}
                            </span>
                            <span className="mx-2 opacity-50">•</span>
                            <span
                              className="px-1.5 py-0.5 rounded"
                              style={{
                                color: colors.textPrimary,
                                backgroundColor: isDark
                                  ? "rgba(255,255,255,0.05)"
                                  : "#E2E8F0",
                              }}
                            >
                              {item.regNumber}
                            </span>
                          </div>

                          <p
                            className="text-xs"
                            style={{ color: colors.textSecondary }}
                          >
                            {item.service}
                          </p>
                        </div>
                      </div>

                      {/* Right Side: Time & Status */}
                      <div
                        className="flex items-center justify-between sm:justify-end border-t pt-3 sm:border-0 sm:pt-0"
                        style={{ borderColor: colors.border }}
                      >
                        <span
                          className="text-xs font-bold uppercase tracking-tighter sm:hidden"
                          style={{ color: colors.textSecondary }}
                        >
                          Schedule
                        </span>
                        <div className="flex flex-col items-end gap-2">
                          <div
                            className="text-sm font-bold px-3 py-1.5 rounded-lg shadow-sm border"
                            style={{
                              color: colors.textPrimary,
                              backgroundColor: colors.cardBg,
                              borderColor: colors.border,
                            }}
                          >
                            {item.time}
                          </div>
                          <span
                            className="inline-block rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider border"
                            style={{
                              backgroundColor: isDark
                                ? "rgba(59, 130, 246, 0.2)"
                                : "#DBEAFE",
                              color: "#3B82F6",
                              borderColor: isDark
                                ? "rgba(59, 130, 246, 0.4)"
                                : "#BFDBFE",
                            }}
                          >
                            {item.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer Button */}
            <button
              className="flex items-center justify-center gap-2 border-t py-4 text-sm font-semibold transition-colors"
              style={{
                borderColor: colors.border,
                color: colors.accent,
                backgroundColor: "transparent",
              }}
              onClick={() => navigate("/reminders")} // Navigation Logic Here
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = colors.hoverBg)
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = "transparent")
              }
            >
              View Full Schedule <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {/* ===== UPCOMING 30 DAYS ===== */}
          <div
            className="flex flex-col rounded-2xl border shadow-sm overflow-hidden"
            style={{
              borderColor: colors.border,
              backgroundColor: colors.cardBg,
            }}
          >
            {/* Header */}
            <div
              className="border-b p-6"
              style={{ borderBottomColor: colors.border }}
            >
              <h3
                className="text-lg font-bold"
                style={{ color: colors.textPrimary }}
              >
                Upcoming 30 Days
              </h3>
            </div>

            {/* Content Area */}
            <div
              className="flex-1 overflow-y-auto p-4 md:p-6"
              style={{ backgroundColor: colors.cardBg }}
            >
              {!data.data.upcomingAppointments?.length ? (
                <div
                  className="flex flex-col items-center justify-center h-full py-10"
                  style={{ color: colors.textSecondary }}
                >
                  <Calendar className="h-10 w-10 mb-2 opacity-20" />
                  <p className="font-medium">No upcoming appointments.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {data.data.upcomingAppointments.map((item) => (
                    <div
                      key={item.id}
                      className="group flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border p-4 transition-all hover:shadow-md"
                      style={{
                        backgroundColor: colors.hoverBg,
                        borderColor: colors.border,
                      }}
                      // Optional: Add specific hover styles if needed via onMouseEnter/Leave or a specific class
                      // Note: Tailwind hover classes won't affect inline styles, so base colors are set here.
                    >
                      {/* Left Side: Avatar & Info */}
                      <div className="flex items-center gap-4">
                        <div
                          className="hidden h-12 w-12 shrink-0 items-center justify-center rounded-full border font-bold shadow-sm sm:flex"
                          style={{
                            backgroundColor: colors.cardBg,
                            borderColor: colors.border,
                            color: "#2563EB", // Brand Blue
                          }}
                        >
                          {item.name.charAt(0)}
                        </div>

                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                            <p
                              className="font-bold text-base leading-tight"
                              style={{ color: colors.textPrimary }}
                            >
                              {item.name}
                            </p>
                            <span
                              className="text-sm font-medium px-2 py-0.5 rounded-md border"
                              style={{
                                color: "#2563EB",
                                backgroundColor: isDark
                                  ? "rgba(37, 99, 235, 0.15)"
                                  : "#EFF6FF",
                                borderColor: isDark
                                  ? "rgba(37, 99, 235, 0.3)"
                                  : "#BFDBFE",
                              }}
                            >
                              {item.phone}
                            </span>
                          </div>

                          <div
                            className="flex items-center text-xs font-medium"
                            style={{ color: colors.textSecondary }}
                          >
                            <span className="uppercase tracking-wider">
                              {item.vehicle}
                            </span>
                            <span className="mx-2 opacity-50">•</span>
                            <span
                              className="px-1.5 py-0.5 rounded"
                              style={{
                                color: colors.textPrimary,
                                backgroundColor: isDark
                                  ? "rgba(255,255,255,0.05)"
                                  : "#E2E8F0",
                              }}
                            >
                              {item.regNumber}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Right Side: Date Badge */}
                      <div
                        className="flex items-center justify-between sm:justify-end border-t pt-3 sm:border-0 sm:pt-0"
                        style={{ borderColor: colors.border }}
                      >
                        <span
                          className="text-xs font-bold uppercase tracking-tighter sm:hidden"
                          style={{ color: colors.textSecondary }}
                        >
                          Service Date
                        </span>
                        <div className="flex flex-col items-end">
                          <div
                            className="text-sm font-bold px-3 py-1.5 rounded-lg shadow-sm border"
                            style={{
                              color: colors.textPrimary,
                              backgroundColor: colors.cardBg,
                              borderColor: colors.border,
                            }}
                          >
                            {new Date(item.serviceDate).toLocaleDateString(
                              "en-IN",
                              {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              },
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
