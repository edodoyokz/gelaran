export default function CustomerFAQDocsPage() {
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">FAQ - Pertanyaan Umum</h1>
            <p className="text-muted-foreground">
                Jawaban untuk pertanyaan yang sering diajukan.
            </p>
            
            <div className="space-y-4">
                <section className="border-b pb-4">
                    <h2 className="text-lg font-semibold mb-2">Bagaimana cara membatalkan tiket?</h2>
                    <p className="text-muted-foreground">
                        Kebijakan pembatalan tergantung pada masing-masing event. Silakan cek halaman event untuk informasi refund policy.
                    </p>
                </section>

                <section className="border-b pb-4">
                    <h2 className="text-lg font-semibold mb-2">Tiket tidak masuk ke email, bagaimana?</h2>
                    <p className="text-muted-foreground">
                        Cek folder spam/junk. Jika tidak ada, login ke akun Anda dan download tiket dari menu &quot;Tiket Saya&quot;.
                    </p>
                </section>

                <section className="border-b pb-4">
                    <h2 className="text-lg font-semibold mb-2">Apakah tiket bisa dipindahtangankan?</h2>
                    <p className="text-muted-foreground">
                        Tergantung kebijakan event. Beberapa event mewajibkan nama di tiket sesuai KTP saat check-in.
                    </p>
                </section>

                <section>
                    <h2 className="text-lg font-semibold mb-2">Bagaimana cara check-in di event?</h2>
                    <p className="text-muted-foreground">
                        Tunjukkan QR code tiket Anda (dari email atau aplikasi) ke petugas di pintu masuk event.
                    </p>
                </section>
            </div>
        </div>
    );
}
