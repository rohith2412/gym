export const dynamic = "force-dynamic";
// app/api/tracking/route.js
import { connectdb } from "@/lib/connectdb";
import tracking      from "@/models/trackingModel";
import jwt           from "jsonwebtoken";
import { ObjectId }  from "mongodb"; // ✅ FIX: needed for DELETE

function getUserFromRequest(req) {
  const auth = req.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) return null;
  try {
    return jwt.verify(auth.slice(7), process.env.JWT_SECRET);
  } catch {
    return null;
  }
}

// ─── POST ─────────────────────────────────────────────────────────────────────
export async function POST(req) {
  try {
    await connectdb();
    const user = getUserFromRequest(req);
    if (!user)
      return Response.json({ success: false, error: "Not authenticated" }, { status: 401 });

    const userId = user.id || user._id;
    const { date, exercises, notes } = await req.json();

    if (!Array.isArray(exercises) || exercises.length === 0)
      return Response.json({ success: false, error: "No exercises provided" }, { status: 400 });

    for (const ex of exercises) {
      if (!Array.isArray(ex.sets) || ex.sets.length === 0)
        return Response.json({ success: false, error: "Each exercise must have sets" }, { status: 400 });
    }

    let parsedDate = new Date();
    if (date) {
      const d = new Date(date);
      if (isNaN(d))
        return Response.json({ success: false, error: "Invalid date" }, { status: 400 });
      parsedDate = d;
    }

    const log = await tracking.create({ userId, date: parsedDate, exercises, notes });
    return Response.json({ success: true, data: log }, { status: 201 });
  } catch (error) {
    console.error("POST ERROR:", error);
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}

// ─── GET ──────────────────────────────────────────────────────────────────────
export async function GET(req) {
  try {
    await connectdb();
    const user = getUserFromRequest(req);
    if (!user)
      return Response.json({ success: false, error: "Not authenticated" }, { status: 401 });

    const userId = user.id || user._id;
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "20");

    const logs = await tracking.find({ userId }).sort({ date: -1 }).limit(limit);
    return Response.json({ success: true, data: logs });
  } catch (error) {
    console.error("GET ERROR:", error);
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}

// ─── DELETE ───────────────────────────────────────────────────────────────────
export async function DELETE(req) {
  try {
    await connectdb();
    const user = getUserFromRequest(req);
    if (!user)
      return Response.json({ success: false, error: "Not authenticated" }, { status: 401 });

    const userId = user.id || user._id;
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id)
      return Response.json({ success: false, error: "No id provided" }, { status: 400 });

    // ✅ FIX: validate before converting — avoids a crash on malformed ids
    if (!ObjectId.isValid(id))
      return Response.json({ success: false, error: "Invalid id format" }, { status: 400 });

    // ✅ FIX: was passing raw string id — MongoDB _id is an ObjectId, so
    // findOneAndDelete({ _id: "abc123" }) always returned null and never deleted
    const deleted = await tracking.findOneAndDelete({
      _id: new ObjectId(id),
      userId,
    });

    if (!deleted)
      return Response.json({ success: false, error: "Log not found" }, { status: 404 });

    return Response.json({ success: true });
  } catch (error) {
    console.error("DELETE ERROR:", error);
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}