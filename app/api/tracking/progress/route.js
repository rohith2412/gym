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

export async function GET(req) {
  try {
    await connectdb();
    const user = getUserFromRequest(req);
    if (!user) return Response.json({ error: "Not authenticated" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const exerciseName = searchParams.get("exercise");
    if (!exerciseName)
      return Response.json({ error: "exercise query param required" }, { status: 400 });

    const logs = await tracking
      .find({
        userId: user.id,
        "exercises.name": { $regex: new RegExp(`^${exerciseName}$`, "i") },
      })
      .sort({ date: -1 })
      .limit(10);

    const progression = logs
      .map((log) => {
        const exercise = log.exercises.find(
          (e) => e.name.toLowerCase() === exerciseName.toLowerCase()
        );
        if (!exercise) return null;
        const totalVolume = exercise.sets.reduce((sum, s) => sum + s.reps * s.weight, 0);
        const bestSet = exercise.sets.reduce(
          (best, s) => (s.weight > best.weight ? s : best),
          exercise.sets[0]
        );
        const totalReps = exercise.sets.reduce((sum, s) => sum + s.reps, 0);
        return {
          date: log.date,
          sets: exercise.sets.length,
          totalReps,
          totalVolume,
          bestWeight: bestSet?.weight ?? 0,
          bestReps: bestSet?.reps ?? 0,
        };
      })
      .filter(Boolean)
      .reverse();

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