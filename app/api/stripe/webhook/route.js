import { connectdb } from "@/lib/connectdb";
import userIntroModel from "@/models/userIntroModel";
import Stripe from "stripe";

export async function POST(req) {
  // ← Initialize inside the function
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

  const body = await req.text();
  const sig  = req.headers.get("stripe-signature");

  let event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (e) {
    return new Response(`Webhook error: ${e.message}`, { status: 400 });
  }

  await connectdb();

  async function syncSubscription(sub) {
    const userId = sub.metadata?.userId;
    if (!userId) return;
    await userIntroModel.findOneAndUpdate(
      { userId },
      {
        stripeSubscriptionId: sub.id,
        subscriptionStatus:   sub.status,
        isSubscribed:         sub.status === "active",
        currentPeriodEnd:     new Date(sub.current_period_end * 1000),
      },
      { upsert: true }
    );
  }

  switch (event.type) {
    case "customer.subscription.created":
    case "customer.subscription.updated":
    case "customer.subscription.deleted":
      await syncSubscription(event.data.object);
      break;
    case "invoice.payment_failed":
      const sub = await stripe.subscriptions.retrieve(event.data.object.subscription);
      await syncSubscription(sub);
      break;
  }

  return Response.json({ received: true });
}