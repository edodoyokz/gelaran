"use client";

import {
    PieChart as RechartsPieChart,
    Pie,
    Cell,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from "recharts";

interface DataPoint {
    name: string;
    value: number | string;
    color?: string;
    [key: string]: string | number | undefined;
}

interface PieChartProps {
    data: DataPoint[];
    height?: number;
    colors?: string[];
    innerRadius?: number;
    outerRadius?: number;
    showLegend?: boolean;
    legendPosition?: "top" | "bottom" | "left" | "right";
    formatTooltip?: (value: number) => string;
    centerLabel?: string;
    centerValue?: string;
}

const DEFAULT_COLORS = [
    "#6366f1",
    "#8b5cf6",
    "#ec4899",
    "#f43f5e",
    "#f97316",
    "#eab308",
    "#22c55e",
    "#14b8a6",
    "#06b6d4",
    "#3b82f6",
];

export function PieChart({
    data,
    height = 300,
    colors = DEFAULT_COLORS,
    innerRadius = 60,
    outerRadius = 100,
    showLegend = true,
    legendPosition = "bottom",
    formatTooltip,
    centerLabel,
    centerValue,
}: PieChartProps) {
    return (
        <ResponsiveContainer width="100%" height={height}>
            <RechartsPieChart>
                <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    innerRadius={innerRadius}
                    outerRadius={outerRadius}
                    paddingAngle={2}
                    dataKey="value"
                    stroke="none"
                >
                    {data.map((entry, index) => (
                        <Cell
                            key={`cell-${entry.name}-${index}`}
                            fill={entry.color || colors[index % colors.length]}
                        />
                    ))}
                </Pie>
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
                {showLegend && (
                    <Legend
                        layout={legendPosition === "left" || legendPosition === "right" ? "vertical" : "horizontal"}
                        align={legendPosition === "left" ? "left" : legendPosition === "right" ? "right" : "center"}
                        verticalAlign={legendPosition === "top" ? "top" : legendPosition === "bottom" ? "bottom" : "middle"}
                        iconType="circle"
                        iconSize={8}
                        formatter={(value) => (
                            <span style={{ color: "#6b7280", fontSize: 12 }}>{value}</span>
                        )}
                    />
                )}
                {(centerLabel || centerValue) && (
                    <text
                        x="50%"
                        y="50%"
                        textAnchor="middle"
                        dominantBaseline="middle"
                    >
                        {centerValue && (
                            <tspan
                                x="50%"
                                dy="-0.5em"
                                style={{ fontSize: 24, fontWeight: "bold", fill: "#111827" }}
                            >
                                {centerValue}
                            </tspan>
                        )}
                        {centerLabel && (
                            <tspan
                                x="50%"
                                dy={centerValue ? "1.5em" : "0"}
                                style={{ fontSize: 12, fill: "#6b7280" }}
                            >
                                {centerLabel}
                            </tspan>
                        )}
                    </text>
                )}
            </RechartsPieChart>
        </ResponsiveContainer>
    );
}
