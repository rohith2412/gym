export const dynamic = "force-dynamic";

import { connectdb } from "@/lib/connectdb";
import Subscription from "@/models/subscriptionModel";
import { getAuthUser } from "@/lib/getAuthUser";
import jwt from "jsonwebtoken";

// ─── Apple App Store Server API ───────────────────────────────────────────────
// Docs: https://developer.apple.com/documentation/appstoreserverapi

const APPLE_PROD_URL    = "https://api.storekit.itunes.apple.com";
const APPLE_SANDBOX_URL = "https://api.storekit-sandbox.itunes.apple.com";

/**
 * Create a signed JWT for Apple App Store Server API
 * Expires in 60 seconds — Apple rejects tokens older than that
 */
function makeAppleJWT() {
  const keyId    = process.env.APPLE_KEY_ID;
  const issuerId = process.env.APPLE_ISSUER_ID;
  const bundleId = process.env.APPLE_BUNDLE_ID || "com.pocketgym.app";
  // Private key from .env — keep newlines intact
  const privateKey = (process.env.APPLE_PRIVATE_KEY || "").replace(/\\n/g, "\n");

  if (!keyId || !issuerId || !privateKey) {
    throw new Error("Missing APPLE_KEY_ID, APPLE_ISSUER_ID or APPLE_PRIVATE_KEY env vars");
  }

  const now = Math.floor(Date.now() / 1000);

  return jwt.sign(
    {
      iss: issuerId,
      iat: now,
      exp: now + 60,          // 60-second lifetime
      aud: "appstoreconnect-v1",
      bid: bundleId,
    },
    privateKey,
    {
      algorithm: "ES256",
      header: { alg: "ES256", kid: keyId, typ: "JWT" },
    }
  );
}

/**
 * Verify a transaction against Apple's App Store Server API
 * Falls back to sandbox if production returns 4040010 (not found in prod)
 */
async function verifyWithApple(originalTransactionId) {
  const token = makeAppleJWT();
  const headers = { Authorization: `Bearer ${token}` };

  // Try production first, fall back to sandbox
  for (const baseUrl of [APPLE_PROD_URL, APPLE_SANDBOX_URL]) {
    const url = `${baseUrl}/inApps/v1/subscriptions/${originalTransactionId}`;
    const res  = await fetch(url, { headers });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      // 4040010 = transaction not found in this environment → try sandbox
      if (err.errorCode === 4040010) continue;
      throw new Error(`Apple API error ${res.status}: ${JSON.stringify(err)}`);
    }

    const data = await res.json();

    // data.data is an array of subscription groups
    // Each group has lastTransactions array
    const transactions = data.data?.flatMap((g) => g.lastTransactions ?? []) ?? [];

    // status: 1 = active, 2 = expired, 3 = in billing retry, 4 = in grace period, 5 = revoked
    const active = transactions.find((t) => [1, 3, 4].includes(t.status));

    if (!active) {
      return { valid: false };
    }

    // Decode the signed transaction (it's a JWS — middle part is base64 JSON payload)
    const payload = JSON.parse(
      Buffer.from(active.signedTransactionInfo.split(".")[1], "base64url").toString("utf8")
    );

    return {
      valid: true,
      originalTransactionId: payload.originalTransactionId,
      productId:             payload.productId,
      expiresDate:           new Date(payload.expiresDate),
      environment:           payload.environment,   // "Production" | "Sandbox"
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

    const { receiptData, bundleId, transactionId } = await req.json();

    if (!transactionId) {
      return Response.json({ error: "transactionId is required" }, { status: 400 });
    }

    const userId = user.id;

    // ── Verify with Apple ──────────────────────────────────────────────────
    let result;
    try {
      result = await verifyWithApple(transactionId);
    } catch (appleErr) {
      console.error("Apple verification failed:", appleErr.message);
      return Response.json({ error: "Apple verification failed", detail: appleErr.message }, { status: 502 });
    }

    if (!result.valid) {
      return Response.json({ error: "Subscription not active or not found" }, { status: 400 });
    }

    // ── Save to DB ─────────────────────────────────────────────────────────
    const subscription = await Subscription.findOneAndUpdate(
      { userId },
      {
        status:                "active",
        paymentMethod:         "iap",
        transactionId:         result.originalTransactionId,
        originalTransactionId: result.originalTransactionId,
        productId:             result.productId,
        receiptData:           receiptData || null,
        bundleId:              bundleId || process.env.APPLE_BUNDLE_ID || "com.pocketgym.app",
        endDate:               result.expiresDate,
        startDate:             new Date(),
        isTrialUsed:           true,
        billingCycle:          result.productId?.includes("annual") ? "annual" : "monthly",
        environment:           result.environment,
      },
      { upsert: true, new: true }
    );

    return Response.json({
      success: true,
      subscription: {
        status:  subscription.status,
        endDate: subscription.endDate,
        plan:    subscription.plan,
      },
    });
  } catch (error) {
    console.error("Receipt verification error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
