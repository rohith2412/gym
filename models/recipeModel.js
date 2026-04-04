import mongoose from "mongoose";

const MacrosSchema = new mongoose.Schema({
  calories:    { type: Number, default: 0 },
  protein:     { type: Number, default: 0 },
  carbs:       { type: Number, default: 0 },
  fat:         { type: Number, default: 0 },
  fiber:       { type: Number, default: 0 },
  sugar:       { type: Number, default: 0 },
  sodium:      { type: Number, default: 0 }, // mg
  cholesterol: { type: Number, default: 0 }, // mg
}, { _id: false });

const IngredientSchema = new mongoose.Schema({
  item:   { type: String, required: true },
  amount: { type: String, required: true },
}, { _id: false });

const RecipeSchema = new mongoose.Schema({
  name:           { type: String, required: true },
  emoji:          { type: String, default: "🍽️" },
  goal:           { type: String, enum: ["muscle gain", "fat loss", "maintenance", "weight gain"], required: true },
  mealType:       { type: String, enum: ["breakfast", "lunch", "dinner", "snack", "smoothie"], required: true },
  difficulty:     { type: String, enum: ["Easy", "Medium", "Hard"], default: "Easy" },
  prepTime:       { type: Number, default: 10 },  // minutes
  cookTime:       { type: Number, default: 20 },  // minutes
  servings:       { type: Number, default: 1 },
  macros:         { type: MacrosSchema, default: () => ({}) },
  ingredients:    { type: [IngredientSchema], default: [] },
  steps:          { type: [String], default: [] },
  proteinSources: { type: [String], default: [] },
  tip:            { type: String, default: "" },
  // Advanced filter fields
  dietaryTags:    { type: [String], default: [] }, // ["keto","gluten-free","dairy-free","high-fiber","low-carb"]
  calorieRange:   { type: String, enum: ["under-300", "300-500", "500-700", "700+"], default: "300-500" },
  maxProtein:     { type: Number, default: 0 },   // g - for quick range queries
  totalTime:      { type: Number, default: 30 },  // prepTime + cookTime
  seeded:         { type: Boolean, default: false }, // true = from seed script
  aiGenerated:    { type: Boolean, default: true },
}, { timestamps: true });

// Compound indexes for fast filter queries
RecipeSchema.index({ goal: 1, mealType: 1 });
RecipeSchema.index({ goal: 1, mealType: 1, difficulty: 1 });
RecipeSchema.index({ goal: 1, mealType: 1, dietaryTags: 1 });
RecipeSchema.index({ goal: 1, mealType: 1, totalTime: 1 });
RecipeSchema.index({ goal: 1, mealType: 1, calorieRange: 1 });

export default mongoose.models.Recipe ||
  mongoose.model("Recipe", RecipeSchema);