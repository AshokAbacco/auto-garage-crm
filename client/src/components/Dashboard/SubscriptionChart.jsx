// client/src/components/Dashboard/SubscriptionChart.jsx

import React, { useMemo } from 'react';
import {
    PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

const SubscriptionChart = ({ data = {}, isDark }) => {
    const safeData = {
        basic: data.basic || 0,
        standard: data.standard || 0,
        premium: data.premium || 0
    };

    const chartColors = useMemo(() => ({
        tooltipBg: isDark ? '#1F2937' : 'white',
        text: isDark ? '#F9FAFB' : '#111827',
        basic: '#6B7280',
        standard: '#3B82F6',
        premium: '#8B5CF6',
    }), [isDark]);

    const pieData = [
        { name: 'Basic', value: safeData.basic, color: chartColors.basic },
        { name: 'Standard', value: safeData.standard, color: chartColors.standard },
        { name: 'Premium', value: safeData.premium, color: chartColors.premium },
    ];

    return (
        <ResponsiveContainer width="100%" height={250}>
            <PieChart>
                <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                >
                    {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                </Pie>
                <Tooltip
                    contentStyle={{
                        backgroundColor: chartColors.tooltipBg,
                        border: 'none',
                        borderRadius: '12px',
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                        color: chartColors.text
                    }}
                />
                <Legend />
            </PieChart>
        </ResponsiveContainer>
    );
};

export default React.memo(SubscriptionChart);


