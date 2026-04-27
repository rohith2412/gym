export const dynamic = "force-dynamic";
// app/api/saved-recipes/route.js
import { connectdb }      from "@/lib/connectdb";
import SavedRecipe        from "@/models/savedRecipeModel";
import { getAuthUser }    from "@/lib/getAuthUser";

// GET /api/saved-recipes — return all saved recipes for the user
export async function GET(req) {
  try {
    await connectdb();
    const authUser = await getAuthUser(req);
    if (!authUser)
      return Response.json({ error: "Not authenticated" }, { status: 401 });

    const saved = await SavedRecipe
      .find({ userId: authUser.id })
      .sort({ savedAt: -1 })
      .lean();

    return Response.json({ success: true, data: saved.map((s) => s.recipe) });
  } catch (err) {
    console.error("[saved-recipes GET]", err);
    return Response.json({ success: false, error: err.message }, { status: 500 });
  }
}

// POST /api/saved-recipes — save a recipe
export async function POST(req) {
  try {
    await connectdb();
    const authUser = await getAuthUser(req);
    if (!authUser)
      return Response.json({ error: "Not authenticated" }, { status: 401 });

    const { recipe } = await req.json();
    if (!recipe)
      return Response.json({ success: false, error: "No recipe provided" }, { status: 400 });

    const recipeKey = recipe._id || recipe.name;
    if (!recipeKey)
      return Response.json({ success: false, error: "Recipe has no identifier" }, { status: 400 });

    // Upsert — safe to call multiple times
    await SavedRecipe.findOneAndUpdate(
      { userId: authUser.id, recipeKey },
      { userId: authUser.id, recipeKey, recipe, savedAt: new Date() },
      { upsert: true, new: true }
    );

    return Response.json({ success: true });
  } catch (err) {
    console.error("[saved-recipes POST]", err);
    return Response.json({ success: false, error: err.message }, { status: 500 });
  }
}

// DELETE /api/saved-recipes — clear ALL saved recipes for the user
export async function DELETE(req) {
  try {
    await connectdb();
    const authUser = await getAuthUser(req);
    if (!authUser)
      return Response.json({ error: "Not authenticated" }, { status: 401 });

    await SavedRecipe.deleteMany({ userId: authUser.id });
    return Response.json({ success: true });
  } catch (err) {
    console.error("[saved-recipes DELETE]", err);
    return Response.json({ success: false, error: err.message }, { status: 500 });
  }
}
