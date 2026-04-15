export const dynamic = "force-dynamic";

import { connectdb } from "@/lib/connectdb";
import userIntroModel from "@/models/userIntroModel";
import jwt from "jsonwebtoken";
import User from "@/models/credentialAuthModel";
import { getServerSession } from "next-auth";
// Add these two imports back// adjust path to your NextAuth file
import { authOptions }      from "@/app/api/auth/[...nextauth]/route";

async function getUserFromRequest(req) {
  // Mobile: Bearer JWT signed with JWT_SECRET
  const auth = req.headers.get("authorization");
  if (auth?.startsWith("Bearer ")) {
    try {
      const decoded = jwt.verify(auth.slice(7), process.env.JWT_SECRET);
      return { id: decoded.id.toString() };
    } catch {
      return null;
    }
  }

  // Web: NextAuth session cookie signed with NEXTAUTH_SECRET
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

    if (!user?.id) {
      return Response.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const intro = await userIntroModel.findOne({ userId: user.id });

    return Response.json({
      success: true,
      exists: !!intro,
      data: intro || null,
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
      return Response.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    // Validate all required fields
    const { age, height, weight, gender, fitnessGoal, experienceLevel, workoutDaysPerWeek } = body;

    if (!age || !height || !weight || !gender || !fitnessGoal || !experienceLevel || !workoutDaysPerWeek) {
      return Response.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }

    const [updatedIntro] = await Promise.all([
      userIntroModel.findOneAndUpdate(
        { userId: user.id },
        { ...body, userId: user.id },
        { upsert: true, new: true, runValidators: true }
      ),
      User.findByIdAndUpdate(user.id, { hasIntro: true }),
    ]);

    return Response.json({ success: true, data: updatedIntro });
  } catch (err) {
    console.error("POST User-Intro Error:", err);
    return Response.json({ success: false, error: err.message }, { status: 500 });
  }
}