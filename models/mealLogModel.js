import mongoose from "mongoose";

const MacrosSchema = new mongoose.Schema(
  {
    calories: { type: Number, default: 0 },
    protein:  { type: Number, default: 0 },
    carbs:    { type: Number, default: 0 },
    fat:      { type: Number, default: 0 },
    fiber:    { type: Number, default: 0 },
  },
  { _id: false },
);

const FoodItemSchema = new mongoose.Schema(
  {
    name:       { type: String, required: true },
    portion:    { type: String, default: "" },
    macros:     { type: MacrosSchema, default: () => ({}) },
    confidence: { type: Number, default: 1 },
  },
  { _id: false },
);

const MealLogSchema = new mongoose.Schema(
  {
    userId:   { type: String, required: true },
    date:     { type: Date, required: true, default: Date.now },
    mealType: {
      type:    String,
      enum:    ["breakfast", "lunch", "dinner", "snack"],
      default: "snack",
    },
    imageUrl: { type: String, default: null },
    foods:    { type: [FoodItemSchema], default: [] },
    totals:   { type: MacrosSchema, default: () => ({}) },
    aiNotes:  { type: String, default: "" },
  },
  { timestamps: true },
);

// Compound index for fast per-user date queries
MealLogSchema.index({ userId: 1, date: -1 });

// ── Reusable totals calculator (used in API route too) ────────────────────────
export function calculateTotals(foods = []) {
  return foods.reduce(
    (t, f) => {
      t.calories += f.macros?.calories || 0;
      t.protein  += f.macros?.protein  || 0;
      t.carbs    += f.macros?.carbs    || 0;
      t.fat      += f.macros?.fat      || 0;
      t.fiber    += f.macros?.fiber    || 0;
      return t;
    },
    { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 },
  );
}

export default mongoose.models.MealLog ||
  mongoose.model("MealLog", MealLogSchema);