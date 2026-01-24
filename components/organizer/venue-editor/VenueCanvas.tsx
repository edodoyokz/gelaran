"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
    DndContext,
    DragEndEvent,
    useDraggable,
    useDroppable,
} from "@dnd-kit/core";
import {
    ZoomIn,
    ZoomOut,
    Move,
    Grid3X3,
    Image as ImageIcon,
    RotateCw,
    Eye,
    EyeOff,
    Armchair,
    Users,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

// Types
interface VenueSection {
    id: string;
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
}

interface TicketType {
    id: string;
    name: string;
    basePrice: number;
}

interface VenueCanvasProps {
    eventId: string;
    sections: VenueSection[];
    ticketTypes: TicketType[];
    backgroundImage?: string | null;
    onSectionMove: (sectionId: string, x: number, y: number) => void;
    onSectionResize: (sectionId: string, width: number, height: number) => void;
    onSectionClick: (sectionId: string) => void;
    onSectionRotate?: (sectionId: string, rotation: number) => void;
    selectedSectionId?: string | null;
}

// Draggable Section Component
function DraggableSection({
    section,
    isSelected,
    onClick,
    scale,
}: {
    section: VenueSection;
    isSelected: boolean;
    onClick: () => void;
    scale: number;
}) {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: section.id,
        data: section,
    });

    const style = {
        position: "absolute" as const,
        left: section.positionX * scale,
        top: section.positionY * scale,
        width: section.width * scale,
        height: section.height * scale,
        transform: transform
            ? `translate(${transform.x}px, ${transform.y}px) rotate(${section.rotation}deg)`
            : `rotate(${section.rotation}deg)`,
        backgroundColor: section.colorHex || "#6366f1",
        opacity: isDragging ? 0.7 : 1,
        cursor: isDragging ? "grabbing" : "grab",
        zIndex: isDragging ? 100 : isSelected ? 50 : 10,
    };

    const SectionIcon = section.sectionType === "STANDING" ? Users : Armchair;

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...listeners}
            {...attributes}
            onClick={(e) => {
                e.stopPropagation();
                onClick();
            }}
            className={`
                rounded-lg border-2 transition-shadow flex flex-col items-center justify-center text-white
                ${isSelected ? "border-white shadow-lg ring-2 ring-white/50" : "border-white/30"}
                ${isDragging ? "shadow-2xl" : "shadow-md"}
            `}
        >
            <SectionIcon size={Math.min(section.width, section.height) * scale * 0.3} className="opacity-50" />
            <span className="text-xs font-medium mt-1 px-1 text-center truncate w-full">
                {section.name}
            </span>
            {section.capacity && (
                <span className="text-[10px] opacity-70">
                    {section.capacity} seats
                </span>
            )}

            {/* Resize handles when selected */}
            {isSelected && (
                <>
                    <div className="absolute -right-1 -bottom-1 w-3 h-3 bg-white rounded-sm cursor-se-resize" />
                    <div className="absolute -left-1 -bottom-1 w-3 h-3 bg-white rounded-sm cursor-sw-resize" />
                    <div className="absolute -right-1 -top-1 w-3 h-3 bg-white rounded-sm cursor-ne-resize" />
                    <div className="absolute -left-1 -top-1 w-3 h-3 bg-white rounded-sm cursor-nw-resize" />
                </>
            )}
        </div>
    );
}

