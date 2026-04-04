// app/api/ai-trainer/saved/route.js
// GET  /api/ai-trainer/saved        — list all saved plans for the user
// POST /api/ai-trainer/saved        — save a new plan

import { connectdb }        from "@/lib/connectdb";
import SavedPlan            from "@/models/savedPlanModel";
import { getServerSession } from "next-auth";
import { authOptions }      from "@/app/api/auth/[...nextauth]/route";

export async function GET(req) {
  try {
    await connectdb();
    const session = await getServerSession(authOptions);
    if (!session?.user?.id)
      return Response.json({ error: "Not authenticated" }, { status: 401 });

    const plans = await SavedPlan
      .find({ userId: session.user.id })
      .sort({ savedAt: -1 })
      .lean();

    return Response.json({ success: true, data: plans });
  } catch (err) {
    console.error("[saved-plans GET]", err);
    return Response.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await connectdb();
    const session = await getServerSession(authOptions);
    if (!session?.user?.id)
      return Response.json({ error: "Not authenticated" }, { status: 401 });

    const { plan } = await req.json();
    if (!plan) return Response.json({ success: false, error: "No plan provided" }, { status: 400 });

    const saved = await SavedPlan.create({ userId: session.user.id, plan });
    return Response.json({ success: true, data: saved });
  } catch (err) {
    console.error("[saved-plans POST]", err);
    return Response.json({ success: false, error: err.message }, { status: 500 });
  }
}