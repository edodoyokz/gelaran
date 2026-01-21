"use client";

import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid } from 'recharts';

interface RevenueTrendChartProps {
    data: Array<{
        date: string;
        platformRevenue: number;
        organizerRevenue: number;
    }>;
}

export function RevenueTrendChart({ data }: RevenueTrendChartProps) {
    const formatCurrency = (value: number) => {
        if (value >= 1000000) {
            return `${(value / 1000000).toFixed(1)}M`;
        }
        if (value >= 1000) {
            return `${(value / 1000).toFixed(0)}K`;
        }
        return value.toString();
    };

    const formatTooltipCurrency = (value: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(value);
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString("id-ID", { day: "numeric", month: "short" });
    };

    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-[var(--surface)] border border-gray-200 rounded-lg p-3 shadow-lg">
                    <p className="text-sm text-[var(--text-muted)] mb-2">
                        {formatDate(payload[0].payload.date)}
                    </p>
                    {payload.map((entry: any) => (
                        <p key={entry.dataKey} className="text-sm font-medium" style={{ color: entry.color }}>
                            {entry.name}: {formatTooltipCurrency(entry.value)}
                        </p>
                    ))}
                </div>
            );
        }
        return null;
    };

    if (!data || data.length === 0) {
        return null;
    }

    return (
        <div className="bg-[var(--surface)] rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-6">Revenue Trend</h3>
            <ResponsiveContainer width="100%" height={300}>
                <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis 
                        dataKey="date" 
                        tickFormatter={formatDate}
                        stroke="#9ca3af"
                        style={{ fontSize: '12px' }}
                    />
                    <YAxis 
                        tickFormatter={formatCurrency}
                        stroke="#9ca3af"
                        style={{ fontSize: '12px' }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend 
                        wrapperStyle={{ fontSize: '14px' }}
                        formatter={(value) => {
                            if (value === 'platformRevenue') return 'Platform Revenue';
                            if (value === 'organizerRevenue') return 'Organizer Revenue';
                            return value;
                        }}
                    />
                    <Line 
                        type="monotone" 
                        dataKey="platformRevenue" 
                        stroke="#6366f1" 
                        strokeWidth={2}
                        dot={{ fill: '#6366f1', r: 3 }}
                        activeDot={{ r: 5 }}
                    />
                    <Line 
                        type="monotone" 
                        dataKey="organizerRevenue" 
                        stroke="#10b981" 
                        strokeWidth={2}
                        dot={{ fill: '#10b981', r: 3 }}
                        activeDot={{ r: 5 }}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}
