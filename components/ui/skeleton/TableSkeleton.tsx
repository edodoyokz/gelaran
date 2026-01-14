import { Skeleton } from "./Skeleton";

interface TableSkeletonProps {
    rows?: number;
    columns?: number;
    showHeader?: boolean;
}

export function TableSkeleton({ rows = 5, columns = 4, showHeader = true }: TableSkeletonProps) {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            {showHeader && (
                <div className="px-6 py-4 border-b flex items-center justify-between">
                    <Skeleton className="w-48 h-6" />
                    <Skeleton className="w-24 h-4" />
                </div>
            )}
            <div className="divide-y">
                {Array.from({ length: rows }).map((_, rowIndex) => (
                    <div
                        key={`table-row-${rowIndex}`}
                        className="px-6 py-4 flex items-center gap-4"
                    >
                        <Skeleton className="w-10 h-10 rounded-lg flex-shrink-0" />
                        <div className="flex-1 space-y-2">
                            <Skeleton className="w-3/4 h-4" />
                            <Skeleton className="w-1/2 h-3" />
                        </div>
                        {Array.from({ length: columns - 2 }).map((_, colIndex) => (
                            <Skeleton
                                key={`table-col-${rowIndex}-${colIndex}`}
                                className="w-20 h-4 flex-shrink-0"
                            />
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
}
