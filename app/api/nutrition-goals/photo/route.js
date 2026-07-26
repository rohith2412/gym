// app/api/nutrition-goals/photo/route.js
export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 30;

import OpenAI from "openai";
import { getAuthUser } from "@/lib/getAuthUser";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const SYSTEM = `You look at a photo of food and return its nutrition estimate.

Return STRICT JSON:
{"name": string, "calories": number, "protein": number, "carbs": number, "fat": number}

Rules:
- calories in kcal, protein/carbs/fat in grams (whole numbers).
- name is a short human dish label (e.g. "Grilled chicken with rice", "Cheeseburger and fries").
- Estimate the entire portion visible.
- If the photo has no identifiable food, return {"name":"","calories":0,"protein":0,"carbs":0,"fat":0}.
- Output JSON only, no prose.`;

// ─── POST /api/nutrition-goals/photo ─────────────────────────────────────────
// Multipart form-data with field `photo` (jpeg / png).
// Returns { name, calories, protein, carbs, fat } — an AI estimate of the meal.
export async function POST(req) {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser) return Response.json({ error: "Not authenticated" }, { status: 401 });

    const form = await req.formData();
    const photo = form.get("photo");
    if (!photo) return Response.json({ error: "photo field required" }, { status: 400 });

    // Convert uploaded file → data URL for the vision API
    const buf = Buffer.from(await photo.arrayBuffer());
    const mime = photo.type || "image/jpeg";
    const dataUrl = `data:${mime};base64,${buf.toString("base64")}`;

    const chat = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: SYSTEM },
        {
          role: "user",
          content: [
            { type: "text", text: "Estimate the nutrition for this meal." },
            { type: "image_url", image_url: { url: dataUrl } },
          ],
        },
      ],
    });

    let parsed = { name: "", calories: 0, protein: 0, carbs: 0, fat: 0 };
    try {
      parsed = JSON.parse(chat.choices?.[0]?.message?.content || "{}");
    } catch {}

    return Response.json({
      name: parsed.name || "",
      calories: Math.max(0, Math.round(parsed.calories || 0)),
      protein: Math.max(0, Math.round(parsed.protein || 0)),
      carbs: Math.max(0, Math.round(parsed.carbs || 0)),
      fat: Math.max(0, Math.round(parsed.fat || 0)),
    });
  } catch (err) {
    console.error("[nutrition-goals/photo POST]", err);
    return Response.json({ success: false, error: err.message }, { status: 500 });
  }
}