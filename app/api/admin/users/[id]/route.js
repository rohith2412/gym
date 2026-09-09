// Admin: one user's detail — profile, screen breakdown, recent event timeline.
//   GET /api/admin/users/:id

export const dynamic = "force-dynamic";

import { connectdb } from "@/lib/connectdb";
import { requireAdmin } from "@/lib/requireAdmin";
import User from "@/models/credentialAuthModel";
import userIntro from "@/models/userIntroModel";
import analyticsEvent from "@/models/analyticsEventModel";
import AiUsage from "@/models/aiUsageModel";
import MealLog from "@/models/mealLogModel";
import SavedPlan from "@/models/savedPlanModel";
import SavedRecipe from "@/models/savedRecipeModel";
import Subscription from "@/models/subscriptionModel";
import Tracking from "@/models/trackingModel";
import SyncSnapshot from "@/models/syncSnapshotModel";

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

/**
 * DELETE /api/admin/users/:id
 *
 * Fully removes a user and every collection keyed to them. Meant for admin
 * cleanup — test accounts, spam, GDPR requests. Requires admin auth. The
 * caller cannot delete themselves (avoids locking the panel out on tap).
 */
export async function DELETE(req, { params }) {
  try {
    const gate = await requireAdmin(req);
    if (gate.error) return gate.error;

    await connectdb();
    const { id } = await params;

    if (gate.user?._id && String(gate.user._id) === String(id)) {
      return Response.json(
        { success: false, error: "You cannot delete your own admin account." },
        { status: 400 },
      );
    }

    const user = await User.findById(id).select("_id email").lean();
    if (!user) {
      return Response.json({ success: false, error: "User not found" }, { status: 404 });
    }

    // Fan out to every user-scoped collection. Missing collections just return
    // { deletedCount: 0 } — no need to guard each one individually.
    const results = await Promise.allSettled([
      analyticsEvent.deleteMany({ userId: id }),
      AiUsage.deleteMany({ userId: id }),
      MealLog.deleteMany({ userId: id }),
      SavedPlan.deleteMany({ userId: id }),
      SavedRecipe.deleteMany({ userId: id }),
      Subscription.deleteMany({ userId: id }),
      Tracking.deleteMany({ userId: id }),
      SyncSnapshot.deleteMany({ userId: id }),
      userIntro.deleteOne({ userId: id }),
      User.deleteOne({ _id: id }),
    ]);

    const failed = results
      .map((r, i) => (r.status === "rejected" ? { i, reason: r.reason?.message } : null))
      .filter(Boolean);
    if (failed.length > 0) {
      console.error("ADMIN DELETE partial failure:", failed);
    }

    return Response.json({
      success: true,
      data: { id, email: user.email, partialFailures: failed.length },
    });
  } catch (err) {
    console.error("ADMIN USER DELETE ERROR:", err);
    return Response.json({ success: false, error: err.message }, { status: 500 });
  }
}
