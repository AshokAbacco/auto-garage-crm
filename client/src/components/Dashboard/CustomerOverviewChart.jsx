import React, { useMemo } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

const RATING_COLORS = {
  5: "#10B981",
  4: "#3B82F6",
  3: "#F59E0B",
  2: "#FB923C",
  1: "#EF4444",
};

const ReviewAnalyticsChart = ({ reviewStats = {}, isDark }) => {
  const {
    averageRating = 0,
    totalReviews = 0,
    ratingDistribution = [],
  } = reviewStats;

  const chartColors = useMemo(
    () => ({
      tooltipBg: isDark ? "#1F2937" : "#ffffff",
    }),
    [isDark],
  );

  if (totalReviews === 0) {
    return (
      <div className="flex items-center justify-center h-[300px] text-gray-400">
        No reviews yet
      </div>
    );
  }

  const formattedData = ratingDistribution.map((r) => ({
    name: `${r.reviewRating}★`,
    value: r._count.reviewRating,
    color: RATING_COLORS[r.reviewRating] || "#9CA3AF",
  }));

  return (
    <div className="relative">
      <ResponsiveContainer width="100%" height={280}>
        <PieChart>
          <Pie
            data={formattedData}
            innerRadius={70}
            outerRadius={110}
            paddingAngle={3}
            dataKey="value"
          >
            {formattedData.map((entry, index) => (
              <Cell key={index} fill={entry.color} />
            ))}
          </Pie>

          <Tooltip
            contentStyle={{
              backgroundColor: chartColors.tooltipBg,
              border: "none",
              borderRadius: "12px",
            }}
          />
        </PieChart>
      </ResponsiveContainer>

      {/* Center Rating Display */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="text-3xl font-bold">{averageRating.toFixed(1)} ⭐</div>
        <div className="text-sm text-gray-500">{totalReviews} Reviews</div>
      </div>
    </div>
  );
};

export default React.memo(ReviewAnalyticsChart);
