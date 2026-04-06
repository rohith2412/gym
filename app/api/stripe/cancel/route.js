// app/api/stripe/cancel/route.js
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectdb } from "@/lib/connectdb";
import userIntroModel from "@/models/userIntroModel";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST() {
  try {
    await connectdb();
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return Response.json({ error: "Not authenticated" }, { status: 401 });
    }

    const intro = await userIntroModel.findOne({ userId: session.user.id });
    if (!intro?.stripeSubscriptionId) {
      return Response.json({ success: false, error: "No active subscription" }, { status: 400 });
    }

    // Cancel at period end (not immediately)
    await stripe.subscriptions.update(intro.stripeSubscriptionId, {
      cancel_at_period_end: true,
    });

    await userIntroModel.findOneAndUpdate(
      { userId: session.user.id },
      { subscriptionStatus: "canceling" }
    );

    return Response.json({ success: true });
  } catch (e) {
    console.error(e);
    return Response.json({ success: false, error: e.message }, { status: 500 });
  }
}