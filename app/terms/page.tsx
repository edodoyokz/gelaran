import Link from "next/link";
import type { Metadata } from "next";
import { Scale, Mail, Phone } from "lucide-react";
import { TextContentSection } from "@/components/shared/public-marketing";

export const metadata: Metadata = {
    title: "Syarat & Ketentuan - Gelaran",
    description: "Syarat dan ketentuan penggunaan platform Gelaran untuk pengguna dan organizer.",
};

export default function TermsPage() {
    return (
        <TextContentSection
            eyebrow="Legal"
            title="Syarat & Ketentuan"
            updatedAt="10 Januari 2026"
            summary={
                <p>
                    Dengan mengakses dan menggunakan platform Gelaran, Anda menyetujui untuk terikat oleh syarat dan ketentuan berikut. Gelaran berhak mengubah ketentuan ini sewaktu-waktu.
                </p>
            }
        >
            <div className="space-y-10">
                <section>
                    <h2>1. Penerimaan syarat</h2>
                    <p>
                        Dengan mengakses dan menggunakan platform Gelaran (&quot;Platform&quot;), Anda menyetujui untuk terikat oleh Syarat dan Ketentuan ini. Jika Anda tidak menyetujui syarat-syarat ini, mohon untuk tidak menggunakan Platform kami.
                    </p>
                    <p>
                        Gelaran berhak untuk mengubah syarat dan ketentuan ini sewaktu-waktu. Perubahan akan berlaku efektif segera setelah dipublikasikan di Platform.
                    </p>
                </section>

                <section>
                    <h2>2. Definisi</h2>
                    <ul>
                        <li><strong>&quot;Platform&quot;</strong> berarti website dan aplikasi Gelaran.</li>
                        <li><strong>&quot;Pengguna&quot;</strong> berarti setiap individu yang mengakses Platform.</li>
                        <li><strong>&quot;Pembeli&quot;</strong> berarti Pengguna yang membeli tiket melalui Platform.</li>
                        <li><strong>&quot;Organizer&quot;</strong> berarti pihak yang menyelenggarakan event dan menjual tiket melalui Platform.</li>
                        <li><strong>&quot;Event&quot;</strong> berarti acara yang diselenggarakan oleh Organizer.</li>
                    </ul>
                </section>

                <section>
                    <h2>3. Pendaftaran akun</h2>
                    <p>Untuk menggunakan fitur tertentu di Platform, Anda perlu membuat akun dengan memberikan informasi yang akurat dan lengkap. Anda bertanggung jawab untuk:</p>
                    <ul>
                        <li>Menjaga kerahasiaan kata sandi akun Anda.</li>
                        <li>Semua aktivitas yang terjadi di akun Anda.</li>
                        <li>Memberikan informasi yang benar dan terkini.</li>
                        <li>Memberitahu kami segera jika ada penggunaan tidak sah atas akun Anda.</li>
                    </ul>
                </section>

                <section>
                    <h2>4. Pembelian tiket</h2>
                    <p>Dengan membeli tiket melalui Platform, Anda menyetujui bahwa:</p>
                    <ul>
                        <li>Anda berusia minimal 17 tahun atau memiliki izin orang tua/wali.</li>
                        <li>Informasi pembayaran yang diberikan adalah akurat.</li>
                        <li>Anda bertanggung jawab atas semua biaya yang timbul.</li>
                        <li>Tiket yang dibeli adalah untuk penggunaan pribadi dan tidak untuk dijual kembali.</li>
                    </ul>
                </section>

                <section>
                    <h2>5. Kebijakan pembatalan & refund</h2>
                    <p>
                        Kebijakan pembatalan dan refund ditentukan oleh masing-masing Organizer. Gelaran berperan sebagai fasilitator dan tidak bertanggung jawab atas keputusan refund yang dibuat oleh Organizer.
                    </p>
                    <p>
                        Dalam kasus pembatalan event oleh Organizer, Pembeli berhak mendapatkan refund penuh sesuai dengan prosedur yang berlaku.
                    </p>
                </section>

                <section>
                    <h2>6. Kewajiban organizer</h2>
                    <p>Organizer yang menggunakan Platform wajib:</p>
                    <ul>
                        <li>Memberikan informasi event yang akurat dan lengkap.</li>
                        <li>Menyelenggarakan event sesuai dengan yang dipromosikan.</li>
                        <li>Bertanggung jawab atas keamanan dan kenyamanan peserta.</li>
                        <li>Memiliki izin yang diperlukan untuk menyelenggarakan event.</li>
                        <li>Mematuhi semua peraturan dan hukum yang berlaku.</li>
                    </ul>
                </section>

                <section>
                    <h2>7. Biaya platform</h2>
                    <p>
                        Gelaran mengenakan biaya platform sebesar 5% dari setiap transaksi tiket yang berhasil. Biaya ini sudah termasuk dalam harga tiket yang ditampilkan kepada Pembeli.
                    </p>
                    <p>
                        Organizer akan menerima pendapatan bersih setelah dikurangi biaya platform dan biaya payment gateway yang berlaku.
                    </p>
                </section>

                <section>
                    <h2>8. Hak kekayaan intelektual</h2>
                    <p>
                        Semua konten di Platform, termasuk namun tidak terbatas pada logo, desain, teks, gambar, dan software, adalah milik Gelaran atau pemberi lisensi kami dan dilindungi oleh hukum hak cipta.
                    </p>
                </section>

                <section>
                    <h2>9. Batasan tanggung jawab</h2>
                    <p>
                        Gelaran tidak bertanggung jawab atas kerugian langsung, tidak langsung, insidental, atau konsekuensial yang timbul dari penggunaan Platform atau kehadiran di event yang diselenggarakan melalui Platform.
                    </p>
                </section>

                <section>
                    <h2>10. Hukum yang berlaku</h2>
                    <p>
                        Syarat dan Ketentuan ini diatur oleh dan ditafsirkan sesuai dengan hukum Republik Indonesia. Setiap perselisihan akan diselesaikan melalui pengadilan yang berwenang di Jakarta.
                    </p>
                </section>

                <section className="space-y-4">
                    <h2>11. Hubungi kami</h2>
                    <p>Jika Anda memiliki pertanyaan tentang Syarat dan Ketentuan ini, hubungi kami melalui:</p>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="rounded-2xl border border-(--border) bg-(--surface) p-5 shadow-(--shadow-xs)">
                            <div className="flex items-start gap-3">
                                <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-(--surface-brand-soft) text-(--accent-primary)">
                                    <Scale className="h-5 w-5" />
                                </span>
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-(--text-muted)">Legal team</p>
                                    <p className="mt-1 text-sm font-semibold text-foreground">Tim Hukum Gelaran</p>
                                    <p className="mt-2 text-sm leading-7 text-(--text-secondary)">
                                        Gelaran<br />
                                        Jl. Sudirman No. 123, Jakarta Pusat, 10220
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="rounded-2xl border border-(--border) bg-(--surface) p-5 shadow-(--shadow-xs)">
                            <div className="space-y-4">
                                <div className="flex items-center gap-3 text-sm text-foreground">
                                    <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-(--surface-brand-soft) text-(--accent-primary)">
                                        <Mail className="h-5 w-5" />
                                    </span>
                                    <span>legal@bsctickets.com</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm text-foreground">
                                    <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-(--surface-brand-soft) text-(--accent-primary)">
                                        <Phone className="h-5 w-5" />
                                    </span>
                                    <span>+62 21 1234 5678</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <div className="rounded-2xl border border-(--border-light) bg-(--surface-elevated) p-5 text-sm text-(--text-secondary)">
                    <p>Dokumen syarat dan ketentuan ini sebelumnya tersedia di halaman terpisah. Untuk navigasi mudah, kunjungi juga <Link href="/privacy" className="text-(--accent-primary) hover:underline">Kebijakan Privasi</Link> kami.</p>
                </div>
            </div>
        </TextContentSection>
    );
}
