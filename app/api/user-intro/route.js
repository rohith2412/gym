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

/**
 * PATCH — partial upsert. Used by the Nutrition onboarding sheet which
 * only asks for weight/height/age/goal and leaves the rest to be filled
 * in later from the Profile page. Fields left `undefined` are ignored;
 * defaults are only applied when creating a brand-new intro document.
 */
export async function PATCH(req) {
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
    const allowed = [
      "age",
      "height",
      "weight",
      "gender",
      "fitnessGoal",
      "experienceLevel",
      "workoutDaysPerWeek",
      "region",
    ];
    const $set = {};
    for (const k of allowed) {
      if (body[k] !== undefined && body[k] !== null) $set[k] = body[k];
    }
    if (Object.keys($set).length === 0) {
      return Response.json(
        { success: false, error: "No fields to update" },
        { status: 400 }
      );
    }

    // On first-ever insert, fill in the required fields with safe defaults
    // so schema validation passes even when the caller only sent a subset.
    const $setOnInsert = {
      userId: user.id,
      gender: "other",
      experienceLevel: "beginner",
      workoutDaysPerWeek: 3,
    };
    // Don't double-write keys that are already in $set.
    for (const k of Object.keys($set)) delete $setOnInsert[k];

    const [updated] = await Promise.all([
      userIntroModel.findOneAndUpdate(
        { userId: user.id },
        { $set, $setOnInsert },
        { upsert: true, new: true, runValidators: true }
      ),
      User.findByIdAndUpdate(user.id, { hasIntro: true }),
    ]);

    return Response.json({ success: true, data: updated });
  } catch (err) {
    console.error("PATCH User-Intro Error:", err);

    return Response.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}