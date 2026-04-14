export const dynamic = "force-dynamic"

// app/api/ai-trainer/saved/[id]/route.js
// DELETE /api/ai-trainer/saved/:id  - remove a saved plan (owner only)

import { connectdb }        from "@/lib/connectdb";
import SavedPlan            from "@/models/savedPlanModel";
import { getServerSession } from "next-auth";
import { authOptions }      from "@/app/api/auth/[...nextauth]/route";

export async function DELETE(req, { params }) {
  try {
    await connectdb();
    const session = await getServerSession(authOptions);
    if (!session?.user?.id)
      return Response.json({ error: "Not authenticated" }, { status: 401 });

    const { id } = await params;
    const doc = await SavedPlan.findOneAndDelete({ _id: id, userId: session.user.id });

    if (!doc)
      return Response.json({ success: false, error: "Plan not found or not yours" }, { status: 404 });

    return Response.json({ success: true });
  } catch (err) {
    console.error("[saved-plans DELETE]", err);
    return Response.json({ success: false, error: err.message }, { status: 500 });
  }
}