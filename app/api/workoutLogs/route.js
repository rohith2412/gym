import { connectdb } from "@/lib/connectdb";
import WorkoutLog from "@/models/WorkoutLog";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const exercise = searchParams.get("exercise");
    const userId = searchParams.get("userId");

    if (!exercise || !userId) {
      return Response.json({ error: "Missing parameters" }, { status: 400 });
    }

    await connectdb();

    const logs = await WorkoutLog.find({
      exercise,
      user: userId,
    }).sort({ date: -1 });

    return Response.json(logs, { status: 200 });
  } catch (err) {
    console.error("GET /api/workoutLogs error:", err);
    return Response.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { userId, muscleGroup, exercise, sets } = body;

    if (!userId || !muscleGroup || !exercise || !sets || sets.length === 0) {
      return Response.json({ error: "Missing required data" }, { status: 400 });
    }

    await connectdb();

    const newLog = new WorkoutLog({
      user: userId,
      muscleGroup,
      exercise,
      sets,
    });

    await newLog.save();

    return Response.json(newLog, { status: 201 });
  } catch (err) {
    console.error("POST /api/workoutLogs error:", err);
    return Response.json({ error: "Server error" }, { status: 500 });
  }
}