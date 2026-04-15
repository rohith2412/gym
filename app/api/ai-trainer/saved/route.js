export const dynamic = "force-dynamic";

import { connectdb }   from "@/lib/connectdb";
import SavedPlan       from "@/models/savedPlanModel";
import { getAuthUser } from "@/lib/getAuthUser";

export async function GET(req) {
  try {
    await connectdb();
    const authUser = await getAuthUser(req);
    if (!authUser)
      return Response.json({ error: "Not authenticated" }, { status: 401 });

    const plans = await SavedPlan
      .find({ userId: authUser.id })
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
    const authUser = await getAuthUser(req);
    if (!authUser)
      return Response.json({ error: "Not authenticated" }, { status: 401 });

    const { plan } = await req.json();
    if (!plan)
      return Response.json({ success: false, error: "No plan provided" }, { status: 400 });

    const saved = await SavedPlan.create({ userId: authUser.id, plan });
    return Response.json({ success: true, data: saved });
  } catch (err) {
    console.error("[saved-plans POST]", err);
    return Response.json({ success: false, error: err.message }, { status: 500 });
  }
}