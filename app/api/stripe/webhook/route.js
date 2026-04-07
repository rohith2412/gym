import Stripe from "stripe";
import { connectdb } from "@/lib/connectdb";
import userIntroModel from "@/models/userIntroModel";

export const dynamic = "force-dynamic";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(req) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("Webhook signature error:", err.message);
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }

  // =========================
  // 1. CHECKOUT SUCCESS
  // =========================
  if (event.type === "checkout.session.completed") {
    try {
      const session = event.data.object;

      await connectdb();

      const userId = session.metadata?.userId;

      if (!userId) {
        console.error("Missing userId in metadata");
        return Response.json({ received: true });
      }

      let subscriptionData = null;

      // ✅ Fetch subscription properly
      if (session.subscription) {
        subscriptionData = await stripe.subscriptions.retrieve(
          session.subscription
        );
      }

      await userIntroModel.findOneAndUpdate(
        { userId },
        {
          isSubscribed: true,
          stripeCustomerId: session.customer,
          stripeSubscriptionId: session.subscription,
          subscriptionStatus: subscriptionData?.status || "active",

          currentPeriodEnd: subscriptionData?.current_period_end
            ? new Date(subscriptionData.current_period_end * 1000)
            : null,
        },
        { upsert: true }
      );

      console.log("User subscribed:", userId);
    } catch (err) {
      console.error("Checkout webhook error:", err.message);
      return new Response("Server error", { status: 500 });
    }
  }

  // =========================
  // 2. SUBSCRIPTION SYNC (IMPORTANT)
  // =========================
  if (
    event.type === "customer.subscription.created" ||
    event.type === "customer.subscription.updated" ||
    event.type === "customer.subscription.deleted"
  ) {
    try {
      const sub = event.data.object;
      const customerId = sub.customer;

      await connectdb();

      await userIntroModel.findOneAndUpdate(
        { stripeCustomerId: customerId },
        {
          isSubscribed: sub.status === "active",
          subscriptionStatus: sub.status,
          stripeSubscriptionId: sub.id,

          currentPeriodEnd: sub.current_period_end
            ? new Date(sub.current_period_end * 1000)
            : null,
        },
        { upsert: true }
      );

      console.log("Subscription synced:", customerId, sub.status);
    } catch (err) {
      console.error("Subscription webhook error:", err.message);
      return new Response("Server error", { status: 500 });
    }
  }

  return Response.json({ received: true });
}