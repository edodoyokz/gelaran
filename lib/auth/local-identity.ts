type LocalIdentityActor = {
  authUserId?: string | null;
  dbUserId?: string | null;
  email?: string | null;
} | null;

type BookingIdentityTarget = {
  userId: string | null;
  guestEmail: string | null;
};

export function getLocalUserId(actor: LocalIdentityActor) {
  return actor?.dbUserId ?? null;
}

export function ownsLocalUserResource(resourceUserId: string | null | undefined, actor: LocalIdentityActor) {
  return Boolean(resourceUserId && actor?.dbUserId && resourceUserId === actor.dbUserId);
}

export function getBookingAccessError(target: BookingIdentityTarget, actor: LocalIdentityActor) {
  if (target.userId) {
    if (!actor?.dbUserId) {
      return {
        message: "Unauthorized",
        status: 403 as const,
      };
    }

    if (!ownsLocalUserResource(target.userId, actor)) {
      return {
        message: "Unauthorized - you don't own this booking",
        status: 403 as const,
      };
    }

    return null;
  }

  if (target.guestEmail && actor?.email && actor.email !== target.guestEmail) {
    return {
      message: "Unauthorized - booking email mismatch",
      status: 403 as const,
    };
  }

  return null;
}
