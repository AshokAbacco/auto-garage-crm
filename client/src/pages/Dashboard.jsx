// client/src/pages/Dashboard.jsx
import React, { useState, useEffect, Suspense, lazy, useMemo } from "react";
import { motion } from "framer-motion";
import {
  TrendingUp,
  Users,
  Wrench,
  IndianRupee,
  Clock,
  Calendar,
  AlertCircle,
  Star,
  ChevronRight,
  MoreHorizontal,
} from "lucide-react";
import { useTheme } from "../contexts/ThemeContext";

const API_URL = import.meta.env.VITE_API_BASE_URL;

// Define fetchWithAuth function
const getAuthToken = () => localStorage.getItem("token");

const fetchWithAuth = async (url) => {
  const token = getAuthToken();
  if (!token) throw new Error("No authentication token found");

  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (response.status === 401) {
    localStorage.removeItem("token");
    window.location.href = "/login";
  }

  return response;
};

// Lazy load entire chart components
const RevenueChart = lazy(() => import("../components/Dashboard/RevenueChart"));
const ServiceTypesPieChart = lazy(() =>
  import("../components/Dashboard/ServiceTypesPieChart")
);
const WeeklyAppointmentsChart = lazy(() =>
  import("../components/Dashboard/WeeklyAppointmentsChart")
);
const CustomerOverviewChart = lazy(() =>
  import("../components/Dashboard/CustomerOverviewChart")
);

// Memoize StatCard
const StatCard = React.memo(
  ({
    title,
    value,
    change,
    icon: Icon,
    color = "blue",
    formatValue = false,
  }) => {
    const { isDark } = useTheme();
    const colors = {
      // Backgrounds
      layoutBg: isDark ? "#020617" : "#FFFFFF", // Sidebar/Header BG
      mainBg: isDark ? "#020617" : "#F8FAFC", // Page Content BG
      elementBg: isDark ? "#01204E" : "#FFFFFF", // Dropdowns/Modals

      // Text
      textPrimary: isDark ? "#E5E7EB" : "#0F172A",
      textSecondary: isDark ? "#94A3B8" : "#475569",

      // Brand & Accents
      brand: isDark ? "#1E3A8A" : "#0B1D51",
      primaryButton: isDark ? "#3B82F6" : "#0046FF", // Blue Color for Active Tab

      // Borders & Hover
      border: isDark ? "#1E293B" : "#E5E7EB",
      hoverBg: isDark ? "#1E293B" : "#F8FAFC",
    };

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="rounded-2xl p-6 shadow-lg border transition-all duration-300"
        style={{
          backgroundColor: colors.elementBg,
          borderColor: colors.border,
        }}
      >
        <div className="flex items-center justify-between mb-4">
          <div
            className={`p-3 rounded-xl shadow-md bg-gradient-to-r from-${color}-500 to-${color}-600`}
          >
            <Icon className="w-6 h-6 text-white" />
          </div>
          {change !== undefined && (
            <div
              className={`flex items-center text-sm font-medium ${
                change > 0 ? "text-green-500" : "text-red-500"
              }`}
            >
              <TrendingUp className="w-4 h-4 mr-1" />
              {change > 0 ? "+" : ""}
              {change}%
            </div>
          )}
        </div>
        <h3
          className="text-2xl font-bold mb-1"
          style={{ color: colors.textPrimary }}
        >
          {formatValue ? `₹${value.toLocaleString()}` : value}
        </h3>
        <p className="text-sm" style={{ color: colors.textSecondary }}>
          {title}
        </p>
      </motion.div>
    );
  }
);

// Memoize ChartCard
const ChartCard = React.memo(({ title, children, subtitle, action }) => {
  const { isDark } = useTheme();
  const colors = {
    // Backgrounds
    layoutBg: isDark ? "#020617" : "#FFFFFF", // Sidebar/Header BG
    mainBg: isDark ? "#020617" : "#F8FAFC", // Page Content BG
    elementBg: isDark ? "#01204E" : "#FFFFFF", // Dropdowns/Modals

    // Text
    textPrimary: isDark ? "#E5E7EB" : "#0F172A",
    textSecondary: isDark ? "#94A3B8" : "#475569",

    // Brand & Accents
    brand: isDark ? "#1E3A8A" : "#0B1D51",
    primaryButton: isDark ? "#3B82F6" : "#0046FF", // Blue Color for Active Tab

    // Borders & Hover
    border: isDark ? "#1E293B" : "#E5E7EB",
    hoverBg: isDark ? "#1E293B" : "#F8FAFC",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="rounded-2xl p-6 shadow-lg border transition-all duration-300"
      style={{
        backgroundColor: colors.elementBg,
        borderColor: colors.border,
      }}
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3
            className="text-lg font-semibold"
            style={{ color: colors.textPrimary }}
          >
            {title}
          </h3>
          {subtitle && (
            <p className="text-sm mt-1" style={{ color: colors.textSecondary }}>
              {subtitle}
            </p>
          )}
        </div>
        {action && (
          <button
            className="transition-colors hover:opacity-75"
            style={{ color: colors.textSecondary }}
          >
            <MoreHorizontal className="w-5 h-5" />
          </button>
        )}
      </div>
      {children}
    </motion.div>
  );
});

