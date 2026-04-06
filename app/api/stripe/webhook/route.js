import Stripe from "stripe";
import { connectdb } from "@/lib/connectdb";
import userIntroModel from "@/models/userIntroModel";

export const dynamic = "force-dynamic";

export async function POST(req) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  let event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (e) {
    console.error("Webhook signature error:", e.message);
    return new Response(`Webhook error: ${e.message}`, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    try {
      const session = event.data.object;
      const userId = session.metadata?.userId;

      console.log("Payment received for userId:", userId);

      if (!userId) {
        console.error("No userId in metadata");
        return Response.json({ received: true });
      }

      await connectdb();
      await userIntroModel.findOneAndUpdate(
        { userId },
        {
          isSubscribed: true,
          stripeCustomerId: session.customer,
          stripeSubscriptionId: session.subscription,
          subscriptionStatus: "active",
        },
        { upsert: true }
      );

      console.log("isSubscribed set to true for:", userId);
    } catch (err) {
      console.error("Error updating user:", err.message);
      return new Response("Server error", { status: 500 });
    }
  }

  // Handle cancellations / failed payments
  if (event.type === "customer.subscription.deleted" || 
      event.type === "customer.subscription.updated") {
    try {
      const sub = event.data.object;
      const customerId = sub.customer;

      await connectdb();
      const user = await userIntroModel.findOne({ stripeCustomerId: customerId });
      if (!user) {
        console.error("No user found for customerId:", customerId);
        return Response.json({ received: true });
      }

      const isActive = sub.status === "active";
      await userIntroModel.findOneAndUpdate(
        { stripeCustomerId: customerId },
        {
          isSubscribed: isActive,
          subscriptionStatus: sub.status,
        }
      );

      console.log("Subscription updated for customerId:", customerId, "status:", sub.status);
    } catch (err) {
      console.error("Error updating subscription:", err.message);
      return new Response("Server error", { status: 500 });
    }
  }

  return Response.json({ received: true });
}