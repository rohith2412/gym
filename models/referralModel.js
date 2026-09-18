import mongoose, { Schema } from "mongoose";

/**
 * One row per accepted referral code.
 *
 * `pending` — B just entered A's code; not yet counted toward A's reward.
 * `credited` — B has satisfied the rules (completed onboarding, logged ≥1
 *              meal, been on the app long enough). A's balance goes up.
 * `rejected` — flagged as fraud / self-referral / duplicate device / etc.
 *
 * Only one row per refereeId — a user can only be referred once total. The
 * unique index enforces that at the DB layer so retries or bugs can't
 * accidentally double-credit.
 */
const referralSchema = new Schema(
  {
    referrerId: { type: String, required: true, index: true },
    refereeId:  { type: String, required: true, unique: true },
    code:       { type: String, required: true, index: true },
    status: {
      type: String,
      enum: ["pending", "credited", "rejected"],
      default: "pending",
      index: true,
    },
    creditedAt: { type: Date, default: null },
    rejectedReason: { type: String, default: null },
  },
  { timestamps: true },
);

referralSchema.index({ referrerId: 1, status: 1 });

export default mongoose.models.Referral ||
  mongoose.model("Referral", referralSchema);
