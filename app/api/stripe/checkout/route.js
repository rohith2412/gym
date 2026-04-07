// app/api/checkout/route.js
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectdb } from "@/lib/connectdb";
import userIntroModel from "@/models/userIntroModel";
import Stripe from "stripe";

export const dynamic = "force-dynamic";

export async function POST(req) {
  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    await connectdb();

    const session = await getServerSession(authOptions);
    console.log("SESSION IN CHECKOUT:", JSON.stringify(session, null, 2));

    if (!session?.user?.id) {
      return Response.json({ error: "Not authenticated" }, { status: 401 });
    }

    const intro = await userIntroModel.findOne({ userId: session.user.id });

    let customerId = intro?.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: session.user.email,
        name:  session.user.name,
        metadata: { userId: session.user.id },
      });
      customerId = customer.id;
      await userIntroModel.findOneAndUpdate(
        { userId: session.user.id },
        { stripeCustomerId: customerId },
        { upsert: true }
      );
    }

    // Build base URL — try env first, then derive from request headers
    const host    = req.headers.get("host");
    const proto   = host?.includes("localhost") ? "http" : "https";
    const baseUrl = process.env.NEXTAUTH_URL || `${proto}://${host}`;

    const checkoutSession = await stripe.checkout.sessions.create({
      customer:    customerId,
      mode:        "subscription",
      line_items:  [{ price: process.env.STRIPE_PRICE_ID, quantity: 1 }],
      success_url: `${baseUrl}/v1/pricing?success=true`,
      cancel_url:  `${baseUrl}/v1/pricing?canceled=true`,
      subscription_data: {
        metadata: { userId: session.user.id },
      },
      metadata: { userId: session.user.id },
    });

    return Response.json({ success: true, url: checkoutSession.url });
  } catch (e) {
    console.error("Checkout error:", e);
    return Response.json({ success: false, error: e.message }, { status: 500 });
  }
}