import CredentialAuth from "@/models/credentialAuthModel";
import Referral from "@/models/referralModel";
import MealLog from "@/models/mealLogModel";

/**
 * Rules a referee must satisfy before their referral becomes CREDITED and
 * the referrer earns the reward.
 *
 * These are deliberately conservative to keep the referral loop resistant
 * to alt-account farming — a referee that never logs a meal costs us
 * whatever ad revenue we would have made on the referrer, so requiring a
 * real meal + a few days of retention protects the model without much
 * friction for genuine invites.
 */
const MIN_MEALS = 1;
const MIN_AGE_DAYS = 3;

/**
 * Reward economics.
 *
 * Every REFERRALS_PER_MONTH credited referrals = REWARD_MONTHS of ad-free
 * on the referrer. Extension stacks on top of any existing window, so a
 * user with 20 days left who earns a second month walks away with ~50
 * days remaining. That's intentional — it rewards continuous inviting
 * rather than gaming the wait-until-it-expires cycle.
 *
 * When a batch is consumed, we deduct REFERRALS_PER_MONTH from `refBalance`
 * so leftover credits can accumulate toward the next month. Example: 3
 * credited referrals → grant 1 month, balance = 1 (waiting for one more).
 */
const REFERRALS_PER_MONTH = 2;
const REWARD_MONTHS = 1;
const MONTH_MS = 30 * 24 * 60 * 60 * 1000;

/**
 * Idempotent: call it as often as you like. Runs a single pending → credited
 * promotion for THIS user if they qualify, and increments the referrer's
 * `refBalance`. Safe to call inline from `/user-me` or a light endpoint —
 * short-circuits when there's nothing to do.
 *
 * Returns { credited, referrerId } for logging / push-notification hooks.
 */
export async function maybeCreditPending(userId) {
  const pending = await Referral.findOne({
    refereeId: String(userId),
    status: "pending",
  }).lean();
  if (!pending) return { credited: false };

  // Age check
  const me = await CredentialAuth.findById(userId).select("createdAt").lean();
  if (!me) return { credited: false };
  const ageDays = (Date.now() - new Date(me.createdAt).getTime()) / (24 * 3600 * 1000);
  if (ageDays < MIN_AGE_DAYS) return { credited: false };

  // Real-user check: at least one logged meal.
  const meals = await MealLog.countDocuments({ userId: String(userId) });
  if (meals < MIN_MEALS) return { credited: false };

  // Atomic promote + increment. We only bump refBalance if the referral
  // is actually still pending — protects against double-credit if the
  // handler is racing itself.
  const updated = await Referral.findOneAndUpdate(
    { _id: pending._id, status: "pending" },
    { $set: { status: "credited", creditedAt: new Date() } },
    { new: true },
  );
  if (!updated) return { credited: false };

  await CredentialAuth.updateOne(
    { _id: pending.referrerId },
    { $inc: { refBalance: 1 } },
  );

  // Try to consume the credit right away — if the referrer now has enough
  // banked credits, grant them a month of ad-free.
  const grant = await maybeGrantReward(pending.referrerId);

  return {
    credited: true,
    referrerId: pending.referrerId,
    grantedMonths: grant.grantedMonths,
    adsUntil: grant.adsUntil,
  };
}

/**
 * Check the referrer's balance and, if it's high enough, deduct a batch of
 * credits and extend their ad-free window by `REWARD_MONTHS` months. Safe
 * to call any time — no-op when the balance is below the threshold.
 *
 * Extension policy: `adsUntil = max(now, adsUntil) + N months`. Stacking
 * from the current expiry (not from `now`) means continuous inviters get
 * a cumulative reward instead of losing days by inviting early.
 */
export async function maybeGrantReward(userId) {
  const user = await CredentialAuth.findById(userId).select("refBalance adsUntil").lean();
  if (!user) return { grantedMonths: 0, adsUntil: null };

  const batches = Math.floor((user.refBalance ?? 0) / REFERRALS_PER_MONTH);
  if (batches < 1) return { grantedMonths: 0, adsUntil: user.adsUntil ?? null };

  const monthsToGrant = batches * REWARD_MONTHS;
  const creditsToConsume = batches * REFERRALS_PER_MONTH;

  const base = Math.max(
    Date.now(),
    user.adsUntil ? new Date(user.adsUntil).getTime() : 0,
  );
  const newAdsUntil = new Date(base + monthsToGrant * MONTH_MS);

  await CredentialAuth.updateOne(
    { _id: userId },
    {
      $set: { adsUntil: newAdsUntil },
      $inc: { refBalance: -creditsToConsume },
    },
  );

  return { grantedMonths: monthsToGrant, adsUntil: newAdsUntil };
}
