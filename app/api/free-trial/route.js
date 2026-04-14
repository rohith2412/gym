export const dynamic = "force-dynamic"

// app/api/free-trial/route.js
// Tracks whether a user has already used their one free CalAI trial.
// Stored as a flag on the user's existing intro document.

import { connectdb }        from "@/lib/connectdb";
import userIntroModel       from "@/models/userIntroModel";
import { getServerSession } from "next-auth";
import { authOptions }      from "@/app/api/auth/[...nextauth]/route";

// GET - has this user already used their free trial?
export async function GET() {
  try {
    await connectdb();
    const session = await getServerSession(authOptions);
    if (!session?.user?.id)
      return Response.json({ error: "Not authenticated" }, { status: 401 });

    const intro = await userIntroModel.findOne({ userId: session.user.id });
    return Response.json({ success: true, used: !!intro?.freeTrialUsed });
  } catch (err) {
    return Response.json({ success: false, error: err.message }, { status: 500 });
  }
}

// POST - mark free trial as consumed
export async function POST() {
  try {
    await connectdb();
    const session = await getServerSession(authOptions);
    if (!session?.user?.id)
      return Response.json({ error: "Not authenticated" }, { status: 401 });

    await userIntroModel.findOneAndUpdate(
      { userId: session.user.id },
      { freeTrialUsed: true },
      { upsert: true, new: true },
    );
    return Response.json({ success: true });
  } catch (err) {
    return Response.json({ success: false, error: err.message }, { status: 500 });
  }
}