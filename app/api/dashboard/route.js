import { connectdb } from "@/lib/connectdb";
import WorkoutLog from "@/models/WorkoutLog";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return Response.json({ error: "Missing userId" }, { status: 400 });
    }

    await connectdb();

    const logs = await WorkoutLog.find({ user: userId })
      .sort({ date: -1 })
      .limit(100); // Get last 100 workouts

    return Response.json(logs, { status: 200 });
  } catch (err) {
    console.error("GET /api/dashboard error:", err);
    return Response.json({ error: "Server error" }, { status: 500 });
  }
}