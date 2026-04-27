export const dynamic = "force-dynamic";
// app/api/saved-recipes/[id]/route.js
import { connectdb }    from "@/lib/connectdb";
import SavedRecipe      from "@/models/savedRecipeModel";
import { getAuthUser }  from "@/lib/getAuthUser";

// DELETE /api/saved-recipes/:id — unsave a single recipe by recipeKey
export async function DELETE(req, { params }) {
  try {
    await connectdb();
    const authUser = await getAuthUser(req);
    if (!authUser)
      return Response.json({ error: "Not authenticated" }, { status: 401 });

    const { id } = await params;
    const recipeKey = decodeURIComponent(id);

    const doc = await SavedRecipe.findOneAndDelete({ userId: authUser.id, recipeKey });

    if (!doc)
      return Response.json({ success: false, error: "Recipe not found in saved" }, { status: 404 });

    return Response.json({ success: true });
  } catch (err) {
    console.error("[saved-recipes/:id DELETE]", err);
    return Response.json({ success: false, error: err.message }, { status: 500 });
  }
}
