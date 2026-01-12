"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
    Search,
    Plus,
    Edit2,
    Trash2,
    Loader2,
    AlertCircle,
    FolderTree,
    ToggleLeft,
    ToggleRight,
    X,
    Hash,
    Palette,
} from "lucide-react";
import { AdminHeader } from "@/components/admin/AdminHeader";

interface Category {
    id: string;
    name: string;
    slug: string;
    icon: string | null;
    colorHex: string | null;
    sortOrder: number;
    isActive: boolean;
    parentId: string | null;
    parent: { id: string; name: string } | null;
    _count: {
        events: number;
        children: number;
    };
}

interface CategoryFormData {
    name: string;
    slug: string;
    icon: string;
    colorHex: string;
    sortOrder: number;
    isActive: boolean;
    parentId: string;
}

const initialFormData: CategoryFormData = {
    name: "",
    slug: "",
    icon: "",
    colorHex: "#6366f1",
    sortOrder: 0,
    isActive: true,
    parentId: "",
};

export default function AdminCategoriesPage() {
    const router = useRouter();
    const [categories, setCategories] = useState<Category[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState("");
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState<string | null>(null);
    const [showDeleteModal, setShowDeleteModal] = useState<string | null>(null);
    const [formData, setFormData] = useState<CategoryFormData>(initialFormData);
    const [formError, setFormError] = useState<string | null>(null);

    const fetchCategories = useCallback(async () => {
        try {
            setIsLoading(true);
            const res = await fetch("/api/admin/categories");
            const data = await res.json();

            if (!res.ok) {
                if (res.status === 401) {
                    router.push("/login?returnUrl=/admin/categories");
                    return;
                }
                if (res.status === 403) {
                    router.push("/");
                    return;
                }
                setError(data.error?.message || "Failed to load categories");
                return;
            }

            if (data.success) {
                setCategories(data.data);
            }
        } catch {
            setError("Failed to load categories");
        } finally {
            setIsLoading(false);
        }
    }, [router]);

    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

    const generateSlug = (name: string): string => {
        return name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-|-$/g, "");
    };

    const handleNameChange = (name: string) => {
        setFormData((prev) => ({
            ...prev,
            name,
            slug: prev.slug || generateSlug(name),
        }));
    };

    const handleCreateCategory = async () => {
        try {
            setActionLoading("create");
            setFormError(null);

            const payload = {
                name: formData.name,
                slug: formData.slug || generateSlug(formData.name),
                icon: formData.icon || null,
                colorHex: formData.colorHex || null,
                sortOrder: formData.sortOrder,
                isActive: formData.isActive,
                parentId: formData.parentId || null,
            };

            const res = await fetch("/api/admin/categories", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            const data = await res.json();

            if (!data.success) {
                setFormError(data.error?.message || "Failed to create category");
                return;
            }

            await fetchCategories();
            setShowAddModal(false);
            setFormData(initialFormData);
        } catch {
            setFormError("Failed to create category");
        } finally {
            setActionLoading(null);
        }
    };

    const handleEditCategory = async () => {
        if (!showEditModal) return;

        try {
            setActionLoading("edit");
            setFormError(null);

            const payload = {
                name: formData.name,
                slug: formData.slug,
                icon: formData.icon || null,
                colorHex: formData.colorHex || null,
                sortOrder: formData.sortOrder,
                isActive: formData.isActive,
                parentId: formData.parentId || null,
            };

            const res = await fetch(`/api/admin/categories/${showEditModal}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            const data = await res.json();

            if (!data.success) {
                setFormError(data.error?.message || "Failed to update category");
                return;
            }

            await fetchCategories();
            setShowEditModal(null);
            setFormData(initialFormData);
        } catch {
            setFormError("Failed to update category");
        } finally {
            setActionLoading(null);
        }
    };

    const handleDeleteCategory = async () => {
        if (!showDeleteModal) return;

        try {
            setActionLoading("delete");

            const res = await fetch(`/api/admin/categories/${showDeleteModal}`, {
                method: "DELETE",
            });

            const data = await res.json();

            if (!data.success) {
                alert(data.error?.message || "Failed to delete category");
                return;
            }

            setCategories((prev) => prev.filter((c) => c.id !== showDeleteModal));
            setShowDeleteModal(null);
        } catch {
            alert("Failed to delete category");
        } finally {
            setActionLoading(null);
        }
    };

    const handleToggleActive = async (category: Category) => {
        try {
            setActionLoading(category.id);

            const res = await fetch(`/api/admin/categories/${category.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ isActive: !category.isActive }),
            });

            const data = await res.json();

            if (!data.success) {
                alert(data.error?.message || "Failed to update category");
                return;
            }

            setCategories((prev) =>
                prev.map((c) =>
                    c.id === category.id ? { ...c, isActive: !c.isActive } : c
                )
            );
        } catch {
            alert("Failed to update category");
        } finally {
            setActionLoading(null);
        }
    };

    const openEditModal = (category: Category) => {
        setFormData({
            name: category.name,
            slug: category.slug,
            icon: category.icon || "",
            colorHex: category.colorHex || "#6366f1",
            sortOrder: category.sortOrder,
            isActive: category.isActive,
            parentId: category.parentId || "",
        });
        setFormError(null);
        setShowEditModal(category.id);
    };

    const openAddModal = () => {
        setFormData(initialFormData);
        setFormError(null);
        setShowAddModal(true);
    };

    const filteredCategories = categories.filter((cat) => {
        const matchesSearch =
            !search ||
            cat.name.toLowerCase().includes(search.toLowerCase()) ||
            cat.slug.toLowerCase().includes(search.toLowerCase());
        return matchesSearch;
    });

    const parentCategories = categories.filter((c) => !c.parentId);
    const totalEvents = categories.reduce((sum, c) => sum + c._count.events, 0);
    const activeCount = categories.filter((c) => c.isActive).length;

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="h-12 w-12 text-indigo-600 animate-spin mx-auto mb-4" />
                    <p className="text-gray-500">Loading categories...</p>
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
            <AdminHeader 
                title="Category Management" 
                subtitle={`${categories.length} categories • ${totalEvents} total events`}
                backHref="/admin"
                actions={
                    <button
                        type="button"
                        onClick={openAddModal}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
                    >
                        <Plus className="h-4 w-4" />
                        Add Category
                    </button>
                }
            />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-white rounded-xl p-4 shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-indigo-100 rounded-lg">
                                <FolderTree className="h-5 w-5 text-indigo-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-gray-900">{categories.length}</p>
                                <p className="text-sm text-gray-500">Total Categories</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl p-4 shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-green-100 rounded-lg">
                                <ToggleRight className="h-5 w-5 text-green-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-gray-900">{activeCount}</p>
                                <p className="text-sm text-gray-500">Active Categories</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl p-4 shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-yellow-100 rounded-lg">
                                <Hash className="h-5 w-5 text-yellow-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-gray-900">{parentCategories.length}</p>
                                <p className="text-sm text-gray-500">Parent Categories</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl p-4 shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-purple-100 rounded-lg">
                                <Palette className="h-5 w-5 text-purple-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-gray-900">{totalEvents}</p>
                                <p className="text-sm text-gray-500">Total Events</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl p-4 mb-6">
                    <div className="relative max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search categories..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                    Category
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                    Slug
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                    Parent
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                    Events
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                    Order
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {filteredCategories.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                                        No categories found
                                    </td>
                                </tr>
                            ) : (
                                filteredCategories.map((category) => (
                                    <tr key={category.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div
                                                    className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-medium text-sm"
                                                    style={{ backgroundColor: category.colorHex || "#6366f1" }}
                                                >
                                                    {category.icon || category.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-900">{category.name}</p>
                                                    {category._count.children > 0 && (
                                                        <p className="text-xs text-gray-500">
                                                            {category._count.children} subcategories
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <code className="text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded">
                                                {category.slug}
                                            </code>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {category.parent?.name || "-"}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                                                {category._count.events} events
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {category.sortOrder}
                                        </td>
                                        <td className="px-6 py-4">
                                            <button
                                                type="button"
                                                onClick={() => handleToggleActive(category)}
                                                disabled={actionLoading === category.id}
                                                className="flex items-center gap-2"
                                            >
                                                {actionLoading === category.id ? (
                                                    <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
                                                ) : category.isActive ? (
                                                    <ToggleRight className="h-6 w-6 text-green-500" />
                                                ) : (
                                                    <ToggleLeft className="h-6 w-6 text-gray-400" />
                                                )}
                                                <span
                                                    className={`text-sm ${
                                                        category.isActive ? "text-green-600" : "text-gray-500"
                                                    }`}
                                                >
                                                    {category.isActive ? "Active" : "Inactive"}
                                                </span>
                                            </button>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1">
                                                <button
                                                    type="button"
                                                    onClick={() => openEditModal(category)}
                                                    className="p-2 text-gray-400 hover:text-indigo-600 rounded-lg hover:bg-gray-100"
                                                    title="Edit"
                                                >
                                                    <Edit2 className="h-4 w-4" />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setShowDeleteModal(category.id)}
                                                    disabled={category._count.events > 0}
                                                    className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                                    title={
                                                        category._count.events > 0
                                                            ? "Cannot delete - has events"
                                                            : "Delete"
                                                    }
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </main>

            {(showAddModal || showEditModal) && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl max-w-lg w-full p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-bold text-gray-900">
                                {showAddModal ? "Add New Category" : "Edit Category"}
                            </h3>
                            <button
                                type="button"
                                onClick={() => {
                                    setShowAddModal(false);
                                    setShowEditModal(null);
                                    setFormData(initialFormData);
                                    setFormError(null);
                                }}
                                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {formError && (
                            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                                {formError}
                            </div>
                        )}

                        <div className="space-y-4">
                            <div>
                                <label htmlFor="category-name" className="block text-sm font-medium text-gray-700 mb-1">
                                    Name *
                                </label>
                                <input
                                    id="category-name"
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => handleNameChange(e.target.value)}
                                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    placeholder="e.g., Music"
                                />
                            </div>

                            <div>
                                <label htmlFor="category-slug" className="block text-sm font-medium text-gray-700 mb-1">
                                    Slug *
                                </label>
                                <input
                                    id="category-slug"
                                    type="text"
                                    value={formData.slug}
                                    onChange={(e) =>
                                        setFormData((prev) => ({ ...prev, slug: e.target.value }))
                                    }
                                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    placeholder="e.g., music"
                                />
                                <p className="mt-1 text-xs text-gray-500">
                                    URL-friendly identifier (lowercase, no spaces)
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="category-icon" className="block text-sm font-medium text-gray-700 mb-1">
                                        Icon (emoji or text)
                                    </label>
                                    <input
                                        id="category-icon"
                                        type="text"
                                        value={formData.icon}
                                        onChange={(e) =>
                                            setFormData((prev) => ({ ...prev, icon: e.target.value }))
                                        }
                                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        placeholder="🎵"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="category-color" className="block text-sm font-medium text-gray-700 mb-1">
                                        Color
                                    </label>
                                    <div className="flex items-center gap-2">
                                        <input
                                            id="category-color"
                                            type="color"
                                            value={formData.colorHex}
                                            onChange={(e) =>
                                                setFormData((prev) => ({ ...prev, colorHex: e.target.value }))
                                            }
                                            className="w-12 h-10 border rounded-lg cursor-pointer"
                                        />
                                        <input
                                            type="text"
                                            value={formData.colorHex}
                                            onChange={(e) =>
                                                setFormData((prev) => ({ ...prev, colorHex: e.target.value }))
                                            }
                                            className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                            placeholder="#6366f1"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="category-order" className="block text-sm font-medium text-gray-700 mb-1">
                                        Sort Order
                                    </label>
                                    <input
                                        id="category-order"
                                        type="number"
                                        min={0}
                                        value={formData.sortOrder}
                                        onChange={(e) =>
                                            setFormData((prev) => ({
                                                ...prev,
                                                sortOrder: parseInt(e.target.value) || 0,
                                            }))
                                        }
                                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="category-parent" className="block text-sm font-medium text-gray-700 mb-1">
                                        Parent Category
                                    </label>
                                    <select
                                        id="category-parent"
                                        value={formData.parentId}
                                        onChange={(e) =>
                                            setFormData((prev) => ({ ...prev, parentId: e.target.value }))
                                        }
                                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    >
                                        <option value="">None (Top Level)</option>
                                        {parentCategories
                                            .filter((c) => c.id !== showEditModal)
                                            .map((cat) => (
                                                <option key={cat.id} value={cat.id}>
                                                    {cat.name}
                                                </option>
                                            ))}
                                    </select>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <button
                                    type="button"
                                    onClick={() =>
                                        setFormData((prev) => ({ ...prev, isActive: !prev.isActive }))
                                    }
                                    className="flex items-center gap-2"
                                >
                                    {formData.isActive ? (
                                        <ToggleRight className="h-6 w-6 text-green-500" />
                                    ) : (
                                        <ToggleLeft className="h-6 w-6 text-gray-400" />
                                    )}
                                    <span className="text-sm text-gray-700">
                                        {formData.isActive ? "Active" : "Inactive"}
                                    </span>
                                </button>
                            </div>
                        </div>

                        <div className="flex gap-3 mt-6">
                            <button
                                type="button"
                                onClick={() => {
                                    setShowAddModal(false);
                                    setShowEditModal(null);
                                    setFormData(initialFormData);
                                    setFormError(null);
                                }}
                                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={showAddModal ? handleCreateCategory : handleEditCategory}
                                disabled={
                                    actionLoading === "create" ||
                                    actionLoading === "edit" ||
                                    !formData.name.trim()
                                }
                                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {(actionLoading === "create" || actionLoading === "edit") && (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                )}
                                {showAddModal ? "Create Category" : "Save Changes"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showDeleteModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl max-w-md w-full p-6">
                        <div className="text-center mb-6">
                            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Trash2 className="h-6 w-6 text-red-600" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Category</h3>
                            <p className="text-gray-500">
                                Are you sure you want to delete this category? This action cannot be
                                undone.
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={() => setShowDeleteModal(null)}
                                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleDeleteCategory}
                                disabled={actionLoading === "delete"}
                                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {actionLoading === "delete" && (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                )}
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
