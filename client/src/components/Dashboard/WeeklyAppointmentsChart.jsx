import React, { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const WeeklyAppointmentsChart = ({ data = [], isDark }) => {
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
      <div className="flex items-center justify-center h-[250px] text-gray-400">
        No weekly data available
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} barGap={6} barCategoryGap="20%">
        <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />

        <XAxis dataKey="day" stroke={chartColors.axis} fontSize={12} />

        <YAxis stroke={chartColors.axis} fontSize={12} allowDecimals={false} />

        <Tooltip
          contentStyle={{
            backgroundColor: chartColors.tooltipBg,
            border: "none",
            borderRadius: "12px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
          }}
          formatter={(value, name) => {
            return [value, name === "appointments" ? "Total" : "Completed"];
          }}
        />

        <Legend
          formatter={(value) =>
            value === "appointments" ? "Total Services" : "Completed"
          }
        />

        <Bar
          dataKey="appointments"
          fill="#3B82F6"
          radius={[6, 6, 0, 0]}
          name="appointments"
          maxBarSize={40}
        />

        <Bar
          dataKey="completed"
          fill="#10B981"
          radius={[6, 6, 0, 0]}
          name="completed"
          maxBarSize={40}
        />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default React.memo(WeeklyAppointmentsChart);
