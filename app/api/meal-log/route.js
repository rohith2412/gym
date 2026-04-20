export const dynamic = "force-dynamic";
// app/api/meal-log/route.js
import { connectdb }                 from "@/lib/connectdb";
import MealLog, { calculateTotals } from "@/models/mealLogModel";
import { ObjectId }                  from "mongodb";
import OpenAI                        from "openai";
import { getAuthUser }               from "@/lib/getAuthUser";

// When the app sends  ?local=true  we skip the MongoDB write entirely —
// the app persists the result in on-device SQLite instead.
// This eliminates the bulk of read/write DB cost for active users.
const SKIP_DB_WRITE = true; // flip to false to re-enable server-side storage

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// ─── GET /api/meal-log ────────────────────────────────────────────────────────
// App now reads from on-device SQLite — this endpoint is kept for
// backward compatibility but returns empty data when SKIP_DB_WRITE is on.
export async function GET(req) {
  if (SKIP_DB_WRITE) {
    return Response.json({ success: true, data: [] });
  }
  try {
    await connectdb();
    const authUser = await getAuthUser(req);
    if (!authUser)
      return Response.json({ error: "Not authenticated" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const dateParam = searchParams.get("date");
    const limit     = Math.min(parseInt(searchParams.get("limit") || "30"), 200);

    const query = { userId: authUser.id };

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
export async function POST(req) {
  try {
    // connectdb only needed when writing to MongoDB
    if (!SKIP_DB_WRITE) await connectdb();
    const authUser = await getAuthUser(req);
    if (!authUser)
      return Response.json({ error: "Not authenticated" }, { status: 401 });

    const body = await req.json();
    const { image, mealType = "snack", date, note = "", manualMacros } = body;

    // ── Manual macros path ────────────────────────────────────────────────────
    if (manualMacros && !image) {
      const macros = {
        calories: parseFloat(manualMacros.calories) || 0,
        protein:  parseFloat(manualMacros.protein)  || 0,
        carbs:    parseFloat(manualMacros.carbs)     || 0,
        fat:      parseFloat(manualMacros.fat)       || 0,
        fiber:    parseFloat(manualMacros.fiber)     || 0,
      };

      const foods = [{
        name:       note.trim() || "Manual entry",
        portion:    "custom",
        macros,
        confidence: 1,
      }];

      const doc = {
        _id:     `local_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        userId:  authUser.id,
        date:    date ? new Date(date) : new Date(),
        mealType,
        foods,
        totals:  macros,
        aiNotes: "Macros entered manually",
      };

      // Only write to MongoDB when local storage is disabled
      if (!SKIP_DB_WRITE) {
        const inserted = await MealLog.collection.insertOne(doc);
        doc._id = inserted.insertedId;
      }

      return Response.json({ success: true, data: doc });
    }

    // ── AI vision path ────────────────────────────────────────────────────────
    if (!image)
      return Response.json({ success: false, error: "image or manualMacros is required" }, { status: 400 });

    const base64Data = image.includes(",") ? image.split(",")[1] : image;
    const mediaType  = image.startsWith("data:image/png") ? "image/png" : "image/jpeg";

    const noteContext = note.trim()
      ? ` The user added this note about the meal: "${note.trim()}". Factor this into your analysis.`
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
  "aiNotes":"max 120 chars"
}
Rules: macros in grams except calories (kcal), round to 1 decimal, confidence<0.7 if uncertain, empty foods array if no food detected.`,
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

    let parsed;
    try {
      parsed = JSON.parse(aiResponse.choices[0].message.content || "{}");
    } catch {
      return Response.json({ success: false, error: "AI returned invalid JSON" }, { status: 502 });
    }

    const foods = parsed.foods || [];
    const doc = {
      _id:     `local_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      userId:  authUser.id,
      date:    date ? new Date(date) : new Date(),
      mealType,
      foods,
      totals:  calculateTotals(foods),
      aiNotes: parsed.aiNotes || "",
    };

    // Only write to MongoDB when local storage is disabled
    if (!SKIP_DB_WRITE) {
      const inserted = await MealLog.collection.insertOne(doc);
      doc._id = inserted.insertedId;
    }

    return Response.json({ success: true, data: doc });
  } catch (err) {
    console.error("[meal-log POST]", err);
    return Response.json({ success: false, error: err.message }, { status: 500 });
  }
}

// ─── PATCH /api/meal-log?id=… ─────────────────────────────────────────────────
// Edits are now handled locally in SQLite — no-op when SKIP_DB_WRITE is on.
export async function PATCH(req) {
  if (SKIP_DB_WRITE) return Response.json({ success: true });
  try {
    await connectdb();
    const authUser = await getAuthUser(req);
    if (!authUser)
      return Response.json({ error: "Not authenticated" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id)
      return Response.json({ error: "id required" }, { status: 400 });

    if (!ObjectId.isValid(id))
      return Response.json({ error: "Invalid id format" }, { status: 400 });

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

    const result = await MealLog.updateOne(
      { _id: new ObjectId(id), userId: authUser.id },
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
// Deletes are now handled locally in SQLite — no-op when SKIP_DB_WRITE is on.
export async function DELETE(req) {
  if (SKIP_DB_WRITE) return Response.json({ success: true });
  try {
    await connectdb();
    const authUser = await getAuthUser(req);
    if (!authUser)
      return Response.json({ error: "Not authenticated" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id)
      return Response.json({ error: "id required" }, { status: 400 });

    if (!ObjectId.isValid(id))
      return Response.json({ error: "Invalid id format" }, { status: 400 });

    await MealLog.deleteOne({ _id: new ObjectId(id), userId: authUser.id });
    return Response.json({ success: true });
  } catch (err) {
    console.error("[meal-log DELETE]", err);
    return Response.json({ success: false, error: err.message }, { status: 500 });
  }
}