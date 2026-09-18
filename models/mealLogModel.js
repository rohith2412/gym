import mongoose from "mongoose";

/**
 * Nutrition schema. Historically we tracked only the four macros + fiber.
 * v2.2.8 expands this to cover Tier-1 essential nutrients (sugar, sodium,
 * saturated fat, cholesterol) plus Tier-2 micronutrients (vitamins + minerals
 * with the highest deficiency prevalence). All new fields default to 0 so
 * older documents stay valid — reads never crash on a missing key.
 *
 * Units:
 *   - calories: kcal
 *   - protein, carbs, fat, fiber, sugar, satFat: grams
 *   - sodium, potassium, calcium: milligrams
 *   - cholesterol: milligrams
 *   - iron: milligrams
 *   - vitaminA: micrograms RAE
 *   - vitaminC: milligrams
 *   - vitaminD: micrograms
 *   - vitaminB12: micrograms
 *   - folate: micrograms DFE
 */
const MacrosSchema = new mongoose.Schema(
  {
    // Existing macros — untouched
    calories:    { type: Number, default: 0 },
    protein:     { type: Number, default: 0 },
    carbs:       { type: Number, default: 0 },
    fat:         { type: Number, default: 0 },
    fiber:       { type: Number, default: 0 },
    // Tier-1 essential nutrients
    sugar:       { type: Number, default: 0 },
    sodium:      { type: Number, default: 0 },
    satFat:      { type: Number, default: 0 },
    cholesterol: { type: Number, default: 0 },
    // Tier-2 micronutrients
    vitaminA:    { type: Number, default: 0 },
    vitaminC:    { type: Number, default: 0 },
    vitaminD:    { type: Number, default: 0 },
    vitaminB12:  { type: Number, default: 0 },
    folate:      { type: Number, default: 0 },
    iron:        { type: Number, default: 0 },
    calcium:     { type: Number, default: 0 },
    potassium:   { type: Number, default: 0 },
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

/**
 * All nutrient keys in one place. Used by `calculateTotals` and by the
 * meal-log route when it needs to coerce a payload — keeps the two files
 * in sync without duplicating a hand-typed list.
 */
export const NUTRIENT_KEYS = [
  "calories", "protein", "carbs", "fat", "fiber",
  "sugar", "sodium", "satFat", "cholesterol",
  "vitaminA", "vitaminC", "vitaminD", "vitaminB12", "folate",
  "iron", "calcium", "potassium",
];

// ── Reusable totals calculator (used in API route too) ────────────────────────
export function calculateTotals(foods = []) {
  const acc = Object.fromEntries(NUTRIENT_KEYS.map((k) => [k, 0]));
  for (const f of foods) {
    for (const k of NUTRIENT_KEYS) {
      acc[k] += Number(f.macros?.[k]) || 0;
    }
  }
  return acc;
}

export default mongoose.models.MealLog ||
  mongoose.model("MealLog", MealLogSchema);
