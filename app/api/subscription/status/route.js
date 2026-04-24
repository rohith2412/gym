export const dynamic = "force-dynamic";

import { connectdb } from "@/lib/connectdb";
import Subscription from "@/models/subscriptionModel";
import { getAuthUser } from "@/lib/getAuthUser";

/**
 * GET /api/subscription/status
 * Get user's subscription status
 * Returns isPremium, subscription details, days until renewal, and feature access
 */
export async function GET(req) {
  try {
    await connectdb();

    // Verify JWT token (React Native) or NextAuth session (web)
    const user = await getAuthUser(req);
    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = user.id;

    let subscription = await Subscription.findOne({ userId });

    // If no subscription exists, user is not premium (no auto-trial)
    if (!subscription) {
      return Response.json({
        success: true,
        userId,
        isPremium: false,
        subscription: null,
        daysUntilRenewal: null,
        canAccessAITrainer: false,
        canAccessRecipes: false,
        canAccessMacroScanner: false,
      });
    }

    // Determine if user is premium (only active subscriptions)
    const now = new Date();
    const isPremium = subscription.status === "active";

    // Calculate days until renewal
    let daysUntilRenewal = null;
    if (subscription.endDate) {
      daysUntilRenewal = Math.ceil(
        (subscription.endDate - now) / (24 * 60 * 60 * 1000)
      );
    }

    return Response.json({
      success: true,
      userId,
      isPremium,
      subscription: {
        status: subscription.status,
        plan: subscription.plan,
        startDate: subscription.startDate,
        endDate: subscription.endDate,
        trialEndsAt: subscription.trialEndsAt,
      },
      daysUntilRenewal,
      canAccessAITrainer: isPremium,
      canAccessRecipes: isPremium,
      canAccessMacroScanner: isPremium,
    });
  } catch (error) {
    console.error("Subscription status error:", error);
    return Response.json(
      { error: "Failed to fetch subscription status" },
      { status: 500 }
    );
  }
}