// Memoize AppointmentCard
const AppointmentCard = React.memo(
  ({ name, time, service, status, avatar, onClick }) => {
    const { isDark } = useTheme();
    const colors = {
      // Backgrounds
      layoutBg: isDark ? "#020617" : "#FFFFFF", // Sidebar/Header BG
      mainBg: isDark ? "#020617" : "#F8FAFC", // Page Content BG
      elementBg: isDark ? "#01204E" : "#FFFFFF", // Dropdowns/Modals

      // Text
      textPrimary: isDark ? "#E5E7EB" : "#0F172A",
      textSecondary: isDark ? "#94A3B8" : "#475569",

      // Brand & Accents
      brand: isDark ? "#1E3A8A" : "#0B1D51",
      primaryButton: isDark ? "#3B82F6" : "#0046FF", // Blue Color for Active Tab

      // Borders & Hover
      border: isDark ? "#1E293B" : "#E5E7EB",
      hoverBg: isDark ? "#1E293B" : "#F8FAFC",
    };

    return (
      <motion.div
        whileHover={{ y: -5 }}
        className="flex items-center justify-between p-4 rounded-xl transition-colors cursor-pointer"
        style={{
          // Use itemBg to distinguish list items from the card background
          backgroundColor: colors.mainBg,
        }}
        onClick={onClick}
      >
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold shadow-md">
            {avatar}
          </div>
          <div>
            <p className="font-medium" style={{ color: colors.textPrimary }}>
              {name}
            </p>
            <p className="text-sm" style={{ color: colors.textSecondary }}>
              {service}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p
            className="text-sm font-medium"
            style={{ color: colors.textPrimary }}
          >
            {time}
          </p>
          <span
            className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
              status === "Completed"
                ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                : status === "In Progress"
                ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                : "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
            }`}
          >
            {status}
          </span>
        </div>
      </motion.div>
    );
  }
);

// Memoize QuickStat
const QuickStat = React.memo(({ icon: Icon, title, value, color }) => {
  const { isDark } = useTheme();
  const colors = {
    // Backgrounds
    layoutBg: isDark ? "#020617" : "#FFFFFF", // Sidebar/Header BG
    mainBg: isDark ? "#020617" : "#F8FAFC", // Page Content BG
    elementBg: isDark ? "#020D36" : "#FFFFFF", // Dropdowns/Modals

    // Text
    textPrimary: isDark ? "#E5E7EB" : "#0F172A",
    textSecondary: isDark ? "#94A3B8" : "#475569",

    // Brand & Accents
    brand: isDark ? "#1E3A8A" : "#0B1D51",
    primaryButton: isDark ? "#3B82F6" : "#0046FF", // Blue Color for Active Tab

    // Borders & Hover
    border: isDark ? "#1E293B" : "#E5E7EB",
    hoverBg: isDark ? "#1E293B" : "#F8FAFC",
  };

  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      className="flex items-center justify-between p-4 rounded-xl transition-colors"
      style={{
        backgroundColor: colors.mainBg,
      }}
    >
      <div className="flex items-center space-x-3">
        <div
          className={`p-2 rounded-lg ${
            isDark ? `bg-${color}-900/30` : `bg-${color}-50`
          }`}
        >
          <Icon
            className={`w-5 h-5 ${
              isDark ? `text-${color}-400` : `text-${color}-600`
            }`}
          />
        </div>
        <span style={{ color: colors.textSecondary }}>{title}</span>
      </div>
      <span className="font-bold" style={{ color: colors.textPrimary }}>
        {value}
      </span>
    </motion.div>
  );
});

// Chart Loading Component
const ChartLoading = () => {
  const { isDark } = useTheme();
  const colors = {
    // Backgrounds
    layoutBg: isDark ? "#020617" : "#FFFFFF", // Sidebar/Header BG
    mainBg: isDark ? "#020617" : "#F8FAFC", // Page Content BG
    elementBg: isDark ? "#020D36" : "#FFFFFF", // Dropdowns/Modals

    // Text
    textPrimary: isDark ? "#E5E7EB" : "#0F172A",
    textSecondary: isDark ? "#94A3B8" : "#475569",

    // Brand & Accents
    brand: isDark ? "#1E3A8A" : "#0B1D51",
    primaryButton: isDark ? "#3B82F6" : "#0046FF", // Blue Color for Active Tab

    // Borders & Hover
    border: isDark ? "#1E293B" : "#E5E7EB",
    hoverBg: isDark ? "#1E293B" : "#F8FAFC",
  };

  return (
    <div
      className="flex items-center justify-center h-64"
      style={{ backgroundColor: colors.mainBg }}
    >
      <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
};

export default function Dashboard() {
  const { isDark } = useTheme();
  const colors = {
    // Backgrounds
    layoutBg: isDark ? "#020617" : "#FFFFFF", // Sidebar/Header BG
    mainBg: isDark ? "#020617" : "#F8FAFC", // Page Content BG
    elementBg: isDark ? "#020D36" : "#FFFFFF", // Dropdowns/Modals

    // Text
    textPrimary: isDark ? "#E5E7EB" : "#0F172A",
    textSecondary: isDark ? "#94A3B8" : "#475569",

    // Brand & Accents
    brand: isDark ? "#1E3A8A" : "#0B1D51",
    primaryButton: isDark ? "#3B82F6" : "#0046FF", // Blue Color for Active Tab

    // Borders & Hover
    border: isDark ? "#1E293B" : "#E5E7EB",
    hoverBg: isDark ? "#1E293B" : "#F8FAFC",
  };

  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await fetchWithAuth(`${API_URL}/api/dashboard`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to fetch dashboard data");
        }

        setDashboardData(data);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const chartData = useMemo(() => {
    if (!dashboardData) return null;

    return {
      monthlyRevenue: dashboardData.charts.monthlyRevenue,
      serviceTypes: dashboardData.charts.serviceTypes,
      weeklyAppointments: dashboardData.charts.weeklyAppointments,
    };
  }, [dashboardData]);

  if (loading) {
    return (
      <div
        className="min-h-screen w-full lg:pl-20 p-6 flex items-center justify-center transition-colors duration-300"
        style={{ backgroundColor: colors.mainBg }}
      >
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4" style={{ color: colors.textSecondary }}>
            Loading dashboard...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="min-h-screen w-full lg:pl-20 p-6 flex items-center justify-center"
        style={{ backgroundColor: colors.mainBg }}
      >
        <div
          className="text-center p-8 rounded-xl max-w-md"
          style={{
            backgroundColor: isDark ? "rgba(127, 29, 29, 0.2)" : "#FEF2F2",
          }}
        >
          <div className="text-5xl mb-4 text-red-500">⚠️</div>
          <h2 className="text-xl font-bold mb-2 text-red-600 dark:text-red-400">
            Error Loading Dashboard
          </h2>
          <p className="text-red-500 dark:text-red-300">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 rounded-lg transition-colors text-white bg-red-600 hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return null;
  }

  const { stats, data: dashboardContent } = dashboardData;

  return (
    <div
      className="min-h-screen w-full lg:pl-20 p-1 transition-colors duration-300"
      style={{ backgroundColor: colors.mainBg }}
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1
              className="text-3xl font-bold"
              style={{ color: colors.textPrimary }}
            >
              Dashboard Overview
            </h1>
            <p className="mt-1" style={{ color: colors.textSecondary }}>
              Welcome back! Here's what's happening in your garage today.
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm" style={{ color: colors.textSecondary }}>
                Today
              </p>
              <p
                className="font-semibold"
                style={{ color: colors.textPrimary }}
              >
                {new Date().toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Revenue"
          value={stats.totalRevenue}
          change={12}
          icon={IndianRupee}
          color="blue"
          formatValue={true}
        />
        <StatCard
          title="Total Services"
          value={stats.totalServices}
          change={8}
          icon={Wrench}
          color="blue"
        />
        <StatCard
          title="Avg Service Time"
          value={stats.avgServiceTime}
          change={-5}
          icon={Clock}
          color="blue"
        />
        <StatCard
          title="Customer Rating"
          value={stats.customerRating}
          icon={Star}
          color="blue"
        />
      </div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Revenue Chart */}
        <div className="lg:col-span-2">
          <ChartCard
            title="Revenue & Services"
            subtitle="Monthly overview of revenue and completed services"
          >
            <Suspense fallback={<ChartLoading />}>
              {chartData && (
                <RevenueChart data={chartData.monthlyRevenue} isDark={isDark} />
              )}
            </Suspense>
          </ChartCard>
        </div>

        {/* Service Types Pie Chart */}
        <ChartCard
          title="Service Distribution"
          subtitle="Popular service types this month"
        >
          <Suspense fallback={<ChartLoading />}>
            {chartData && (
              <ServiceTypesPieChart
                data={chartData.serviceTypes}
                isDark={isDark}
              />
            )}
          </Suspense>
        </ChartCard>
      </div>

      {/* Secondary Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Weekly Appointments */}
        <ChartCard
          title="Weekly Appointments"
          subtitle="Appointments scheduled vs completed this week"
        >
          <Suspense fallback={<ChartLoading />}>
            {chartData && (
              <WeeklyAppointmentsChart
                data={chartData.weeklyAppointments}
                isDark={isDark}
              />
            )}
          </Suspense>
        </ChartCard>

        {/* Customer Overview */}
        <ChartCard
          title="Customer Overview"
          subtitle="New vs returning customers"
        >
          <div className="grid grid-cols-2 gap-6 mb-6">
            <div
              className="text-center p-4 rounded-xl"
              style={{
                backgroundColor: isDark ? "rgba(30, 58, 138, 0.3)" : "#EFF6FF",
              }} // Blue-50 equivalent
            >
              <div
                className="text-3xl font-bold mb-2"
                style={{ color: isDark ? "#60A5FA" : "#2563EB" }} // Blue-400/600
              >
                {stats.totalClients}
              </div>
              <div className="text-sm" style={{ color: colors.textSecondary }}>
                Total Customers
              </div>
            </div>
            <div
              className="text-center p-4 rounded-xl"
              style={{
                backgroundColor: isDark ? "rgba(20, 83, 45, 0.3)" : "#F0FDF4",
              }} // Green-50 equivalent
            >
              <div
                className="text-3xl font-bold mb-2"
                style={{ color: isDark ? "#4ADE80" : "#16A34A" }} // Green-400/600
              >
                {stats.upcomingReminders}
              </div>
              <div className="text-sm" style={{ color: colors.textSecondary }}>
                Upcoming Reminders
              </div>
            </div>
          </div>
          <Suspense fallback={<ChartLoading />}>
            {chartData && (
              <CustomerOverviewChart
                data={chartData.monthlyRevenue}
                isDark={isDark}
              />
            )}
          </Suspense>
        </ChartCard>
      </div>

      {/* Appointments and Quick Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Appointments */}
        <div className="lg:col-span-2">
          <ChartCard
            title="Today's Appointments"
            subtitle="Scheduled appointments for today"
            action={
              <button
                className="text-sm font-medium flex items-center transition-colors"
                style={{ color: colors.primaryButton }}
              >
                View All <ChevronRight className="w-4 h-4 ml-1" />
              </button>
            }
          >
            <div className="space-y-3">
              {dashboardContent.todayAppointments.length > 0 ? (
                dashboardContent.todayAppointments.map((appointment) => (
                  <AppointmentCard
                    key={appointment.id}
                    name={appointment.name}
                    time={appointment.time}
                    service={appointment.service}
                    status={appointment.status}
                    avatar={appointment.avatar}
                    onClick={() =>
                      console.log("View appointment:", appointment.id)
                    }
                  />
                ))
              ) : (
                <div
                  className="text-center py-8"
                  style={{ color: colors.textSecondary }}
                >
                  <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No appointments scheduled for today</p>
                </div>
              )}
            </div>
          </ChartCard>
        </div>

        {/* Quick Stats */}
        <ChartCard title="Quick Stats" subtitle="Key metrics at a glance">
          <div className="space-y-4">
            <QuickStat
              icon={Users}
              title="Active Clients"
              value={stats.totalClients}
              color="blue"
            />
            <QuickStat
              icon={Wrench}
              title="Services This Month"
              value={stats.totalServices}
              color="blue"
            />
            <QuickStat
              icon={Calendar}
              title="Pending Reminders"
              value={stats.upcomingReminders}
              color="blue"
            />
            <QuickStat
              icon={AlertCircle}
              title="Overdue Bills"
              value={stats.overdueRevenue > 0 ? "Yes" : "No"}
              color="blue"
            />
          </div>
        </ChartCard>
      </div>
    </div>
  );
}
