// app/api/tracking/route.js
import { connectdb } from "@/lib/connectdb";
import tracking from "@/models/trackingModel";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";


export async function POST(req) {
  try {
    await connectdb();
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return Response.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = await req.json();
    const { date, exercises, notes } = body;

    if (!exercises || exercises.length === 0) {
      return Response.json({ error: "No exercises provided" }, { status: 400 });
    }

    const log = await tracking.create({
      userId: session.user.id,
      date: date ? new Date(date) : new Date(),
      exercises,
      notes,
    });

    return Response.json({ success: true, data: log }, { status: 201 });
  } catch (error) {
    console.error(error);
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}

// GET - fetch all workout logs for the user (newest first)
export async function GET(req) {
  try {
    await connectdb();
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return Response.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "20");

    const logs = await tracking
      .find({ userId: session.user.id })
      .sort({ date: -1 })
      .limit(limit);

    return Response.json({ success: true, data: logs });
  } catch (error) {
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}

// DELETE - remove a single workout log by ID
export async function DELETE(req) {
  try {
    await connectdb();
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return Response.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return Response.json({ error: "No id provided" }, { status: 400 });
    }

    const deleted = await tracking.findOneAndDelete({
      _id: id,
      userId: session.user.id,   // ensures users can only delete their own logs
    });

    if (!deleted) {
      return Response.json({ error: "Log not found" }, { status: 404 });
    }

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}