// app/api/user-intro/route.js
// Replace your entire existing file with this - adds GET alongside the POST

import { connectdb } from "@/lib/connectdb";
import userIntroModel from "@/models/userIntroModel";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// GET /api/user-intro - fetch the current user's intro data
export async function GET() {
  try {
    await connectdb();

    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return Response.json({ error: "Not authenticated" }, { status: 401 });
    }

    const intro = await userIntroModel.findOne({ userId: session.user.id });

    return Response.json({ success: true, data: intro ?? null });
  } catch (error) {
    console.error(error);
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST /api/user-intro - create or update the current user's intro data
export async function POST(req) {
  try {
    await connectdb();

    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return Response.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = await req.json();

    const intro = await userIntroModel.findOneAndUpdate(
      { userId: session.user.id },
      { ...body, userId: session.user.id },
      { upsert: true, new: true },
    );

    return Response.json({ success: true, data: intro });
  } catch (error) {
    console.error(error);
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}