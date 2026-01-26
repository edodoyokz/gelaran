"use client";

import { useState, useEffect, Fragment } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
    ArrowLeft,
    Plus,
    Edit2,
    Trash2,
    Save,
    X,
    LayoutGrid,
    Armchair,
    ChevronDown,
    ChevronRight,
    Loader2,
    AlertCircle,
    CheckCircle2,
    Info,
    MoreHorizontal,
    Settings,
    MousePointer2,
    Maximize2,
    Minimize2,
    Users,
    Grid2X2,
    Image as ImageIcon,
    Move,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { VenueCanvas, ImageTracer, SectionTypeSelector } from "@/components/organizer/venue-editor";

interface VenueSection {
    id: string;
    eventId: string;
    name: string;
    colorHex: string | null;
    capacity: number | null;
    sectionType: "SEATED" | "STANDING" | "MIXED";
    positionX: number;
    positionY: number;
    width: number;
    height: number;
    rotation: number;
    sortOrder: number;
    isActive: boolean;
    rows: VenueRow[];
}

interface VenueRow {
    id: string;
    sectionId: string;
    rowLabel: string;
    sortOrder: number;
    isActive: boolean;
    seats: Seat[];
}

interface Seat {
    id: string;
    rowId: string;
    ticketTypeId: string | null;
    seatLabel: string;
    seatNumber: number;
    status: "AVAILABLE" | "LOCKED" | "BOOKED" | "BLOCKED";
    priceOverride: number | null;
    isAccessible: boolean;
    isActive: boolean;
}

interface TicketType {
    id: string;
    name: string;
    basePrice: number;
}

interface EventData {
    id: string;
    title: string;
    status: string;
}

const STATUS_COLORS = {
    AVAILABLE: "bg-emerald-100 border-emerald-300 text-emerald-700 hover:bg-emerald-200",
    LOCKED: "bg-amber-100 border-amber-300 text-amber-700",
    BOOKED: "bg-gray-200 border-gray-300 text-gray-500 cursor-not-allowed",
    BLOCKED: "bg-red-100 border-red-300 text-red-700 hover:bg-red-200",
};

const STATUS_LEGEND = [
    { label: "Tersedia", color: "bg-emerald-100 border-emerald-300" },
    { label: "Terkunci", color: "bg-amber-100 border-amber-300" },
    { label: "Terjual", color: "bg-gray-200 border-gray-300" },
    { label: "Diblokir", color: "bg-red-100 border-red-300" },
];

