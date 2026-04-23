export const APP_ROLES = ["SUPER_ADMIN", "ADMIN", "ORGANIZER", "CUSTOMER", "SCANNER"] as const;

export type AppRole = (typeof APP_ROLES)[number];
export type AuthFailure = { error: string; status: 401 | 403 };

export function createAuthFailure(
  reason: "missing-user" | "missing-role" | "missing-app-user"
): AuthFailure {
  if (reason === "missing-user") {
    return { error: "Unauthorized", status: 401 };
  }

  if (reason === "missing-app-user") {
    return { error: "User not found", status: 403 };
  }

  return { error: "Forbidden", status: 403 };
}

export function isAllowedRole(role: string): role is AppRole {
  return APP_ROLES.includes(role as AppRole);
}

export function hasRequiredRole(role: AppRole, allowedRoles: readonly AppRole[]) {
  return allowedRoles.includes(role);
}
