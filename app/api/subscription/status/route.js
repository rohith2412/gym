export const dynamic = "force-dynamic";

import { connectdb } from "@/lib/connectdb";
import { getAuthUser } from "@/lib/getAuthUser";

/**
 * GET /api/subscription/status
 * Note: subscription state is now managed by RevenueCat.
 * This endpoint is kept for profile page compatibility only.
 */
export async function GET(req) {
  try {
    await connectdb();
    const user = await getAuthUser(req);
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    return Response.json({
      success:    true,
      userId:     user.id,
      message:    "Subscription status is managed by RevenueCat on the client.",
    });
  } catch (error) {
    console.error("Subscription status error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
