export const dynamic = "force-dynamic"

// app/api/recipes/route.js

import { connectdb } from "@/lib/connectdb";
import Recipe        from "@/models/recipeModel";
import OpenAI        from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

function calcCalorieRange(cal) {
  if (cal < 300) return "under-300";
  if (cal < 500) return "300-500";
  if (cal < 700) return "500-700";
  return "700+";
}

// ─── GET /api/recipes - browse library ───────────────────────────────────────
export async function GET(req) {
  try {
    await connectdb();
    const { searchParams } = new URL(req.url);

    const query = {};
    const goal      = searchParams.get("goal");
    const mealType  = searchParams.get("mealType");
    const page      = Math.max(parseInt(searchParams.get("page")  || "1"),  1);
    const limit     = Math.min(parseInt(searchParams.get("limit") || "12"), 50);

    if (goal)     query.goal     = goal;
    if (mealType) query.mealType = mealType;

    const [recipes, total] = await Promise.all([
      Recipe.find(query)
        .sort({ "macros.protein": -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Recipe.countDocuments(query),
    ]);

    return Response.json({ success: true, data: recipes, total, page, pages: Math.ceil(total / limit) });
  } catch (err) {
    console.error("[recipes GET]", err);
    return Response.json({ success: false, error: err.message }, { status: 500 });
  }
}

// ─── POST /api/recipes - ingredient-based match or AI generate ────────────────
// Body: {
//   ingredients: string[],   // e.g. ["chicken", "eggs", "spinach"]
//   goal?: string,
//   mealType?: string,
//   forceNew?: boolean
// }
export async function POST(req) {
  try {
    await connectdb();
    const { ingredients = [], goal, mealType, forceNew } = await req.json();

    if (!ingredients.length) {
      return Response.json({ success: false, error: "Add at least one ingredient" }, { status: 400 });
    }

    // ── Try DB first ──────────────────────────────────────────────────────────
    // Match recipes whose ingredient list contains ALL (or most) of the user's items
    if (!forceNew) {
      const dbQuery = {};
      if (goal)     dbQuery.goal     = goal;
      if (mealType) dbQuery.mealType = mealType;

      // Find recipes where ingredient names overlap with user's list
      // Use regex OR match across ingredients array
      const regexes = ingredients.map((i) => new RegExp(i.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i"));
      dbQuery["ingredients.item"] = { $in: regexes };

      // Score by how many ingredients match - get top 20 candidates then score
      const candidates = await Recipe.find(dbQuery).limit(50).lean();

      if (candidates.length > 0) {
        // Score each recipe by ingredient overlap
        const scored = candidates.map((recipe) => {
          const recipeIngredients = recipe.ingredients.map((i) => i.item.toLowerCase());
          const matches = ingredients.filter((userIng) =>
            recipeIngredients.some((ri) => ri.includes(userIng.toLowerCase()) || userIng.toLowerCase().includes(ri.split(" ")[0]))
          );
          return { recipe, score: matches.length };
        });

        // Sort by score descending, pick best match
        scored.sort((a, b) => b.score - a.score);
        const best = scored[0];

        if (best.score > 0) {
          // Pick randomly from top matches to add variety
          const topTier = scored.filter((s) => s.score === best.score);
          const pick = topTier[Math.floor(Math.random() * topTier.length)];
          return Response.json({ success: true, data: pick.recipe, source: "db", matchScore: pick.score });
        }
      }
    }

    // ── No DB match → call AI ─────────────────────────────────────────────────
    const goalMacros = {
      "muscle gain": "high protein 40g+, moderate carbs, moderate fats",
      "fat loss":    "high protein 35g+, low calories under 500 kcal, low carbs",
      "maintenance": "balanced macros, protein 30g+",
      "weight gain": "high calories 600-900 kcal, high protein 40g+, high carbs",
    }[goal] || "high protein, balanced macros";

    const prompt = `You are a professional chef and sports nutritionist.
The user has these ingredients available: ${ingredients.join(", ")}.
Create 1 high-protein recipe using PRIMARILY these ingredients (you can add basic pantry staples like oil, salt, garlic, onion, spices).
${goal ? `Goal: ${goal}. Macro target: ${goalMacros}.` : ""}
${mealType ? `Meal type: ${mealType}.` : ""}

Return ONLY valid JSON:
{
  "name": "string",
  "emoji": "single food emoji",
  "goal": "${goal || "maintenance"}",
  "mealType": "${mealType || "lunch"}",
  "prepTime": number,
  "cookTime": number,
  "servings": number,
  "difficulty": "Easy" | "Medium" | "Hard",
  "macros": {
    "calories": number, "protein": number, "carbs": number,
    "fat": number, "fiber": number, "sugar": number,
    "sodium": number, "cholesterol": number
  },
  "ingredients": [{ "item": "string", "amount": "string" }],
  "steps": ["string"],
  "proteinSources": ["string"],
  "tip": "string"
}`;

    const aiRes = await openai.chat.completions.create({
      model:           "gpt-4o",
      max_tokens:      900,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: "Expert chef. Return only valid JSON." },
        { role: "user",   content: prompt },
      ],
    });

    const data      = JSON.parse(aiRes.choices[0].message.content || "{}");
    const totalTime = (data.prepTime || 0) + (data.cookTime || 0);

    // Save to DB for future cache hits
    await Recipe.collection.insertOne({
      ...data,
      goal:         data.goal     || goal     || "maintenance",
      mealType:     data.mealType || mealType || "lunch",
      difficulty:   data.difficulty || "Medium",
      dietaryTags:  [],
      calorieRange: calcCalorieRange(data.macros?.calories || 0),
      maxProtein:   data.macros?.protein || 0,
      totalTime,
      seeded:       false,
      aiGenerated:  true,
      createdAt:    new Date(),
      updatedAt:    new Date(),
    });

    return Response.json({ success: true, data, source: "ai" });
  } catch (err) {
    console.error("[recipes POST]", err);
    return Response.json({ success: false, error: err.message }, { status: 500 });
  }
}