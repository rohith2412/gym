import AiUsage from "@/models/aiUsageModel";

/**
 * Per-user daily caps on AI features. These are what actually cap the OpenAI
 * bill — the app-side caps (60s voice, 5/day photo) exist for UX, but a
 * modified build could ignore them; this cannot.
 *
 * Numbers are set generously enough that a real user never hits them, but low
 * enough that one abusive user can't burn the budget for the day. Adjust as
 * usage data comes in.
 */
export const DAILY_LIMITS = {
  coach: 40, // messages/day — power-user coach session is ~20
  voice: 30, // clips/day — 30 × 60s = 30 min transcription/user/day
  photo: 5, // scans/day — matches the app-side cap
  "meal-plan": 3, // meal plans/day — this is the expensive one
};

const utcDay = () => new Date().toISOString().slice(0, 10);

/**
 * Read current usage without mutating. Callers that want to bail before doing
 * any billable work should use this; callers that want to bill-then-record can
 * skip straight to `record`.
 */
export async function checkAiLimit(userId, feature) {
  const limit = DAILY_LIMITS[feature];
  if (!limit) return { allowed: true, used: 0, limit: Infinity };

  const day = utcDay();
  const doc = await AiUsage.findOne({ userId, day, feature }).lean();
  const used = doc?.count ?? 0;

  return { allowed: used < limit, used, limit, remaining: Math.max(0, limit - used) };
}

/**
 * Atomically bump the counter. Returns the *new* count so callers can decide
 * to still respond but flag "you're at the cap".
 *
 * `units` is a rough weight so we can spot heavy features later — seconds
 * for voice, tokens for chat, 1 for anything else.
 */
export async function recordAiUsage(userId, feature, units = 1) {
  const day = utcDay();
  const res = await AiUsage.findOneAndUpdate(
    { userId, day, feature },
    { $inc: { count: 1, units } },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  return res.count;
}

/**
 * The common pattern: check limit → 429 if over → return null so the route
 * can early-exit. Keeps the boilerplate out of each route.
 *
 *   const limited = await guardAiLimit(user.id, "coach");
 *   if (limited) return limited;   // NextResponse already built
 *
 * The response includes `used`/`limit` so the app can show a "you've hit
 * today's cap, resets at midnight UTC" message rather than a generic error.
 */
export async function guardAiLimit(userId, feature) {
  const { NextResponse } = await import("next/server");
  const check = await checkAiLimit(userId, feature);
  if (check.allowed) return null;
  return NextResponse.json(
    {
      error: "Daily AI limit reached",
      feature,
      used: check.used,
      limit: check.limit,
      resetsAt: `${utcDay()}T24:00:00Z`,
    },
    { status: 429 }
  );
}
