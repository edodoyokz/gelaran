export function isCronAuthorized(request: Request, cronSecret: string | undefined) {
  if (!cronSecret) {
    return false;
  }

  const authHeader = request.headers.get("authorization");

  return authHeader === `Bearer ${cronSecret}`;
}
