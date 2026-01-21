interface RevenueBreakdownProps {
    totalTransactions: number;
    platformRevenue: number;
    organizerRevenue: number;
    gatewayFee: number;
    tax: number;
}

export function RevenueBreakdown({
    totalTransactions,
    platformRevenue,
    organizerRevenue,
    gatewayFee,
    tax,
}: RevenueBreakdownProps) {
    const formatCurrency = (value: number): string => {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(value);
    };

    const calculatePercentage = (value: number): string => {
        if (totalTransactions === 0) return "0%";
        return ((value / totalTransactions) * 100).toFixed(1) + "%";
    };

    return (
        <div className="rounded-xl shadow-[var(--shadow-sm)] bg-[var(--surface)] border border-[var(--border)]">
            <div className="px-6 py-4 border-b border-[var(--border)]">
                <h3 className="text-lg font-semibold text-[var(--text-primary)]">
                    Revenue Breakdown
                </h3>
                <p className="text-sm text-[var(--text-muted)] mt-0.5">
                    Platform earnings and distribution
                </p>
            </div>
            <div className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                    <span className="text-sm text-[var(--text-muted)]">Total Transactions</span>
                    <span className="text-lg font-bold text-[var(--text-primary)]">
                        {formatCurrency(totalTransactions)}
                    </span>
                </div>
                <div className="h-px bg-[var(--border)]" />
                <div className="flex items-center justify-between">
                    <div>
                        <span className="text-sm font-medium text-[var(--text-primary)]">Platform Revenue</span>
                        <span className="ml-2 text-xs text-[var(--text-muted)]">
                            {calculatePercentage(platformRevenue)}
                        </span>
                    </div>
                    <span className="text-base font-semibold text-[var(--accent-primary)]">
                        {formatCurrency(platformRevenue)}
                    </span>
                </div>
                <div className="flex items-center justify-between">
                    <div>
                        <span className="text-sm font-medium text-[var(--text-primary)]">Organizer Revenue</span>
                        <span className="ml-2 text-xs text-[var(--text-muted)]">
                            {calculatePercentage(organizerRevenue)}
                        </span>
                    </div>
                    <span className="text-base font-semibold text-[var(--success)]">
                        {formatCurrency(organizerRevenue)}
                    </span>
                </div>
                <div className="flex items-center justify-between">
                    <div>
                        <span className="text-sm font-medium text-[var(--text-primary)]">Payment Gateway Fee</span>
                        <span className="ml-2 text-xs text-[var(--text-muted)]">
                            {calculatePercentage(gatewayFee)}
                        </span>
                    </div>
                    <span className="text-base font-medium text-[var(--text-muted)]">
                        {formatCurrency(gatewayFee)}
                    </span>
                </div>
                {tax > 0 && (
                    <div className="flex items-center justify-between">
                        <div>
                            <span className="text-sm font-medium text-[var(--text-primary)]">Tax Collected</span>
                            <span className="ml-2 text-xs text-[var(--text-muted)]">
                                {calculatePercentage(tax)}
                            </span>
                        </div>
                        <span className="text-base font-medium text-[var(--text-muted)]">
                            {formatCurrency(tax)}
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
}
