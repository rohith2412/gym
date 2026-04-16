export const dynamic = "force-dynamic";
//app/api/ai-trainer/route.js
import { connectdb }    from "@/lib/connectdb";
import userIntroModel   from "@/models/userIntroModel";
import { getAuthUser }  from "@/lib/getAuthUser";
import OpenAI           from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

function buildUserContext(intro, extra = {}) {
  const parts = [];
  if (intro) {
    if (intro.age)                parts.push(`Age: ${intro.age}`);
    if (intro.gender)             parts.push(`Gender: ${intro.gender}`);
    if (intro.weight)             parts.push(`Weight: ${intro.weight}kg`);
    if (intro.height)             parts.push(`Height: ${intro.height}cm`);
    if (intro.fitnessGoal)        parts.push(`Primary goal: ${intro.fitnessGoal}`);
    if (intro.experienceLevel)    parts.push(`Experience: ${intro.experienceLevel}`);
    if (intro.workoutDaysPerWeek) parts.push(`Available days/week: ${intro.workoutDaysPerWeek}`);
  }
  if (extra.injuries)      parts.push(`Injuries/limitations: ${extra.injuries}`);
  if (extra.equipment)     parts.push(`Equipment: ${extra.equipment}`);
  if (extra.focusAreas)    parts.push(`Focus areas: ${extra.focusAreas}`);
  if (extra.sessionLength) parts.push(`Session length preference: ${extra.sessionLength} minutes`);
  return parts.join("\n");
}

export async function POST(req) {
  try {
    await connectdb();

    const authUser = await getAuthUser(req);
    if (!authUser)
      return Response.json({ error: "Not authenticated" }, { status: 401 });

    const body = await req.json();
    const { type, extra = {}, messages = [] } = body;

    const intro  = await userIntroModel.findOne({ userId: authUser.id }).lean();
    const userCtx = buildUserContext(intro, extra);

    if (type === "plan") {
      const { planType = "weekly", focus } = body;
      const prompt = `You are an elite personal trainer and strength & conditioning coach.
Generate a detailed, personalised ${planType} workout plan for this athlete:

${userCtx}
${focus ? `Special focus: ${focus}` : ""}

Return ONLY valid JSON:
{
  "planTitle": "string",
  "planSummary": "string (2-3 sentences explaining the plan strategy)",
  "weeklyVolume": "string (e.g. '4 days / ~45 min per session')",
  "difficulty": "Beginner" | "Intermediate" | "Advanced",
  "days": [
    {
      "day": "Monday",
      "label": "string",
      "focus": "string",
      "restDay": false,
      "warmup": "string",
      "exercises": [
        {
          "name": "string",
          "muscleGroup": "string",
          "sets": number,
          "reps": "string",
          "rest": "string",
          "tempo": "string",
          "notes": "string"
        }
      ],
      "cooldown": "string",
      "estimatedTime": number
    }
  ],
  "progressionTips": ["string"],
  "nutritionTips": ["string"],
  "weeklyGoals": ["string"]
}

Rules:
- Include all 7 days (rest days have restDay: true and no exercises)
- Scale intensity to experience level
- Include warm-up and cooldown every training day
- 4-6 exercises per training day`;

      const res  = await openai.chat.completions.create({
        model:           "gpt-4o",
        max_tokens:      2500,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: "Elite personal trainer. Return only valid JSON." },
          { role: "user",   content: prompt },
        ],
      });

      const plan = JSON.parse(res.choices[0].message.content || "{}");
      return Response.json({ success: true, data: plan });
    }

    if (type === "chat") {
      const systemPrompt = `You are an elite AI personal trainer with expertise in strength training, nutrition, recovery and sports science.

Your athlete's profile:
${userCtx || "Profile not provided - ask the user for details if needed."}

Personality: Direct, motivating, evidence-based. Give specific actionable advice. Keep responses concise - 2-4 short paragraphs max. Use line breaks for readability. Do NOT use markdown headers or ** symbols.`;

      const res = await openai.chat.completions.create({
        model:      "gpt-4o",
        max_tokens: 600,
        messages: [
          { role: "system", content: systemPrompt },
          ...messages.map((m) => ({ role: m.role, content: m.content })),
        ],
      });

      return Response.json({ success: true, data: { reply: res.choices[0].message.content || "" } });
    }

    return Response.json({ success: false, error: "Invalid type" }, { status: 400 });
  } catch (err) {
    console.error("[ai-trainer]", err);
    return Response.json({ success: false, error: err.message }, { status: 500 });
  }
}