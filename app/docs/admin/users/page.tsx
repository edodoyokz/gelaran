export default function AdminUsersDocsPage() {
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">User Management</h1>
            <p className="text-muted-foreground">
                Panduan lengkap untuk mengelola pengguna di platform BSC.
            </p>

            <div className="space-y-4">
                <section>
                    <h2 className="text-xl font-semibold mb-2">Fitur Utama</h2>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                        <li>Melihat daftar semua pengguna</li>
                        <li>Mengubah role pengguna (Customer, Organizer, Admin)</li>
                        <li>Menonaktifkan atau mengaktifkan akun</li>
                        <li>Melihat riwayat aktivitas pengguna</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-xl font-semibold mb-2">Cara Mengakses</h2>
                    <p className="text-muted-foreground">
                        Navigasi ke <code className="bg-muted px-1 rounded">Admin Dashboard → Users</code> untuk mengelola pengguna.
                    </p>
                </section>
            </div>
        </div>
    );
}
