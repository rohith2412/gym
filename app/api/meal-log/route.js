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
      // UTC-safe: always parse as explicit UTC midnight → end-of-day
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
// Body: { image: "data:image/jpeg;base64,...", mealType, date? }
export async function POST(req) {
  try {
    await connectdb();
    const session = await getServerSession(authOptions);
    if (!session?.user?.id)
      return Response.json({ error: "Not authenticated" }, { status: 401 });

    const body = await req.json();
    const { image, mealType = "snack", date } = body;

    if (!image)
      return Response.json({ success: false, error: "image is required" }, { status: 400 });

    // Strip data URL prefix → raw base64
    const base64Data = image.includes(",") ? image.split(",")[1] : image;
    const mediaType  = image.startsWith("data:image/png") ? "image/png" : "image/jpeg";

    // ── GPT-4o Vision ─────────────────────────────────────────────────────────
    // response_format: json_object eliminates markdown fences + trailing commas
    const aiResponse = await openai.chat.completions.create({
      model:           "gpt-4o",
      max_tokens:      400,
      response_format: { type: "json_object" },
      messages: [
        {
          role:    "system",
          content: `Nutrition analyst. Analyse the food image. Return JSON only:
{
  "foods": [{ "name":"string","portion":"string","macros":{"calories":0,"protein":0,"carbs":0,"fat":0,"fiber":0},"confidence":0.0-1.0 }],
  "aiNotes":"max 100 chars summary or caveat"
}
Rules: macros in grams except calories (kcal), round to 1dp, confidence<0.7 if uncertain, return empty foods array if no food detected.`,
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

    // ── Parse - json_object mode means this rarely fails, but still guard ─────
    let parsed;
    try {
      parsed = JSON.parse(aiResponse.choices[0].message.content || "{}");
    } catch {
      return Response.json({ success: false, error: "AI returned invalid JSON" }, { status: 502 });
    }

    const foods = parsed.foods || [];

    // ── Save via create() - avoids .save() triggering any cached hooks ─────────
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

// ─── DELETE /api/meal-log?id=… ────────────────────────────────────────────────
export async function DELETE(req) {
  try {
    await connectdb();
    const session = await getServerSession(authOptions);
    if (!session?.user?.id)
      return Response.json({ error: "Not authenticated" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return Response.json({ error: "id required" }, { status: 400 });

    await MealLog.deleteOne({ _id: id, userId: session.user.id });
    return Response.json({ success: true });
  } catch (err) {
    console.error("[meal-log DELETE]", err);
    return Response.json({ success: false, error: err.message }, { status: 500 });
  }
}