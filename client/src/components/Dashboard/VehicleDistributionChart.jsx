// client/src/components/Dashboard/VehicleDistributionChart.jsx

import React, { useMemo } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

const VehicleDistributionChart = ({ data, isDark }) => {
    const chartColors = useMemo(() => ({
        grid: isDark ? '#374151' : '#f0f0f0',
        axis: isDark ? '#9CA3AF' : '#666',
        tooltipBg: isDark ? '#1F2937' : 'white',
        text: isDark ? '#F9FAFB' : '#111827',
        car: '#3B82F6',
        bike: '#10B981',
        other: '#8B5CF6',
    }), [isDark]);

    return (
        <ResponsiveContainer width="100%" height={250}>
            <BarChart data={data} barCategoryGap="20%">
                <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
                <XAxis dataKey="type" stroke={chartColors.axis} fontSize={12} />
                <YAxis stroke={chartColors.axis} fontSize={12} />
                <Tooltip
                    contentStyle={{
                        backgroundColor: chartColors.tooltipBg,
                        border: 'none',
                        borderRadius: '12px',
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                        color: chartColors.text
                    }}
                />
                <Bar dataKey="count" fill={chartColors.car} radius={[4, 4, 0, 0]} />
            </BarChart>
        </ResponsiveContainer>
    );
};

export default React.memo(VehicleDistributionChart);