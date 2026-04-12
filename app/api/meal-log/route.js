// app/api/meal-log/route.js
import { connectdb }        from "@/lib/connectdb";
import MealLog, { calculateTotals } from "@/models/mealLogModel";
import { getServerSession } from "next-auth";
import { authOptions }      from "@/app/api/auth/[...nextauth]/route";
import OpenAI               from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// ─── GET /api/meal-log ────────────────────────────────────────────────────────
// ?date=YYYY-MM-DD  → logs for that day (UTC-safe)
// ?limit=N          → most recent N logs (default 30)
export async function GET(req) {
  try {
    await connectdb();
    const session = await getServerSession(authOptions);
    if (!session?.user?.id)
      return Response.json({ error: "Not authenticated" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const dateParam = searchParams.get("date");
    const limit     = Math.min(parseInt(searchParams.get("limit") || "30"), 200);

    const query = { userId: session.user.id };

    if (dateParam) {
      const start = new Date(`${dateParam}T00:00:00.000Z`);
      const end   = new Date(`${dateParam}T23:59:59.999Z`);
      query.date  = { $gte: start, $lte: end };
    }

    const logs = await MealLog.find(query)
      .sort({ date: -1 })
      .limit(limit)
      .lean();

    return Response.json({ success: true, data: logs });
  } catch (err) {
    console.error("[meal-log GET]", err);
    return Response.json({ success: false, error: err.message }, { status: 500 });
  }
}

// ─── POST /api/meal-log ───────────────────────────────────────────────────────
// Body: { image?, mealType, date?, note?, manualMacros? }
// • image + optional note  → AI vision analysis (note appended to prompt)
// • manualMacros (no image) → skip AI, save directly
export async function POST(req) {
  try {
    await connectdb();
    const session = await getServerSession(authOptions);
    if (!session?.user?.id)
      return Response.json({ error: "Not authenticated" }, { status: 401 });

    const body = await req.json();
    const { image, mealType = "snack", date, note = "", manualMacros } = body;

    // ── Manual macros path — no AI call needed ────────────────────────────────
    if (manualMacros && !image) {
      const macros = {
        calories: parseFloat(manualMacros.calories) || 0,
        protein:  parseFloat(manualMacros.protein)  || 0,
        carbs:    parseFloat(manualMacros.carbs)     || 0,
        fat:      parseFloat(manualMacros.fat)       || 0,
        fiber:    parseFloat(manualMacros.fiber)     || 0,
      };

      // If user added a note, use it as the food name; otherwise generic
      const foods = [{
        name:       note.trim() || "Manual entry",
        portion:    "custom",
        macros,
        confidence: 1,
      }];

      const doc = {
        userId:   session.user.id,
        date:     date ? new Date(date) : new Date(),
        mealType,
        foods,
        totals:   macros,
        aiNotes:  "Macros entered manually",
      };

      const inserted = await MealLog.collection.insertOne(doc);
      doc._id = inserted.insertedId;
      return Response.json({ success: true, data: doc });
    }

    // ── AI vision path ────────────────────────────────────────────────────────
    if (!image)
      return Response.json({ success: false, error: "image or manualMacros is required" }, { status: 400 });

    const base64Data = image.includes(",") ? image.split(",")[1] : image;
    const mediaType  = image.startsWith("data:image/png") ? "image/png" : "image/jpeg";

    // Build system prompt — inject user note if present
    const noteContext = note.trim()
      ? ` The user added this note about the meal: "${note.trim()}". Factor this into your analysis (e.g. extra toppings, large portions, specific brands).`
      : "";

    const aiResponse = await openai.chat.completions.create({
      model:           "gpt-4o",
      max_tokens:      500,
      response_format: { type: "json_object" },
      messages: [
        {
          role:    "system",
          content: `Nutrition analyst. Analyse the food image.${noteContext} Return JSON only:
{
  "foods": [{ "name":"string","portion":"string","macros":{"calories":0,"protein":0,"carbs":0,"fat":0,"fiber":0},"confidence":0.0-1.0 }],
  "aiNotes":"max 120 chars — brief summary or caveat, mention user note if it changed your estimate"
}
Rules: macros in grams except calories (kcal), round to 1 decimal place, set confidence<0.7 if uncertain, return empty foods array if no food detected.`,
        },
        {
          role: "user",
          content: [
            { type: "image_url", image_url: { url: `data:${mediaType};base64,${base64Data}` } },
            { type: "text", text: "Analyse this meal." },
          ],
        },
      ],
    });

    // ── Parse AI response ─────────────────────────────────────────────────────
    let parsed;
    try {
      parsed = JSON.parse(aiResponse.choices[0].message.content || "{}");
    } catch {
      return Response.json({ success: false, error: "AI returned invalid JSON" }, { status: 502 });
    }

    const foods = parsed.foods || [];

    const doc = {
      userId:   session.user.id,
      date:     date ? new Date(date) : new Date(),
      mealType,
      foods,
      totals:   calculateTotals(foods),
      aiNotes:  parsed.aiNotes || "",
    };

    const mealLog = await MealLog.collection.insertOne(doc);
    doc._id = mealLog.insertedId;

    return Response.json({ success: true, data: doc });
  } catch (err) {
    console.error("[meal-log POST]", err);
    return Response.json({ success: false, error: err.message }, { status: 500 });
  }
}

// ─── PATCH /api/meal-log?id=… ─────────────────────────────────────────────────
// Body: { totals?: MacrosObject, foods?: FoodItem[] }
// Allows the user to correct AI-detected macros or food items after analysis.
export async function PATCH(req) {
  try {
    await connectdb();
    const session = await getServerSession(authOptions);
    if (!session?.user?.id)
      return Response.json({ error: "Not authenticated" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id)
      return Response.json({ error: "id required" }, { status: 400 });

    const body = await req.json();

    // Build $set payload — only update fields that were sent
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
      // If foods are updated but totals weren't explicitly sent, recalculate
      if (!body.totals) {
        $set.totals = calculateTotals(body.foods);
      }
    }
    if (body.aiNotes !== undefined) {
      $set.aiNotes = body.aiNotes;
    }

    if (Object.keys($set).length === 0)
      return Response.json({ error: "Nothing to update" }, { status: 400 });

    const result = await MealLog.updateOne(
      { _id: id, userId: session.user.id }, // userId guard prevents cross-user edits
      { $set }
    );

    if (result.matchedCount === 0)
      return Response.json({ error: "Log not found or not yours" }, { status: 404 });

    return Response.json({ success: true, updated: $set });
  } catch (err) {
    console.error("[meal-log PATCH]", err);
    return Response.json({ success: false, error: err.message }, { status: 500 });
  }
}

// ─── DELETE /api/meal-log?id=… ────────────────────────────────────────────────
export async function DELETE(req) {
  try {
    await connectdb();
    const session = await getServerSession(authOptions);
    if (!session?.user?.id)
      return Response.json({ error: "Not authenticated" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id)
      return Response.json({ error: "id required" }, { status: 400 });

    await MealLog.deleteOne({ _id: id, userId: session.user.id });
    return Response.json({ success: true });
  } catch (err) {
    console.error("[meal-log DELETE]", err);
    return Response.json({ success: false, error: err.message }, { status: 500 });
  }
}