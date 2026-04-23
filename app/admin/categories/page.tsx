"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
    Search,
    Plus,
    Edit2,
    Trash2,
    Loader2,
    FolderTree,
    ToggleLeft,
    ToggleRight,
    X,
    Hash,
    Palette,
} from "lucide-react";
import {
    AdminDataTable,
    AdminFilterBar,
    AdminMetricCard,
    AdminNotice,
    AdminStatusBadge,
    AdminWorkspacePage,
} from "@/components/admin/admin-workspace";
import { useToast } from "@/components/ui/toast-provider";

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
    const { showToast } = useToast();
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
            showToast("Category created successfully", "success");
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
            showToast("Category updated successfully", "success");
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
                showToast(data.error?.message || "Failed to delete category", "error");
                return;
            }

            showToast("Category deleted", "success");
            setCategories((prev) => prev.filter((c) => c.id !== showDeleteModal));
            setShowDeleteModal(null);
        } catch {
            showToast("Failed to delete category", "error");
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
                showToast(data.error?.message || "Failed to update category", "error");
                return;
            }

            setCategories((prev) =>
                prev.map((c) =>
                    c.id === category.id ? { ...c, isActive: !c.isActive } : c
                )
            );
            showToast("Category updated", "success");
        } catch {
            showToast("Failed to update category", "error");
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
            <div className="flex min-h-[60vh] items-center justify-center">
                <Loader2 className="h-10 w-10 animate-spin text-(--accent-primary)" />
            </div>
        );
    }

    if (error) {
        return (
            <AdminWorkspacePage eyebrow="Admin categories" title="Category management" description="Organise event discovery by managing the platform taxonomy.">
                <AdminNotice tone="warning" title="Category data is unavailable" description={error} actionHref="/admin" actionLabel="Back to dashboard" />
            </AdminWorkspacePage>
        );
    }

    return (
        <>
            <AdminWorkspacePage
                eyebrow="Admin categories"
                title="Category management"
                description="Organise event discovery by managing the platform taxonomy and subcategory structure."
                actions={
                    <button
                        type="button"
                        onClick={openAddModal}
                        className="inline-flex items-center gap-2 rounded-full bg-(--accent-gradient) px-4 py-2 text-sm font-semibold text-white shadow-(--shadow-glow)"
                    >
                        <Plus className="h-4 w-4" />
                        Add category
                    </button>
                }
            >
                <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    <AdminMetricCard label="Total categories" value={categories.length.toString()} icon={FolderTree} meta="All taxonomy entries" />
                    <AdminMetricCard label="Active categories" value={activeCount.toString()} icon={ToggleRight} tone="success" meta="Currently visible to users" />
                    <AdminMetricCard label="Parent categories" value={parentCategories.length.toString()} icon={Hash} tone="accent" meta="Top-level taxonomy nodes" />
                    <AdminMetricCard label="Total events" value={totalEvents.toLocaleString("en-US")} icon={Palette} meta="Events across all categories" />
                </section>

                <AdminFilterBar>
                    <label className="relative block min-w-[16rem] flex-1">
                        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-(--text-muted)" />
                        <input
                            type="search"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search category name or slug"
                            className="w-full rounded-2xl border border-(--border) bg-(--surface-elevated) py-3 pl-11 pr-4 text-sm text-foreground outline-none"
                        />
                    </label>
                </AdminFilterBar>

                <AdminDataTable
                    columns={["Category", "Slug", "Parent", "Events", "Order", "Status", "Actions"]}
                    hasRows={filteredCategories.length > 0}
                    emptyTitle="No categories match the current filters"
                    emptyDescription="Try clearing the search term to reveal all available taxonomy entries."
                >
                    {filteredCategories.map((category) => (
                        <tr key={category.id} className="transition-colors hover:bg-(--surface-elevated)">
                            <td className="px-5 py-4 align-top">
                                <div className="flex items-center gap-3">
                                    <div
                                        className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-medium text-sm shrink-0"
                                        style={{ backgroundColor: category.colorHex || "#6366f1" }}
                                    >
                                        {category.icon || category.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-foreground">{category.name}</p>
                                        {category._count.children > 0 && (
                                            <p className="mt-0.5 text-xs text-(--text-secondary)">{category._count.children} subcategories</p>
                                        )}
                                    </div>
                                </div>
                            </td>
                            <td className="px-5 py-4 align-top">
                                <code className="text-xs text-(--text-secondary) bg-(--surface-elevated) border border-(--border) px-2 py-1 rounded-lg">
                                    {category.slug}
                                </code>
                            </td>
                            <td className="px-5 py-4 align-top text-sm text-(--text-secondary)">
                                {category.parent?.name || <span className="text-(--text-muted)">—</span>}
                            </td>
                            <td className="px-5 py-4 align-top">
                                <AdminStatusBadge label={`${category._count.events} events`} tone="default" />
                            </td>
                            <td className="px-5 py-4 align-top text-sm text-(--text-secondary)">
                                {category.sortOrder}
                            </td>
                            <td className="px-5 py-4 align-top">
                                <button
                                    type="button"
                                    onClick={() => handleToggleActive(category)}
                                    disabled={actionLoading === category.id}
                                    className="flex items-center gap-2"
                                >
                                    {actionLoading === category.id ? (
                                        <Loader2 className="h-5 w-5 animate-spin text-(--text-muted)" />
                                    ) : category.isActive ? (
                                        <ToggleRight className="h-6 w-6 text-green-500" />
                                    ) : (
                                        <ToggleLeft className="h-6 w-6 text-(--text-muted)" />
                                    )}
                                    <AdminStatusBadge label={category.isActive ? "Active" : "Inactive"} tone={category.isActive ? "success" : "default"} />
                                </button>
                            </td>
                            <td className="px-5 py-4 align-top">
                                <div className="flex items-center gap-1">
                                    <button
                                        type="button"
                                        onClick={() => openEditModal(category)}
                                        className="p-2 text-(--text-muted) hover:text-(--accent-primary) rounded-lg hover:bg-(--surface-elevated)"
                                        title="Edit"
                                    >
                                        <Edit2 className="h-4 w-4" />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setShowDeleteModal(category.id)}
                                        disabled={category._count.events > 0}
                                        className="p-2 text-(--text-muted) hover:text-red-600 rounded-lg hover:bg-red-500/10 disabled:opacity-50 disabled:cursor-not-allowed"
                                        title={category._count.events > 0 ? "Cannot delete — has events" : "Delete"}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </AdminDataTable>
            </AdminWorkspacePage>

            {(showAddModal || showEditModal) && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-(--surface) rounded-2xl max-w-lg w-full p-6 shadow-2xl">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-bold text-foreground">
                                {showAddModal ? "Add new category" : "Edit category"}
                            </h3>
                            <button
                                type="button"
                                onClick={() => {
                                    setShowAddModal(false);
                                    setShowEditModal(null);
                                    setFormData(initialFormData);
                                    setFormError(null);
                                }}
                                className="p-2 text-(--text-muted) hover:text-(--text-secondary) rounded-lg hover:bg-(--surface-elevated)"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {formError && (
                            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-700 text-sm">
                                {formError}
                            </div>
                        )}

                        <div className="space-y-4">
                            <div>
                                <label htmlFor="category-name" className="block text-sm font-medium text-(--text-secondary) mb-1">
                                    Name *
                                </label>
                                <input
                                    id="category-name"
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => handleNameChange(e.target.value)}
                                    className="w-full rounded-2xl border border-(--border) bg-(--surface-elevated) px-4 py-3 text-foreground outline-none focus:border-(--accent-primary)"
                                    placeholder="e.g., Music"
                                />
                            </div>

                            <div>
                                <label htmlFor="category-slug" className="block text-sm font-medium text-(--text-secondary) mb-1">
                                    Slug *
                                </label>
                                <input
                                    id="category-slug"
                                    type="text"
                                    value={formData.slug}
                                    onChange={(e) =>
                                        setFormData((prev) => ({ ...prev, slug: e.target.value }))
                                    }
                                    className="w-full rounded-2xl border border-(--border) bg-(--surface-elevated) px-4 py-3 text-foreground outline-none focus:border-(--accent-primary)"
                                    placeholder="e.g., music"
                                />
                                <p className="mt-1 text-xs text-(--text-muted)">
                                    URL-friendly identifier (lowercase, no spaces)
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="category-icon" className="block text-sm font-medium text-(--text-secondary) mb-1">
                                        Icon (emoji or text)
                                    </label>
                                    <input
                                        id="category-icon"
                                        type="text"
                                        value={formData.icon}
                                        onChange={(e) =>
                                            setFormData((prev) => ({ ...prev, icon: e.target.value }))
                                        }
                                        className="w-full rounded-2xl border border-(--border) bg-(--surface-elevated) px-4 py-3 text-foreground outline-none focus:border-(--accent-primary)"
                                        placeholder="🎵"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="category-color" className="block text-sm font-medium text-(--text-secondary) mb-1">
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
                                            className="w-12 h-12 border border-(--border) rounded-xl cursor-pointer"
                                        />
                                        <input
                                            type="text"
                                            value={formData.colorHex}
                                            onChange={(e) =>
                                                setFormData((prev) => ({ ...prev, colorHex: e.target.value }))
                                            }
                                            className="flex-1 rounded-2xl border border-(--border) bg-(--surface-elevated) px-4 py-3 text-foreground outline-none focus:border-(--accent-primary)"
                                            placeholder="#6366f1"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="category-order" className="block text-sm font-medium text-(--text-secondary) mb-1">
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
                                        className="w-full rounded-2xl border border-(--border) bg-(--surface-elevated) px-4 py-3 text-foreground outline-none focus:border-(--accent-primary)"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="category-parent" className="block text-sm font-medium text-(--text-secondary) mb-1">
                                        Parent Category
                                    </label>
                                    <select
                                        id="category-parent"
                                        value={formData.parentId}
                                        onChange={(e) =>
                                            setFormData((prev) => ({ ...prev, parentId: e.target.value }))
                                        }
                                        className="w-full rounded-2xl border border-(--border) bg-(--surface-elevated) px-4 py-3 text-foreground outline-none focus:border-(--accent-primary)"
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
                                        <ToggleLeft className="h-6 w-6 text-(--text-muted)" />
                                    )}
                                    <span className="text-sm text-(--text-secondary)">
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
                                className="flex-1 rounded-full border border-(--border) px-4 py-2 text-sm font-semibold text-foreground hover:bg-(--surface-elevated)"
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
                                className="flex-1 inline-flex items-center justify-center gap-2 rounded-full bg-(--accent-gradient) px-4 py-2 text-sm font-semibold text-white shadow-(--shadow-glow) disabled:opacity-50"
                            >
                                {(actionLoading === "create" || actionLoading === "edit") && (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                )}
                                {showAddModal ? "Create category" : "Save changes"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showDeleteModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-(--surface) rounded-2xl max-w-md w-full p-6 shadow-2xl">
                        <div className="text-center mb-6">
                            <div className="w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Trash2 className="h-6 w-6 text-red-600" />
                            </div>
                            <h3 className="text-lg font-bold text-foreground mb-2">Delete category</h3>
                            <p className="text-(--text-muted)">
                                Are you sure you want to delete this category? This action cannot be undone.
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={() => setShowDeleteModal(null)}
                                className="flex-1 rounded-full border border-(--border) px-4 py-2 text-sm font-semibold text-foreground hover:bg-(--surface-elevated)"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleDeleteCategory}
                                disabled={actionLoading === "delete"}
                                className="flex-1 inline-flex items-center justify-center gap-2 rounded-full bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
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
        </>
    );
}
