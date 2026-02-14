import React, { useMemo } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Bar,
  ComposedChart,
  Legend,
} from "recharts";

const RevenueChart = ({ data = [], isDark }) => {
  const chartColors = useMemo(
    () => ({
      grid: isDark ? "#374151" : "#e5e7eb",
      axis: isDark ? "#9CA3AF" : "#6b7280",
      tooltipBg: isDark ? "#1F2937" : "#ffffff",
      text: isDark ? "#F9FAFB" : "#111827",
    }),
    [isDark],
  );

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px] text-gray-400">
        No revenue data available
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <ComposedChart data={data}>
        <defs>
          <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.4} />
            <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
          </linearGradient>
        </defs>

        <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />

        <XAxis dataKey="month" stroke={chartColors.axis} fontSize={12} />

        {/* Revenue Axis */}
        <YAxis
          yAxisId="left"
          stroke={chartColors.axis}
          fontSize={12}
          tickFormatter={(value) => `₹${value / 1000}k`}
        />

        {/* Invoice Count Axis */}
        <YAxis
          yAxisId="right"
          orientation="right"
          stroke={chartColors.axis}
          fontSize={12}
        />

        <Tooltip
          contentStyle={{
            backgroundColor: chartColors.tooltipBg,
            border: "none",
            borderRadius: "12px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
          }}
          formatter={(value, name) => {
            if (name === "Revenue") {
              return [`₹${value.toLocaleString()}`, name];
            }
            return [value, name];
          }}
        />

        <Legend />

        {/* Revenue Area */}
        <Area
          yAxisId="left"
          type="monotone"
          dataKey="revenue"
          stroke="#3B82F6"
          fill="url(#revenueGradient)"
          strokeWidth={3}
          name="Revenue"
        />

        {/* Invoice Count Bars */}
        <Bar
          yAxisId="right"
          dataKey="invoices"
          fill="#10B981"
          radius={[6, 6, 0, 0]}
          name="Invoices"
          barSize={28}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
};

export default React.memo(RevenueChart);
