"use client";

import { AreaChart, Area, ResponsiveContainer } from "recharts";

interface DataPoint {
    value: number;
}

interface MiniSparklineProps {
    data: DataPoint[];
    color?: string;
    height?: number;
    width?: number;
    positive?: boolean;
}

export function MiniSparkline({
    data,
    color,
    height = 30,
    width = 60,
    positive = true,
}: MiniSparklineProps) {
    const lineColor = color || (positive ? "#22c55e" : "#ef4444");
    
    return (
        <ResponsiveContainer width={width} height={height}>
            <AreaChart data={data} margin={{ top: 2, right: 2, left: 2, bottom: 2 }}>
                <defs>
                    <linearGradient id={`sparkGradient-${positive}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={lineColor} stopOpacity={0.3} />
                        <stop offset="95%" stopColor={lineColor} stopOpacity={0} />
                    </linearGradient>
                </defs>
                <Area
                    type="monotone"
                    dataKey="value"
                    stroke={lineColor}
                    strokeWidth={1.5}
                    fill={`url(#sparkGradient-${positive})`}
                    isAnimationActive={false}
                />
            </AreaChart>
        </ResponsiveContainer>
    );
}
