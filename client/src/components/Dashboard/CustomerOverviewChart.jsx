import React, { useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const CustomerOverviewChart = ({ data, isDark }) => {
  // Use the same color configuration approach as Layout.js
  const colors = useMemo(
    () => ({
      // Backgrounds
      layoutBg: isDark ? "#020617" : "#FFFFFF",
      mainBg: isDark ? "#ffffff" : "#F8FAFC",
      elementBg: isDark ? "#020D36" : "#FFFFFF",

      // Text
      textPrimary: isDark ? "#E5E7EB" : "#0F172A",
      textSecondary: isDark ? "#94A3B8" : "#475569",

      // Brand & Accents
      brand: isDark ? "#1E3A8A" : "#0B1D51",
      primaryButton: isDark ? "#3B82F6" : "#0046FF",

      // Borders & Hover
      border: isDark ? "#1E293B" : "#E5E7EB",
      hoverBg: isDark ? "#1E293B" : "#F8FAFC",
    }),
    [isDark]
  );

  // Chart-specific colors derived from the main color scheme
  const chartColors = useMemo(
    () => ({
      grid: isDark ? "#374151" : "#f0f0f0",
      axis: isDark ? "#9CA3AF" : "#666",
      tooltipBg: isDark ? "#1F2937" : "white",
      text: isDark ? "#F9FAFB" : "#111827",
    }),
    [isDark]
  );

  return (
    <ResponsiveContainer width="100%" height={150}>
      <LineChart data={data.slice(0, 7)}>
        <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
        <XAxis dataKey="month" stroke={chartColors.axis} fontSize={12} />
        <YAxis stroke={chartColors.axis} fontSize={12} />
        <Tooltip
          contentStyle={{
            backgroundColor: chartColors.tooltipBg,
            border: "none",
            borderRadius: "12px",
            boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
            color: chartColors.text,
          }}
        />
        <Line
          type="monotone"
          dataKey="services"
          stroke="#8B5CF6"
          strokeWidth={3}
          dot={{ fill: "#8B5CF6", strokeWidth: 2, r: 4 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default React.memo(CustomerOverviewChart);
