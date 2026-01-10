import Link from "next/link";
import { ArrowLeft, Shield } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Kebijakan Privasi - BSC Tickets",
    description: "Kebijakan privasi BSC Tickets menjelaskan bagaimana kami mengumpulkan, menggunakan, dan melindungi data pribadi Anda.",
};

export default function PrivacyPage() {
    return (
        <div className="min-h-screen bg-gray-50">
            <div className="bg-white border-b">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-4"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Kembali
                    </Link>
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-100 rounded-lg">
                            <Shield className="h-6 w-6 text-indigo-600" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Kebijakan Privasi</h1>
                            <p className="text-gray-500">Terakhir diperbarui: 10 Januari 2026</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="bg-white rounded-2xl shadow-sm p-8 prose prose-gray max-w-none">
                    <div className="mb-8 p-4 bg-indigo-50 border border-indigo-100 rounded-lg">
                        <p className="text-indigo-800 text-sm">
                            Kebijakan Privasi ini menjelaskan bagaimana BSC Tickets mengumpulkan,
                            menggunakan, dan melindungi informasi pribadi Anda. Kami berkomitmen
                            untuk menjaga privasi dan keamanan data Anda.
                        </p>
                    </div>

                    <section className="mb-8">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">1. Informasi yang Kami Kumpulkan</h2>
                        <p className="text-gray-600 mb-4">
                            Kami mengumpulkan informasi yang Anda berikan secara langsung kepada kami,
                            termasuk:
                        </p>
                        <ul className="list-disc pl-6 text-gray-600 space-y-2">
                            <li>
                                <strong>Informasi Akun:</strong> Nama, alamat email, nomor telepon, dan
                                kata sandi saat Anda membuat akun.
                            </li>
                            <li>
                                <strong>Informasi Profil:</strong> Foto profil, tanggal lahir, jenis
                                kelamin, dan alamat.
                            </li>
                            <li>
                                <strong>Informasi Pembayaran:</strong> Detail kartu kredit/debit atau
                                informasi rekening bank untuk pemrosesan pembayaran.
                            </li>
                            <li>
                                <strong>Informasi Transaksi:</strong> Riwayat pembelian tiket dan
                                kehadiran di event.
                            </li>
                            <li>
                                <strong>Komunikasi:</strong> Pesan yang Anda kirim kepada kami melalui
                                formulir kontak atau email.
                            </li>
                        </ul>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">2. Informasi yang Dikumpulkan Secara Otomatis</h2>
                        <p className="text-gray-600 mb-4">
                            Saat Anda menggunakan Platform, kami secara otomatis mengumpulkan:
                        </p>
                        <ul className="list-disc pl-6 text-gray-600 space-y-2">
                            <li>
                                <strong>Data Perangkat:</strong> Jenis perangkat, sistem operasi, browser,
                                dan pengidentifikasi unik perangkat.
                            </li>
                            <li>
                                <strong>Data Log:</strong> Alamat IP, waktu akses, halaman yang dikunjungi,
                                dan tindakan yang dilakukan.
                            </li>
                            <li>
                                <strong>Data Lokasi:</strong> Lokasi geografis umum berdasarkan alamat IP.
                            </li>
                            <li>
                                <strong>Cookies:</strong> File kecil yang disimpan di perangkat Anda untuk
                                meningkatkan pengalaman pengguna.
                            </li>
                        </ul>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">3. Penggunaan Informasi</h2>
                        <p className="text-gray-600 mb-4">
                            Kami menggunakan informasi yang dikumpulkan untuk:
                        </p>
                        <ul className="list-disc pl-6 text-gray-600 space-y-2">
                            <li>Menyediakan dan mengelola layanan Platform.</li>
                            <li>Memproses transaksi dan mengirim konfirmasi pembelian.</li>
                            <li>Mengirim e-ticket dan pengingat event.</li>
                            <li>Meningkatkan dan mengembangkan Platform.</li>
                            <li>Mengirim informasi promosi dan penawaran (dengan persetujuan Anda).</li>
                            <li>Mencegah penipuan dan menjaga keamanan Platform.</li>
                            <li>Mematuhi kewajiban hukum.</li>
                        </ul>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">4. Berbagi Informasi</h2>
                        <p className="text-gray-600 mb-4">
                            Kami dapat membagikan informasi Anda dengan:
                        </p>
                        <ul className="list-disc pl-6 text-gray-600 space-y-2">
                            <li>
                                <strong>Organizer Event:</strong> Untuk memfasilitasi kehadiran Anda di event.
                            </li>
                            <li>
                                <strong>Penyedia Layanan:</strong> Pihak ketiga yang membantu kami dalam
                                operasional seperti payment gateway dan cloud hosting.
                            </li>
                            <li>
                                <strong>Mitra Bisnis:</strong> Dengan persetujuan Anda untuk penawaran khusus.
                            </li>
                            <li>
                                <strong>Otoritas Hukum:</strong> Jika diwajibkan oleh hukum atau untuk
                                melindungi hak kami.
                            </li>
                        </ul>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">5. Keamanan Data</h2>
                        <p className="text-gray-600 mb-4">
                            Kami menerapkan langkah-langkah keamanan yang sesuai untuk melindungi
                            informasi Anda, termasuk:
                        </p>
                        <ul className="list-disc pl-6 text-gray-600 space-y-2">
                            <li>Enkripsi data saat transit menggunakan SSL/TLS.</li>
                            <li>Enkripsi data sensitif saat disimpan.</li>
                            <li>Akses terbatas ke data pribadi oleh karyawan.</li>
                            <li>Audit keamanan berkala.</li>
                            <li>Pemberitahuan pelanggaran data jika terjadi.</li>
                        </ul>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">6. Hak Anda</h2>
                        <p className="text-gray-600 mb-4">
                            Anda memiliki hak untuk:
                        </p>
                        <ul className="list-disc pl-6 text-gray-600 space-y-2">
                            <li>
                                <strong>Akses:</strong> Meminta salinan data pribadi yang kami miliki.
                            </li>
                            <li>
                                <strong>Koreksi:</strong> Memperbarui atau memperbaiki data yang tidak akurat.
                            </li>
                            <li>
                                <strong>Penghapusan:</strong> Meminta penghapusan data pribadi Anda.
                            </li>
                            <li>
                                <strong>Pembatasan:</strong> Membatasi cara kami menggunakan data Anda.
                            </li>
                            <li>
                                <strong>Portabilitas:</strong> Menerima data Anda dalam format yang dapat dibaca mesin.
                            </li>
                            <li>
                                <strong>Penolakan:</strong> Menolak penggunaan data untuk pemasaran langsung.
                            </li>
                        </ul>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">7. Cookies</h2>
                        <p className="text-gray-600 mb-4">
                            Kami menggunakan cookies untuk:
                        </p>
                        <ul className="list-disc pl-6 text-gray-600 space-y-2">
                            <li>Mengingat preferensi dan pengaturan Anda.</li>
                            <li>Memahami bagaimana Anda menggunakan Platform.</li>
                            <li>Menyediakan konten yang dipersonalisasi.</li>
                            <li>Mengukur efektivitas kampanye pemasaran.</li>
                        </ul>
                        <p className="text-gray-600 mt-4">
                            Anda dapat mengatur browser Anda untuk menolak cookies, namun hal ini
                            dapat mempengaruhi fungsionalitas Platform.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">8. Penyimpanan Data</h2>
                        <p className="text-gray-600">
                            Kami menyimpan data pribadi Anda selama akun Anda aktif atau selama
                            diperlukan untuk menyediakan layanan. Setelah akun dihapus, kami akan
                            menghapus atau menganonimkan data Anda dalam waktu 90 hari, kecuali
                            jika diwajibkan oleh hukum untuk menyimpannya lebih lama.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">9. Anak-Anak</h2>
                        <p className="text-gray-600">
                            Platform kami tidak ditujukan untuk anak-anak di bawah 17 tahun. Kami
                            tidak dengan sengaja mengumpulkan data pribadi dari anak-anak. Jika
                            Anda mengetahui bahwa anak Anda telah memberikan informasi kepada kami,
                            silakan hubungi kami untuk penghapusan.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">10. Perubahan Kebijakan</h2>
                        <p className="text-gray-600">
                            Kami dapat memperbarui Kebijakan Privasi ini dari waktu ke waktu.
                            Perubahan akan dipublikasikan di halaman ini dengan tanggal efektif
                            yang diperbarui. Kami akan memberitahu Anda melalui email atau
                            notifikasi Platform untuk perubahan yang signifikan.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-gray-900 mb-4">11. Hubungi Kami</h2>
                        <p className="text-gray-600 mb-4">
                            Jika Anda memiliki pertanyaan atau kekhawatiran tentang Kebijakan Privasi
                            ini atau praktik data kami, silakan hubungi:
                        </p>
                        <div className="p-4 bg-gray-50 rounded-lg">
                            <p className="text-gray-600">
                                <strong>Data Protection Officer</strong>
                            </p>
                            <p className="text-gray-600">
                                <strong>Email:</strong> privacy@bsctickets.com
                            </p>
                            <p className="text-gray-600">
                                <strong>Telepon:</strong> +62 21 1234 5678
                            </p>
                            <p className="text-gray-600">
                                <strong>Alamat:</strong> Jl. Sudirman No. 123, Jakarta Pusat, 10220
                            </p>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}
