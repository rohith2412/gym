export const dynamic = "force-dynamic";

import { connectdb } from "@/lib/connectdb";
import Subscription from "@/models/subscriptionModel";
import { getAuthUser } from "@/lib/getAuthUser";
import jwt from "jsonwebtoken";

// ─── Shared Apple JWT helper (same as verify-receipt) ─────────────────────────
function makeAppleJWT() {
  const keyId      = process.env.APPLE_KEY_ID;
  const issuerId   = process.env.APPLE_ISSUER_ID;
  const bundleId   = process.env.APPLE_BUNDLE_ID || "com.pocketgym.app";
  const privateKey = (process.env.APPLE_PRIVATE_KEY || "").replace(/\\n/g, "\n");

  if (!keyId || !issuerId || !privateKey) {
    throw new Error("Missing Apple API env vars");
  }

  const now = Math.floor(Date.now() / 1000);
  return jwt.sign(
    { iss: issuerId, iat: now, exp: now + 60, aud: "appstoreconnect-v1", bid: bundleId },
    privateKey,
    { algorithm: "ES256", header: { alg: "ES256", kid: keyId, typ: "JWT" } }
  );
}

async function checkAppleSubscription(originalTransactionId) {
  const token   = makeAppleJWT();
  const headers = { Authorization: `Bearer ${token}` };

  for (const base of [
    "https://api.storekit.itunes.apple.com",
    "https://api.storekit-sandbox.itunes.apple.com",
  ]) {
    const res = await fetch(`${base}/inApps/v1/subscriptions/${originalTransactionId}`, { headers });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      if (err.errorCode === 4040010) continue; // not found in this env, try sandbox
      throw new Error(`Apple API ${res.status}`);
    }

    const data = await res.json();
    const transactions = data.data?.flatMap((g) => g.lastTransactions ?? []) ?? [];
    // status 1=active, 3=billing retry, 4=grace period
    const active = transactions.find((t) => [1, 3, 4].includes(t.status));
    if (!active) return { valid: false };

    const payload = JSON.parse(
      Buffer.from(active.signedTransactionInfo.split(".")[1], "base64url").toString("utf8")
    );

    return {
      valid:       true,
      expiresDate: new Date(payload.expiresDate),
      productId:   payload.productId,
    };
  }

  return { valid: false };
}

// ─── Route Handler ─────────────────────────────────────────────────────────────
export async function POST(req) {
  try {
    await connectdb();

    const user = await getAuthUser(req);
    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const subscription = await Subscription.findOne({ userId: user.id });

    if (!subscription?.originalTransactionId) {
      return Response.json({ error: "No subscription found to restore" }, { status: 404 });
    }

    // ── Re-verify with Apple ───────────────────────────────────────────────
    let appleResult;
    try {
      appleResult = await checkAppleSubscription(subscription.originalTransactionId);
    } catch (err) {
      console.error("Apple restore check failed:", err.message);
      // If Apple is unreachable fall back to local DB status
      appleResult = null;
    }

    if (appleResult && !appleResult.valid) {
      // Apple says expired — update DB and reject
      await Subscription.findOneAndUpdate({ userId: user.id }, { status: "expired" });
      return Response.json({ error: "Subscription is no longer active" }, { status: 400 });
    }

    // If Apple confirmed a new expiry date, sync it
    if (appleResult?.valid && appleResult.expiresDate) {
      await Subscription.findOneAndUpdate(
        { userId: user.id },
        { status: "active", endDate: appleResult.expiresDate }
      );
      subscription.endDate = appleResult.expiresDate;
      subscription.status  = "active";
    }

    return Response.json({
      success: true,
      subscription: {
        status:    subscription.status,
        plan:      subscription.plan,
        endDate:   subscription.endDate,
        startDate: subscription.startDate,
      },
      message: "Subscription restored successfully",
    });
  } catch (error) {
    console.error("Restore purchases error:", error);
    return Response.json({ error: "Failed to restore purchases" }, { status: 500 });
  }
}
