export const dynamic = "force-dynamic";

import { connectdb } from "@/lib/connectdb";
import Subscription from "@/models/subscriptionModel";
import { getAuthUser } from "@/lib/getAuthUser";

/**
 * POST /api/subscription/verify-receipt
 * Verify App Store receipt and create/update subscription
 *
 * Request body:
 * {
 *   receiptData: string (base64 encoded receipt)
 *   bundleId?: string (optional, e.g., com.pocketgym.app)
 *   transactionId?: string (optional)
 * }
 */
export async function POST(req) {
  try {
    await connectdb();

    // Verify authentication
    const user = await getAuthUser(req);
    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { receiptData, bundleId, transactionId } = await req.json();

    if (!receiptData) {
      return Response.json(
        { error: "Receipt data is required" },
        { status: 400 }
      );
    }

    const userId = user.id;

    // TODO: Implement full App Store Server API verification
    // For now, this is a simplified version that accepts the receipt
    // In production, you MUST verify with Apple's App Store Server API
    //
    // Steps to verify with Apple:
    // 1. Extract originalTransactionId from receiptData
    // 2. Create JWT signed with your App Store API key
    // 3. Call: GET https://api.storekit.itunes.apple.com/inApps/v1/subscriptions/{originalTransactionId}
    // 4. Validate response contains active subscription
    // See: https://developer.apple.com/documentation/appstoreserverapi

    const verifyWithApple = async (receipt) => {
      // This is a PLACEHOLDER - implement real verification
      console.log(
        "TODO: Verify receipt with Apple App Store Server API",
        receipt
      );

      // For now, return mock verification
      // REMOVE THIS IN PRODUCTION - Always verify with Apple
      return {
        valid: true,
        originalTransactionId: transactionId || "mock_transaction_id",
        productId: "com.pocketgym.premium.monthly",
        expiresDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      };
    };

    const result = await verifyWithApple(receiptData);

    if (!result.valid) {
      return Response.json({ error: "Invalid receipt" }, { status: 400 });
    }

    // Update or create subscription
    const subscription = await Subscription.findOneAndUpdate(
      { userId },
      {
        status: "active",
        paymentMethod: "iap",
        transactionId: result.originalTransactionId,
        originalTransactionId: result.originalTransactionId,
        productId: result.productId,
        receiptData,
        bundleId: bundleId || "com.pocketgym.app",
        endDate: result.expiresDate,
        startDate: new Date(),
        isTrialUsed: true,
        billingCycle: result.productId?.includes("annual") ? "annual" : "monthly",
      },
      { upsert: true, new: true }
    );

    return Response.json({
      success: true,
      subscription: {
        status: subscription.status,
        endDate: subscription.endDate,
        plan: subscription.plan,
      },
    });
  } catch (error) {
    console.error("Receipt verification error:", error);
    return Response.json(
      { error: "Failed to verify receipt" },
      { status: 500 }
    );
  }
}
