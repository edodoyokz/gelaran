import React, { useState } from 'react';
import { 
  Menu, 
  X, 
  Search, 
  ChevronRight, 
  BookOpen, 
  Code, 
  Zap, 
  Layout, 
  Github, 
  Terminal,
  ExternalLink,
  Copy,
  Check
} from 'lucide-react';

// Komponen Bingkai Browser untuk Screenshot
const BrowserFrame = ({ src, alt, title }) => (
  <div className="my-8 rounded-lg overflow-hidden border border-slate-200 shadow-xl bg-white">
    <div className="bg-slate-100 border-b border-slate-200 px-4 py-3 flex items-center gap-2">
      <div className="flex gap-1.5">
        <div className="w-3 h-3 rounded-full bg-red-400"></div>
        <div className="w-3 h-3 rounded-full bg-amber-400"></div>
        <div className="w-3 h-3 rounded-full bg-green-400"></div>
      </div>
      <div className="ml-4 flex-1 bg-white border border-slate-200 rounded px-3 py-1 text-xs text-slate-500 font-mono truncate flex items-center justify-center">
        {title || 'https://example.com/demo'}
      </div>
    </div>
    <div className="relative aspect-video bg-slate-50 w-full overflow-hidden group">
        {/* Placeholder Image - Ganti src dengan URL screenshot asli Anda */}
        <img 
            src={src} 
            alt={alt} 
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={(e) => {
                e.target.src = "https://placehold.co/1200x800/f1f5f9/94a3b8?text=Screenshot+Website+Anda";
            }}
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300 pointer-events-none" />
    </div>
  </div>
);

// Komponen Blok Kode Sederhana
const CodeBlock = ({ code, language = 'bash' }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-6 rounded-lg overflow-hidden bg-slate-900 text-slate-50 text-sm font-mono shadow-md">
      <div className="flex justify-between items-center px-4 py-2 bg-slate-800/50 border-b border-slate-700/50">
        <span className="text-xs text-slate-400 uppercase">{language}</span>
        <button 
          onClick={handleCopy}
          className="text-slate-400 hover:text-white transition-colors p-1"
        >
          {copied ? <Check size={14} /> : <Copy size={14} />}
        </button>
      </div>
      <div className="p-4 overflow-x-auto">
        <pre>{code}</pre>
      </div>
    </div>
  );
};

