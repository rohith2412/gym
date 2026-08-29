// Event intake. Called by the app with a small batch of events.
//   POST /api/analytics/event  { events: [{ type, screen?, at? }] }

export const dynamic = "force-dynamic";

import { connectdb } from "@/lib/connectdb";
import { getAuthUser } from "@/lib/getAuthUser";
import analyticsEvent from "@/models/analyticsEventModel";

const ALLOWED_TYPES = new Set(["app_open", "screen_view"]);
const MAX_BATCH = 50;

export async function POST(req) {
  try {
    const user = await getAuthUser(req);
    // Analytics is best-effort — never surface a failure to the app.
    if (!user) return Response.json({ success: true, written: 0 });

    const body = await req.json().catch(() => null);
    const raw = Array.isArray(body?.events) ? body.events.slice(0, MAX_BATCH) : [];

    const now = Date.now();
    const docs = raw
      .filter((e) => e && ALLOWED_TYPES.has(e.type))
      .map((e) => {
        const at = e.at ? new Date(e.at) : new Date();
        // Reject nonsense timestamps — clock skew or a tampered client.
        const valid = !isNaN(at) && at.getTime() < now + 60_000;
        return {
          userId: user.id,
          type: e.type,
          screen:
            typeof e.screen === "string" ? e.screen.slice(0, 64) : undefined,
          at: valid ? at : new Date(),
        };
      });

    if (docs.length) await connectdb().then(() => analyticsEvent.insertMany(docs));

    return Response.json({ success: true, written: docs.length });
  } catch (err) {
    console.error("ANALYTICS EVENT ERROR:", err);
    // Still 200 — a dropped event must never break the app.
    return Response.json({ success: true, written: 0 });
  }
}
