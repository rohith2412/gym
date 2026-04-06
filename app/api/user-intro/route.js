// app/api/user-intro/route.js
import { connectdb } from "@/lib/connectdb";
import userIntroModel from "@/models/userIntroModel";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET() {
  try {
    await connectdb();
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return Response.json({ error: "Not authenticated" }, { status: 401 });
    }
    const intro = await userIntroModel.findOne({ userId: session.user.id });
    return Response.json({ success: true, data: intro ?? null });
  } catch (error) {
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await connectdb();
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return Response.json({ error: "Not authenticated" }, { status: 401 });
    }
    const body = await req.json();
    // Never allow client to manually set subscription fields
    delete body.isSubscribed;
    delete body.stripeCustomerId;
    delete body.stripeSubscriptionId;
    delete body.subscriptionStatus;
    delete body.currentPeriodEnd;

    const intro = await userIntroModel.findOneAndUpdate(
      { userId: session.user.id },
      { ...body, userId: session.user.id },
      { upsert: true, new: true }
    );
    return Response.json({ success: true, data: intro });
  } catch (error) {
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}