import { NextResponse } from "next/server";
import OpenAI from "openai";

export const runtime = "nodejs";
export const maxDuration = 30;

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const MUSCLE_GROUPS = ["Chest", "Back", "Shoulders", "Arms", "Legs", "Core"];

const SYSTEM = `You parse gym voice logs into JSON.

Return STRICT JSON:
{"exercises":[{"name":string,"muscleGroup":string,"sets":[{"reps":number,"weight":number}]}]}

Rules:
- Weight is in lb (a number, no units in output).
- If the user says "three sets of 5 at 225", expand to 3 identical set objects.
- Map exercise to standard names (e.g. "bench" -> "Bench Press").
- muscleGroup must be one of: ${MUSCLE_GROUPS.join(", ")}.
- If nothing parseable, return {"exercises":[]}.
- Output JSON only, no prose.`;

export async function POST(req) {
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
    return NextResponse.json({ transcript: "", exercises: [] });
  }

  // 2) Parse into sets
  const chat = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: SYSTEM },
      { role: "user", content: transcript },
    ],
  });

  let parsed = { exercises: [] };
  try {
    parsed = JSON.parse(chat.choices?.[0]?.message?.content || "{}");
  } catch {
    parsed = { exercises: [] };
  }

  return NextResponse.json({ transcript, exercises: parsed.exercises || [] });
}