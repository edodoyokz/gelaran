"use client";

import { createContext, useContext } from "react";

export interface AdminUserProfile {
    id: string;
    name: string;
    email: string;
    role: string;
    avatarUrl: string | null;
}

const AdminProfileContext = createContext<AdminUserProfile | null>(null);

export function AdminProfileProvider({
    profile,
    children,
}: {
    profile: AdminUserProfile;
    children: React.ReactNode;
}) {
    return (
        <AdminProfileContext.Provider value={profile}>
            {children}
        </AdminProfileContext.Provider>
    );
}

export function useAdminProfile() {
    return useContext(AdminProfileContext);
}
