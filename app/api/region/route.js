// Save the user's country region (ISO 3166-1 alpha-2, e.g. "US", "GB", "IN")
// picked during the region intro. Stored on the userIntro doc — upserts.
//   POST /api/region  { code: "US" }
//   GET  /api/region  → { code }

export const dynamic = "force-dynamic";

import { connectdb } from "@/lib/connectdb";
import { getAuthUser } from "@/lib/getAuthUser";
import userIntro from "@/models/userIntroModel";

function normalizeCode(input) {
  if (typeof input !== "string") return null;
  const c = input.trim().toUpperCase();
  if (!c) return null;
  if (c === "OTHER") return c;
  return /^[A-Z]{2,3}$/.test(c) ? c : null;
}

export async function GET(req) {
  try {
    await connectdb();
    const user = await getAuthUser(req);
    if (!user) {
      return Response.json({ success: false, error: "Not authenticated" }, { status: 401 });
    }
    const doc = await userIntro.findOne({ userId: user.id }).select("region").lean();
    return Response.json({ success: true, code: doc?.region ?? null });
  } catch (err) {
    console.error("REGION GET ERROR:", err);
    return Response.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await connectdb();
    const user = await getAuthUser(req);
    if (!user) {
      return Response.json({ success: false, error: "Not authenticated" }, { status: 401 });
    }

    const body = await req.json().catch(() => null);
    const code = normalizeCode(body?.code);
    if (!code) {
      return Response.json({ success: false, error: "Invalid region code" }, { status: 400 });
    }

    const doc = await userIntro.findOneAndUpdate(
      { userId: user.id },
      { userId: user.id, region: code },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    ).select("region");

    return Response.json({ success: true, code: doc.region });
  } catch (err) {
    console.error("REGION POST ERROR:", err);
    return Response.json({ success: false, error: err.message }, { status: 500 });
  }
}
