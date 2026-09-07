import mongoose from "mongoose";

/**
 * One document per user per UTC day per feature key.
 *
 * Kept intentionally simple: no per-request rows, just a counter. That means a
 * write on every AI call, but each one is a single-doc `findOneAndUpdate` with
 * an `$inc` on a compound-unique key — cheap, and the whole collection ages
 * out via a TTL index so it never grows unbounded.
 *
 * We rely on this as the *hard* limit; the app-side caps (5 photos, 1-min
 * voice) are UX, this is what stops a modified build burning through the
 * OpenAI bill.
 */
const aiUsageSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, index: true },
    day: { type: String, required: true }, // YYYY-MM-DD in UTC
    feature: { type: String, required: true }, // "coach" | "voice" | "photo" | "meal-plan"
    count: { type: Number, default: 0 },
    // Rough proxy so we can spot heavy features later without adding schema.
    // For voice this is seconds transcribed; for chat it's tokens used.
    units: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now, expires: 60 * 60 * 24 * 45 },
  },
  { versionKey: false }
);

// One row per (user, day, feature). Prevents duplicate counters from racing
// concurrent requests.
aiUsageSchema.index({ userId: 1, day: 1, feature: 1 }, { unique: true });

const AiUsage =
  mongoose.models.AiUsage || mongoose.model("AiUsage", aiUsageSchema);

export default AiUsage;
