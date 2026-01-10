import Link from "next/link";

export function Footer() {
    return (
        <footer className="bg-gray-50 border-t border-gray-200 py-12 mt-12">
            <div className="container mx-auto px-4 text-center">
                <h3 className="font-bold text-2xl text-indigo-900 mb-4">BSC Tickets</h3>
                <p className="text-gray-500 mb-8">
                    Platform manajemen event dan penjualan tiket terpercaya.
                </p>
                <div className="flex justify-center space-x-6 text-sm text-gray-500">
                    <Link href="/about" className="hover:text-indigo-600 transition-colors">
                        Tentang Kami
                    </Link>
                    <Link href="/contact" className="hover:text-indigo-600 transition-colors">
                        Hubungi
                    </Link>
                    <Link href="/terms" className="hover:text-indigo-600 transition-colors">
                        Syarat & Ketentuan
                    </Link>
                    <Link href="/privacy" className="hover:text-indigo-600 transition-colors">
                        Kebijakan Privasi
                    </Link>
                </div>
                <p className="text-xs text-gray-400 mt-8">
                    &copy; 2026 BSC Event Platform. All rights reserved.
                </p>
            </div>
        </footer>
    );
}
