import React, { useMemo } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
  
} from "recharts";
import { FiTrendingUp,FiCheckCircle, FiClock } from "react-icons/fi";
import { IndianRupee } from "lucide-react";
export default function BikeAnalyticsView({
  invoices = [],
  services = [],
  clients = [],
  isDark,
}) {
  const COLORS = ["#6366F1", "#10B981", "#F59E0B", "#EF4444", "#06B6D4", "#8B5CF6"];

  const paidInvoices = invoices.filter(i => i.status === "Paid");
  const pendingInvoices = invoices.filter(i => i.status === "Pending");

  const revenueSummary = {
    totalRevenue: invoices.reduce((s, i) => s + Number(i.grandTotal || 0), 0),
    paidRevenue: paidInvoices.reduce((s, i) => s + Number(i.grandTotal || 0), 0),
    pendingRevenue: pendingInvoices.reduce((s, i) => s + Number(i.grandTotal || 0), 0),
  };

  const serviceSummary = {
    totalServices: services.length,
    completedServices: services.filter(s => s.status === "Paid").length,
    pendingServices: services.filter(s => s.status === "Pending").length,
    averageServiceCost:
      services.length === 0
        ? 0
        : (
            services.reduce((s, x) => s + Number(x.cost || 0), 0) /
            services.length
          ).toFixed(2),
  };

  /* Revenue Over Time (Line Chart) */
  const revenueOverTime = useMemo(() => {
    if (!invoices.length) return [];

    const map = {};
    invoices.forEach(inv => {
      const d = new Date(inv.createdAt || Date.now());
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      map[key] = (map[key] || 0) + Number(inv.grandTotal || 0);
    });

    return Object.entries(map).map(([month, revenue]) => ({
      month,
      revenue: Number(revenue.toFixed(2)),
    }));
  }, [invoices]);

  /* Invoice Status Distribution (Pie) */
  const invoiceStatusData = [
    { name: "Paid", value: paidInvoices.length },
    { name: "Pending", value: pendingInvoices.length },
  ];

  /* Service Status Overview (Pie) */
  const serviceStatusData = [
    { name: "Completed", value: services.filter(s => s.status === "Paid").length },
    { name: "Pending", value: services.filter(s => s.status === "Pending").length },
  ];

  /* Top Services by Revenue (Bar) */
  const topServiceTypes = useMemo(() => {
    const map = {};
    services.forEach(s => {
      const name = s.subService?.name || s.category?.name || "Unknown";
      map[name] = (map[name] || 0) + Number(s.cost || 0);
    });

    return Object.entries(map)
      .map(([type, total]) => ({ type, total }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 10);
  }, [services]);

  /* Top Clients (Bar) */
  const topClients = useMemo(() => {
    const map = {};

    invoices.forEach(i => {
      const name = i.bike?.ownerName || "Unknown";
      map[name] = (map[name] || 0) + Number(i.grandTotal || 0);
    });

    return Object.entries(map)
      .map(([fullName, totalSpent]) => ({ fullName, totalSpent }))
      .sort((a, b) => b.totalSpent - a.totalSpent)
      .slice(0, 10);
  }, [invoices]);

  // Custom Tooltip for Charts
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className={`p-3 rounded-lg shadow-lg border ${
          isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
        }`}>
          <p className={`font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>
            {label}
          </p>
          <p className="text-blue-600 font-bold">
            ₹{Number(payload[0].value).toFixed(2)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-8">
      {/* Revenue Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-slide-up">
        <StatCard
          title="Total Revenue"
          value={revenueSummary.totalRevenue}
          icon={<IndianRupee size={24} />}
          gradient="from-blue-500 to-blue-600"
          isDark={isDark}
          showRupee
        />
        <StatCard
          title="Paid Revenue"
          value={revenueSummary.paidRevenue}
          icon={<FiCheckCircle size={24} />}
          gradient="from-blue-500 to-blue-600"
          isDark={isDark}
          showRupee
        />
        <StatCard
          title="Pending Revenue"
          value={revenueSummary.pendingRevenue}
          icon={<FiClock size={24} />}
          gradient="from-blue-500 to-blue-600"
          isDark={isDark}
          showRupee
        />
      </div>

      {/* Service Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 animate-slide-up" style={{ animationDelay: "100ms" }}>
        <StatCard
          title="Total Services"
          value={serviceSummary.totalServices}
          icon={<FiTrendingUp size={20} />}
          gradient="from-blue-500 to-blue-600"
          isDark={isDark}
        />
        <StatCard
          title="Completed"
          value={serviceSummary.completedServices}
          icon={<FiCheckCircle size={20} />}
          gradient="from-blue-500 to-blue-600"
          isDark={isDark}
        />
        <StatCard
          title="Pending"
          value={serviceSummary.pendingServices}
          icon={<FiClock size={20} />}
          gradient="from-blue-500 to-blue-600"
          isDark={isDark}
        />
        <StatCard
          title="Avg Service Cost"
          value={serviceSummary.averageServiceCost}
          icon={<IndianRupee size={20} />}
          gradient="from-blue-500 to-blue-600"
          isDark={isDark}
          showRupee
        />
      </div>

      {/* Revenue Over Time Chart */}
      <ChartSection
        title="Revenue Over Time"
        subtitle="Monthly revenue from invoices"
        isDark={isDark}
      >
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={revenueOverTime}>
            <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#374151" : "#e5e7eb"} />
            <XAxis 
              dataKey="month" 
              stroke={isDark ? "#9ca3af" : "#6b7280"}
              style={{ fontSize: '12px' }}
            />
            <YAxis 
              stroke={isDark ? "#9ca3af" : "#6b7280"}
              style={{ fontSize: '12px' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line 
              type="monotone" 
              dataKey="revenue" 
              stroke="#6366F1" 
              strokeWidth={3}
              dot={{ fill: "#6366F1", r: 5 }}
              activeDot={{ r: 7 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </ChartSection>

      {/* Pie Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Invoice Status Distribution */}
        <ChartSection
          title="Invoice Status Distribution"
          isDark={isDark}
        >
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie 
                data={invoiceStatusData} 
                dataKey="value" 
                nameKey="name" 
                
                outerRadius={100}
                labelLine={false}
                label={(entry) => `${entry.name}: ${entry.value}`}
              >
                {invoiceStatusData.map((e, i) => (
                  <Cell key={i} fill={COLORS[i]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </ChartSection>

        {/* Service Status Overview */}
        <ChartSection
          title="Service Status Overview"
          isDark={isDark}
        >
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie 
                data={serviceStatusData} 
                dataKey="value" 
                nameKey="name" 
                outerRadius={100} 
                
                labelLine={false}
                label={(entry) => `${entry.name}: ${entry.value}`}
              >
                {serviceStatusData.map((e, i) => (
                  <Cell key={i} fill={COLORS[i]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </ChartSection>
      </div>

      {/* Top Services Revenue */}
      <ChartSection
        title="Top Services by Revenue"
        subtitle="Highest earning service categories"
        isDark={isDark}
      >
        <ResponsiveContainer width="100%" height={400}>
          <BarChart layout="vertical" data={topServiceTypes}>
            <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#374151" : "#e5e7eb"} />
            <XAxis 
              type="number" 
              stroke={isDark ? "#9ca3af" : "#6b7280"}
              style={{ fontSize: '12px' }}
            />
            <YAxis 
              dataKey="type" 
              type="category" 
              width={150} 
              stroke={isDark ? "#9ca3af" : "#6b7280"}
              style={{ fontSize: '12px' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="total" fill="#06B6D4" radius={[0, 8, 8, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartSection>

      {/* Top Clients */}
      <ChartSection
        title="Top Clients"
        subtitle="Highest spending customers"
        isDark={isDark}
      >
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={topClients}>
            <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#374151" : "#e5e7eb"} />
            <XAxis 
              dataKey="fullName" 
              stroke={isDark ? "#9ca3af" : "#6b7280"}
              style={{ fontSize: '12px' }}
              angle={-45}
              textAnchor="end"
              height={100}
            />
            <YAxis 
              stroke={isDark ? "#9ca3af" : "#6b7280"}
              style={{ fontSize: '12px' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="totalSpent" fill="#8B5CF6" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartSection>
    </div>
  );
}

/* Stat Card Component */
function StatCard({ title, value, icon, gradient, isDark, showRupee = false }) {
  return (
    <div className={`group relative overflow-hidden p-6 rounded-2xl shadow-md hover:shadow-2xl border-2 transition-all duration-300 hover:scale-105 ${
      isDark 
        ? "bg-gray-800 border-gray-700 hover:border-gray-600" 
        : "bg-white border-gray-100 hover:border-gray-200"
    }`}>
      {/* Background Gradient Overlay */}
      <div className={`absolute inset-0 bg-gradient-to-r ${gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
      
      <div className="relative flex items-center justify-between">
        <div className="flex-1">
          <p className={`text-sm font-semibold uppercase tracking-wider mb-2 ${
            isDark ? "text-gray-400" : "text-gray-500"
          }`}>
            {title}
          </p>
          <p className={`text-3xl font-bold ${
            isDark ? "text-white" : "text-gray-900"
          }`}>
            {showRupee ? `₹ ${Number(value || 0).toFixed(2)}` : Math.round(value)}
          </p>
        </div>
        
        <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

/* Chart Section Wrapper */
function ChartSection({ title, subtitle, children, isDark }) {
  return (
    <div className={`p-6 rounded-2xl shadow-md hover:shadow-xl border-2 transition-all duration-300 ${
      isDark 
        ? "bg-gray-800 border-gray-700" 
        : "bg-white border-gray-100"
    }`}>
      <div className="mb-6">
        <h3 className={`text-xl font-bold ${
          isDark ? "text-white" : "text-gray-900"
        }`}>
          {title}
        </h3>
        {subtitle && (
          <p className={`text-sm mt-1 ${
            isDark ? "text-gray-400" : "text-gray-500"
          }`}>
            {subtitle}
          </p>
        )}
      </div>
      {children}
    </div>
  );
}