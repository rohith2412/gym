export const dynamic = "force-dynamic";

import { connectdb }   from "@/lib/connectdb";
import SavedPlan       from "@/models/savedPlanModel";
import { getAuthUser } from "@/lib/getAuthUser";

export async function DELETE(req, { params }) {
  try {
    await connectdb();
    const authUser = await getAuthUser(req);
    if (!authUser)
      return Response.json({ error: "Not authenticated" }, { status: 401 });

    const { id } = await params;
    const doc = await SavedPlan.findOneAndDelete({ _id: id, userId: authUser.id });

    if (!doc)
      return Response.json({ success: false, error: "Plan not found or not yours" }, { status: 404 });

    return Response.json({ success: true });
  } catch (err) {
    console.error("[saved-plans DELETE]", err);
    return Response.json({ success: false, error: err.message }, { status: 500 });
  }
}