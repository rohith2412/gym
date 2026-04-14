export const dynamic = "force-dynamic";

import { connectdb } from "@/lib/connectdb";
import userIntroModel from "@/models/userIntroModel";
import jwt from "jsonwebtoken";
import User from "@/models/credentialAuthModel";

function getUserFromRequest(req) {
  const auth = req.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) return null;

  try {
    // Note: Ensure your JWT payload actually uses 'id'. 
    // If using MongoDB's default, it might be 'sub' or '_id'.
    return jwt.verify(auth.slice(7), process.env.JWT_SECRET);
  } catch {
    return null;
  }
}

export async function GET(req) {
  try {
    await connectdb();
    const user = getUserFromRequest(req);
    
    if (!user) {
      return Response.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const intro = await userIntroModel.findOne({ userId: user.id });

    return Response.json({
      success: true,
      exists: !!intro,
      data: intro || null,
    });
  } catch (error) {
    return Response.json({ success: false, error: "Server error" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await connectdb();
    const user = getUserFromRequest(req);
    
    if (!user) {
      return Response.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    // 1. Basic Validation: Ensure we aren't saving empty data
    if (!body.weight || !body.height) {
      return Response.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }

    // 2. Atomic Update: Update/Create the Intro and update the User flag
    // We use Promise.all to run these concurrently for better performance
    const [updatedIntro] = await Promise.all([
      userIntroModel.findOneAndUpdate(
        { userId: user.id },
        { ...body, userId: user.id }, // Spread body last to ensure userId isn't overwritten
        { upsert: true, new: true, runValidators: true }
      ),
      User.findByIdAndUpdate(user.id, { hasIntro: true })
    ]);

    return Response.json({ 
      success: true, 
      data: updatedIntro 
    });

  } catch (err) {
    console.error("POST User-Intro Error:", err);
    return Response.json({ success: false, error: err.message }, { status: 500 });
  }
}