const App = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('pengenalan');

  const navigation = [
    {
      title: 'Memulai',
      items: [
        { id: 'pengenalan', label: 'Pengenalan', icon: BookOpen },
        { id: 'instalasi', label: 'Instalasi', icon: Terminal },
        { id: 'konfigurasi', label: 'Konfigurasi', icon: Zap },
      ]
    },
    {
      title: 'Komponen UI',
      items: [
        { id: 'layout', label: 'Layout & Grid', icon: Layout },
        { id: 'tampilan', label: 'Contoh Tampilan', icon: Code },
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-white text-slate-800 font-sans">
      {/* Header / Navbar */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 z-50 flex items-center justify-between px-4 lg:px-8">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="lg:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-md"
          >
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          
          <div className="flex items-center gap-2 font-bold text-xl tracking-tight text-blue-600">
            <Layout className="w-8 h-8" />
            <span>Gelaran</span>
          </div>
        </div>

        <div className="flex items-center gap-2 lg:gap-4">
            {/* Search Bar (Desktop) */}
            <div className="hidden md:flex items-center bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200 w-64 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all">
                <Search size={16} className="text-slate-400 mr-2" />
                <input 
                    type="text" 
                    placeholder="Cari dokumentasi..." 
                    className="bg-transparent border-none outline-none text-sm w-full placeholder:text-slate-400"
                />
                <span className="text-xs text-slate-400 border border-slate-300 rounded px-1.5">⌘K</span>
            </div>

            <a href="#" className="p-2 text-slate-500 hover:text-slate-900 transition-colors">
                <Github size={20} />
            </a>
            <button className="hidden sm:block bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                Download v2.0
            </button>
        </div>
      </header>

      <div className="pt-16 flex max-w-screen-2xl mx-auto">
        {/* Sidebar Navigasi */}
        <aside 
          className={`
            fixed lg:sticky top-16 left-0 h-[calc(100vh-4rem)] w-72 bg-white border-r border-slate-200 overflow-y-auto z-40 transition-transform duration-300 ease-in-out
            ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          `}
        >
          <div className="p-6 space-y-8">
            {navigation.map((group, idx) => (
              <div key={idx}>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                  {group.title}
                </h3>
                <ul className="space-y-1">
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeSection === item.id;
                    return (
                      <li key={item.id}>
                        <button
                          onClick={() => {
                            setActiveSection(item.id);
                            setIsSidebarOpen(false);
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }}
                          className={`
                            w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-all
                            ${isActive 
                              ? 'bg-blue-50 text-blue-600' 
                              : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}
                          `}
                        >
                          <Icon size={18} className={isActive ? 'text-blue-500' : 'text-slate-400'} />
                          {item.label}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
            
            {/* Banner Promo Kecil di Sidebar */}
            <div className="mt-8 p-4 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl text-white">
                <p className="text-xs font-medium opacity-80 mb-1">Versi Pro Tersedia</p>
                <h4 className="font-bold text-sm mb-2">Dapatkan akses ke 50+ komponen premium.</h4>
                <button className="text-xs bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded transition-colors w-full text-left flex items-center justify-between">
                    Upgrade <ChevronRight size={14} />
                </button>
            </div>
          </div>
        </aside>

        {/* Overlay untuk Mobile ketika sidebar terbuka */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/20 z-30 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Area Konten Utama */}
        <main className="flex-1 min-w-0 px-4 py-10 sm:px-8 lg:px-12 lg:py-12">
          <div className="max-w-4xl mx-auto">
            
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm text-slate-500 mb-6">
              <span>Dokumentasi</span>
              <ChevronRight size={14} />
              <span className="capitalize text-slate-900 font-medium">{activeSection.replace('-', ' ')}</span>
            </div>

            {/* Konten Halaman: Pengenalan */}
            {activeSection === 'pengenalan' && (
              <div className="animate-fade-in">
                <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-4">
                  Pengenalan Gelaran
                </h1>
                <p className="text-xl text-slate-600 mb-8 leading-relaxed">
                  Gelaran adalah framework UI modern yang dirancang untuk membantu Anda membangun halaman dokumentasi yang indah, cepat, dan mudah diakses.
                </p>

                {/* Screenshot Utama */}
                <div className="mb-10">
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">Tampilan Dashboard</h3>
                    <p className="text-slate-600 mb-4 text-sm">Berikut adalah contoh bagaimana Gelaran merender tampilan dashboard analitik.</p>
                    <BrowserFrame 
                        src="https://placehold.co/1200x700/3b82f6/FFFFFF?text=Dashboard+Analytics+UI" 
                        title="https://app.gelaran.com/dashboard"
                        alt="Screenshot Dashboard"
                    />
                </div>

                <div className="grid md:grid-cols-2 gap-6 mb-12">
                    <div className="p-6 border border-slate-200 rounded-xl hover:shadow-md transition-shadow">
                        <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center mb-4">
                            <Zap size={20} />
                        </div>
                        <h3 className="font-bold text-slate-900 mb-2">Performa Tinggi</h3>
                        <p className="text-slate-600 text-sm">Dibangun di atas React dan Tailwind untuk rendering yang sangat cepat.</p>
                    </div>
                    <div className="p-6 border border-slate-200 rounded-xl hover:shadow-md transition-shadow">
                        <div className="w-10 h-10 bg-green-100 text-green-600 rounded-lg flex items-center justify-center mb-4">
                            <Layout size={20} />
                        </div>
                        <h3 className="font-bold text-slate-900 mb-2">Responsif</h3>
                        <p className="text-slate-600 text-sm">Tampilan yang sempurna di perangkat mobile, tablet, dan desktop.</p>
                    </div>
                </div>
              </div>
            )}

            {/* Konten Halaman: Instalasi */}
            {activeSection === 'instalasi' && (
              <div className="animate-fade-in">
                 <h1 className="text-3xl font-bold text-slate-900 mb-6">Instalasi</h1>
                 <p className="text-slate-600 mb-6">
                    Mulai menggunakan Gelaran dengan menginstal paket melalui manajer paket favorit Anda.
                 </p>

                 <div className="space-y-6">
                    <div>
                        <h3 className="font-semibold text-slate-900 mb-2">1. Install Paket</h3>
                        <CodeBlock 
                            language="bash" 
                            code="npm install @gelaran/core @gelaran/react" 
                        />
                    </div>
                    
                    <div>
                        <h3 className="font-semibold text-slate-900 mb-2">2. Import CSS</h3>
                        <p className="text-slate-600 text-sm mb-3">Tambahkan baris ini di file entri utama aplikasi Anda (misalnya `index.js` atau `App.js`).</p>
                        <CodeBlock 
                            language="javascript" 
                            code="import '@gelaran/core/dist/style.css';" 
                        />
                    </div>
                 </div>

                 <div className="mt-8 p-4 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-sm">
                    <strong>Catatan:</strong> Pastikan Anda menggunakan Node.js versi 16 atau yang lebih baru.
                 </div>
              </div>
            )}

            {/* Konten Halaman: Contoh Tampilan (Dengan lebih banyak screenshot) */}
            {activeSection === 'tampilan' && (
                <div className="animate-fade-in">
                    <h1 className="text-3xl font-bold text-slate-900 mb-6">Galeri Tampilan</h1>
                    <p className="text-slate-600 mb-8">
                        Jelajahi berbagai implementasi antarmuka yang dibuat menggunakan komponen Gelaran.
                    </p>

                    <div className="space-y-12">
                        {/* Section 1 */}
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-bold text-slate-900">Landing Page SaaS</h2>
                                <a href="#" className="flex items-center text-blue-600 hover:text-blue-700 text-sm font-medium">
                                    Lihat Live Demo <ExternalLink size={14} className="ml-1" />
                                </a>
                            </div>
                            <p className="text-slate-600 mb-4">
                                Template landing page dengan konversi tinggi, dilengkapi section hero, fitur, dan harga.
                            </p>
                            <BrowserFrame 
                                src="https://placehold.co/1200x800/1e293b/FFFFFF?text=SaaS+Landing+Page+Preview" 
                                title="https://saas.gelaran.com"
                                alt="SaaS Landing Page"
                            />
                        </div>

                        {/* Section 2 */}
                        <div className="border-t border-slate-200 pt-10">
                            <h2 className="text-xl font-bold text-slate-900 mb-2">E-Commerce Detail</h2>
                            <p className="text-slate-600 mb-4">
                                Halaman detail produk dengan galeri gambar, varian produk, dan keranjang belanja.
                            </p>
                            <div className="grid lg:grid-cols-2 gap-6">
                                <BrowserFrame 
                                    src="https://placehold.co/600x600/e2e8f0/475569?text=Product+Page" 
                                    title="shop.gelaran.com/p/123"
                                    alt="Product Detail"
                                />
                                <div className="space-y-4 py-8">
                                    <h3 className="font-semibold text-slate-900">Fitur Utama</h3>
                                    <ul className="space-y-2 text-slate-600 text-sm">
                                        <li className="flex items-start gap-2">
                                            <Check size={16} className="text-green-500 mt-0.5" />
                                            Galeri foto interaktif dengan zoom
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <Check size={16} className="text-green-500 mt-0.5" />
                                            Selector varian (warna/ukuran)
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <Check size={16} className="text-green-500 mt-0.5" />
                                            Sticky "Add to Cart" di mobile
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            
            {/* Footer Halaman Konten */}
            <div className="mt-16 pt-8 border-t border-slate-200 flex justify-between items-center text-sm text-slate-500">
                <span>Terakhir diperbarui: 24 Januari 2026</span>
                <div className="flex gap-4">
                    <a href="#" className="hover:text-blue-600">Edit halaman ini</a>
                    <a href="#" className="hover:text-blue-600">Laporkan masalah</a>
                </div>
            </div>

          </div>
        </main>
        
        {/* Table of Contents (Kanan) - Hanya Desktop */}
        <div className="hidden xl:block w-64 pt-10 pr-8 sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto">
            <h5 className="text-xs font-bold text-slate-900 uppercase tracking-wide mb-3">Di Halaman Ini</h5>
            <ul className="space-y-2 text-sm border-l border-slate-200 pl-4">
                <li><a href="#" className="text-blue-600 font-medium block border-l-2 border-blue-600 -ml-[17px] pl-4">Ringkasan</a></li>
                <li><a href="#" className="text-slate-500 hover:text-slate-800 block">Fitur Utama</a></li>
                <li><a href="#" className="text-slate-500 hover:text-slate-800 block">Screenshot</a></li>
                <li><a href="#" className="text-slate-500 hover:text-slate-800 block">Langkah Selanjutnya</a></li>
            </ul>
        </div>
      </div>
    </div>
  );
};

export default App;
