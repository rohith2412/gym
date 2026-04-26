export const dynamic = "force-dynamic";
import { connectdb }                 from "@/lib/connectdb";
import MealLog, { calculateTotals } from "@/models/mealLogModel";
import { ObjectId }                  from "mongodb";
import { getAuthUser }               from "@/lib/getAuthUser";

// ─── DELETE /api/meal-log/[id] ────────────────────────────────────────────────
export async function DELETE(req, { params }) {
  try {
    await connectdb();
    const authUser = await getAuthUser(req);
    if (!authUser)
      return Response.json({ error: "Not authenticated" }, { status: 401 });

    const id = params.id;
    if (!id)
      return Response.json({ error: "id required" }, { status: 400 });

    const filter = ObjectId.isValid(id)
      ? { _id: new ObjectId(id), userId: authUser.id }
      : { _id: id,               userId: authUser.id };

    await MealLog.deleteOne(filter);
    return Response.json({ success: true });
  } catch (err) {
    console.error("[meal-log DELETE]", err);
    return Response.json({ success: false, error: err.message }, { status: 500 });
  }
}

// ─── PATCH /api/meal-log/[id] ─────────────────────────────────────────────────
export async function PATCH(req, { params }) {
  try {
    await connectdb();
    const authUser = await getAuthUser(req);
    if (!authUser)
      return Response.json({ error: "Not authenticated" }, { status: 401 });

    const id = params.id;
    if (!id)
      return Response.json({ error: "id required" }, { status: 400 });

    const body = await req.json();
    const $set = {};

    if (body.totals) {
      $set.totals = {
        calories: parseFloat(body.totals.calories) || 0,
        protein:  parseFloat(body.totals.protein)  || 0,
        carbs:    parseFloat(body.totals.carbs)     || 0,
        fat:      parseFloat(body.totals.fat)       || 0,
        fiber:    parseFloat(body.totals.fiber)     || 0,
      };
    }
    if (body.foods) {
      $set.foods = body.foods;
      if (!body.totals) $set.totals = calculateTotals(body.foods);
    }
    if (body.aiNotes !== undefined) $set.aiNotes = body.aiNotes;

    if (Object.keys($set).length === 0)
      return Response.json({ error: "Nothing to update" }, { status: 400 });

    const filter = ObjectId.isValid(id)
      ? { _id: new ObjectId(id), userId: authUser.id }
      : { _id: id,               userId: authUser.id };

    const result = await MealLog.updateOne(filter, { $set });

    if (result.matchedCount === 0)
      return Response.json({ error: "Log not found or not yours" }, { status: 404 });

    return Response.json({ success: true, updated: $set });
  } catch (err) {
    console.error("[meal-log PATCH]", err);
    return Response.json({ success: false, error: err.message }, { status: 500 });
  }
}
