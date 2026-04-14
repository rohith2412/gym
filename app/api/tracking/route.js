export const dynamic = "force-dynamic";

import { connectdb } from "@/lib/connectdb";
import tracking from "@/models/trackingModel";
import jwt from "jsonwebtoken";

function getUserFromRequest(req) {
  const auth = req.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) return null;
  try {
    return jwt.verify(auth.slice(7), process.env.JWT_SECRET);
  } catch {
    return null;
  }
}

export async function POST(req) {
  try {
    await connectdb();
    const user = getUserFromRequest(req);
    if (!user) return Response.json({ error: "Not authenticated" }, { status: 401 });

    const { date, exercises, notes } = await req.json();
    if (!exercises || exercises.length === 0)
      return Response.json({ error: "No exercises provided" }, { status: 400 });

    const log = await tracking.create({
      userId: user.id,
      date: date ? new Date(date) : new Date(),
      exercises,
      notes,
    });

    return Response.json({ success: true, data: log }, { status: 201 });
  } catch (error) {
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function GET(req) {
  try {
    await connectdb();
    const user = getUserFromRequest(req);
    if (!user) return Response.json({ error: "Not authenticated" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "20");

    const logs = await tracking
      .find({ userId: user.id })
      .sort({ date: -1 })
      .limit(limit);

    return Response.json({ success: true, data: logs });
  } catch (error) {
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    await connectdb();
    const user = getUserFromRequest(req);
    if (!user) return Response.json({ error: "Not authenticated" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return Response.json({ error: "No id provided" }, { status: 400 });

    const deleted = await tracking.findOneAndDelete({ _id: id, userId: user.id });
    if (!deleted) return Response.json({ error: "Log not found" }, { status: 404 });

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}