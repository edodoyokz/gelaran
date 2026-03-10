import prisma from "../prisma/client";
import { createClient } from "../supabase/server";
import {
  createAuthFailure,
  hasRequiredRole,
  isAllowedRole,
  type AppRole,
  type AuthFailure,
} from "./role-helpers";

export type AuthenticatedAppUser = {
  id: string;
  email: string;
  role: AppRole;
  name: string | null;
};
export type AuthSuccess = { user: AuthenticatedAppUser };
export type AuthResult = AuthSuccess | AuthFailure;

async function getCurrentAppUser(): Promise<AuthResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    return createAuthFailure("missing-user");
  }

  const appUser = await prisma.user.findUnique({
    where: { email: user.email },
    select: {
      id: true,
      email: true,
      role: true,
      name: true,
    },
  });

  if (!appUser || !isAllowedRole(appUser.role)) {
    return createAuthFailure("missing-role");
  }

  return {
    user: {
      id: appUser.id,
      email: appUser.email,
      role: appUser.role,
      name: appUser.name,
    },
  };
}

export async function requireRoles(
  allowedRoles: readonly AppRole[],
  forbiddenMessage = "Forbidden"
): Promise<AuthResult> {
  const authResult = await getCurrentAppUser();

  if ("error" in authResult) {
    return authResult;
  }

  if (!hasRequiredRole(authResult.user.role, allowedRoles)) {
    return {
      error: forbiddenMessage,
      status: 403,
    };
  }

  return authResult;
}

export function requireAdmin() {
  return requireRoles(["ADMIN", "SUPER_ADMIN"], "Admin access required");
}

export function requireSuperAdmin() {
  return requireRoles(["SUPER_ADMIN"], "Super admin access required");
}

export function requireOrganizer() {
  return requireRoles(["ORGANIZER"], "Organizer access required");
}
