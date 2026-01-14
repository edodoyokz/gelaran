"use client";

import {
    AreaChart as RechartsAreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";

interface DataPoint {
    name: string;
    [key: string]: string | number;
}

interface AreaChartProps {
    data: DataPoint[];
    dataKey?: string;
    xAxisKey?: string;
    height?: number;
    color?: string;
    gradientId?: string;
    showGrid?: boolean;
    showXAxis?: boolean;
    showYAxis?: boolean;
    formatTooltip?: (value: number) => string;
    formatXAxis?: (value: string) => string;
}

export function AreaChart({
    data,
    dataKey = "value",
    xAxisKey = "name",
    height = 300,
    color = "#6366f1",
    gradientId = "colorValue",
    showGrid = true,
    showXAxis = true,
    showYAxis = true,
    formatTooltip,
    formatXAxis,
}: AreaChartProps) {
    return (
        <ResponsiveContainer width="100%" height={height}>
            <RechartsAreaChart
                data={data}
                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            >
                <defs>
                    <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                        <stop offset="95%" stopColor={color} stopOpacity={0} />
                    </linearGradient>
                </defs>
                {showGrid && (
                    <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="#e5e7eb"
                        vertical={false}
                    />
                )}
                {showXAxis && (
                    <XAxis
                        dataKey={xAxisKey}
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: "#9ca3af", fontSize: 12 }}
                        tickFormatter={formatXAxis}
                        dy={10}
                    />
                )}
                {showYAxis && (
                    <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: "#9ca3af", fontSize: 12 }}
                        width={50}
                        tickFormatter={(value) =>
                            value >= 1000000
                                ? `${(value / 1000000).toFixed(0)}M`
                                : value >= 1000
                                  ? `${(value / 1000).toFixed(0)}K`
                                  : value.toString()
                        }
                    />
                )}
                <Tooltip
                    contentStyle={{
                        backgroundColor: "#1f2937",
                        border: "none",
                        borderRadius: "8px",
                        boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    }}
                    labelStyle={{ color: "#9ca3af", marginBottom: 4 }}
                    itemStyle={{ color: "#fff" }}
                    formatter={(value) => {
                        if (typeof value !== "number") return ["", ""];
                        return [
                            formatTooltip ? formatTooltip(value) : value.toLocaleString("id-ID"),
                            "",
                        ];
                    }}
                />
                <Area
                    type="monotone"
                    dataKey={dataKey}
                    stroke={color}
                    strokeWidth={2}
                    fillOpacity={1}
                    fill={`url(#${gradientId})`}
                />
            </RechartsAreaChart>
        </ResponsiveContainer>
    );
}
