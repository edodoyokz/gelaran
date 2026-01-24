export default function OrganizerTeamDocsPage() {
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">Team Management</h1>
            <p className="text-muted-foreground">
                Panduan untuk mengelola tim dan akses staff event.
            </p>

            <div className="space-y-4">
                <section>
                    <h2 className="text-xl font-semibold mb-2">Menambah Anggota Tim</h2>
                    <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                        <li>Buka halaman Team Management</li>
                        <li>Klik &quot;Tambah Anggota&quot;</li>
                        <li>Masukkan email anggota baru</li>
                        <li>Pilih role dan akses yang sesuai</li>
                    </ol>
                </section>

                <section>
                    <h2 className="text-xl font-semibold mb-2">Role Tim</h2>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                        <li><strong>Owner</strong> - Akses penuh ke semua fitur</li>
                        <li><strong>Manager</strong> - Kelola event dan lihat laporan</li>
                        <li><strong>Staff</strong> - Akses Gate & POS saja</li>
                        <li><strong>Viewer</strong> - Hanya bisa melihat laporan</li>
                    </ul>
                </section>
            </div>
        </div>
    );
}
