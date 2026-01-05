import React, { useMemo } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
} from "recharts";
import {
  FiDollarSign,
  FiCheckCircle,
  FiClock,
  FiTool,
  FiActivity,
  FiUsers,
  FiTrendingUp,
  FiAlertCircle,
  FiXCircle,
} from "react-icons/fi";
import { FaRupeeSign } from "react-icons/fa";

export default function AnalyticsView({ summary, invoices, isDark }) {
  // Build monthly revenue trend from invoice list
  const revenueOverTime = useMemo(() => {
    if (!invoices?.length) return [];
    const map = {};
    invoices.forEach((inv) => {
      if (!inv.createdAt || typeof inv.grandTotal !== "number") return;
      const d = new Date(inv.createdAt);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
        2,
        "0"
      )}`;
      map[key] = (map[key] || 0) + Number(inv.grandTotal || 0);
    });
    return Object.entries(map)
      .map(([month, revenue]) => ({ month, revenue }))
      .sort((a, b) => a.month.localeCompare(b.month));
  }, [invoices]);

  const serviceSummary = summary?.serviceSummary || {};

  // Calculate percentages for service status
  const totalServices = serviceSummary.totalServices || 0;
  const completedPercent =
    totalServices > 0
      ? (
          ((serviceSummary.completedServices || 0) / totalServices) *
          100
        ).toFixed(1)
      : 0;
  const pendingPercent =
    totalServices > 0
      ? (((serviceSummary.pendingServices || 0) / totalServices) * 100).toFixed(
          1
        )
      : 0;
  const cancelledPercent =
    totalServices > 0
      ? (
          ((serviceSummary.cancelledServices || 0) / totalServices) *
          100
        ).toFixed(1)
      : 0;

  // Calculate invoice status percentages
  const totalInvoices =
    summary?.invoiceStatusSummary?.reduce((acc, item) => acc + item.count, 0) ||
    0;

  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div
          className={`p-3 rounded-lg shadow-xl border ${
            isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
          }`}
        >
          <p
            className={`text-xs font-semibold ${
              isDark ? "text-gray-300" : "text-gray-700"
            } mb-1`}
          >
            {label}
          </p>
          <p className={`text-sm font-bold text-blue-900`}>
            ₹
            {payload[0].value?.toLocaleString("en-IN", {
              maximumFractionDigits: 2,
            })}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div
      className={`min-h-screen ${
        isDark ? "" : "bg-gray-50"
      }  `}
    >
      <div className="">
        {/* Header */}
        <div
          className={`rounded-2xl p-6 mb-6 shadow-lg ${
            isDark
              ? "bg-gray-800"
              : "bg-gradient-to-r from-blue-900 to-blue-800"
          }`}
        >
          <h1
            className={`text-2xl font-bold ${
              isDark ? "text-white" : "text-white"
            } mb-1`}
          >
            Analytics Dashboard
          </h1>
          <p
            className={`text-sm ${isDark ? "text-gray-300" : "text-blue-100"}`}
          >
            Track your business performance and insights
          </p>
        </div>

        {/* ===== Revenue Summary Cards ===== */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {/* Total Revenue */}
          <div
            className={`rounded-xl shadow-md p-5 hover:shadow-lg transition-shadow border ${
              isDark
                ? "bg-gray-800 border-gray-700"
                : "bg-white border-gray-100"
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div
                className={`p-3 rounded-lg ${
                  isDark ? "bg-gray-700" : "bg-blue-50"
                }`}
              >
                <FaRupeeSign
                  size={20}
                  className={isDark ? "text-blue-400" : "text-blue-900"}
                />
              </div>
              <span
                className={`text-xs font-semibold px-2 py-1 rounded ${
                  isDark
                    ? "text-blue-400 bg-gray-700"
                    : "text-blue-900 bg-blue-50"
                }`}
              >
                ALL TIME
              </span>
            </div>
            <p
              className={`text-xs font-medium ${
                isDark ? "text-gray-400" : "text-gray-500"
              } mb-1`}
            >
              Total Revenue
            </p>
            <p
              className={`text-2xl font-bold ${
                isDark ? "text-white" : "text-gray-900"
              }`}
            >
              ₹
              {(summary?.revenueSummary?.totalRevenue || 0).toLocaleString(
                "en-IN",
                { maximumFractionDigits: 2 }
              )}
            </p>
          </div>

          {/* Paid Revenue */}
          <div
            className={`rounded-xl shadow-md p-5 hover:shadow-lg transition-shadow border ${
              isDark
                ? "bg-gray-800 border-gray-700"
                : "bg-white border-gray-100"
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div
                className={`p-3 rounded-lg ${
                  isDark ? "bg-gray-700" : "bg-green-50"
                }`}
              >
                <FiCheckCircle
                  size={20}
                  className={isDark ? "text-green-400" : "text-green-600"}
                />
              </div>
              <span
                className={`text-xs font-semibold px-2 py-1 rounded ${
                  isDark
                    ? "text-green-400 bg-gray-700"
                    : "text-green-600 bg-green-50"
                }`}
              >
                RECEIVED
              </span>
            </div>
            <p
              className={`text-xs font-medium ${
                isDark ? "text-gray-400" : "text-gray-500"
              } mb-1`}
            >
              Paid Revenue
            </p>
            <p
              className={`text-2xl font-bold ${
                isDark ? "text-white" : "text-gray-900"
              }`}
            >
              ₹
              {(summary?.revenueSummary?.paidRevenue || 0).toLocaleString(
                "en-IN",
                { maximumFractionDigits: 2 }
              )}
            </p>
          </div>

          {/* Pending Revenue */}
          <div
            className={`rounded-xl shadow-md p-5 hover:shadow-lg transition-shadow border ${
              isDark
                ? "bg-gray-800 border-gray-700"
                : "bg-white border-gray-100"
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div
                className={`p-3 rounded-lg ${
                  isDark ? "bg-gray-700" : "bg-orange-50"
                }`}
              >
                <FiClock
                  size={20}
                  className={isDark ? "text-orange-400" : "text-orange-600"}
                />
              </div>
              <span
                className={`text-xs font-semibold px-2 py-1 rounded ${
                  isDark
                    ? "text-orange-400 bg-gray-700"
                    : "text-orange-600 bg-orange-50"
                }`}
              >
                PENDING
              </span>
            </div>
            <p
              className={`text-xs font-medium ${
                isDark ? "text-gray-400" : "text-gray-500"
              } mb-1`}
            >
              Pending Revenue
            </p>
            <p
              className={`text-2xl font-bold ${
                isDark ? "text-white" : "text-gray-900"
              }`}
            >
              ₹
              {(summary?.revenueSummary?.pendingRevenue || 0).toLocaleString(
                "en-IN",
                { maximumFractionDigits: 2 }
              )}
            </p>
          </div>
        </div>

        {/* ===== Revenue Trend Chart ===== */}
        <div
          className={`rounded-xl shadow-md mb-6 border ${
            isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"
          }`}
        >
          <div
            className={`border-b rounded-xl p-4 ${
              isDark ? "bg-gray-700" : "bg-blue-900"
            }`}
          >
            <div className="flex items-center gap-2">
              <FiTrendingUp
                className={isDark ? "text-white" : "text-white"}
                size={18}
              />
              <h3
                className={`text-base font-bold ${
                  isDark ? "text-white" : "text-white"
                }`}
              >
                Revenue Trend
              </h3>
            </div>
            <p
              className={`text-xs mt-1 ${
                isDark ? "text-gray-300" : "text-blue-100"
              }`}
            >
              Monthly revenue performance
            </p>
          </div>

          <div className="p-5">
            {revenueOverTime.length === 0 ? (
              <div className="text-center py-12">
                <FiAlertCircle
                  size={32}
                  className={`mx-auto mb-2 ${
                    isDark ? "text-gray-600" : "text-gray-300"
                  }`}
                />
                <p
                  className={`text-sm ${
                    isDark ? "text-gray-400" : "text-gray-400"
                  }`}
                >
                  No revenue data available
                </p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={revenueOverTime}>
                  <defs>
                    <linearGradient
                      id="colorRevenue"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="5%" stopColor="#1e3a8a" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#1e3a8a" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke={isDark ? "#374151" : "#e5e7eb"}
                    vertical={false}
                  />
                  <XAxis
                    dataKey="month"
                    stroke={isDark ? "#9ca3af" : "#9ca3af"}
                    tick={{ fontSize: 11 }}
                    tickLine={false}
                  />
                  <YAxis
                    stroke={isDark ? "#9ca3af" : "#9ca3af"}
                    tick={{ fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#1e3a8a"
                    fillOpacity={1}
                    fill="url(#colorRevenue)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* ===== Service Status & Metrics ===== */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Service Status Card */}
          <div
            className={`rounded-xl shadow-md border ${
              isDark
                ? "bg-gray-800 border-gray-700"
                : "bg-white border-gray-100"
            }`}
          >
            <div
              className={`border-b p-4 rounded-xl ${
                isDark ? "bg-gray-700" : "bg-blue-900"
              }`}
            >
              <div className="flex items-center gap-2">
                <FiTool
                  className={isDark ? "text-white" : "text-white"}
                  size={18}
                />
                <h3
                  className={`text-base font-bold ${
                    isDark ? "text-white" : "text-white"
                  }`}
                >
                  Service Status
                </h3>
              </div>
              <p
                className={`text-xs mt-1 ${
                  isDark ? "text-gray-300" : "text-blue-100"
                }`}
              >
                Completion overview
              </p>
            </div>

            <div className="p-5">
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div
                  className={`text-center p-3 rounded-lg border ${
                    isDark
                      ? "bg-gray-700 border-gray-600"
                      : "bg-blue-50 border-blue-100"
                  }`}
                >
                  <FiTool
                    size={20}
                    className={`mx-auto mb-1 ${
                      isDark ? "text-blue-400" : "text-blue-900"
                    }`}
                  />
                  <p
                    className={`text-xs ${
                      isDark ? "text-gray-400" : "text-gray-600"
                    } mb-1`}
                  >
                    Total
                  </p>
                  <p
                    className={`text-2xl font-bold ${
                      isDark ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {serviceSummary.totalServices || 0}
                  </p>
                </div>
                <div
                  className={`text-center p-3 rounded-lg border ${
                    isDark
                      ? "bg-gray-700 border-gray-600"
                      : "bg-gray-50 border-gray-200"
                  }`}
                >
                  <FiActivity
                    size={20}
                    className={`mx-auto mb-1 ${
                      isDark ? "text-purple-400" : "text-purple-600"
                    }`}
                  />
                  <p
                    className={`text-xs ${
                      isDark ? "text-gray-400" : "text-gray-600"
                    } mb-1`}
                  >
                    Avg Cost
                  </p>
                  <p
                    className={`text-lg font-bold ${
                      isDark ? "text-white" : "text-gray-900"
                    }`}
                  >
                    ₹
                    {(serviceSummary.averageServiceCost || 0).toLocaleString(
                      "en-IN",
                      { maximumFractionDigits: 0 }
                    )}
                  </p>
                </div>
              </div>

              {totalServices > 0 ? (
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <div className="flex items-center gap-2">
                        <FiCheckCircle size={14} className="text-green-600" />
                        <span
                          className={`text-xs font-medium ${
                            isDark ? "text-gray-300" : "text-gray-700"
                          }`}
                        >
                          Completed
                        </span>
                      </div>
                      <span className="text-xs font-bold text-green-600">
                        {serviceSummary.completedServices || 0} (
                        {completedPercent}%)
                      </span>
                    </div>
                    <div
                      className={`w-full rounded-full h-2 ${
                        isDark ? "bg-gray-700" : "bg-gray-200"
                      }`}
                    >
                      <div
                        className="bg-green-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${completedPercent}%` }}
                      ></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <div className="flex items-center gap-2">
                        <FiClock size={14} className="text-orange-600" />
                        <span
                          className={`text-xs font-medium ${
                            isDark ? "text-gray-300" : "text-gray-700"
                          }`}
                        >
                          Pending
                        </span>
                      </div>
                      <span className="text-xs font-bold text-orange-600">
                        {serviceSummary.pendingServices || 0} ({pendingPercent}
                        %)
                      </span>
                    </div>
                    <div
                      className={`w-full rounded-full h-2 ${
                        isDark ? "bg-gray-700" : "bg-gray-200"
                      }`}
                    >
                      <div
                        className="bg-orange-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${pendingPercent}%` }}
                      ></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <div className="flex items-center gap-2">
                        <FiXCircle size={14} className="text-red-600" />
                        <span
                          className={`text-xs font-medium ${
                            isDark ? "text-gray-300" : "text-gray-700"
                          }`}
                        >
                          Cancelled
                        </span>
                      </div>
                      <span className="text-xs font-bold text-red-600">
                        {serviceSummary.cancelledServices || 0} (
                        {cancelledPercent}%)
                      </span>
                    </div>
                    <div
                      className={`w-full rounded-full h-2 ${
                        isDark ? "bg-gray-700" : "bg-gray-200"
                      }`}
                    >
                      <div
                        className="bg-red-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${cancelledPercent}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <FiAlertCircle
                    size={24}
                    className={`mx-auto mb-2 ${
                      isDark ? "text-gray-600" : "text-gray-300"
                    }`}
                  />
                  <p
                    className={`text-xs ${
                      isDark ? "text-gray-400" : "text-gray-400"
                    }`}
                  >
                    No service data
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Invoice Status Card */}
          <div
            className={`rounded-xl shadow-md border ${
              isDark
                ? "bg-gray-800 border-gray-700"
                : "bg-white border-gray-100"
            }`}
          >
            <div
              className={`border-b p-4 rounded-xl ${
                isDark ? "bg-gray-700" : "bg-blue-900"
              }`}
            >
              <div className="flex items-center gap-2">
                <FiDollarSign
                  className={isDark ? "text-white" : "text-white"}
                  size={18}
                />
                <h3
                  className={`text-base font-bold ${
                    isDark ? "text-white" : "text-white"
                  }`}
                >
                  Invoice Status
                </h3>
              </div>
              <p
                className={`text-xs mt-1 ${
                  isDark ? "text-gray-300" : "text-blue-100"
                }`}
              >
                Payment breakdown
              </p>
            </div>

            <div className="p-5">
              {summary?.invoiceStatusSummary?.length > 0 ? (
                <div className="space-y-3">
                  {summary.invoiceStatusSummary.map((item, index) => {
                    const percentage =
                      totalInvoices > 0
                        ? ((item.count / totalInvoices) * 100).toFixed(1)
                        : 0;
                    const statusConfig = {
                      Paid: {
                        icon: FiCheckCircle,
                        color: "green",
                        bg: isDark ? "bg-gray-700" : "bg-green-50",
                        border: isDark ? "border-gray-600" : "border-green-200",
                        bar: "bg-green-500",
                      },
                      Pending: {
                        icon: FiClock,
                        color: "orange",
                        bg: isDark ? "bg-gray-700" : "bg-orange-50",
                        border: isDark
                          ? "border-gray-600"
                          : "border-orange-200",
                        bar: "bg-orange-500",
                      },
                      Cancelled: {
                        icon: FiXCircle,
                        color: "red",
                        bg: isDark ? "bg-gray-700" : "bg-red-50",
                        border: isDark ? "border-gray-600" : "border-red-200",
                        bar: "bg-red-500",
                      },
                    };
                    const config =
                      statusConfig[item.status] || statusConfig.Pending;
                    const Icon = config.icon;

                    return (
                      <div
                        key={index}
                        className={`${config.bg} rounded-lg p-3 border ${config.border}`}
                      >
                        <div className="flex justify-between items-center mb-2">
                          <div className="flex items-center gap-2">
                            <Icon
                              size={16}
                              className={`text-${config.color}-600`}
                            />
                            <span
                              className={`text-xs font-semibold ${
                                isDark ? "text-gray-300" : "text-gray-700"
                              }`}
                            >
                              {item.status}
                            </span>
                          </div>
                          <span
                            className={`text-sm font-bold text-${config.color}-600`}
                          >
                            {item.count}
                          </span>
                        </div>
                        <div
                          className={`w-full rounded-full h-2 ${
                            isDark ? "bg-gray-600" : "bg-white"
                          }`}
                        >
                          <div
                            className={`${config.bar} h-2 rounded-full transition-all duration-500`}
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                        <p
                          className={`text-xs font-medium text-${config.color}-600 mt-1`}
                        >
                          {percentage}% of total
                        </p>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FiAlertCircle
                    size={24}
                    className={`mx-auto mb-2 ${
                      isDark ? "text-gray-600" : "text-gray-300"
                    }`}
                  />
                  <p
                    className={`text-xs ${
                      isDark ? "text-gray-400" : "text-gray-400"
                    }`}
                  >
                    No invoice data
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ===== Top Services by Revenue ===== */}
        <div
          className={`rounded-xl shadow-md mb-6 border ${
            isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"
          }`}
        >
          <div
            className={`border-b p-4 rounded-xl ${
              isDark ? "bg-gray-700" : "bg-blue-900"
            }`}
          >
            <div className="flex items-center gap-2">
              <FiActivity
                className={isDark ? "text-white" : "text-white"}
                size={18}
              />
              <h3
                className={`text-base font-bold ${
                  isDark ? "text-white" : "text-white"
                }`}
              >
                Top Services by Revenue
              </h3>
            </div>
            <p
              className={`text-xs mt-1 ${
                isDark ? "text-gray-300" : "text-blue-100"
              }`}
            >
              Highest-earning services
            </p>
          </div>

          <div className="p-5">
            {serviceSummary?.topServiceTypes?.length > 0 ? (
              <div className="space-y-3">
                {serviceSummary.topServiceTypes
                  .slice(0, 5)
                  .map((service, index) => (
                    <div
                      key={index}
                      className={`flex items-center justify-between p-3 rounded-lg border hover:border-blue-400 transition-colors ${
                        isDark
                          ? "bg-gray-700 border-gray-600"
                          : "bg-gray-50 border-gray-200"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`text-white w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${
                            isDark ? "bg-blue-600" : "bg-blue-900"
                          }`}
                        >
                          {index + 1}
                        </div>
                        <div>
                          <p
                            className={`text-sm font-semibold ${
                              isDark ? "text-white" : "text-gray-900"
                            }`}
                          >
                            {service.type}
                          </p>
                          <p
                            className={`text-xs ${
                              isDark ? "text-gray-400" : "text-gray-500"
                            }`}
                          >
                            {service.count} services
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p
                          className={`text-base font-bold ${
                            isDark ? "text-blue-400" : "text-blue-900"
                          }`}
                        >
                          ₹
                          {service.total.toLocaleString("en-IN", {
                            maximumFractionDigits: 0,
                          })}
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <FiAlertCircle
                  size={24}
                  className={`mx-auto mb-2 ${
                    isDark ? "text-gray-600" : "text-gray-300"
                  }`}
                />
                <p
                  className={`text-xs ${
                    isDark ? "text-gray-400" : "text-gray-400"
                  }`}
                >
                  No service revenue data
                </p>
              </div>
            )}
          </div>
        </div>

        {/* ===== Top Clients ===== */}
        <div
          className={`rounded-xl shadow-md border ${
            isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"
          }`}
        >
          <div
            className={`border-b rounded-xl p-4 ${
              isDark ? "bg-gray-700" : "bg-blue-900"
            }`}
          >
            <div className="flex items-center gap-2">
              <FiUsers
                className={isDark ? "text-white" : "text-white"}
                size={18}
              />
              <h3
                className={`text-base font-bold ${
                  isDark ? "text-white" : "text-white"
                }`}
              >
                Top Clients
              </h3>
            </div>
            <p
              className={`text-xs mt-1 ${
                isDark ? "text-gray-300" : "text-blue-100"
              }`}
            >
              Highest-spending customers
            </p>
          </div>

          <div className="p-5">
            {summary?.topClients?.length > 0 ? (
              <div className="space-y-3">
                {summary.topClients.slice(0, 5).map((client, index) => (
                  <div
                    key={index}
                    className={`flex items-center justify-between p-3 rounded-lg border hover:border-blue-400 transition-colors ${
                      isDark
                        ? "bg-gray-700 border-gray-600"
                        : "bg-gray-50 border-gray-200"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`text-white w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${
                          isDark ? "bg-blue-600" : "bg-blue-900"
                        }`}
                      >
                        {client.fullName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p
                          className={`text-sm font-semibold ${
                            isDark ? "text-white" : "text-gray-900"
                          }`}
                        >
                          {client.fullName}
                        </p>
                        <p
                          className={`text-xs ${
                            isDark ? "text-gray-400" : "text-gray-500"
                          }`}
                        >
                          Customer #{index + 1}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p
                        className={`text-base font-bold ${
                          isDark ? "text-blue-400" : "text-blue-900"
                        }`}
                      >
                        ₹
                        {client.totalSpent.toLocaleString("en-IN", {
                          maximumFractionDigits: 0,
                        })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <FiAlertCircle
                  size={24}
                  className={`mx-auto mb-2 ${
                    isDark ? "text-gray-600" : "text-gray-300"
                  }`}
                />
                <p
                  className={`text-xs ${
                    isDark ? "text-gray-400" : "text-gray-400"
                  }`}
                >
                  No client data
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
