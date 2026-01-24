export default function OrganizerWalletDocsPage() {
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">Wallet & Payouts</h1>
            <p className="text-muted-foreground">
                Panduan untuk mengelola pendapatan dan penarikan dana.
            </p>

            <div className="space-y-4">
                <section>
                    <h2 className="text-xl font-semibold mb-2">Saldo Wallet</h2>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                        <li>Lihat total pendapatan dari semua event</li>
                        <li>Pantau saldo yang tersedia untuk ditarik</li>
                        <li>Lihat saldo pending (menunggu event selesai)</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-xl font-semibold mb-2">Tarik Dana</h2>
                    <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                        <li>Pastikan rekening bank sudah terdaftar</li>
                        <li>Klik &quot;Tarik Dana&quot; dan masukkan jumlah</li>
                        <li>Konfirmasi penarikan</li>
                        <li>Dana akan diproses dalam 1-3 hari kerja</li>
                    </ol>
                </section>

                <section>
                    <h2 className="text-xl font-semibold mb-2">Biaya Platform</h2>
                    <p className="text-muted-foreground">
                        Platform memotong biaya sebesar 5% dari setiap transaksi penjualan tiket.
                    </p>
                </section>
            </div>
        </div>
    );
}
