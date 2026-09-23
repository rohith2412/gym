export const dynamic = "force-dynamic";

import { connectdb } from "@/lib/connectdb";
import { requireAdmin } from "@/lib/requireAdmin";
import AiUsage from "@/models/aiUsageModel";
import MealLog from "@/models/mealLogModel";

/**
 * GET /api/admin/ai-usage
 *
 * Aggregate view of what's actually driving the OpenAI bill, across every
 * user -- built because the mobile admin screen (AdminScreen.tsx) only ever
 * showed product analytics (signups/opens/regions), never API spend, so
 * there was no way to see usage creeping up until the bill arrived.
 *
 * Two sources, since the app doesn't funnel every AI call through one
 * counter:
 *   - Photo scans go through /api/meal-log's AI-vision path, which is
 *     rate-limited by counting MealLog docs directly (lib/scanRateLimit.js),
 *     not AiUsage -- so we count those docs the same way here.
 *   - Coach chat / voice / meal-plan calls go through lib/aiRateLimit.js,
 *     which does write to the AiUsage collection (count + rough units:
 *     tokens for chat, seconds for voice).
 *
 * No dollar figures anywhere in the codebase to convert these into --
 * this reports raw call counts/units, which is what you actually watch to
 * catch a runaway loop or an abused account before it shows up on the
 * invoice.
 */
function last7Days() {
  const days = [];
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  for (let i = 6; i >= 0; i--) {
    const day = new Date(d);
    day.setUTCDate(d.getUTCDate() - i);
    days.push(day.toISOString().slice(0, 10));
  }
  return days;
}

export async function GET(req) {
  try {
    await connectdb();
    const { user, error } = await requireAdmin(req);
    if (error) return error;

    const days = last7Days();
    const today = days[days.length - 1];
    const startOfRange = new Date(`${days[0]}T00:00:00.000Z`);

    // Photo scans: count MealLog docs per day, same predicate
    // checkScanRateLimit uses (AI-vision inserts, not manual entries).
    const photoAgg = await MealLog.collection
      .aggregate([
        {
          $match: {
            aiNotes: { $exists: true, $ne: "Macros entered manually" },
            date: { $gte: startOfRange },
          },
        },
        {
          $group: {
            _id: { $ifNull: ["$localDate", { $dateToString: { format: "%Y-%m-%d", date: "$date" } }] },
            count: { $sum: 1 },
            users: { $addToSet: "$userId" },
          },
        },
      ])
      .toArray();

    const photoByDay = Object.fromEntries(
      photoAgg.map((r) => [r._id, { count: r.count, users: r.users.length }]),
    );

    // Everything else (coach/voice/meal-plan) -- aggregated straight from
    // AiUsage, which already tracks count + units per user/day/feature.
    const usageAgg = await AiUsage.collection
      .aggregate([
        { $match: { day: { $in: days } } },
        {
          $group: {
            _id: { day: "$day", feature: "$feature" },
            count: { $sum: "$count" },
            units: { $sum: "$units" },
            users: { $addToSet: "$userId" },
          },
        },
      ])
      .toArray();

    const featureTotals = {};
    const byDay = Object.fromEntries(
      days.map((d) => [
        d,
        { photo: photoByDay[d]?.count || 0, coach: 0, voice: 0, "meal-plan": 0 },
      ]),
    );

    for (const row of usageAgg) {
      const { day, feature } = row._id;
      if (byDay[day]) byDay[day][feature] = row.count;
      featureTotals[feature] = featureTotals[feature] || { count: 0, units: 0, users: new Set() };
      featureTotals[feature].count += row.count;
      featureTotals[feature].units += row.units;
      for (const u of row.users) featureTotals[feature].users.add(u);
    }

    const photoTotal7d = Object.values(photoByDay).reduce((s, v) => s + v.count, 0);
    const photoUsers7d = new Set(photoAgg.flatMap((r) => r.users)).size;

    return Response.json({
      success: true,
      data: {
        today: {
          photo: photoByDay[today]?.count || 0,
          coach: featureTotals.coach ? byDay[today].coach : 0,
          voice: featureTotals.voice ? byDay[today].voice : 0,
          "meal-plan": featureTotals["meal-plan"] ? byDay[today]["meal-plan"] : 0,
        },
        last7Days: days.map((d) => ({ day: d, ...byDay[d] })),
        totals: {
          photo: { count: photoTotal7d, users: photoUsers7d },
          coach: featureTotals.coach
            ? { count: featureTotals.coach.count, units: featureTotals.coach.units, users: featureTotals.coach.users.size }
            : { count: 0, units: 0, users: 0 },
          voice: featureTotals.voice
            ? { count: featureTotals.voice.count, units: featureTotals.voice.units, users: featureTotals.voice.users.size }
            : { count: 0, units: 0, users: 0 },
          "meal-plan": featureTotals["meal-plan"]
            ? { count: featureTotals["meal-plan"].count, units: featureTotals["meal-plan"].units, users: featureTotals["meal-plan"].users.size }
            : { count: 0, units: 0, users: 0 },
        },
      },
    });
  } catch (err) {
    console.error("[admin/ai-usage GET]", err);
    return Response.json({ success: false, error: err.message }, { status: 500 });
  }
}
