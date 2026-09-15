// app/api/water/route.js — per-user water intake sync.

export const dynamic = "force-dynamic";

import { connectdb } from "@/lib/connectdb";
import { getAuthUser } from "@/lib/getAuthUser";
import WaterLog from "@/models/waterLogModel";

/**
 * GET /api/water
 *
 * Returns the trailing 60 days of the caller's water intake as a
 * { day: ml } map. That's enough for the app's 7-day trend + today's cell
 * without pulling the whole history.
 */
export async function GET(req) {
  try {
    await connectdb();
    const authUser = await getAuthUser(req);
    if (!authUser)
      return Response.json({ error: "Not authenticated" }, { status: 401 });

    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 60);
    const cutoffIso = cutoff.toISOString().slice(0, 10);

    const rows = await WaterLog.find({
      userId: authUser.id,
      day: { $gte: cutoffIso },
    })
      .sort({ day: -1 })
      .lean();

    const state = {};
    for (const r of rows) state[r.day] = r.ml;

    return Response.json({ success: true, data: state });
  } catch (err) {
    console.error("[water GET]", err);
    return Response.json({ success: false, error: err.message }, { status: 500 });
  }
}

/**
 * POST /api/water
 *
 * Body: { day: "YYYY-MM-DD", ml: number, mode?: "add" | "set" }
 *
 * `add` (default) increments the existing amount by `ml`; `set` overwrites
 * to exactly `ml` (used for corrections or "reset today"). Returns the new
 * total for that day.
 */
export async function POST(req) {
  try {
    await connectdb();
    const authUser = await getAuthUser(req);
    if (!authUser)
      return Response.json({ error: "Not authenticated" }, { status: 401 });

    const body = await req.json();
    const day = String(body.day ?? "").slice(0, 10);
    const ml = Math.max(0, Math.round(Number(body.ml) || 0));
    const mode = body.mode === "set" ? "set" : "add";

    if (!/^\d{4}-\d{2}-\d{2}$/.test(day)) {
      return Response.json(
        { success: false, error: "day must be YYYY-MM-DD" },
        { status: 400 },
      );
    }

    const update =
      mode === "set"
        ? { $set: { ml } }
        : { $inc: { ml } };

    const doc = await WaterLog.findOneAndUpdate(
      { userId: authUser.id, day },
      update,
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );

    return Response.json({ success: true, data: { day, ml: Math.max(0, doc.ml) } });
  } catch (err) {
    console.error("[water POST]", err);
    return Response.json({ success: false, error: err.message }, { status: 500 });
  }
}
