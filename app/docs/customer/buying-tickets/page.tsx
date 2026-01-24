export default function CustomerBuyingTicketsDocsPage() {
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">Membeli Tiket</h1>
            <p className="text-muted-foreground">
                Panduan lengkap untuk membeli tiket event di BSC.
            </p>

            <div className="space-y-4">
                <section>
                    <h2 className="text-xl font-semibold mb-2">Langkah Pembelian</h2>
                    <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                        <li>Pilih event yang ingin Anda hadiri</li>
                        <li>Pilih kategori tiket dan jumlah</li>
                        <li>Isi data pengunjung</li>
                        <li>Pilih metode pembayaran</li>
                        <li>Selesaikan pembayaran</li>
                        <li>Tiket akan dikirim ke email Anda</li>
                    </ol>
                </section>

                <section>
                    <h2 className="text-xl font-semibold mb-2">Metode Pembayaran</h2>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                        <li>Transfer Bank (BCA, Mandiri, BNI, BRI)</li>
                        <li>E-Wallet (GoPay, OVO, DANA, ShopeePay)</li>
                        <li>QRIS</li>
                        <li>Kartu Kredit/Debit</li>
                    </ul>
                </section>
            </div>
        </div>
    );
}
