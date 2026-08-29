// Admin: every user with their headline stats, newest activity first.
//   GET /api/admin/users

export const dynamic = "force-dynamic";

import { connectdb } from "@/lib/connectdb";
import { requireAdmin } from "@/lib/requireAdmin";
import User from "@/models/credentialAuthModel";
import userIntro from "@/models/userIntroModel";
import analyticsEvent from "@/models/analyticsEventModel";
import tracking from "@/models/trackingModel";

export async function GET(req) {
  try {
    const gate = await requireAdmin(req);
    if (gate.error) return gate.error;

    await connectdb();

    const users = await User.find({}).select("name email createdAt").lean();
    const ids = users.map((u) => String(u._id));

    // Pull the aggregates in parallel rather than per-user, so this stays a
    // handful of queries no matter how many users there are.
    const [intros, opens, screens, lastSeen, workouts] = await Promise.all([
      userIntro.find({ userId: { $in: ids } }).select("userId region").lean(),
      analyticsEvent.aggregate([
        { $match: { userId: { $in: ids }, type: "app_open" } },
        { $group: { _id: "$userId", n: { $sum: 1 } } },
      ]),
      analyticsEvent.aggregate([
        { $match: { userId: { $in: ids }, type: "screen_view" } },
        { $group: { _id: "$userId", n: { $sum: 1 } } },
      ]),
      analyticsEvent.aggregate([
        { $match: { userId: { $in: ids } } },
        { $group: { _id: "$userId", at: { $max: "$at" } } },
      ]),
      tracking.aggregate([
        { $match: { userId: { $in: ids } } },
        { $group: { _id: "$userId", n: { $sum: 1 } } },
      ]),
    ]);

    const byId = (rows, key = "n") =>
      Object.fromEntries(rows.map((r) => [String(r._id), r[key]]));

    const regionOf = Object.fromEntries(
      intros.map((i) => [String(i.userId), i.region || null]),
    );
    const openOf = byId(opens);
    const screenOf = byId(screens);
    const seenOf = byId(lastSeen, "at");
    const workoutOf = byId(workouts);

    const data = users
      .map((u) => {
        const id = String(u._id);
        return {
          id,
          name: u.name,
          email: u.email,
          region: regionOf[id] ?? null,
          joinedAt: u.createdAt ?? null,
          opens: openOf[id] ?? 0,
          screenViews: screenOf[id] ?? 0,
          workouts: workoutOf[id] ?? 0,
          lastSeenAt: seenOf[id] ?? null,
        };
      })
      .sort((a, b) => {
        // Most recently active first; never-seen users sink to the bottom.
        const at = a.lastSeenAt ? new Date(a.lastSeenAt).getTime() : 0;
        const bt = b.lastSeenAt ? new Date(b.lastSeenAt).getTime() : 0;
        return bt - at;
      });

    const active7d = data.filter(
      (u) =>
        u.lastSeenAt &&
        Date.now() - new Date(u.lastSeenAt).getTime() < 7 * 24 * 60 * 60 * 1000,
    ).length;

    return Response.json({
      success: true,
      totals: {
        users: data.length,
        active7d,
        opens: data.reduce((s, u) => s + u.opens, 0),
      },
      data,
    });
  } catch (err) {
    console.error("ADMIN USERS ERROR:", err);
    return Response.json({ success: false, error: err.message }, { status: 500 });
  }
}
