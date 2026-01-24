export default function AdminSettingsDocsPage() {
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">Settings</h1>
            <p className="text-muted-foreground">
                Panduan untuk mengonfigurasi pengaturan platform.
            </p>

            <div className="space-y-4">
                <section>
                    <h2 className="text-xl font-semibold mb-2">Pengaturan Umum</h2>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                        <li>Konfigurasi nama dan logo platform</li>
                        <li>Pengaturan mata uang dan format</li>
                        <li>Konfigurasi email notifikasi</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-xl font-semibold mb-2">Pengaturan Pembayaran</h2>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                        <li>Konfigurasi payment gateway (Midtrans)</li>
                        <li>Pengaturan biaya platform</li>
                        <li>Jadwal payout otomatis</li>
                    </ul>
                </section>
            </div>
        </div>
    );
}
