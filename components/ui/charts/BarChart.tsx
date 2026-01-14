"use client";

import {
    BarChart as RechartsBarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell,
} from "recharts";

interface DataPoint {
    name: string;
    color?: string;
    [key: string]: string | number | undefined;
}

interface BarChartProps {
    data: DataPoint[];
    dataKey?: string;
    xAxisKey?: string;
    height?: number;
    color?: string;
    colors?: string[];
    showGrid?: boolean;
    showXAxis?: boolean;
    showYAxis?: boolean;
    horizontal?: boolean;
    formatTooltip?: (value: number) => string;
    barRadius?: number;
}

export function BarChart({
    data,
    dataKey = "value",
    xAxisKey = "name",
    height = 300,
    color = "#6366f1",
    colors,
    showGrid = true,
    showXAxis = true,
    showYAxis = true,
    horizontal = false,
    formatTooltip,
    barRadius = 4,
}: BarChartProps) {
    const Chart = horizontal ? (
        <RechartsBarChart
            data={data}
            layout="vertical"
            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
        >
            {showGrid && (
                <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#e5e7eb"
                    horizontal={false}
                />
            )}
            <XAxis
                type="number"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#9ca3af", fontSize: 12 }}
                hide={!showXAxis}
            />
            <YAxis
                dataKey={xAxisKey}
                type="category"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#9ca3af", fontSize: 12 }}
                width={80}
                hide={!showYAxis}
            />
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
            <Bar dataKey={dataKey} radius={[0, barRadius, barRadius, 0]}>
                {data.map((entry, index) => (
                    <Cell
                        key={`cell-h-${entry.name}-${index}`}
                        fill={colors ? colors[index % colors.length] : entry.color || color}
                    />
                ))}
            </Bar>
        </RechartsBarChart>
    ) : (
        <RechartsBarChart
            data={data}
            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
        >
            {showGrid && (
                <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#e5e7eb"
                    vertical={false}
                />
            )}
            <XAxis
                dataKey={xAxisKey}
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#9ca3af", fontSize: 12 }}
                dy={10}
                hide={!showXAxis}
            />
            <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#9ca3af", fontSize: 12 }}
                width={50}
                hide={!showYAxis}
                tickFormatter={(value) =>
                    value >= 1000000
                        ? `${(value / 1000000).toFixed(0)}M`
                        : value >= 1000
                          ? `${(value / 1000).toFixed(0)}K`
                          : value.toString()
                }
            />
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
            <Bar dataKey={dataKey} radius={[barRadius, barRadius, 0, 0]}>
                {data.map((entry, index) => (
                    <Cell
                        key={`cell-v-${entry.name}-${index}`}
                        fill={colors ? colors[index % colors.length] : entry.color || color}
                    />
                ))}
            </Bar>
        </RechartsBarChart>
    );

    return (
        <ResponsiveContainer width="100%" height={height}>
            {Chart}
        </ResponsiveContainer>
    );
}
