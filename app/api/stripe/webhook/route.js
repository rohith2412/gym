// app/api/webhook/route.js
import Stripe from "stripe";
import { connectdb } from "@/lib/connectdb";
import userIntroModel from "@/models/userIntroModel";

export const dynamic = "force-dynamic";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// ── Helper: always 30 days from the moment of purchase/renewal ──
function thirtyDaysFromNow() {
  return new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
}

export async function POST(req) {
  const body = await req.text();
  const sig  = req.headers.get("stripe-signature");

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

      // Fetch subscription to get status
      let subscriptionStatus = "active";
      if (session.subscription) {
        const subscriptionData = await stripe.subscriptions.retrieve(
          session.subscription
        );
        subscriptionStatus = subscriptionData?.status || "active";
      }

      const periodEnd = thirtyDaysFromNow();

      await userIntroModel.findOneAndUpdate(
        { userId },
        {
          isSubscribed:        true,
          stripeCustomerId:    session.customer,
          stripeSubscriptionId:session.subscription,
          subscriptionStatus,
          currentPeriodEnd:    periodEnd,  // ✅ 30 days from purchase
        },
        { upsert: true, new: true }
      );

      console.log(`✅ User subscribed: ${userId} | Period ends: ${periodEnd}`);
    } catch (err) {
      console.error("Checkout webhook error:", err.message);
      return new Response("Server error", { status: 500 });
    }
  }

  // =========================
  // 2. SUBSCRIPTION SYNC
  // =========================
  if (
    event.type === "customer.subscription.created" ||
    event.type === "customer.subscription.updated" ||
    event.type === "customer.subscription.deleted"
  ) {
    try {
      const sub        = event.data.object;
      const customerId = sub.customer;
      const isActive   = sub.status === "active";

      await connectdb();

      // Only push a new 30-day window when a subscription becomes active/renewed.
      // On cancellation/deletion we keep the existing periodEnd so the user
      // retains access until it expires naturally.
      const updatePayload = {
        isSubscribed:        isActive,
        subscriptionStatus:  sub.status,
        stripeSubscriptionId:sub.id,
      };

      if (
        isActive &&
        (event.type === "customer.subscription.created" ||
         event.type === "customer.subscription.updated")
      ) {
        updatePayload.currentPeriodEnd = thirtyDaysFromNow(); // ✅ 30 days from renewal
      }

      await userIntroModel.findOneAndUpdate(
        { stripeCustomerId: customerId },
        updatePayload,
        { upsert: true, new: true }
      );

      console.log(`✅ Subscription synced: ${customerId} | Status: ${sub.status}`);
    } catch (err) {
      console.error("Subscription webhook error:", err.message);
      return new Response("Server error", { status: 500 });
    }
  }

  return Response.json({ received: true });
}