export const dynamic = "force-dynamic";

import { connectdb } from "@/lib/connectdb";
import { getAuthUser } from "@/lib/getAuthUser";
import CredentialAuth from "@/models/credentialAuthModel";
import Referral from "@/models/referralModel";
import { ensureCode } from "@/lib/referralCode";

/**
 * GET /api/referrals/mine
 *
 * Returns everything the Invite screen needs in one round-trip.
 *
 *   {
 *     code:       "A7K3P2",             // generated on first call
 *     balance:    1,                    // credits earned toward the NEXT month
 *     pending:    2,                    // waiting to satisfy the rules
 *     goal:       2,                    // credits per month of ad-free
 *     monthsGranted: 1,                 // months already granted lifetime
 *     adsUntil:   "2026-10-18" | null,  // when the current ad-free window ends
 *     adsFree:    true,                 // true iff adsUntil is in the future
 *     daysRemaining: 27,                // integer, 0 when not ads-free
 *     invitees: [{ refereeId, status, createdAt, creditedAt }]
 *   }
 *
 * `balance` is REMAINING credits (after any consumed batches). Every time
 * balance reaches `goal`, a batch is auto-consumed and `adsUntil` extends
 * by one month.
 */

const REFERRALS_PER_MONTH = 2;
const MONTH_MS = 30 * 24 * 60 * 60 * 1000;

export async function GET(req) {
  try {
    await connectdb();
    const authUser = await getAuthUser(req);
    if (!authUser)
      return Response.json({ error: "Not authenticated" }, { status: 401 });

    const code = await ensureCode(authUser.id);

    const [me, invitees] = await Promise.all([
      CredentialAuth.findById(authUser.id).select("refBalance adsUntil").lean(),
      Referral.find({ referrerId: authUser.id })
        .select("refereeId status createdAt creditedAt")
        .sort({ createdAt: -1 })
        .lean(),
    ]);

    const now = Date.now();
    const balance = me?.refBalance ?? 0;
    const adsUntil = me?.adsUntil ?? null;
    const adsUntilMs = adsUntil ? new Date(adsUntil).getTime() : 0;

    // Ads-free is driven purely by the time window now — the auto-grant
    // in `maybeGrantReward` moves credits into the window as soon as
    // enough accumulate, so `balance` never carries the reward itself.
    const adsFree = adsUntilMs > now;
    const daysRemaining = adsFree
      ? Math.ceil((adsUntilMs - now) / (24 * 60 * 60 * 1000))
      : 0;
    // Lifetime months granted = total credited referrals ÷ threshold.
    const monthsGranted = Math.floor(
      invitees.filter((r) => r.status === "credited").length /
        REFERRALS_PER_MONTH,
    );

    return Response.json({
      code,
      balance,
      pending: invitees.filter((r) => r.status === "pending").length,
      goal: REFERRALS_PER_MONTH,
      monthsGranted,
      adsUntil,
      adsFree,
      daysRemaining,
      invitees,
    });
  } catch (err) {
    console.error("[referrals/mine GET]", err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}
