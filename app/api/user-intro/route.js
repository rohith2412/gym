export const dynamic = "force-dynamic";
// app/api/user-intro/route.js

import { connectdb } from "@/lib/connectdb";
import userIntroModel from "@/models/userIntroModel";
import jwt from "jsonwebtoken";
import User from "@/models/credentialAuthModel";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

async function getUserFromRequest(req) {
  // Mobile: Bearer JWT signed with JWT_SECRET
  const auth = req.headers.get("authorization");

  if (auth?.startsWith("Bearer ")) {
    const rawToken = auth.slice(7);

    if (!rawToken || rawToken === "null" || rawToken === "undefined") {
      return null;
    }

    try {
      const decoded = jwt.verify(rawToken, process.env.JWT_SECRET);
      return { id: decoded.id.toString() };
    } catch {
      return null;
    }
  }

  // Web: NextAuth session
  const session = await getServerSession(authOptions);

  if (session?.user?.id) {
    return { id: session.user.id };
  }

  return null;
}

export async function GET(req) {
  try {
    await connectdb();
    const user = await getUserFromRequest(req);
    
    console.log("=== USER-INTRO DEBUG ===");
    console.log("user from request:", user);
    
    if (!user?.id)
      return Response.json({ success: false, error: "Unauthorized" }, { status: 401 });

    const intro = await userIntroModel.findOne({ userId: user.id }).lean();
    
    console.log("searching for userId:", user.id);
    console.log("intro found:", intro ? "YES" : "NO");
    
    // ✅ Also search without the id to see what's actually in the DB
    const allIntros = await userIntroModel.find({}).select("userId").lean();
    console.log("all userIds in DB:", allIntros.map(i => i.userId));

    return Response.json({
      success: true,
      exists:  !!intro,
      data:    intro || null,
    });
  } catch (error) {
    console.error("GET User-Intro Error:", error);
    return Response.json({ success: false, error: "Server error" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await connectdb();

    const user = await getUserFromRequest(req);

    if (!user?.id) {
      return Response.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();

    const {
      age,
      height,
      weight,
      gender,
      fitnessGoal,
      experienceLevel,
      workoutDaysPerWeek,
    } = body;

    if (
      age == null ||
      height == null ||
      weight == null ||
      !gender ||
      !fitnessGoal ||
      !experienceLevel ||
      workoutDaysPerWeek == null
    ) {
      return Response.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    const [updatedIntro] = await Promise.all([
      userIntroModel.findOneAndUpdate(
        { userId: user.id },
        { ...body, userId: user.id },
        { upsert: true, new: true, runValidators: true }
      ),
      User.findByIdAndUpdate(user.id, { hasIntro: true }),
    ]);

    return Response.json({
      success: true,
      data: updatedIntro,
    });

  } catch (err) {
    console.error("POST User-Intro Error:", err);

    return Response.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}