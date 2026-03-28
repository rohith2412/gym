// app/api/tracking/progress/route.js
import { connectdb } from "@/lib/connectdb";
import tracking from "@/models/trackingModel";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// GET /api/tracking/progress?exercise=Bench+Press
// Returns per-session volume + best set for the given exercise (up to 10 sessions)
export async function GET(req) {
  try {
    await connectdb();
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return Response.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const exerciseName = searchParams.get("exercise");

    if (!exerciseName) {
      return Response.json({ error: "exercise query param required" }, { status: 400 });
    }

    // Find all logs that contain this exercise, newest first
    const logs = await tracking
      .find({
        userId: session.user.id,
        "exercises.name": { $regex: new RegExp(`^${exerciseName}$`, "i") },
      })
      .sort({ date: -1 })
      .limit(10);

    // Shape the data: one data point per session
    const progression = logs
      .map((log) => {
        const exercise = log.exercises.find(
          (e) => e.name.toLowerCase() === exerciseName.toLowerCase()
        );
        if (!exercise) return null;

        const totalVolume = exercise.sets.reduce(
          (sum, s) => sum + s.reps * s.weight,
          0
        );
        const bestSet = exercise.sets.reduce(
          (best, s) => (s.weight > best.weight ? s : best),
          exercise.sets[0]
        );
        const totalReps = exercise.sets.reduce((sum, s) => sum + s.reps, 0);

        return {
          date: log.date,
          sets: exercise.sets.length,
          totalReps,
          totalVolume,           // e.g. 4 sets × 8 reps × 130 lbs = 4160
          bestWeight: bestSet?.weight ?? 0,
          bestReps: bestSet?.reps ?? 0,
        };
      })
      .filter(Boolean)
      .reverse(); // oldest → newest for chart order

    // Tag each session with improvement vs previous
    const tagged = progression.map((entry, i) => {
      if (i === 0) return { ...entry, improved: null };
      const prev = progression[i - 1];
      return {
        ...entry,
        improved: entry.totalVolume > prev.totalVolume,
        volumeDelta: entry.totalVolume - prev.totalVolume,
        weightDelta: entry.bestWeight - prev.bestWeight,
      };
    });

    return Response.json({ success: true, exercise: exerciseName, data: tagged });
  } catch (error) {
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}