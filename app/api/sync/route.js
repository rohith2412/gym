// Pro-tier data sync — one snapshot per user.
//   GET  /api/sync  → returns { data, updatedAt } (null if never synced).
//   POST /api/sync  → body { data, clientUpdatedAt? } upserts the snapshot.
// Auth: Bearer JWT (iOS) or NextAuth session (web) via getAuthUser().

export const dynamic = "force-dynamic";

import { connectdb } from "@/lib/connectdb";
import { getAuthUser } from "@/lib/getAuthUser";
import syncSnapshot from "@/models/syncSnapshotModel";

const MAX_BYTES = 2 * 1024 * 1024; // 2 MB — plenty for routines/food/water/weights.

export async function GET(req) {
  try {
    await connectdb();
    const user = await getAuthUser(req);
    if (!user) {
      return Response.json({ success: false, error: "Not authenticated" }, { status: 401 });
    }

    const snap = await syncSnapshot.findOne({ userId: user.id });
    if (!snap) {
      return Response.json({ success: true, data: null, updatedAt: null });
    }

    return Response.json({
      success: true,
      data: snap.data ?? {},
      updatedAt: snap.updatedAt,
      clientUpdatedAt: snap.clientUpdatedAt,
    });
  } catch (err) {
    console.error("SYNC GET ERROR:", err);
    return Response.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await connectdb();
    const user = await getAuthUser(req);
    if (!user) {
      return Response.json({ success: false, error: "Not authenticated" }, { status: 401 });
    }

    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return Response.json({ success: false, error: "Invalid body" }, { status: 400 });
    }

    const { data, clientUpdatedAt } = body;
    if (data == null || typeof data !== "object") {
      return Response.json({ success: false, error: "Missing data" }, { status: 400 });
    }

    // Cheap size guard so a runaway client can't blow up the collection.
    const size = Buffer.byteLength(JSON.stringify(data), "utf8");
    if (size > MAX_BYTES) {
      return Response.json(
        { success: false, error: `Snapshot too large (${size} bytes)` },
        { status: 413 },
      );
    }

    const parsedClientTs = clientUpdatedAt ? new Date(clientUpdatedAt) : null;

    const snap = await syncSnapshot.findOneAndUpdate(
      { userId: user.id },
      {
        userId: user.id,
        data,
        clientUpdatedAt: parsedClientTs && !isNaN(parsedClientTs) ? parsedClientTs : new Date(),
      },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );

    return Response.json({
      success: true,
      updatedAt: snap.updatedAt,
      clientUpdatedAt: snap.clientUpdatedAt,
      bytes: size,
    });
  } catch (err) {
    console.error("SYNC POST ERROR:", err);
    return Response.json({ success: false, error: err.message }, { status: 500 });
  }
}
