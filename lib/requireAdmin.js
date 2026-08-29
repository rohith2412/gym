// Admin gating. Server-side only — the client also hides the admin UI, but
// that's cosmetic; this is the check that actually matters.

import { getAuthUser } from "@/lib/getAuthUser";

const ADMIN_EMAILS = new Set(
  (process.env.ADMIN_EMAILS || "rohithra75@gmail.com")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean),
);

/**
 * Returns the authenticated user when they're an admin, otherwise a Response
 * to return straight from the route.
 *
 * Deliberately answers 404 rather than 403 for a signed-in non-admin, so the
 * existence of these routes isn't advertised to ordinary users.
 */
export async function requireAdmin(req) {
  const user = await getAuthUser(req);
  if (!user) {
    return {
      error: Response.json(
        { success: false, error: "Not authenticated" },
        { status: 401 },
      ),
    };
  }
  if (!user.email || !ADMIN_EMAILS.has(user.email.toLowerCase())) {
    return {
      error: Response.json({ success: false, error: "Not found" }, { status: 404 }),
    };
  }
  return { user };
}
