import { NextResponse } from "next/server";
import OpenAI from "openai";
import { getAuthUser } from "@/lib/getAuthUser";
import { guardAiLimit, recordAiUsage } from "@/lib/aiRateLimit";

export const runtime = "nodejs";
export const maxDuration = 30;

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const SYSTEM = `You parse spoken food and drink logs into JSON.

Return STRICT JSON — every food entry MUST include every nutrient field:
{
  "foods":[{
    "name":string,
    "calories":number,"protein":number,"carbs":number,"fat":number,
    "fiber":number,"sugar":number,"sodium":number,"satFat":number,"cholesterol":number,
    "vitaminA":number,"vitaminC":number,"vitaminD":number,"vitaminB12":number,"folate":number,
    "iron":number,"calcium":number,"potassium":number
  }],
  "waterMl":number
}

Units:
- calories: kcal
- protein, carbs, fat, fiber, sugar, satFat: grams
- sodium, cholesterol, calcium, potassium, iron, vitaminC: milligrams
- vitaminA (RAE), vitaminD, vitaminB12, folate (DFE): micrograms

Rules:
- Estimate every nutrient from typical USDA values for the food and portion.
  Be realistic, not generous. If a field really doesn't apply, return 0.
- If the user states numbers explicitly, use those instead of estimating.
- Expand quantities: "two eggs" is one entry named "2 eggs" with doubled values.
- name should be short and human, e.g. "Grilled chicken salad".
- waterMl is the TOTAL water mentioned, converted to millilitres.
  Common conversions: 1 glass = 250, 1 cup = 240, 1 bottle = 500,
  1 litre = 1000, 1 fl oz = 30.
- Only count actual water toward waterMl. Coffee, tea, juice, soda and shakes
  are foods, not water — put them in foods with their calories.
- If no water was mentioned, waterMl is 0.
- If no food was mentioned, foods is [].
- Output JSON only, no prose.`;

export async function POST(req) {
  const user = await getAuthUser(req);
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const limited = await guardAiLimit(user.id, "voice");
  if (limited) return limited;

  const form = await req.formData();
  const audio = form.get("audio");
  if (!audio) {
    return NextResponse.json({ error: "audio field required" }, { status: 400 });
  }
  if (audio.size && audio.size > 2 * 1024 * 1024) {
    return NextResponse.json(
      { error: "Recording too long (max ~60s)" },
      { status: 413 }
    );
  }

  // 1) Transcribe
  const tr = await openai.audio.transcriptions.create({
    file: audio,
    model: "whisper-1",
  });
  const transcript = (tr.text || "").trim();

  await recordAiUsage(user.id, "voice");

  if (!transcript) {
    return NextResponse.json({ transcript: "", foods: [], waterMl: 0 });
  }

  // 2) Parse into foods + water
  const chat = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: SYSTEM },
      { role: "user", content: transcript },
    ],
  });

  let parsed = { foods: [], waterMl: 0 };
  try {
    parsed = JSON.parse(chat.choices?.[0]?.message?.content || "{}");
  } catch {
    parsed = { foods: [], waterMl: 0 };
  }

  // Coerce defensively — the model occasionally returns strings or nulls.
  // Whole-number nutrients use `num`; nutrients typically measured in grams
  // (and often <10) use `num1` which keeps one decimal so tiny values (e.g.
  // 0.4g fiber in a coffee) don't get rounded to 0.
  const num = (v) => {
    const n = Number(v);
    return Number.isFinite(n) && n > 0 ? Math.round(n) : 0;
  };
  const num1 = (v) => {
    const n = Number(v);
    return Number.isFinite(n) && n > 0 ? Math.round(n * 10) / 10 : 0;
  };
  const foods = Array.isArray(parsed.foods)
    ? parsed.foods
        .filter((f) => f && typeof f.name === "string" && f.name.trim())
        .map((f) => ({
          name: String(f.name).trim().slice(0, 80),
          calories: num(f.calories),
          protein: num(f.protein),
          carbs: num(f.carbs),
          fat: num(f.fat),
          fiber: num1(f.fiber),
          sugar: num1(f.sugar),
          sodium: num(f.sodium),
          satFat: num1(f.satFat),
          cholesterol: num(f.cholesterol),
          vitaminA: num(f.vitaminA),
          vitaminC: num(f.vitaminC),
          vitaminD: num1(f.vitaminD),
          vitaminB12: num1(f.vitaminB12),
          folate: num(f.folate),
          iron: num1(f.iron),
          calcium: num(f.calcium),
          potassium: num(f.potassium),
        }))
    : [];

  return NextResponse.json({
    transcript,
    foods,
    waterMl: Math.min(num(parsed.waterMl), 5000),
  });
}
