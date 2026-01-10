import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Syarat & Ketentuan - BSC Tickets",
    description: "Syarat dan ketentuan penggunaan platform BSC Tickets untuk pengguna dan organizer.",
};

export default function TermsPage() {
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
                    <h1 className="text-3xl font-bold text-gray-900">Syarat & Ketentuan</h1>
                    <p className="text-gray-500 mt-2">Terakhir diperbarui: 10 Januari 2026</p>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="bg-white rounded-2xl shadow-sm p-8 prose prose-gray max-w-none">
                    <section className="mb-8">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">1. Penerimaan Syarat</h2>
                        <p className="text-gray-600 mb-4">
                            Dengan mengakses dan menggunakan platform BSC Tickets (&quot;Platform&quot;), Anda
                            menyetujui untuk terikat oleh Syarat dan Ketentuan ini. Jika Anda tidak
                            menyetujui syarat-syarat ini, mohon untuk tidak menggunakan Platform kami.
                        </p>
                        <p className="text-gray-600">
                            BSC Tickets berhak untuk mengubah syarat dan ketentuan ini sewaktu-waktu.
                            Perubahan akan berlaku efektif segera setelah dipublikasikan di Platform.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">2. Definisi</h2>
                        <ul className="list-disc pl-6 text-gray-600 space-y-2">
                            <li>
                                <strong>&quot;Platform&quot;</strong> berarti website dan aplikasi BSC Tickets.
                            </li>
                            <li>
                                <strong>&quot;Pengguna&quot;</strong> berarti setiap individu yang mengakses Platform.
                            </li>
                            <li>
                                <strong>&quot;Pembeli&quot;</strong> berarti Pengguna yang membeli tiket melalui Platform.
                            </li>
                            <li>
                                <strong>&quot;Organizer&quot;</strong> berarti pihak yang menyelenggarakan event dan
                                menjual tiket melalui Platform.
                            </li>
                            <li>
                                <strong>&quot;Event&quot;</strong> berarti acara yang diselenggarakan oleh Organizer.
                            </li>
                        </ul>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">3. Pendaftaran Akun</h2>
                        <p className="text-gray-600 mb-4">
                            Untuk menggunakan fitur tertentu di Platform, Anda perlu membuat akun dengan
                            memberikan informasi yang akurat dan lengkap. Anda bertanggung jawab untuk:
                        </p>
                        <ul className="list-disc pl-6 text-gray-600 space-y-2">
                            <li>Menjaga kerahasiaan kata sandi akun Anda.</li>
                            <li>Semua aktivitas yang terjadi di akun Anda.</li>
                            <li>Memberikan informasi yang benar dan terkini.</li>
                            <li>Memberitahu kami segera jika ada penggunaan tidak sah atas akun Anda.</li>
                        </ul>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">4. Pembelian Tiket</h2>
                        <p className="text-gray-600 mb-4">
                            Dengan membeli tiket melalui Platform, Anda menyetujui bahwa:
                        </p>
                        <ul className="list-disc pl-6 text-gray-600 space-y-2">
                            <li>Anda berusia minimal 17 tahun atau memiliki izin orang tua/wali.</li>
                            <li>Informasi pembayaran yang diberikan adalah akurat.</li>
                            <li>Anda bertanggung jawab atas semua biaya yang timbul.</li>
                            <li>Tiket yang dibeli adalah untuk penggunaan pribadi dan tidak untuk dijual kembali.</li>
                        </ul>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">5. Kebijakan Pembatalan dan Refund</h2>
                        <p className="text-gray-600 mb-4">
                            Kebijakan pembatalan dan refund ditentukan oleh masing-masing Organizer.
                            BSC Tickets berperan sebagai fasilitator dan tidak bertanggung jawab atas
                            keputusan refund yang dibuat oleh Organizer.
                        </p>
                        <p className="text-gray-600">
                            Dalam kasus pembatalan event oleh Organizer, Pembeli berhak mendapatkan
                            refund penuh sesuai dengan prosedur yang berlaku.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">6. Kewajiban Organizer</h2>
                        <p className="text-gray-600 mb-4">
                            Organizer yang menggunakan Platform wajib:
                        </p>
                        <ul className="list-disc pl-6 text-gray-600 space-y-2">
                            <li>Memberikan informasi event yang akurat dan lengkap.</li>
                            <li>Menyelenggarakan event sesuai dengan yang dipromosikan.</li>
                            <li>Bertanggung jawab atas keamanan dan kenyamanan peserta.</li>
                            <li>Memiliki izin yang diperlukan untuk menyelenggarakan event.</li>
                            <li>Mematuhi semua peraturan dan hukum yang berlaku.</li>
                        </ul>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">7. Biaya Platform</h2>
                        <p className="text-gray-600 mb-4">
                            BSC Tickets mengenakan biaya platform sebesar 5% dari setiap transaksi tiket
                            yang berhasil. Biaya ini sudah termasuk dalam harga tiket yang ditampilkan
                            kepada Pembeli.
                        </p>
                        <p className="text-gray-600">
                            Organizer akan menerima pendapatan bersih setelah dikurangi biaya platform
                            dan biaya payment gateway yang berlaku.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">8. Hak Kekayaan Intelektual</h2>
                        <p className="text-gray-600">
                            Semua konten di Platform, termasuk namun tidak terbatas pada logo, desain,
                            teks, gambar, dan software, adalah milik BSC Tickets atau pemberi lisensi
                            kami dan dilindungi oleh hukum hak cipta.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">9. Batasan Tanggung Jawab</h2>
                        <p className="text-gray-600">
                            BSC Tickets tidak bertanggung jawab atas kerugian langsung, tidak langsung,
                            insidental, atau konsekuensial yang timbul dari penggunaan Platform atau
                            kehadiran di event yang diselenggarakan melalui Platform.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">10. Hukum yang Berlaku</h2>
                        <p className="text-gray-600">
                            Syarat dan Ketentuan ini diatur oleh dan ditafsirkan sesuai dengan hukum
                            Republik Indonesia. Setiap perselisihan akan diselesaikan melalui pengadilan
                            yang berwenang di Jakarta.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-gray-900 mb-4">11. Hubungi Kami</h2>
                        <p className="text-gray-600">
                            Jika Anda memiliki pertanyaan tentang Syarat dan Ketentuan ini, silakan
                            hubungi kami di:
                        </p>
                        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                            <p className="text-gray-600">
                                <strong>Email:</strong> legal@bsctickets.com
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
