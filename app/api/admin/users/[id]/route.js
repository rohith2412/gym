// Admin: one user's detail — profile, screen breakdown, recent event timeline.
//   GET /api/admin/users/:id

export const dynamic = "force-dynamic";

import { connectdb } from "@/lib/connectdb";
import { requireAdmin } from "@/lib/requireAdmin";
import User from "@/models/credentialAuthModel";
import userIntro from "@/models/userIntroModel";
import analyticsEvent from "@/models/analyticsEventModel";

export async function GET(req, { params }) {
  try {
    const gate = await requireAdmin(req);
    if (gate.error) return gate.error;

    await connectdb();
    const { id } = await params;

    const user = await User.findById(id).select("name email createdAt").lean();
    if (!user) {
      return Response.json({ success: false, error: "User not found" }, { status: 404 });
    }

    const [intro, byScreen, recent, opens] = await Promise.all([
      userIntro.findOne({ userId: id }).lean(),
      analyticsEvent.aggregate([
        { $match: { userId: id, type: "screen_view" } },
        { $group: { _id: "$screen", n: { $sum: 1 }, last: { $max: "$at" } } },
        { $sort: { n: -1 } },
      ]),
      analyticsEvent.find({ userId: id }).sort({ at: -1 }).limit(60).lean(),
      analyticsEvent.countDocuments({ userId: id, type: "app_open" }),
    ]);

    return Response.json({
      success: true,
      data: {
        id,
        name: user.name,
        email: user.email,
        joinedAt: user.createdAt ?? null,
        region: intro?.region ?? null,
        age: intro?.age ?? null,
        fitnessGoal: intro?.fitnessGoal ?? null,
        experienceLevel: intro?.experienceLevel ?? null,
        isSubscribed: intro?.isSubscribed ?? false,
        opens,
        screens: byScreen.map((s) => ({
          screen: s._id || "unknown",
          count: s.n,
          lastAt: s.last,
        })),
        timeline: recent.map((e) => ({
          type: e.type,
          screen: e.screen ?? null,
          at: e.at,
        })),
      },
    });
  } catch (err) {
    console.error("ADMIN USER DETAIL ERROR:", err);
    return Response.json({ success: false, error: err.message }, { status: 500 });
  }
}
