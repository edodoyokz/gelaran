export default function CustomerAccountDocsPage() {
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">Akun Saya</h1>
            <p className="text-muted-foreground">
                Panduan untuk mengelola akun dan profil Anda.
            </p>

            <div className="space-y-4">
                <section>
                    <h2 className="text-xl font-semibold mb-2">Pengaturan Profil</h2>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                        <li>Ubah nama dan foto profil</li>
                        <li>Update nomor telepon</li>
                        <li>Ubah email (memerlukan verifikasi)</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-xl font-semibold mb-2">Keamanan Akun</h2>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                        <li>Ubah password</li>
                        <li>Aktifkan autentikasi dua faktor</li>
                        <li>Lihat riwayat login</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-xl font-semibold mb-2">Tiket Saya</h2>
                    <p className="text-muted-foreground">
                        Lihat semua tiket yang sudah Anda beli di menu &quot;Tiket Saya&quot;. Anda bisa download e-ticket atau menampilkan QR code untuk check-in.
                    </p>
                </section>
            </div>
        </div>
    );
}
