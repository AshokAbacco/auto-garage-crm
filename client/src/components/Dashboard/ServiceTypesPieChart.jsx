import React, { useMemo } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const STATUS_CONFIG = {
  PENDING: { label: "Pending", color: "#F59E0B" },
  IN_PROGRESS: { label: "In Progress", color: "#3B82F6" },
  COMPLETED: { label: "Completed", color: "#10B981" },
  CANCELLED: { label: "Cancelled", color: "#EF4444" },
};

const ServiceTypesPieChart = ({ data = [], isDark }) => {
  const chartColors = useMemo(
    () => ({
      tooltipBg: isDark ? "#1F2937" : "#ffffff",
      text: isDark ? "#F9FAFB" : "#111827",
    }),
    [isDark],
  );

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px] text-gray-400">
        No service data available
      </div>
    );
  }

  const total = data.reduce((sum, item) => sum + item.value, 0);

  const formattedData = data.map((item) => ({
    ...item,
    label: STATUS_CONFIG[item.name]?.label || item.name,
    color: STATUS_CONFIG[item.name]?.color || "#9CA3AF",
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={formattedData}
          cx="50%"
          cy="50%"
          innerRadius={70}
          outerRadius={110}
          paddingAngle={4}
          dataKey="value"
        >
          {formattedData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>

        <Tooltip
          contentStyle={{
            backgroundColor: chartColors.tooltipBg,
            border: "none",
            borderRadius: "12px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
          }}
          formatter={(value, name, props) => {
            const percentage = ((value / total) * 100).toFixed(1);
            return [`${value} (${percentage}%)`, props.payload.label];
          }}
        />

        <Legend formatter={(value, entry) => entry.payload.label} />
      </PieChart>
    </ResponsiveContainer>
  );
};

export default React.memo(ServiceTypesPieChart);
