import { NextResponse } from "next/server";
import OpenAI from "openai";
import { getAuthUser } from "@/lib/getAuthUser";

export const runtime = "nodejs";
export const maxDuration = 30;

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const SYSTEM = `You are Coach — a warm, expert fitness trainer inside the PocketGym app.
- Answer concisely (2-4 short paragraphs max, or a tight bullet list).
- Weights are in pounds (lb) by default.
- Give practical, evidence-based advice on training, form, nutrition, and recovery.
- If the user asks for a plan, use headers and simple bullet lists.
- Never diagnose medical conditions; suggest seeing a doctor when relevant.`;

export async function POST(req) {
  const user = await getAuthUser(req);
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }

  const messages = Array.isArray(body?.messages) ? body.messages : [];
  if (messages.length === 0) {
    return NextResponse.json({ error: "messages required" }, { status: 400 });
  }

  // Cap history so token cost stays bounded
  const trimmed = messages.slice(-20);

  const chat = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "system", content: SYSTEM }, ...trimmed],
  });

  const reply = chat.choices?.[0]?.message?.content?.trim() ?? "";
  return NextResponse.json({ reply });
}