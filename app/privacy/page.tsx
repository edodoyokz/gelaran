import type { Metadata } from "next";
import { Mail, Phone, Shield } from "lucide-react";
import { TextContentSection } from "@/components/shared/public-marketing";

export const metadata: Metadata = {
    title: "Kebijakan Privasi",
    description:
        "Kebijakan privasi Gelaran menjelaskan bagaimana kami mengumpulkan, menggunakan, dan melindungi data pribadi pengguna di dalam platform.",
};

export default function PrivacyPage() {
    return (
        <TextContentSection
            eyebrow="Privacy policy"
            title="Kebijakan Privasi Gelaran"
            updatedAt="10 Januari 2026"
            summary={
                <p>
                    Dokumen ini menjelaskan bagaimana Gelaran mengumpulkan, menggunakan, menyimpan, dan melindungi informasi pribadi Anda saat menggunakan platform kami untuk menjelajahi event, membeli tiket, atau berinteraksi dengan layanan Gelaran.
                </p>
            }
        >
            <div className="space-y-10">
                <section className="space-y-4">
                    <div className="rounded-2xl border border-(--border) bg-(--surface-brand-soft) p-5 text-sm leading-7 text-(--text-secondary) sm:text-base">
                        Gelaran berkomitmen menjaga privasi dan keamanan data pengguna. Dengan menggunakan platform ini, Anda menyetujui praktik pengelolaan data sebagaimana dijelaskan dalam kebijakan ini.
                    </div>
                </section>

                <section>
                    <h2>1. Informasi yang kami kumpulkan</h2>
                    <p>
                        Kami mengumpulkan informasi yang Anda berikan secara langsung kepada kami, termasuk tetapi tidak terbatas pada:
                    </p>
                    <ul>
                        <li><strong>Informasi akun:</strong> nama, alamat email, nomor telepon, dan kata sandi ketika Anda membuat akun.</li>
                        <li><strong>Informasi profil:</strong> foto profil, tanggal lahir, jenis kelamin, dan alamat bila Anda memilih untuk melengkapinya.</li>
                        <li><strong>Informasi pembayaran:</strong> data yang diperlukan untuk memproses pembayaran tiket atau pencairan dana organizer.</li>
                        <li><strong>Informasi transaksi:</strong> riwayat pembelian, kehadiran event, dan aktivitas terkait pesanan.</li>
                        <li><strong>Komunikasi:</strong> pesan yang Anda kirim melalui formulir kontak, email, atau kanal bantuan lainnya.</li>
                    </ul>
                </section>

                <section>
                    <h2>2. Informasi yang dikumpulkan secara otomatis</h2>
                    <p>
                        Saat Anda mengakses platform, kami juga dapat mengumpulkan informasi tertentu secara otomatis untuk menjaga performa dan keamanan layanan.
                    </p>
                    <ul>
                        <li><strong>Data perangkat:</strong> jenis perangkat, sistem operasi, browser, dan pengenal perangkat tertentu.</li>
                        <li><strong>Data log:</strong> alamat IP, waktu akses, halaman yang dibuka, serta interaksi penting di dalam platform.</li>
                        <li><strong>Data lokasi umum:</strong> perkiraan lokasi geografis berdasarkan alamat IP.</li>
                        <li><strong>Cookies dan teknologi serupa:</strong> digunakan untuk mengingat preferensi, menjaga sesi, dan memahami penggunaan produk.</li>
                    </ul>
                </section>

                <section>
                    <h2>3. Cara kami menggunakan informasi</h2>
                    <p>Informasi yang dikumpulkan digunakan untuk tujuan berikut:</p>
                    <ul>
                        <li>Menyediakan, menjalankan, dan meningkatkan layanan Gelaran.</li>
                        <li>Memproses transaksi, mengirim konfirmasi, dan mendistribusikan e-ticket.</li>
                        <li>Mengirim pengingat event, pembaruan pesanan, atau pemberitahuan penting.</li>
                        <li>Mengembangkan pengalaman produk, desain, dan dukungan pelanggan.</li>
                        <li>Mengirim penawaran promosi apabila Anda memberikan persetujuan.</li>
                        <li>Mendeteksi penipuan, penyalahgunaan, atau ancaman keamanan lainnya.</li>
                        <li>Memenuhi kewajiban hukum dan kepatuhan yang berlaku.</li>
                    </ul>
                </section>

                <section>
                    <h2>4. Berbagi informasi</h2>
                    <p>Kami dapat membagikan data pribadi Anda kepada pihak berikut hanya sejauh diperlukan:</p>
                    <ul>
                        <li><strong>Organizer event</strong> untuk memfasilitasi partisipasi Anda pada event yang dipilih.</li>
                        <li><strong>Penyedia layanan</strong> seperti payment gateway, infrastruktur cloud, dan alat pendukung operasional.</li>
                        <li><strong>Mitra bisnis</strong> apabila Anda menyetujui penawaran atau program tertentu.</li>
                        <li><strong>Otoritas hukum</strong> jika diwajibkan oleh peraturan perundang-undangan atau untuk melindungi hak Gelaran.</li>
                    </ul>
                </section>

                <section>
                    <h2>5. Keamanan data</h2>
                    <p>
                        Kami menerapkan langkah-langkah teknis dan organisasional yang wajar untuk membantu melindungi data pribadi, termasuk enkripsi saat transit, pembatasan akses internal, dan evaluasi keamanan berkala.
                    </p>
                    <p>
                        Meskipun demikian, tidak ada sistem digital yang sepenuhnya bebas risiko. Karena itu, kami terus memperbarui praktik keamanan sesuai perkembangan teknologi dan ancaman yang relevan.
                    </p>
                </section>

                <section>
                    <h2>6. Hak Anda</h2>
                    <p>Anda dapat memiliki hak-hak tertentu terkait data pribadi Anda, sesuai hukum yang berlaku, termasuk:</p>
                    <ul>
                        <li>Meminta akses atas data pribadi yang kami simpan.</li>
                        <li>Memperbaiki informasi yang tidak akurat atau tidak mutakhir.</li>
                        <li>Meminta penghapusan data dalam kondisi tertentu.</li>
                        <li>Membatasi atau menolak penggunaan data untuk kebutuhan tertentu.</li>
                        <li>Meminta salinan data dalam format yang dapat dipindahkan jika relevan.</li>
                    </ul>
                </section>

                <section>
                    <h2>7. Cookies</h2>
                    <p>
                        Kami menggunakan cookies untuk menjaga sesi Anda tetap aktif, mengingat preferensi, memahami pola penggunaan, dan membantu peningkatan performa halaman publik maupun area produk lainnya.
                    </p>
                    <p>
                        Anda dapat menyesuaikan pengaturan cookies melalui browser yang digunakan. Namun, beberapa fitur platform mungkin tidak berjalan optimal bila cookies dinonaktifkan.
                    </p>
                </section>

                <section>
                    <h2>8. Penyimpanan data</h2>
                    <p>
                        Kami menyimpan data pribadi selama diperlukan untuk menyediakan layanan, menjaga riwayat transaksi, memenuhi kebutuhan operasional, atau memenuhi kewajiban hukum. Setelah tidak lagi diperlukan, data akan dihapus, dianonimkan, atau disimpan dengan perlindungan yang sesuai.
                    </p>
                </section>

                <section>
                    <h2>9. Layanan untuk anak-anak</h2>
                    <p>
                        Platform Gelaran tidak ditujukan untuk anak-anak di bawah usia 17 tahun, kecuali diperbolehkan oleh hukum atau kebijakan event tertentu. Kami tidak dengan sengaja mengumpulkan data pribadi anak tanpa dasar hukum yang sah.
                    </p>
                </section>

                <section>
                    <h2>10. Perubahan kebijakan</h2>
                    <p>
                        Kebijakan Privasi ini dapat diperbarui dari waktu ke waktu. Perubahan material akan dipublikasikan melalui halaman ini, dan bila diperlukan kami dapat memberikan pemberitahuan tambahan melalui email atau notifikasi platform.
                    </p>
                </section>

                <section className="space-y-4">
                    <h2>11. Hubungi kami</h2>
                    <p>
                        Jika Anda memiliki pertanyaan, permintaan, atau keberatan terkait kebijakan ini dan praktik pengelolaan data Gelaran, silakan hubungi kami melalui kontak berikut:
                    </p>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="rounded-2xl border border-(--border) bg-(--surface) p-5 shadow-(--shadow-xs)">
                            <div className="flex items-start gap-3">
                                <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-(--surface-brand-soft) text-(--accent-primary)">
                                    <Shield className="h-5 w-5" />
                                </span>
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-(--text-muted)">Data protection</p>
                                    <p className="mt-1 text-sm font-semibold text-foreground">Data Protection Officer</p>
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
                                    <span>privacy@bsctickets.com</span>
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
            </div>
        </TextContentSection>
    );
}
