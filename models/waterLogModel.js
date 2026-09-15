import mongoose from "mongoose";

/**
 * One document per user per day. Keeps queries simple ("give me the last
 * 30 days for this user") and avoids the map-of-days shape ballooning as
 * time goes on.
 *
 * Water goal is per-user (not per-day) — stored on the userIntro doc
 * alongside other daily targets. This model tracks intake only.
 */
const waterLogSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, index: true },
    day: { type: String, required: true }, // "YYYY-MM-DD" local date
    ml: { type: Number, required: true, min: 0, default: 0 },
  },
  { timestamps: true },
);

waterLogSchema.index({ userId: 1, day: 1 }, { unique: true });

export default mongoose.models.WaterLog ||
  mongoose.model("WaterLog", waterLogSchema);
