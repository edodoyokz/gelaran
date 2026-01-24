export default function OrganizerGateDocsPage() {
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">Gate & POS System</h1>
            <p className="text-muted-foreground">
                Panduan untuk sistem check-in dan point of sale di event.
            </p>

            <div className="space-y-4">
                <section>
                    <h2 className="text-xl font-semibold mb-2">Fitur Gate (Check-in)</h2>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                        <li>Scan QR code tiket pengunjung</li>
                        <li>Validasi tiket secara real-time</li>
                        <li>Lihat statistik check-in langsung</li>
                        <li>Mode offline untuk area tanpa sinyal</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-xl font-semibold mb-2">Fitur POS (Point of Sale)</h2>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                        <li>Jual tiket langsung di lokasi (on-the-spot)</li>
                        <li>Terima pembayaran tunai atau QRIS</li>
                        <li>Cetak tiket instan</li>
                        <li>Laporan penjualan real-time</li>
                    </ul>
                </section>
            </div>
        </div>
    );
}
