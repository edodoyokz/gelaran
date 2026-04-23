import type { User as SupabaseUser } from "@supabase/supabase-js";
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
export type AuthenticatedAppUserContext = {
  authUser: SupabaseUser;
  dbUser: AuthenticatedAppUser;
  dbUserId: string;
  email: string;
};
export type AuthSuccess = { user: AuthenticatedAppUser };
export type AuthResult = AuthSuccess | AuthFailure;
type AuthResolverOptions = {
  requireEmailVerified?: boolean;
};

async function resolveCurrentAppUser(
  options: AuthResolverOptions = {}
): Promise<AuthenticatedAppUserContext | AuthFailure> {
  const { requireEmailVerified = true } = options;
  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser?.email) {
    return createAuthFailure("missing-user");
  }

  if (requireEmailVerified && !authUser.email_confirmed_at) {
    return createAuthFailure("missing-user");
  }

  const appUser = await prisma.user.findUnique({
    where: { email: authUser.email },
    select: {
      id: true,
      email: true,
      role: true,
      name: true,
    },
  });

  if (!appUser) {
    return createAuthFailure("missing-app-user");
  }

  if (!isAllowedRole(appUser.role)) {
    return createAuthFailure("missing-role");
  }

  return {
    authUser,
    dbUser: {
      id: appUser.id,
      email: appUser.email,
      role: appUser.role,
      name: appUser.name,
    },
    dbUserId: appUser.id,
    email: appUser.email,
  };
}

async function getCurrentAppUser(): Promise<AuthResult> {
  const authContext = await resolveCurrentAppUser();

  if ("error" in authContext) {
    return authContext;
  }

  return {
    user: authContext.dbUser,
  };
}

export async function requireAppUserWithRoles(
  allowedRoles: readonly AppRole[],
  forbiddenMessage = "Forbidden",
  options: AuthResolverOptions = {}
): Promise<AuthenticatedAppUserContext | AuthFailure> {
  const authContext = await resolveCurrentAppUser(options);

  if ("error" in authContext) {
    return authContext;
  }

  if (!hasRequiredRole(authContext.dbUser.role, allowedRoles)) {
    return {
      error: forbiddenMessage,
      status: 403,
    };
  }

  return authContext;
}

export async function requireAuthenticatedAppUser(
  options: AuthResolverOptions = {}
): Promise<AuthenticatedAppUserContext | AuthFailure> {
  return resolveCurrentAppUser(options);
}

export async function getOptionalAuthenticatedAppUser(
  options: AuthResolverOptions = {}
): Promise<AuthenticatedAppUserContext | AuthFailure | null> {
  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser) {
    return null;
  }

  return resolveCurrentAppUser(options);
}

export async function requireRoles(
  allowedRoles: readonly AppRole[],
  forbiddenMessage = "Forbidden"
): Promise<AuthResult> {
  const authResult = await requireAppUserWithRoles(allowedRoles, forbiddenMessage);

  if ("error" in authResult) {
    return authResult;
  }

  return {
    user: authResult.dbUser,
  };
}

export function requireAdmin() {
  return requireRoles(["ADMIN", "SUPER_ADMIN"], "Admin access required");
}

export function requireAdminContext(options: AuthResolverOptions = {}) {
  return requireAppUserWithRoles(["ADMIN", "SUPER_ADMIN"], "Admin access required", options);
}

export function requireSuperAdmin() {
  return requireRoles(["SUPER_ADMIN"], "Super admin access required");
}

export function requireOrganizer() {
  return requireRoles(["ORGANIZER"], "Organizer access required");
}

export function requireOrganizerContext(options: AuthResolverOptions = {}) {
  return requireAppUserWithRoles(["ORGANIZER"], "Organizer access required", options);
}
