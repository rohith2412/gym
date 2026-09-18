export const dynamic = "force-dynamic";

import { connectdb } from "@/lib/connectdb";
import { getAuthUser } from "@/lib/getAuthUser";
import Auth from "@/models/authModel";
import Referral from "@/models/referralModel";
import { normalizeCode } from "@/lib/referralCode";

/**
 * POST /api/referrals/redeem
 * body: { code: "A7K3P2" }
 *
 * Called by a NEW user (the referee) during onboarding after they type
 * someone else's referral code.
 *
 * On success returns { success: true, pending: true } — the referrer
 * won't actually be credited until the referee satisfies the maturity
 * rules (see `maybeCreditPending` — meant to be called from `/user-me`
 * on every open so credits roll in lazily without a cron).
 *
 * Anti-abuse rules enforced here:
 *   - can't self-redeem
 *   - can't redeem twice (unique index on refereeId)
 *   - referrer must exist and have a code
 *   - referrer must be older than 1 day (prevents brand-new alt accounts
 *     from creating fake chains right after signup)
 */
export async function POST(req) {
  try {
    await connectdb();
    const authUser = await getAuthUser(req);
    if (!authUser)
      return Response.json({ error: "Not authenticated" }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const code = normalizeCode(body.code);
    if (!code || code.length < 4)
      return Response.json({ error: "Invalid code" }, { status: 400 });

    // Look up the code's owner. `code` is unique + indexed.
    const referrer = await Auth.findOne({ code })
      .select("_id createdAt")
      .lean();
    if (!referrer)
      return Response.json({ error: "Code not found" }, { status: 404 });

    // Self-referral guard.
    if (String(referrer._id) === String(authUser.id))
      return Response.json({ error: "Can't use your own code" }, { status: 400 });

    // Referrer must be > 1 day old so freshly-created alt accounts can't
    // generate a code and immediately have another alt redeem it.
    const ageMs = Date.now() - new Date(referrer.createdAt).getTime();
    if (ageMs < 24 * 60 * 60 * 1000)
      return Response.json({ error: "Code not yet active" }, { status: 400 });

    // One redemption per referee, ever. The unique index on `refereeId`
    // makes this atomic — a second attempt hits E11000 and we return the
    // existing record silently.
    try {
      await Referral.create({
        referrerId: String(referrer._id),
        refereeId: String(authUser.id),
        code,
        status: "pending",
      });
    } catch (err) {
      if (err?.code === 11000) {
        return Response.json(
          { error: "You've already used a referral code" },
          { status: 409 },
        );
      }
      throw err;
    }

    return Response.json({ success: true, pending: true });
  } catch (err) {
    console.error("[referrals/redeem POST]", err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}
