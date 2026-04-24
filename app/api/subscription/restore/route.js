export const dynamic = "force-dynamic";

import { connectdb } from "@/lib/connectdb";
import Subscription from "@/models/subscriptionModel";
import { getAuthUser } from "@/lib/getAuthUser";

/**
 * POST /api/subscription/restore
 * Restore purchases for user (when app is reinstalled or user logs back in)
 * Validates existing subscription with Apple and returns current status
 */
export async function POST(req) {
  try {
    await connectdb();

    // Verify authentication
    const user = await getAuthUser(req);
    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = user.id;

    // Find existing subscription
    const subscription = await Subscription.findOne({ userId });

    if (!subscription) {
      return Response.json(
        { error: "No subscription found to restore" },
        { status: 404 }
      );
    }

    // TODO: In production, verify the subscription is still valid with Apple
    // using the App Store Server API
    //
    // Steps:
    // 1. Extract originalTransactionId from subscription
    // 2. Create JWT signed with your App Store API key
    // 3. Call App Store API to validate subscription status
    // 4. Update subscription status if needed

    const now = new Date();
    const isValid =
      subscription.status === "active" &&
      subscription.endDate &&
      subscription.endDate > now;

    if (!isValid) {
      // Subscription expired or canceled
      return Response.json(
        {
          error: "Subscription is no longer active",
          subscription,
        },
        { status: 400 }
      );
    }

    // Return subscription details for successful restore
    return Response.json({
      success: true,
      subscription: {
        status: subscription.status,
        plan: subscription.plan,
        endDate: subscription.endDate,
        startDate: subscription.startDate,
      },
      message: "Subscription restored successfully",
    });
  } catch (error) {
    console.error("Restore purchases error:", error);
    return Response.json(
      { error: "Failed to restore purchases" },
      { status: 500 }
    );
  }
}
