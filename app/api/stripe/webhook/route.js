import { connectdb } from "@/lib/connectdb";
import userIntroModel from "@/models/userIntroModel";
import Stripe from "stripe";

export const dynamic = "force-dynamic";
//isSubscribed
export async function POST(req) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

  const body = await req.text();
  const sig  = req.headers.get("stripe-signature");

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (e) {
    console.error("Webhook signature error:", e.message);
    return new Response(`Webhook error: ${e.message}`, { status: 400 });
  }

  await connectdb();

async function syncSubscription(sub) {
  let userId = sub.metadata?.userId;

  // Fallback: find user by stripeCustomerId stored in your DB
  if (!userId && sub.customer) {
    const existing = await userIntroModel.findOne({
      stripeCustomerId: sub.customer,
    });
    userId = existing?.userId;
  }

  if (!userId) {
    console.error("No userId found for subscription:", sub.id, "customer:", sub.customer);
    return;
  }

  console.log("Syncing subscription for userId:", userId, "status:", sub.status);
  await userIntroModel.findOneAndUpdate(
    { userId },
    {
      stripeCustomerId:     sub.customer,   // also persist this
      stripeSubscriptionId: sub.id,
      subscriptionStatus:   sub.status,
      isSubscribed:         sub.status === "active",
      currentPeriodEnd:     new Date(sub.current_period_end * 1000),
    },
    { upsert: true }
  );
}

  console.log("Webhook event received:", event.type);

  switch (event.type) {

    // ── Fires immediately when checkout payment succeeds ──────────────────
    case "checkout.session.completed": {
      const checkoutSession = event.data.object;

        console.log("CHECKOUT SESSION FULL:", JSON.stringify(checkoutSession, null, 2));
        console.log("metadata:", checkoutSession.metadata);
        console.log("subscription_data metadata:", checkoutSession.subscription_data);
        
      // Only handle subscription checkouts
      if (checkoutSession.mode !== "subscription") break;

      const userId = checkoutSession.metadata?.userId;
      if (!userId) break;

      // Fetch the full subscription object to get all fields
      const subscription = await stripe.subscriptions.retrieve(
        checkoutSession.subscription
      );

      await userIntroModel.findOneAndUpdate(
        { userId },
        {
          stripeSubscriptionId: subscription.id,
          subscriptionStatus:   subscription.status,
          isSubscribed:         subscription.status === "active",
          currentPeriodEnd:     new Date(subscription.current_period_end * 1000),
          stripeCustomerId:     checkoutSession.customer,
        },
        { upsert: true }
      );
      console.log("Checkout completed — user subscribed:", userId);
      break;
    }

    // ── Subscription lifecycle events ─────────────────────────────────────
    case "customer.subscription.created":
    case "customer.subscription.updated":
    case "customer.subscription.deleted":
      await syncSubscription(event.data.object);
      break;

    // ── Payment failed ────────────────────────────────────────────────────
    case "invoice.payment_failed": {
      const invoice = event.data.object;
      if (invoice.subscription) {
        const sub = await stripe.subscriptions.retrieve(invoice.subscription);
        await syncSubscription(sub);
      }
      break;
    }

    default:
      console.log("Unhandled event type:", event.type);
  }

  return Response.json({ received: true });
}