// Main Canvas Component
export function VenueCanvas({
    eventId,
    sections,
    ticketTypes,
    backgroundImage,
    onSectionMove,
    onSectionResize,
    onSectionClick,
    onSectionRotate,
    selectedSectionId,
}: VenueCanvasProps) {
    const [scale, setScale] = useState(1);
    const [showGrid, setShowGrid] = useState(true);
    const [showBackground, setShowBackground] = useState(true);
    const [canvasSize] = useState({ width: 800, height: 600 });
    const canvasRef = useRef<HTMLDivElement>(null);

    const { setNodeRef: setDroppableRef } = useDroppable({
        id: "venue-canvas",
    });

    const handleDragEnd = useCallback((event: DragEndEvent) => {
        const { active, delta } = event;
        if (active && delta) {
            const sectionId = active.id as string;
            const section = sections.find((s) => s.id === sectionId);
            if (section) {
                const newX = Math.max(0, Math.min(canvasSize.width - section.width, section.positionX + delta.x / scale));
                const newY = Math.max(0, Math.min(canvasSize.height - section.height, section.positionY + delta.y / scale));
                onSectionMove(sectionId, Math.round(newX), Math.round(newY));
            }
        }
    }, [sections, scale, canvasSize, onSectionMove]);

    const handleZoom = (delta: number) => {
        setScale((prev) => Math.max(0.5, Math.min(2, prev + delta)));
    };

    return (
        <div className="flex flex-col gap-4">
            {/* Toolbar */}
            <div className="flex items-center gap-2 p-3 bg-gray-100 rounded-lg">
                <div className="flex items-center gap-1 mr-4">
                    <button
                        type="button"
                        onClick={() => handleZoom(-0.1)}
                        className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                        title="Zoom Out"
                    >
                        <ZoomOut size={18} />
                    </button>
                    <span className="text-sm font-medium w-12 text-center">
                        {Math.round(scale * 100)}%
                    </span>
                    <button
                        type="button"
                        onClick={() => handleZoom(0.1)}
                        className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                        title="Zoom In"
                    >
                        <ZoomIn size={18} />
                    </button>
                </div>

                <div className="h-6 w-px bg-gray-300" />

                <button
                    type="button"
                    onClick={() => setShowGrid(!showGrid)}
                    className={`p-2 rounded-lg transition-colors ${showGrid ? "bg-indigo-100 text-indigo-600" : "hover:bg-gray-200"}`}
                    title="Toggle Grid"
                >
                    <Grid3X3 size={18} />
                </button>

                {backgroundImage && (
                    <button
                        type="button"
                        onClick={() => setShowBackground(!showBackground)}
                        className={`p-2 rounded-lg transition-colors ${showBackground ? "bg-indigo-100 text-indigo-600" : "hover:bg-gray-200"}`}
                        title="Toggle Background"
                    >
                        {showBackground ? <Eye size={18} /> : <EyeOff size={18} />}
                    </button>
                )}

                <div className="flex-1" />

                <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Move size={16} />
                    <span>Drag sections to reposition</span>
                </div>
            </div>

            {/* Canvas Area */}
            <div className="relative overflow-auto border-2 border-dashed border-gray-300 rounded-xl bg-gray-50">
                <DndContext onDragEnd={handleDragEnd}>
                    <div
                        ref={(node) => {
                            canvasRef.current = node;
                            setDroppableRef(node);
                        }}
                        className="relative"
                        style={{
                            width: canvasSize.width * scale,
                            height: canvasSize.height * scale,
                            minWidth: "100%",
                            minHeight: 400,
                        }}
                        onClick={() => onSectionClick("")}
                    >
                        {/* Grid Pattern */}
                        {showGrid && (
                            <div
                                className="absolute inset-0 pointer-events-none opacity-30"
                                style={{
                                    backgroundImage: `
                                        linear-gradient(to right, #cbd5e1 1px, transparent 1px),
                                        linear-gradient(to bottom, #cbd5e1 1px, transparent 1px)
                                    `,
                                    backgroundSize: `${20 * scale}px ${20 * scale}px`,
                                }}
                            />
                        )}

                        {/* Background Image */}
                        {backgroundImage && showBackground && (
                            <img
                                src={backgroundImage}
                                alt="Venue Layout"
                                className="absolute inset-0 w-full h-full object-contain opacity-30 pointer-events-none"
                            />
                        )}

                        {/* Stage Indicator */}
                        <div
                            className="absolute left-1/2 top-4 -translate-x-1/2 px-8 py-2 bg-gray-800 text-white text-sm font-medium rounded-lg"
                            style={{ transform: `translateX(-50%) scale(${scale})` }}
                        >
                            🎭 PANGGUNG
                        </div>

                        {/* Sections */}
                        {sections.map((section) => (
                            <DraggableSection
                                key={section.id}
                                section={section}
                                isSelected={selectedSectionId === section.id}
                                onClick={() => onSectionClick(section.id)}
                                scale={scale}
                            />
                        ))}

                        {/* Empty State */}
                        {sections.length === 0 && (
                            <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                                <div className="text-center">
                                    <Armchair size={48} className="mx-auto mb-2 opacity-50" />
                                    <p>Belum ada section</p>
                                    <p className="text-sm">Tambahkan section dari panel di kiri</p>
                                </div>
                            </div>
                        )}
                    </div>
                </DndContext>
            </div>

            {/* Legend */}
            <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                    <Armchair size={16} />
                    <span>Seated Section</span>
                </div>
                <div className="flex items-center gap-2">
                    <Users size={16} />
                    <span>Standing Section</span>
                </div>
            </div>
        </div>
    );
}

export default VenueCanvas;
