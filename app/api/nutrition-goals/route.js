// app/api/nutrition-goals/route.js
export const dynamic = "force-dynamic";
import { connectdb }    from "@/lib/connectdb";
import UserIntro        from "@/models/userIntroModel";
import { getAuthUser }  from "@/lib/getAuthUser";

// ─── Mifflin-St Jeor BMR → TDEE → goal calories ──────────────────────────────
function calculateCalories(intro) {
  const { gender, age, height, weight, fitnessGoal, workoutDaysPerWeek } = intro;

  if (!age || !height || !weight) return null;

  // BMR
  let bmr;
  if (gender === "female") {
    bmr = 10 * weight + 6.25 * height - 5 * age - 161;
  } else {
    // male or other — use male formula as default
    bmr = 10 * weight + 6.25 * height - 5 * age + 5;
  }

  // Activity multiplier based on workout days
  const days = workoutDaysPerWeek || 3;
  let multiplier;
  if (days <= 1)      multiplier = 1.2;   // sedentary
  else if (days <= 3) multiplier = 1.375; // lightly active
  else if (days <= 5) multiplier = 1.55;  // moderately active
  else if (days <= 6) multiplier = 1.725; // very active
  else                multiplier = 1.9;   // extra active

  const tdee = Math.round(bmr * multiplier);

  // Adjust for goal
  let calories;
  if (fitnessGoal === "lose fat")    calories = Math.round(tdee * 0.8);  // -20% deficit
  else if (fitnessGoal === "gain muscle") calories = Math.round(tdee * 1.1); // +10% surplus
  else                                calories = tdee; // maintenance / strength

  // Macros (standard splits)
  // Protein: 2g per kg bodyweight
  // Fat: 25% of calories
  // Carbs: remainder
  const protein = Math.round(weight * 2);
  const fat     = Math.round((calories * 0.25) / 9);
  const carbs   = Math.round((calories - protein * 4 - fat * 9) / 4);
  const fiber   = Math.round(calories / 100); // ~14g per 1000kcal

  return { calories, protein, carbs, fat, fiber, tdee, bmr: Math.round(bmr) };
}

// ─── GET /api/nutrition-goals ─────────────────────────────────────────────────
export async function GET(req) {
  try {
    await connectdb();
    const authUser = await getAuthUser(req);
    if (!authUser) return Response.json({ error: "Not authenticated" }, { status: 401 });

    const intro = await UserIntro.findOne({ userId: authUser.id }).lean();
    if (!intro)  return Response.json({ error: "No intro found" }, { status: 404 });

    // Check if user has custom overrides stored
    const calculated = calculateCalories(intro);

    // Custom override stored on the intro doc (we'll add these fields)
    const goals = {
      calories: intro.customCalories ?? calculated?.calories ?? 2200,
      protein:  intro.customProtein  ?? calculated?.protein  ?? 160,
      carbs:    intro.customCarbs    ?? calculated?.carbs    ?? 250,
      fat:      intro.customFat      ?? calculated?.fat      ?? 70,
      fiber:    intro.customFiber    ?? calculated?.fiber    ?? 30,
    };

    return Response.json({
      success: true,
      data: {
        goals,
        calculated,           // the auto-calculated values (for display reference)
        hasCustom: !!(intro.customCalories), // whether user has overridden
        intro: {
          gender: intro.gender,
          age: intro.age,
          height: intro.height,
          weight: intro.weight,
          fitnessGoal: intro.fitnessGoal,
          workoutDaysPerWeek: intro.workoutDaysPerWeek,
        },
      },
    });
  } catch (err) {
    console.error("[nutrition-goals GET]", err);
    return Response.json({ success: false, error: err.message }, { status: 500 });
  }
}

// ─── PATCH /api/nutrition-goals ───────────────────────────────────────────────
// User can override any or all macro targets
export async function PATCH(req) {
  try {
    await connectdb();
    const authUser = await getAuthUser(req);
    if (!authUser) return Response.json({ error: "Not authenticated" }, { status: 401 });

    const body = await req.json();
    const { calories, protein, carbs, fat, fiber } = body;

    const $set = {};
    if (calories !== undefined) $set.customCalories = Math.max(500,  Math.round(Number(calories)));
    if (protein  !== undefined) $set.customProtein  = Math.max(10,   Math.round(Number(protein)));
    if (carbs    !== undefined) $set.customCarbs    = Math.max(0,    Math.round(Number(carbs)));
    if (fat      !== undefined) $set.customFat      = Math.max(5,    Math.round(Number(fat)));
    if (fiber    !== undefined) $set.customFiber    = Math.max(0,    Math.round(Number(fiber)));

    if (Object.keys($set).length === 0)
      return Response.json({ error: "Nothing to update" }, { status: 400 });

    await UserIntro.updateOne({ userId: authUser.id }, { $set });

    return Response.json({ success: true, updated: $set });
  } catch (err) {
    console.error("[nutrition-goals PATCH]", err);
    return Response.json({ success: false, error: err.message }, { status: 500 });
  }
}

// ─── DELETE /api/nutrition-goals ──────────────────────────────────────────────
// Reset to auto-calculated
export async function DELETE(req) {
  try {
    await connectdb();
    const authUser = await getAuthUser(req);
    if (!authUser) return Response.json({ error: "Not authenticated" }, { status: 401 });

    await UserIntro.updateOne(
      { userId: authUser.id },
      { $unset: { customCalories: "", customProtein: "", customCarbs: "", customFat: "", customFiber: "" } }
    );

    return Response.json({ success: true });
  } catch (err) {
    console.error("[nutrition-goals DELETE]", err);
    return Response.json({ success: false, error: err.message }, { status: 500 });
  }
}