"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
    ArrowLeft,
    Search,
    MapPin,
    Loader2,
    AlertCircle,
    Plus,
    Calendar,
    Users,
    Edit,
    Trash2,
    X,
    Building2,
    Globe,
    ExternalLink,
} from "lucide-react";

interface Venue {
    id: string;
    name: string;
    slug: string;
    address: string;
    city: string;
    province: string;
    postalCode: string | null;
    country: string;
    latitude: string | null;
    longitude: string | null;
    googlePlaceId: string | null;
    capacity: number | null;
    description: string | null;
    amenities: string[] | null;
    imageUrl: string | null;
    isActive: boolean;
    createdAt: string;
    _count: {
        events: number;
    };
}

interface Pagination {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

interface FormData {
    name: string;
    address: string;
    city: string;
    province: string;
    postalCode: string;
    capacity: string;
    description: string;
    googlePlaceId: string;
    imageUrl: string;
}

const INITIAL_FORM: FormData = {
    name: "",
    address: "",
    city: "",
    province: "",
    postalCode: "",
    capacity: "",
    description: "",
    googlePlaceId: "",
    imageUrl: "",
};

export default function AdminVenuesPage() {
    const router = useRouter();
    const [venues, setVenues] = useState<Venue[]>([]);
    const [cities, setCities] = useState<string[]>([]);
    const [pagination, setPagination] = useState<Pagination | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState("");
    const [cityFilter, setCityFilter] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [showModal, setShowModal] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState<FormData>(INITIAL_FORM);
    const [formErrors, setFormErrors] = useState<Partial<FormData>>({});

    const fetchVenues = useCallback(async () => {
        try {
            setIsLoading(true);
            const params = new URLSearchParams();
            if (search) params.set("search", search);
            if (cityFilter) params.set("city", cityFilter);
            params.set("page", currentPage.toString());

            const res = await fetch(`/api/admin/venues?${params.toString()}`);
            const data = await res.json();

            if (!res.ok) {
                if (res.status === 401) {
                    router.push("/login?returnUrl=/admin/venues");
                    return;
                }
                if (res.status === 403) {
                    router.push("/admin");
                    return;
                }
                setError(data.error?.message || "Failed to load venues");
                return;
            }

            if (data.success) {
                setVenues(data.data.venues);
                setCities(data.data.cities);
                setPagination(data.data.pagination);
            }
        } catch {
            setError("Failed to load venues");
        } finally {
            setIsLoading(false);
        }
    }, [search, cityFilter, currentPage, router]);

    useEffect(() => {
        fetchVenues();
    }, [fetchVenues]);

    const validateForm = (): boolean => {
        const errors: Partial<FormData> = {};

        if (!formData.name.trim() || formData.name.trim().length < 3) {
            errors.name = "Name must be at least 3 characters";
        }
        if (!formData.address.trim() || formData.address.trim().length < 5) {
            errors.address = "Address must be at least 5 characters";
        }
        if (!formData.city.trim()) {
            errors.city = "City is required";
        }
        if (!formData.province.trim()) {
            errors.province = "Province is required";
        }
        if (formData.capacity && isNaN(parseInt(formData.capacity))) {
            errors.capacity = "Capacity must be a number";
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        try {
            setIsSubmitting(true);

            const payload = {
                name: formData.name.trim(),
                address: formData.address.trim(),
                city: formData.city.trim(),
                province: formData.province.trim(),
                postalCode: formData.postalCode.trim() || undefined,
                capacity: formData.capacity ? parseInt(formData.capacity) : undefined,
                description: formData.description.trim() || undefined,
                googlePlaceId: formData.googlePlaceId.trim() || undefined,
                imageUrl: formData.imageUrl.trim() || undefined,
            };

            const res = await fetch("/api/admin/venues", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            const data = await res.json();

            if (!data.success) {
                alert(data.error?.message || "Failed to create venue");
                return;
            }

            setShowModal(false);
            setFormData(INITIAL_FORM);
            fetchVenues();
        } catch {
            alert("Failed to create venue");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleInputChange = (field: keyof FormData, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        if (formErrors[field]) {
            setFormErrors((prev) => ({ ...prev, [field]: undefined }));
        }
    };

    if (isLoading && venues.length === 0) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="h-12 w-12 text-indigo-600 animate-spin mx-auto mb-4" />
                    <p className="text-gray-500">Loading venues...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="text-center">
                    <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                    <p className="text-gray-900 font-medium mb-2">{error}</p>
                    <Link href="/admin" className="text-indigo-600 hover:text-indigo-500">
                        Back to Dashboard
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100">
            <header className="bg-white border-b sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Link href="/admin" className="text-gray-500 hover:text-gray-700">
                                <ArrowLeft className="h-5 w-5" />
                            </Link>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">Venue Management</h1>
                                <p className="text-sm text-gray-500">{pagination?.total || 0} venues</p>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={() => setShowModal(true)}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700"
                        >
                            <Plus className="h-4 w-4" />
                            Add Venue
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="bg-white rounded-xl p-4 mb-6 flex flex-wrap gap-4">
                    <div className="flex-1 min-w-[200px] relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search venues..."
                            value={search}
                            onChange={(e) => {
                                setSearch(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <MapPin className="h-5 w-5 text-gray-400" />
                        <select
                            value={cityFilter}
                            onChange={(e) => {
                                setCityFilter(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                            <option value="">All Cities</option>
                            {cities.map((city) => (
                                <option key={city} value={city}>
                                    {city}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {venues.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                        <Building2 className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No venues found</h3>
                        <p className="text-gray-500 mb-6">
                            {search || cityFilter ? "Try adjusting your filters" : "Create your first venue"}
                        </p>
                        <button
                            type="button"
                            onClick={() => setShowModal(true)}
                            className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700"
                        >
                            <Plus className="h-5 w-5" />
                            Add Venue
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {venues.map((venue) => (
                            <div
                                key={venue.id}
                                className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow"
                            >
                                <div className="h-40 bg-gradient-to-br from-indigo-500 to-purple-600 relative">
                                    {venue.imageUrl ? (
                                        <img
                                            src={venue.imageUrl}
                                            alt={venue.name}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <Building2 className="h-16 w-16 text-white/50" />
                                        </div>
                                    )}
                                    {venue.capacity && (
                                        <div className="absolute top-3 right-3 px-2 py-1 bg-black/50 text-white text-xs rounded-full flex items-center gap-1">
                                            <Users className="h-3 w-3" />
                                            {venue.capacity.toLocaleString()}
                                        </div>
                                    )}
                                </div>

                                <div className="p-4">
                                    <h3 className="font-bold text-gray-900 mb-1">{venue.name}</h3>
                                    <div className="flex items-start gap-1 text-sm text-gray-500 mb-3">
                                        <MapPin className="h-4 w-4 shrink-0 mt-0.5" />
                                        <span>{venue.address}, {venue.city}</span>
                                    </div>

                                    <div className="flex items-center justify-between pt-3 border-t">
                                        <div className="flex items-center gap-1 text-sm text-gray-500">
                                            <Calendar className="h-4 w-4" />
                                            <span>{venue._count.events} events</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            {venue.googlePlaceId && (
                                                <a
                                                    href={`https://www.google.com/maps/place/?q=place_id:${venue.googlePlaceId}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="p-2 text-gray-400 hover:text-indigo-600 rounded-lg hover:bg-indigo-50"
                                                    title="View on Google Maps"
                                                >
                                                    <Globe className="h-4 w-4" />
                                                </a>
                                            )}
                                            <button
                                                type="button"
                                                className="p-2 text-gray-400 hover:text-indigo-600 rounded-lg hover:bg-indigo-50"
                                                title="Edit venue"
                                            >
                                                <Edit className="h-4 w-4" />
                                            </button>
                                            {venue._count.events === 0 && (
                                                <button
                                                    type="button"
                                                    className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50"
                                                    title="Delete venue"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {pagination && pagination.totalPages > 1 && (
                    <div className="flex justify-center gap-2 mt-8">
                        <button
                            type="button"
                            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            className="px-4 py-2 border rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                        >
                            Previous
                        </button>
                        <div className="flex items-center gap-1">
                            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                                .filter((page) => {
                                    if (pagination.totalPages <= 7) return true;
                                    if (page === 1 || page === pagination.totalPages) return true;
                                    if (Math.abs(page - currentPage) <= 1) return true;
                                    return false;
                                })
                                .map((page, index, arr) => {
                                    const showEllipsis = index > 0 && page - arr[index - 1] > 1;
                                    return (
                                        <span key={page} className="flex items-center">
                                            {showEllipsis && (
                                                <span className="px-2 text-gray-400">...</span>
                                            )}
                                            <button
                                                type="button"
                                                onClick={() => setCurrentPage(page)}
                                                className={`w-10 h-10 rounded-lg text-sm font-medium ${
                                                    currentPage === page
                                                        ? "bg-indigo-600 text-white"
                                                        : "hover:bg-gray-100"
                                                }`}
                                            >
                                                {page}
                                            </button>
                                        </span>
                                    );
                                })}
                        </div>
                        <button
                            type="button"
                            onClick={() => setCurrentPage((p) => Math.min(pagination.totalPages, p + 1))}
                            disabled={currentPage === pagination.totalPages}
                            className="px-4 py-2 border rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                        >
                            Next
                        </button>
                    </div>
                )}
            </main>

            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
                    <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b flex items-center justify-between sticky top-0 bg-white">
                            <h2 className="text-xl font-bold text-gray-900">Add New Venue</h2>
                            <button
                                type="button"
                                onClick={() => {
                                    setShowModal(false);
                                    setFormData(INITIAL_FORM);
                                    setFormErrors({});
                                }}
                                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                                    Venue Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    id="name"
                                    value={formData.name}
                                    onChange={(e) => handleInputChange("name", e.target.value)}
                                    placeholder="e.g., Jakarta Convention Center"
                                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                                        formErrors.name ? "border-red-300" : ""
                                    }`}
                                />
                                {formErrors.name && (
                                    <p className="mt-1 text-sm text-red-500">{formErrors.name}</p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                                    Address <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    id="address"
                                    rows={2}
                                    value={formData.address}
                                    onChange={(e) => handleInputChange("address", e.target.value)}
                                    placeholder="Full street address"
                                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none ${
                                        formErrors.address ? "border-red-300" : ""
                                    }`}
                                />
                                {formErrors.address && (
                                    <p className="mt-1 text-sm text-red-500">{formErrors.address}</p>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                                        City <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        id="city"
                                        value={formData.city}
                                        onChange={(e) => handleInputChange("city", e.target.value)}
                                        placeholder="e.g., Jakarta"
                                        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                                            formErrors.city ? "border-red-300" : ""
                                        }`}
                                    />
                                    {formErrors.city && (
                                        <p className="mt-1 text-sm text-red-500">{formErrors.city}</p>
                                    )}
                                </div>
                                <div>
                                    <label htmlFor="province" className="block text-sm font-medium text-gray-700 mb-1">
                                        Province <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        id="province"
                                        value={formData.province}
                                        onChange={(e) => handleInputChange("province", e.target.value)}
                                        placeholder="e.g., DKI Jakarta"
                                        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                                            formErrors.province ? "border-red-300" : ""
                                        }`}
                                    />
                                    {formErrors.province && (
                                        <p className="mt-1 text-sm text-red-500">{formErrors.province}</p>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700 mb-1">
                                        Postal Code
                                    </label>
                                    <input
                                        type="text"
                                        id="postalCode"
                                        value={formData.postalCode}
                                        onChange={(e) => handleInputChange("postalCode", e.target.value)}
                                        placeholder="e.g., 12345"
                                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="capacity" className="block text-sm font-medium text-gray-700 mb-1">
                                        Capacity
                                    </label>
                                    <input
                                        type="number"
                                        id="capacity"
                                        value={formData.capacity}
                                        onChange={(e) => handleInputChange("capacity", e.target.value)}
                                        placeholder="e.g., 5000"
                                        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                                            formErrors.capacity ? "border-red-300" : ""
                                        }`}
                                    />
                                    {formErrors.capacity && (
                                        <p className="mt-1 text-sm text-red-500">{formErrors.capacity}</p>
                                    )}
                                </div>
                            </div>

                            <div>
                                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                                    Description
                                </label>
                                <textarea
                                    id="description"
                                    rows={3}
                                    value={formData.description}
                                    onChange={(e) => handleInputChange("description", e.target.value)}
                                    placeholder="Brief description of the venue..."
                                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                                />
                            </div>

                            <div>
                                <label htmlFor="googlePlaceId" className="block text-sm font-medium text-gray-700 mb-1">
                                    Google Place ID
                                </label>
                                <input
                                    type="text"
                                    id="googlePlaceId"
                                    value={formData.googlePlaceId}
                                    onChange={(e) => handleInputChange("googlePlaceId", e.target.value)}
                                    placeholder="ChIJ..."
                                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                                <p className="mt-1 text-xs text-gray-500">
                                    Find it at{" "}
                                    <a
                                        href="https://developers.google.com/maps/documentation/places/web-service/place-id"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-indigo-600 hover:text-indigo-700 inline-flex items-center gap-1"
                                    >
                                        Google Place ID Finder <ExternalLink className="h-3 w-3" />
                                    </a>
                                </p>
                            </div>

                            <div>
                                <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700 mb-1">
                                    Image URL
                                </label>
                                <input
                                    type="url"
                                    id="imageUrl"
                                    value={formData.imageUrl}
                                    onChange={(e) => handleInputChange("imageUrl", e.target.value)}
                                    placeholder="https://..."
                                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowModal(false);
                                        setFormData(INITIAL_FORM);
                                        setFormErrors({});
                                    }}
                                    disabled={isSubmitting}
                                    className="flex-1 px-4 py-2.5 border rounded-lg font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="flex-1 px-4 py-2.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            Creating...
                                        </>
                                    ) : (
                                        <>
                                            <Plus className="h-4 w-4" />
                                            Create Venue
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
