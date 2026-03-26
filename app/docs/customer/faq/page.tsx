import { Breadcrumb } from "@/components/docs/Breadcrumb";

const faqs = [
    {
        question: "Bagaimana cara membatalkan tiket?",
        answer: "Kebijakan pembatalan tergantung pada masing-masing event. Cek halaman event untuk informasi refund policy. Jika diijinkan, buka menu 'Tiket Saya' dan klik 'Ajukan Refund'."
    },
    {
        question: "Tiket tidak masuk ke email, bagaimana?",
        answer: "Cek folder spam/junk di email Anda. Jika tidak ada, login ke akun Gelaran dan download tiket dari menu 'Tiket Saya'. Anda juga bisa meminta pengiriman ulang email."
    },
    {
        question: "Apakah tiket bisa dipindahtangankan?",
        answer: "Tergantung kebijakan event. Beberapa event mewajibkan nama di tiket sesuai KTP saat check-in. Cek detail event untuk informasi lebih lanjut."
    },
    {
        question: "Bagaimana cara check-in di event?",
        answer: "Tunjukkan QR code tiket Anda (dari email atau aplikasi) ke petugas di pintu masuk event. Petugas akan scan QR code untuk validasi tiket Anda."
    },
    {
        question: "Pembayaran sudah berhasil tapi tiket belum masuk?",
        answer: "Tunggu 1-5 menit untuk proses otomatis. Jika lebih dari 30 menit, hubungi customer support dengan bukti pembayaran."
    },
    {
        question: "Apakah bisa beli tiket untuk orang lain?",
        answer: "Bisa! Saat checkout, masukkan data pengunjung sesuai nama orang yang akan hadir. Tiket akan dikirim ke email pembeli."
    }
];

export default function CustomerFAQDocsPage() {
    return (
        <div className="animate-fade-in">
            <Breadcrumb
                items={[
                    { label: "Dokumentasi", href: "/docs" },
                    { label: "Customer", href: "/docs/customer" },
                    { label: "FAQ" },
                ]}
            />

            <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-4">
                FAQ - Pertanyaan Umum
            </h1>
            <p className="text-xl text-slate-600 mb-8 leading-relaxed">
                Jawaban untuk pertanyaan yang sering diajukan.
            </p>

            {/* FAQ List */}
            <div className="space-y-4 mb-12">
                {faqs.map((faq, index) => (
                    <div key={index} className="border border-slate-200 rounded-lg overflow-hidden">
                        <div className="p-4 bg-slate-50">
                            <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                                <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 text-sm flex items-center justify-center">
                                    {index + 1}
                                </span>
                                {faq.question}
                            </h3>
                        </div>
                        <div className="p-4 bg-white">
                            <p className="text-slate-600 text-sm">{faq.answer}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Still need help */}
            <div className="p-6 bg-linear-to-br from-indigo-50 to-blue-50 rounded-xl mb-12">
                <h3 className="font-bold text-slate-900 mb-2">Masih ada pertanyaan?</h3>
                <p className="text-slate-600 mb-4">
                    Jika pertanyaan Anda belum terjawab, silakan hubungi tim support kami.
                </p>
                <a
                    href="/docs/customer/support"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
                >
                    Hubungi Support
                </a>
            </div>

            {/* Footer */}
            <div className="mt-16 pt-8 border-t border-slate-200 flex justify-between items-center text-sm text-slate-500">
                <span>Terakhir diperbarui: Januari 2026</span>
            </div>
        </div>
    );
}
