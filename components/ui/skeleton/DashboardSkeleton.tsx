import { CardSkeleton } from "./CardSkeleton";
import { ChartSkeleton } from "./ChartSkeleton";
import { TableSkeleton } from "./TableSkeleton";

interface DashboardSkeletonProps {
    type?: "customer" | "admin" | "organizer";
}

export function DashboardSkeleton({ type = "customer" }: DashboardSkeletonProps) {
    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            <CardSkeleton count={4} columns={4} />
            <div className="grid lg:grid-cols-2 gap-6">
                <ChartSkeleton height={250} />
                {type === "admin" && <ChartSkeleton height={250} />}
            </div>
            <TableSkeleton rows={5} />
        </div>
    );
}
