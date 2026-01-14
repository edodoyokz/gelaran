import { Skeleton } from "./Skeleton";

interface CardSkeletonProps {
    count?: number;
    columns?: number;
}

export function CardSkeleton({ count = 4, columns = 4 }: CardSkeletonProps) {
    const gridCols = {
        1: "grid-cols-1",
        2: "grid-cols-1 sm:grid-cols-2",
        3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
        4: "grid-cols-2 lg:grid-cols-4",
    };

    return (
        <div className={`grid ${gridCols[columns as keyof typeof gridCols] || gridCols[4]} gap-4`}>
            {Array.from({ length: count }).map((_, i) => (
                <div
                    key={`card-skeleton-${i}`}
                    className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
                >
                    <div className="flex items-center justify-between mb-4">
                        <Skeleton className="w-12 h-12 rounded-xl" />
                        <Skeleton className="w-16 h-6 rounded-full" />
                    </div>
                    <Skeleton className="w-24 h-8 mb-2" />
                    <Skeleton className="w-32 h-4" />
                </div>
            ))}
        </div>
    );
}