export default function SeatingChartPage() {
    const params = useParams();
    const router = useRouter();
    const eventId = params.id as string;

    const [event, setEvent] = useState<EventData | null>(null);
    const [sections, setSections] = useState<VenueSection[]>([]);
    const [ticketTypes, setTicketTypes] = useState<TicketType[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
    const [zoomLevel, setZoomLevel] = useState(1);

    const [modalMode, setModalMode] = useState<"SECTION" | "ROW" | "SEAT" | null>(null);
    const [editingItem, setEditingItem] = useState<VenueSection | VenueRow | Seat | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [activeSectionId, setActiveSectionId] = useState<string | null>(null);
    const [activeRowId, setActiveRowId] = useState<string | null>(null);
    const [editorMode, setEditorMode] = useState<"list" | "visual">("list");
    const [backgroundImage, setBackgroundImage] = useState<string | null>(null);

    // Type-safe accessors for the editing item based on modal mode
    const editingSection = modalMode === "SECTION" ? (editingItem as VenueSection | null) : null;
    const editingRow = modalMode === "ROW" ? (editingItem as VenueRow | null) : null;
    const editingSeat = modalMode === "SEAT" ? (editingItem as Seat | null) : null;

    const fetchData = async () => {
        try {
            setIsLoading(true);

            const eventRes = await fetch(`/api/organizer/events/${eventId}`);
            const eventData = await eventRes.json();
            if (eventData.success) setEvent(eventData.data);

            const sectionsRes = await fetch(`/api/organizer/events/${eventId}/seating/sections`);
            const sectionsData = await sectionsRes.json();
            if (sectionsData.success) {
                const sectionsList = Array.isArray(sectionsData.data) ? sectionsData.data : [];
                setSections(sectionsList);
                const initialExpanded: Record<string, boolean> = {};
                sectionsList.forEach((s: VenueSection) => {
                    initialExpanded[s.id] = true;
                });
                setExpandedSections(initialExpanded);
            }

            const ticketsRes = await fetch(`/api/organizer/events/${eventId}/tickets`);
            const ticketsData = await ticketsRes.json();
            if (ticketsData.success) setTicketTypes(ticketsData.data);

        } catch (err) {
            setError("Gagal memuat data seating chart");
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [eventId]);

    const handleSaveSection = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);
        const formData = new FormData(e.currentTarget);
        const payload = {
            sectionId: (editingItem as VenueSection | null)?.id,
            name: formData.get("name"),
            colorHex: formData.get("colorHex"),
            capacity: Number(formData.get("capacity")) || null,
            sortOrder: Number(formData.get("sortOrder")) || 0,
            isActive: formData.get("isActive") === "on",
        };

        try {
            const url = `/api/organizer/events/${eventId}/seating/sections`;
            const method = editingItem ? "PUT" : "POST";
            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            const data = await res.json();
            if (data.success) {
                fetchData();
                setModalMode(null);
                setEditingItem(null);
            } else {
                alert(data.error?.message || "Gagal menyimpan section");
            }
        } catch (err) {
            alert("Terjadi kesalahan");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteSection = async (sectionId: string) => {
        if (!confirm("Hapus section ini? Semua row dan seat di dalamnya akan ikut terhapus.")) return;
        try {
            const res = await fetch(`/api/organizer/events/${eventId}/seating/sections?sectionId=${sectionId}`, {
                method: "DELETE",
            });
            const data = await res.json();
            if (data.success) fetchData();
            else alert(data.error?.message || "Gagal menghapus");
        } catch (err) {
            alert("Terjadi kesalahan");
        }
    };

    const handleSaveRow = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);
        const formData = new FormData(e.currentTarget);

        const generateSeats = formData.get("generateSeats") === "on";
        const seatCount = Number(formData.get("seatCount"));
        const seatPrefix = formData.get("seatPrefix");
        const ticketTypeId = formData.get("ticketTypeId");

        const payload = {
            rowId: (editingItem as VenueRow | null)?.id,
            sectionId: activeSectionId,
            rowLabel: formData.get("rowLabel") as string,
            sortOrder: Number(formData.get("sortOrder")) || 0,
            isActive: formData.get("isActive") === "on",
        };

        try {
            const url = `/api/organizer/events/${eventId}/seating/rows`;
            const method = editingItem ? "PUT" : "POST";
            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            const data = await res.json();

            if (data.success) {
                if (!editingItem && generateSeats && data.data?.id) {
                    const rowId = data.data.id;
                    await fetch(`/api/organizer/events/${eventId}/seating/seats`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            rowId,
                            ticketTypeId: ticketTypeId || null,
                            generateSeats: {
                                count: seatCount,
                                startNumber: 1,
                                prefix: seatPrefix || payload.rowLabel
                            }
                        })
                    });
                }

                fetchData();
                setModalMode(null);
                setEditingItem(null);
                setActiveSectionId(null);
            } else {
                alert(data.error?.message || "Gagal menyimpan row");
            }
        } catch (err) {
            alert("Terjadi kesalahan");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteRow = async (rowId: string) => {
        if (!confirm("Hapus row ini? Semua seat di dalamnya akan ikut terhapus.")) return;
        try {
            const res = await fetch(`/api/organizer/events/${eventId}/seating/rows?rowId=${rowId}`, {
                method: "DELETE",
            });
            const data = await res.json();
            if (data.success) fetchData();
            else alert(data.error?.message || "Gagal menghapus");
        } catch (err) {
            alert("Terjadi kesalahan");
        }
    };

    const handleSaveSeat = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);
        const formData = new FormData(e.currentTarget);
        const payload = {
            seatId: (editingItem as Seat | null)?.id,
            seatLabel: formData.get("seatLabel"),
            ticketTypeId: formData.get("ticketTypeId") || null,
            status: formData.get("status"),
            priceOverride: Number(formData.get("priceOverride")) || null,
            isAccessible: formData.get("isAccessible") === "on",
            isActive: formData.get("isActive") === "on",
        };

        try {
            const url = `/api/organizer/events/${eventId}/seating/seats`;
            const res = await fetch(url, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            const data = await res.json();
            if (data.success) {
                fetchData();
                setModalMode(null);
                setEditingItem(null);
            } else {
                alert(data.error?.message || "Gagal menyimpan seat");
            }
        } catch (err) {
            alert("Terjadi kesalahan");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteSeat = async (seatId: string) => {
        if (!confirm("Hapus seat ini?")) return;
        try {
            const res = await fetch(`/api/organizer/events/${eventId}/seating/seats?seatId=${seatId}`, {
                method: "DELETE",
            });
            const data = await res.json();
            if (data.success) fetchData();
            else alert(data.error?.message || "Gagal menghapus");
        } catch (err) {
            alert("Terjadi kesalahan");
        }
    };

    const toggleSection = (id: string) => {
        setExpandedSections(prev => ({ ...prev, [id]: !prev[id] }));
    };

    // Handler for visual editor section movement
    const handleSectionMove = async (sectionId: string, x: number, y: number) => {
        // Update locally first for immediate feedback
        setSections(prev => prev.map(s =>
            s.id === sectionId ? { ...s, positionX: x, positionY: y } : s
        ));

        // Persist to server
        try {
            await fetch(`/api/organizer/events/${eventId}/venue-layout`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    sections: [{ id: sectionId, positionX: x, positionY: y }]
                })
            });
        } catch (err) {
            console.error("Failed to save position:", err);
        }
    };

    const handleSectionResize = async (sectionId: string, width: number, height: number) => {
        setSections(prev => prev.map(s =>
            s.id === sectionId ? { ...s, width, height } : s
        ));

        try {
            await fetch(`/api/organizer/events/${eventId}/venue-layout`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    sections: [{ id: sectionId, width, height }]
                })
            });
        } catch (err) {
            console.error("Failed to save size:", err);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <Loader2 className="h-10 w-10 text-indigo-600 animate-spin" />
            </div>
        );
    }

    if (error || !event) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center text-center p-4">
                <div>
                    <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                    <h1 className="text-xl font-bold text-gray-900 mb-2">Terjadi Kesalahan</h1>
                    <p className="text-gray-500 mb-6">{error || "Event tidak ditemukan"}</p>
                    <Link href="/organizer/events" className="text-indigo-600 hover:text-indigo-700 font-medium">
                        Kembali ke Daftar Event
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col h-screen overflow-hidden">
            <header className="bg-white border-b px-6 py-4 flex-none z-10">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href={`/organizer/events/${eventId}`} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                            <ArrowLeft className="h-5 w-5 text-gray-600" />
                        </Link>
                        <div>
                            <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                {event.title}
                                <span className="text-sm font-normal text-gray-500 px-2 py-0.5 bg-gray-100 rounded-full">Seating Chart</span>
                            </h1>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        {/* Editor Mode Toggle */}
                        <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg">
                            <button
                                onClick={() => setEditorMode("list")}
                                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${editorMode === "list"
                                    ? "bg-white text-gray-900 shadow-sm"
                                    : "text-gray-500 hover:text-gray-700"
                                    }`}
                            >
                                <LayoutGrid className="h-4 w-4 inline mr-1" />
                                List
                            </button>
                            <button
                                onClick={() => setEditorMode("visual")}
                                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${editorMode === "visual"
                                    ? "bg-white text-gray-900 shadow-sm"
                                    : "text-gray-500 hover:text-gray-700"
                                    }`}
                            >
                                <Move className="h-4 w-4 inline mr-1" />
                                Visual
                            </button>
                        </div>

                        <div className="flex items-center gap-2 bg-gray-50 p-1 rounded-lg border">
                            <button
                                onClick={() => setZoomLevel(Math.max(0.5, zoomLevel - 0.1))}
                                className="p-1.5 hover:bg-white rounded-md shadow-sm transition-all"
                            >
                                <Minimize2 className="h-4 w-4 text-gray-600" />
                            </button>
                            <span className="text-xs font-medium w-12 text-center">{Math.round(zoomLevel * 100)}%</span>
                            <button
                                onClick={() => setZoomLevel(Math.min(2, zoomLevel + 0.1))}
                                className="p-1.5 hover:bg-white rounded-md shadow-sm transition-all"
                            >
                                <Maximize2 className="h-4 w-4 text-gray-600" />
                            </button>
                        </div>
                        <button
                            onClick={() => {
                                setEditingItem(null);
                                setModalMode("SECTION");
                            }}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 shadow-sm transition-all"
                        >
                            <Plus className="h-4 w-4" />
                            Tambah Section
                        </button>
                    </div>
                </div>
            </header>

            <div className="flex flex-1 overflow-hidden">
                <aside className="w-80 bg-white border-r flex flex-col overflow-hidden z-10">
                    <div className="p-4 border-b bg-gray-50/50">
                        <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                            <LayoutGrid className="h-4 w-4 text-indigo-600" />
                            Struktur Denah
                        </h2>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {sections.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                                <Armchair className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                                <p className="text-sm">Belum ada section.</p>
                                <button
                                    onClick={() => setModalMode("SECTION")}
                                    className="mt-2 text-indigo-600 text-sm font-medium hover:underline"
                                >
                                    Buat Section Baru
                                </button>
                            </div>
                        ) : (
                            sections.sort((a, b) => a.sortOrder - b.sortOrder).map(section => (
                                <div key={section.id} className="border rounded-lg overflow-hidden bg-white shadow-sm group">
                                    <div
                                        className="flex items-center justify-between p-3 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
                                        onClick={() => toggleSection(section.id)}
                                    >
                                        <div className="flex items-center gap-2">
                                            {expandedSections[section.id] ?
                                                <ChevronDown className="h-4 w-4 text-gray-400" /> :
                                                <ChevronRight className="h-4 w-4 text-gray-400" />
                                            }
                                            <span
                                                className="w-3 h-3 rounded-full border border-black/10 shadow-sm"
                                                style={{ backgroundColor: section.colorHex || "#4F46E5" }}
                                            />
                                            <span className="font-medium text-sm text-gray-900">{section.name}</span>
                                            <span className="text-xs text-gray-400">({section.rows.length} rows)</span>
                                        </div>
                                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={(e) => { e.stopPropagation(); setEditingItem(section); setModalMode("SECTION"); }}
                                                className="p-1.5 hover:bg-white rounded text-gray-500 hover:text-indigo-600"
                                                title="Edit Section"
                                            >
                                                <Edit2 className="h-3.5 w-3.5" />
                                            </button>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); setActiveSectionId(section.id); setModalMode("ROW"); }}
                                                className="p-1.5 hover:bg-white rounded text-gray-500 hover:text-green-600"
                                                title="Tambah Row"
                                            >
                                                <Plus className="h-3.5 w-3.5" />
                                            </button>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleDeleteSection(section.id); }}
                                                className="p-1.5 hover:bg-white rounded text-gray-500 hover:text-red-600"
                                                title="Hapus Section"
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </button>
                                        </div>
                                    </div>

                                    {expandedSections[section.id] && (
                                        <div className="border-t divide-y">
                                            {section.rows.length === 0 ? (
                                                <div className="p-3 text-center text-xs text-gray-400 bg-gray-50/30">
                                                    Belum ada baris kursi
                                                </div>
                                            ) : (
                                                section.rows.sort((a, b) => a.sortOrder - b.sortOrder).map(row => (
                                                    <div key={row.id} className="p-2 pl-8 hover:bg-gray-50 flex items-center justify-between group/row">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-xs font-mono font-bold bg-gray-100 px-1.5 py-0.5 rounded text-gray-600">
                                                                {row.rowLabel}
                                                            </span>
                                                            <span className="text-xs text-gray-500">{row.seats.length} Kursi</span>
                                                        </div>
                                                        <div className="flex items-center gap-1 opacity-0 group-hover/row:opacity-100 transition-opacity">
                                                            <button
                                                                onClick={() => { setEditingItem(row); setActiveSectionId(section.id); setModalMode("ROW"); }}
                                                                className="p-1 hover:bg-white rounded text-gray-400 hover:text-indigo-600"
                                                            >
                                                                <Edit2 className="h-3 w-3" />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteRow(row.id)}
                                                                className="p-1 hover:bg-white rounded text-gray-400 hover:text-red-600"
                                                            >
                                                                <Trash2 className="h-3 w-3" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </aside>

                <main className="flex-1 overflow-auto bg-gray-100/50 p-8 relative">

                    {editorMode === "visual" ? (
                        /* Visual Editor Mode */
                        <div className="max-w-6xl mx-auto">
                            <div className="mb-4 flex items-center justify-between">
                                <div>
                                    <h3 className="font-semibold text-gray-900">Visual Editor</h3>
                                    <p className="text-sm text-gray-500">Drag sections untuk mengatur posisi</p>
                                </div>
                                <ImageTracer
                                    eventId={eventId}
                                    currentImage={backgroundImage}
                                    onImageUpload={(url) => setBackgroundImage(url)}
                                    onImageRemove={() => setBackgroundImage(null)}
                                />
                            </div>
                            <VenueCanvas
                                eventId={eventId}
                                sections={sections.map(s => ({
                                    id: s.id,
                                    name: s.name,
                                    colorHex: s.colorHex,
                                    capacity: s.capacity,
                                    sectionType: s.sectionType || "SEATED",
                                    positionX: s.positionX || 0,
                                    positionY: s.positionY || 0,
                                    width: s.width || 100,
                                    height: s.height || 100,
                                    rotation: s.rotation || 0,
                                    sortOrder: s.sortOrder,
                                }))}
                                ticketTypes={ticketTypes}
                                backgroundImage={backgroundImage}
                                onSectionMove={handleSectionMove}
                                onSectionResize={handleSectionResize}
                                onSectionClick={(id) => {
                                    if (id) {
                                        const section = sections.find(s => s.id === id);
                                        if (section) {
                                            setEditingItem(section);
                                            setModalMode("SECTION");
                                        }
                                    }
                                }}
                                selectedSectionId={activeSectionId}
                            />
                        </div>
                    ) : (
                        /* List Editor Mode */
                        <>
                            <div className="max-w-4xl mx-auto mb-12">
                                <div className="h-16 bg-gray-800 rounded-b-[4rem] flex items-center justify-center text-white/50 text-sm font-medium tracking-widest shadow-lg transform perspective-1000 rotate-x-12">
                                    PANGGUNG / LAYAR UTAMA
                                </div>
                            </div>

                            <div
                                className="max-w-5xl mx-auto space-y-8 transition-transform origin-top"
                                style={{ transform: `scale(${zoomLevel})` }}
                            >
                                {sections.length === 0 && (
                                    <div className="flex flex-col items-center justify-center py-20 text-gray-400 border-2 border-dashed border-gray-300 rounded-3xl bg-white/50">
                                        <MousePointer2 className="h-12 w-12 mb-4 opacity-50" />
                                        <h3 className="text-lg font-medium text-gray-900">Area Kosong</h3>
                                        <p className="mb-6 max-w-sm text-center">Mulai dengan menambahkan Section baru dari panel sebelah kiri.</p>
                                    </div>
                                )}

                                {sections.sort((a, b) => a.sortOrder - b.sortOrder).map(section => (
                                    <div key={section.id} className="bg-white rounded-2xl shadow-sm p-6 relative group border border-gray-100">
                                        <div className="absolute top-0 left-0 right-0 h-1.5 rounded-t-2xl" style={{ backgroundColor: section.colorHex || "#4F46E5" }} />

                                        <div className="flex items-center justify-between mb-6">
                                            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                                {section.name}
                                                <span className="text-xs font-normal text-gray-400 px-2 py-1 bg-gray-100 rounded-full">
                                                    {section.capacity ? `Kap. ${section.capacity}` : 'Auto'}
                                                </span>
                                            </h3>
                                        </div>

                                        <div className="space-y-3">
                                            {section.rows.sort((a, b) => a.sortOrder - b.sortOrder).map(row => (
                                                <div key={row.id} className="flex items-center gap-4">
                                                    <div className="w-8 flex-none text-right font-mono font-bold text-gray-400 text-sm">
                                                        {row.rowLabel}
                                                    </div>
                                                    <div className="flex flex-wrap gap-2 flex-1">
                                                        {row.seats.sort((a, b) => a.seatNumber - b.seatNumber).map(seat => (
                                                            <button
                                                                key={seat.id}
                                                                onClick={() => { setEditingItem(seat); setModalMode("SEAT"); }}
                                                                className={`
                                                            w-8 h-8 rounded-md text-[10px] font-medium flex items-center justify-center
                                                            transition-all duration-200 border shadow-sm
                                                            ${STATUS_COLORS[seat.status]}
                                                            ${seat.isAccessible ? 'ring-2 ring-blue-400 ring-offset-1' : ''}
                                                            hover:scale-110 hover:z-10
                                                        `}
                                                                title={`Seat ${seat.seatLabel} - ${seat.ticketTypeId ? ticketTypes.find(t => t.id === seat.ticketTypeId)?.name : 'No Ticket'}`}
                                                            >
                                                                {seat.seatNumber}
                                                            </button>
                                                        ))}

                                                        <button
                                                            onClick={() => { setEditingItem(row); setActiveSectionId(section.id); setModalMode("ROW"); }}
                                                            className="w-8 h-8 rounded-md border-2 border-dashed border-gray-200 text-gray-300 flex items-center justify-center hover:border-indigo-300 hover:text-indigo-400 transition-colors"
                                                            title="Tambah/Edit Row"
                                                        >
                                                            <Plus className="h-3 w-3" />
                                                        </button>
                                                    </div>
                                                    <div className="w-8 flex-none text-left font-mono font-bold text-gray-400 text-sm">
                                                        {row.rowLabel}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        {section.rows.length === 0 && (
                                            <div className="text-center py-8 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                                                <p className="text-sm text-gray-500 mb-2">Section ini belum memiliki kursi</p>
                                                <button
                                                    onClick={() => { setActiveSectionId(section.id); setModalMode("ROW"); }}
                                                    className="text-indigo-600 font-medium text-sm hover:underline"
                                                >
                                                    + Tambah Baris Kursi
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>

                            <div className="fixed bottom-8 right-8 bg-white p-4 rounded-xl shadow-lg border border-gray-100 max-w-xs z-20">
                                <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-3">Keterangan</h4>
                                <div className="grid grid-cols-2 gap-3">
                                    {STATUS_LEGEND.map((item) => (
                                        <div key={item.label} className="flex items-center gap-2">
                                            <div className={`w-3 h-3 rounded-sm border ${item.color}`} />
                                            <span className="text-xs text-gray-600">{item.label}</span>
                                        </div>
                                    ))}
                                    <div className="flex items-center gap-2 col-span-2">
                                        <div className="w-3 h-3 rounded-sm border ring-2 ring-blue-400 ring-offset-1 bg-white border-gray-200" />
                                        <span className="text-xs text-gray-600">Aksesibel (Kursi Roda)</span>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </main>
            </div>

            {modalMode === "SECTION" && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                        <div className="px-6 py-4 border-b flex items-center justify-between">
                            <h3 className="text-lg font-bold text-gray-900">
                                {editingItem ? "Edit Section" : "Tambah Section Baru"}
                            </h3>
                            <button onClick={() => setModalMode(null)} className="text-gray-400 hover:text-gray-600">
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        <form onSubmit={handleSaveSection} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Section</label>
                                <input
                                    name="name"
                                    defaultValue={editingSection?.name}
                                    placeholder="Contoh: VIP, Tribun A, Festival"
                                    required
                                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Warna Label</label>
                                    <div className="flex gap-2">
                                        <input
                                            type="color"
                                            name="colorHex"
                                            defaultValue={editingSection?.colorHex || "#4F46E5"}
                                            className="h-10 w-10 rounded-lg border p-1 cursor-pointer"
                                        />
                                        <input
                                            type="text"
                                            defaultValue={editingSection?.colorHex || "#4F46E5"}
                                            className="flex-1 px-3 py-2 border rounded-lg text-sm uppercase text-gray-600"
                                            readOnly
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Urutan</label>
                                    <input
                                        type="number"
                                        name="sortOrder"
                                        defaultValue={editingSection?.sortOrder || 0}
                                        className="w-full px-3 py-2 border rounded-lg"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Kapasitas (Opsional)</label>
                                <input
                                    type="number"
                                    name="capacity"
                                    defaultValue={editingSection?.capacity ?? undefined}
                                    placeholder="Biarkan kosong untuk otomatis"
                                    className="w-full px-3 py-2 border rounded-lg"
                                />
                                <p className="text-xs text-gray-500 mt-1">Jika kosong, kapasitas dihitung dari jumlah kursi yang dibuat.</p>
                            </div>
                            <div className="flex items-center gap-2 pt-2">
                                <input
                                    type="checkbox"
                                    name="isActive"
                                    id="isActiveSec"
                                    defaultChecked={editingSection ? editingSection.isActive : true}
                                    className="rounded text-indigo-600 focus:ring-indigo-500"
                                />
                                <label htmlFor="isActiveSec" className="text-sm text-gray-700">Section Aktif</label>
                            </div>
                            <div className="pt-4 flex gap-3">
                                <button type="button" onClick={() => setModalMode(null)} className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50 font-medium">Batal</button>
                                <button type="submit" disabled={isSubmitting} className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50">
                                    {isSubmitting ? "Menyimpan..." : "Simpan"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {modalMode === "ROW" && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                        <div className="px-6 py-4 border-b flex items-center justify-between">
                            <h3 className="text-lg font-bold text-gray-900">
                                {editingItem ? "Edit Row" : "Tambah Row Baru"}
                            </h3>
                            <button onClick={() => setModalMode(null)} className="text-gray-400 hover:text-gray-600">
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        <form onSubmit={handleSaveRow} className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Label Baris</label>
                                    <input
                                        name="rowLabel"
                                        defaultValue={editingRow?.rowLabel}
                                        placeholder="A, B, C..."
                                        required
                                        className="w-full px-3 py-2 border rounded-lg uppercase"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Urutan</label>
                                    <input
                                        type="number"
                                        name="sortOrder"
                                        defaultValue={editingRow?.sortOrder || 0}
                                        className="w-full px-3 py-2 border rounded-lg"
                                    />
                                </div>
                            </div>

                            {!editingRow && (
                                <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100 space-y-3">
                                    <div className="flex items-center gap-2 mb-2">
                                        <input type="checkbox" name="generateSeats" id="genSeats" defaultChecked={true} className="rounded text-indigo-600" />
                                        <label htmlFor="genSeats" className="font-medium text-indigo-900">Generate Kursi Otomatis</label>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-xs font-medium text-indigo-700 mb-1">Jumlah Kursi</label>
                                            <input type="number" name="seatCount" defaultValue={10} min={1} className="w-full px-3 py-2 border border-indigo-200 rounded-lg text-sm" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-indigo-700 mb-1">Format Label Kursi</label>
                                            <input type="text" name="seatPrefix" placeholder="Otomatis (A-1, A-2...)" className="w-full px-3 py-2 border border-indigo-200 rounded-lg text-sm" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-indigo-700 mb-1">Default Tipe Tiket</label>
                                        <select name="ticketTypeId" className="w-full px-3 py-2 border border-indigo-200 rounded-lg text-sm bg-white">
                                            <option value="">Pilih Tipe Tiket...</option>
                                            {ticketTypes.map(t => (
                                                <option key={t.id} value={t.id}>{t.name} ({formatCurrency(t.basePrice)})</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            )}

                            <div className="flex items-center gap-2 pt-2">
                                <input
                                    type="checkbox"
                                    name="isActive"
                                    id="isActiveRow"
                                    defaultChecked={editingRow ? editingRow.isActive : true}
                                    className="rounded text-indigo-600"
                                />
                                <label htmlFor="isActiveRow" className="text-sm text-gray-700">Row Aktif</label>
                            </div>

                            <div className="pt-4 flex gap-3">
                                <button type="button" onClick={() => setModalMode(null)} className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50 font-medium">Batal</button>
                                <button type="submit" disabled={isSubmitting} className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50">
                                    {isSubmitting ? "Menyimpan..." : "Simpan"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {modalMode === "SEAT" && editingSeat && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                        <div className="px-6 py-4 border-b flex items-center justify-between">
                            <h3 className="text-lg font-bold text-gray-900">
                                Edit Kursi: {editingSeat.seatLabel}
                            </h3>
                            <button onClick={() => setModalMode(null)} className="text-gray-400 hover:text-gray-600">
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        <form onSubmit={handleSaveSeat} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Label Kursi</label>
                                <input
                                    name="seatLabel"
                                    defaultValue={editingSeat.seatLabel}
                                    required
                                    className="w-full px-3 py-2 border rounded-lg"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Tipe Tiket</label>
                                <select
                                    name="ticketTypeId"
                                    defaultValue={editingSeat.ticketTypeId || ""}
                                    className="w-full px-3 py-2 border rounded-lg bg-white"
                                >
                                    <option value="">-- Tidak ada tiket --</option>
                                    {ticketTypes.map(t => (
                                        <option key={t.id} value={t.id}>{t.name} - {formatCurrency(t.basePrice)}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                <select
                                    name="status"
                                    defaultValue={editingSeat.status}
                                    className="w-full px-3 py-2 border rounded-lg bg-white"
                                >
                                    <option value="AVAILABLE">Available (Tersedia)</option>
                                    <option value="LOCKED">Locked (Terkunci)</option>
                                    <option value="BLOCKED">Blocked (Tidak dijual)</option>
                                    <option value="BOOKED" disabled>Booked (Sudah dibeli)</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Override Harga (Opsional)</label>
                                <input
                                    type="number"
                                    name="priceOverride"
                                    defaultValue={editingSeat.priceOverride ?? undefined}
                                    placeholder="Harga khusus..."
                                    className="w-full px-3 py-2 border rounded-lg"
                                />
                            </div>

                            <div className="space-y-2 pt-2 border-t">
                                <label className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        name="isAccessible"
                                        defaultChecked={editingSeat.isAccessible}
                                        className="rounded text-indigo-600"
                                    />
                                    <span className="text-sm text-gray-700">Aksesibel (Kursi Roda)</span>
                                </label>
                                <label className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        name="isActive"
                                        defaultChecked={editingSeat.isActive}
                                        className="rounded text-indigo-600"
                                    />
                                    <span className="text-sm text-gray-700">Aktif</span>
                                </label>
                            </div>

                            <div className="pt-4 flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => handleDeleteSeat(editingSeat.id)}
                                    className="px-4 py-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                                <button type="button" onClick={() => setModalMode(null)} className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50 font-medium">Batal</button>
                                <button type="submit" disabled={isSubmitting} className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50">
                                    Simpan
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
