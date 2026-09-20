export const dynamic = "force-dynamic";

import { connectdb } from "@/lib/connectdb";
import { getAuthUser } from "@/lib/getAuthUser";
import CredentialAuth from "@/models/credentialAuthModel";

/**
 * POST /api/user-source
 * body: { source: "instagram" | "tiktok" | ... }
 *
 * Records where the user first heard about PocketGym. Called once during
 * onboarding, right after country selection. The value is a stable string —
 * we slice acquisition analytics by it in the admin dashboard.
 *
 * Idempotent: overwriting a source is fine (users who reset onboarding
 * will re-answer), but we only store the FIRST value we see for a given
 * user so the reported channel matches the day they signed up.
 */
const ALLOWED = new Set([
  "instagram", "tiktok", "youtube", "app_store", "google",
  "friend", "reddit", "twitter", "news", "other",
]);

export async function POST(req) {
  try {
    await connectdb();
    const authUser = await getAuthUser(req);
    if (!authUser)
      return Response.json({ error: "Not authenticated" }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const source = String(body.source ?? "").trim().toLowerCase();
    if (!ALLOWED.has(source))
      return Response.json({ error: "Invalid source" }, { status: 400 });

    // First-write wins — don't overwrite an existing attribution. Keeps
    // the reported channel tied to the moment of acquisition.
    await CredentialAuth.updateOne(
      { _id: authUser.id, acquisitionSource: { $exists: false } },
      { $set: { acquisitionSource: source, acquisitionSourceAt: new Date() } },
    );

    return Response.json({ success: true });
  } catch (err) {
    console.error("[user-source POST]", err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}
