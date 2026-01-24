export default function CustomerSupportDocsPage() {
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">Hubungi Support</h1>
            <p className="text-muted-foreground">
                Butuh bantuan? Kami siap membantu Anda.
            </p>

            <div className="space-y-4">
                <section>
                    <h2 className="text-xl font-semibold mb-2">Kontak Kami</h2>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                        <li>Email: support@bsctickets.com</li>
                        <li>WhatsApp: +62 812-3456-7890</li>
                        <li>Live Chat: Tersedia di pojok kanan bawah</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-xl font-semibold mb-2">Jam Operasional</h2>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                        <li>Senin - Jumat: 09:00 - 18:00 WIB</li>
                        <li>Sabtu: 09:00 - 15:00 WIB</li>
                        <li>Minggu & Hari Libur: Tutup</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-xl font-semibold mb-2">Waktu Respon</h2>
                    <p className="text-muted-foreground">
                        Kami akan merespon pertanyaan Anda dalam waktu maksimal 1x24 jam pada hari kerja.
                    </p>
                </section>
            </div>
        </div>
    );
}
