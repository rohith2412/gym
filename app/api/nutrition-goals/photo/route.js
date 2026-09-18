// app/api/nutrition-goals/photo/route.js
export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 30;

import OpenAI from "openai";
import { getAuthUser } from "@/lib/getAuthUser";
import { guardAiLimit, recordAiUsage } from "@/lib/aiRateLimit";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/**
 * v2.2.8: extended the response schema from four macros to a full nutrient
 * panel (Tier-1 essentials + Tier-2 micronutrients). Client-side the values
 * flow into the Nutrient Breakdown card and daily-goal bars.
 *
 * Units — kcal: calories · grams: protein, carbs, fat, fiber, sugar, satFat ·
 * milligrams: sodium, cholesterol, calcium, potassium, iron, vitaminC ·
 * micrograms: vitaminA (RAE), vitaminD, vitaminB12, folate (DFE).
 */
const SYSTEM = `You look at a photo of food and return its full nutrition estimate.

Return STRICT JSON with EVERY field, no omissions:
{
  "name": string,
  "calories": number, "protein": number, "carbs": number, "fat": number,
  "fiber": number, "sugar": number, "sodium": number, "satFat": number, "cholesterol": number,
  "vitaminA": number, "vitaminC": number, "vitaminD": number, "vitaminB12": number, "folate": number,
  "iron": number, "calcium": number, "potassium": number
}

Units:
- calories: kcal
- protein, carbs, fat, fiber, sugar, satFat: grams
- sodium, cholesterol, calcium, potassium, iron, vitaminC: milligrams
- vitaminA (RAE), vitaminD, vitaminB12, folate (DFE): micrograms

Rules:
- name is a short human dish label (e.g. "Grilled chicken with rice", "Cheeseburger and fries").
- Estimate the entire portion visible. Base values on standard USDA nutrition data for the food and portion size you see.
- Round grams to 1 decimal, round milligrams/micrograms/kcal to whole numbers.
- If the photo has no identifiable food, return every numeric field as 0 and name as "".
- Output JSON only, no prose.`;

// ─── POST /api/nutrition-goals/photo ─────────────────────────────────────────
// Multipart form-data with field `photo` (jpeg / png).
// Returns the full nutrient panel — an AI estimate of the meal.
export async function POST(req) {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser) return Response.json({ error: "Not authenticated" }, { status: 401 });

    const limited = await guardAiLimit(authUser.id, "photo");
    if (limited) return limited;

    const form = await req.formData();
    const photo = form.get("photo");
    if (!photo) return Response.json({ error: "photo field required" }, { status: 400 });
    if (photo.size && photo.size > 10 * 1024 * 1024) {
      await recordAiUsage(authUser.id, "photo");
    return Response.json({ error: "Image too large (max 10 MB)" }, { status: 413 });
    }

    // Convert uploaded file → data URL for the vision API
    const buf = Buffer.from(await photo.arrayBuffer());
    const mime = photo.type || "image/jpeg";
    const dataUrl = `data:${mime};base64,${buf.toString("base64")}`;

    const chat = await openai.chat.completions.create({
      // Bumped to gpt-4o (from mini) — mini often skipped nutrient fields.
      // Cost delta is ~4x per call but call volume is low (one per meal photo).
      model: "gpt-4o",
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: SYSTEM },
        {
          role: "user",
          content: [
            { type: "text", text: "Estimate the full nutrition panel for this meal." },
            { type: "image_url", image_url: { url: dataUrl } },
          ],
        },
      ],
    });

    let raw = {};
    try {
      raw = JSON.parse(chat.choices?.[0]?.message?.content || "{}");
    } catch {}

    // Fields the client expects, in one place — kept in sync with mealLogModel's
    // NUTRIENT_KEYS. Sanitize each: coerce, floor at 0, whole-number the
    // integers, one-decimal the grams.
    const gramKeys = new Set(["protein", "carbs", "fat", "fiber", "sugar", "satFat"]);
    const KEYS = [
      "calories", "protein", "carbs", "fat", "fiber",
      "sugar", "sodium", "satFat", "cholesterol",
      "vitaminA", "vitaminC", "vitaminD", "vitaminB12", "folate",
      "iron", "calcium", "potassium",
    ];
    const out = { name: raw.name || "" };
    for (const k of KEYS) {
      const n = Math.max(0, Number(raw[k]) || 0);
      out[k] = gramKeys.has(k) ? Math.round(n * 10) / 10 : Math.round(n);
    }
    return Response.json(out);
  } catch (err) {
    console.error("[nutrition-goals/photo POST]", err);
    return Response.json({ success: false, error: err.message }, { status: 500 });
  }
}
