export const dynamic = "force-dynamic";

import { connectdb } from "@/lib/connectdb";
import userIntroModel from "@/models/userIntroModel";
import jwt from "jsonwebtoken";
import User from "@/models/credentialAuthModel";

function getUserFromRequest(req) {
  const auth = req.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) return null;

  try {
    return jwt.verify(auth.slice(7), process.env.JWT_SECRET);
  } catch {
    return null;
  }
}

// ✅ GET (FIXED)
export async function GET(req) {
  try {
    await connectdb();

    const user = getUserFromRequest(req);
    if (!user) {
      return Response.json(
        { success: false, error: "Not authenticated" },
        { status: 401 }
      );
    }

    const intro = await userIntroModel.findOne({ userId: user.id });

    return Response.json({
      success: true,
      exists: !!intro,
      data: intro ?? null,
    });
  } catch (error) {
    return Response.json(
      { success: false,
        error: error.message },
      { status: 500 }
    );
  }
}

// POST stays same logic
export async function POST(req) {
  try {
    await connectdb();

    const user = getUserFromRequest(req);
    if (!user) {
      return Response.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = await req.json();

    // Save to userIntroModel (so GET can find it)
    await userIntroModel.findOneAndUpdate(
      { userId: user.id },
      { userId: user.id, ...body },
      { upsert: true, new: true }
    );

    // Optionally still flag the user record
    await User.findByIdAndUpdate(user.id, { hasIntro: true });

    return Response.json({ success: true });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}