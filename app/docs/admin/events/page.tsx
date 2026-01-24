export default function AdminEventsDocsPage() {
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">Event Moderation</h1>
            <p className="text-muted-foreground">
                Panduan untuk memoderasi dan mengelola event di platform.
            </p>

            <div className="space-y-4">
                <section>
                    <h2 className="text-xl font-semibold mb-2">Fitur Utama</h2>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                        <li>Mereview dan menyetujui event baru</li>
                        <li>Menolak event yang tidak sesuai</li>
                        <li>Mengedit informasi event</li>
                        <li>Menonaktifkan event yang bermasalah</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-xl font-semibold mb-2">Workflow Moderasi</h2>
                    <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                        <li>Event baru masuk dengan status &quot;Pending&quot;</li>
                        <li>Admin mereview detail event</li>
                        <li>Admin menyetujui atau menolak dengan catatan</li>
                        <li>Organizer mendapat notifikasi hasil moderasi</li>
                    </ol>
                </section>
            </div>
        </div>
    );
}
