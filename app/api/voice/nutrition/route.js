import { NextResponse } from "next/server";
import OpenAI from "openai";
import { getAuthUser } from "@/lib/getAuthUser";

export const runtime = "nodejs";
export const maxDuration = 30;

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const SYSTEM = `You parse spoken food and drink logs into JSON.

Return STRICT JSON:
{"foods":[{"name":string,"calories":number,"protein":number,"carbs":number,"fat":number}],"waterMl":number}

Rules:
- Estimate calories and macros (grams) from typical portions when the user
  doesn't give numbers. Be realistic, not generous.
- If the user states numbers explicitly, use those instead of estimating.
- Expand quantities: "two eggs" is one entry named "2 eggs" with doubled macros.
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

  const form = await req.formData();
  const audio = form.get("audio");
  if (!audio) {
    return NextResponse.json({ error: "audio field required" }, { status: 400 });
  }

  // 1) Transcribe
  const tr = await openai.audio.transcriptions.create({
    file: audio,
    model: "whisper-1",
  });
  const transcript = (tr.text || "").trim();

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
  const num = (v) => {
    const n = Number(v);
    return Number.isFinite(n) && n > 0 ? Math.round(n) : 0;
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
        }))
    : [];

  return NextResponse.json({
    transcript,
    foods,
    waterMl: Math.min(num(parsed.waterMl), 5000),
  });
}
