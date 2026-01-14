import { Skeleton } from "./Skeleton";

interface ChartSkeletonProps {
    height?: number;
    showHeader?: boolean;
}

export function ChartSkeleton({ height = 300, showHeader = true }: ChartSkeletonProps) {
    return (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            {showHeader && (
                <div className="flex items-center justify-between mb-6">
                    <Skeleton className="w-48 h-6" />
                    <Skeleton className="w-32 h-8 rounded-lg" />
                </div>
            )}
            <Skeleton className="w-full rounded-lg" style={{ height }} />
        </div>
    );
}
