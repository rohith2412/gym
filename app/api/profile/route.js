export const dynamic = "force-dynamic";

import { connectdb } from "@/lib/connectdb";
import jwt from "jsonwebtoken";
import User from "@/models/credentialAuthModel";
import userIntroModel from "@/models/userIntroModel";
import TrackingModel from "@/models/trackingModel";

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

    const decoded = getUserFromRequest(req);
    if (!decoded) {
      return Response.json({ success: false, error: "Not authenticated" }, { status: 401 });
    }

    // ── Fetch all models in parallel ──────────────────────────────────────────
    const [user, intro, logs] = await Promise.all([
      User.findById(decoded.id).select("name email createdAt").lean(),
      userIntroModel.findOne({ userId: decoded.id }).lean(),
      TrackingModel.find({ userId: decoded.id }).lean(),
    ]);

    if (!user) {
      return Response.json({ success: false, error: "User not found" }, { status: 404 });
    }

    // ── Workout stats ─────────────────────────────────────────────────────────
    const sessions  = logs.length;
    const totalVol  = logs.reduce((sum, log) =>
      sum + log.exercises.reduce((s2, ex) =>
        s2 + ex.sets.reduce((s3, set) => s3 + set.reps * set.weight, 0), 0), 0);

    const freq = {};
    logs.forEach((log) =>
      log.exercises.forEach((ex) => { freq[ex.name] = (freq[ex.name] || 0) + 1; })
    );
    const topEntry    = Object.entries(freq).sort((a, b) => b[1] - a[1])[0];
    const topExercise = topEntry ? topEntry[0] : null;

    // ── Response ──────────────────────────────────────────────────────────────
    return Response.json({
      success: true,
      data: {
        // User
        name:      user.name,
        email:     user.email,
        memberSince: user.createdAt,

        // Intro / body stats
        gender:            intro?.gender            ?? null,
        age:               intro?.age               ?? null,
        height:            intro?.height            ?? null,
        weight:            intro?.weight            ?? null,
        fitnessGoal:       intro?.fitnessGoal       ?? null,
        experienceLevel:   intro?.experienceLevel   ?? null,
        workoutDaysPerWeek:intro?.workoutDaysPerWeek ?? null,
        hasIntro:          !!intro,

        // Subscription
        isSubscribed:       intro?.isSubscribed       ?? false,
        subscriptionStatus: intro?.subscriptionStatus ?? null,
        currentPeriodEnd:   intro?.currentPeriodEnd   ?? null,

        // Workout stats
        workoutStats: {
          sessions,
          totalVol,
          topExercise,
        },
      },
    });
  } catch (err) {
    return Response.json({ success: false, error: err.message }, { status: 500 });
  }
}