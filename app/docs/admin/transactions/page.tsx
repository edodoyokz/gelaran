export default function AdminTransactionsDocsPage() {
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">Transactions</h1>
            <p className="text-muted-foreground">
                Panduan untuk memantau dan mengelola transaksi keuangan.
            </p>

            <div className="space-y-4">
                <section>
                    <h2 className="text-xl font-semibold mb-2">Fitur Utama</h2>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                        <li>Melihat semua transaksi pembayaran</li>
                        <li>Memproses refund request</li>
                        <li>Menyetujui payout ke organizer</li>
                        <li>Melihat laporan keuangan</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-xl font-semibold mb-2">Status Transaksi</h2>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                        <li><strong>Pending</strong> - Menunggu pembayaran</li>
                        <li><strong>Paid</strong> - Pembayaran berhasil</li>
                        <li><strong>Failed</strong> - Pembayaran gagal</li>
                        <li><strong>Refunded</strong> - Dana dikembalikan</li>
                    </ul>
                </section>
            </div>
        </div>
    );
}
