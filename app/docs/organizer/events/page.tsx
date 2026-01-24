export default function OrganizerEventsDocsPage() {
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">Kelola Event Saya</h1>
            <p className="text-muted-foreground">
                Panduan lengkap untuk membuat dan mengelola event Anda.
            </p>

            <div className="space-y-4">
                <section>
                    <h2 className="text-xl font-semibold mb-2">Membuat Event Baru</h2>
                    <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                        <li>Klik tombol &quot;Buat Event&quot; di dashboard</li>
                        <li>Isi informasi dasar (nama, deskripsi, tanggal)</li>
                        <li>Upload gambar cover event</li>
                        <li>Tentukan kategori tiket dan harga</li>
                        <li>Submit untuk review admin</li>
                    </ol>
                </section>

                <section>
                    <h2 className="text-xl font-semibold mb-2">Status Event</h2>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                        <li><strong>Draft</strong> - Event belum dipublish</li>
                        <li><strong>Pending</strong> - Menunggu approval admin</li>
                        <li><strong>Published</strong> - Event live dan bisa dibeli</li>
                        <li><strong>Completed</strong> - Event sudah selesai</li>
                    </ul>
                </section>
            </div>
        </div>
    );
}
