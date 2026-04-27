// models/savedRecipeModel.js
import mongoose from "mongoose";

const savedRecipeSchema = new mongoose.Schema({
  userId:    { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  recipeKey: { type: String, required: true },   // recipe._id or recipe.name
  recipe:    { type: Object, required: true },   // full recipe object stored as-is
  savedAt:   { type: Date, default: Date.now },
});

// One user can't save the same recipe twice
savedRecipeSchema.index({ userId: 1, recipeKey: 1 }, { unique: true });

export default mongoose.models.SavedRecipe || mongoose.model("SavedRecipe", savedRecipeSchema);
