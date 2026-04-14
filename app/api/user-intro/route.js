export const dynamic = "force-dynamic"

// app/api/user-intro/route.js
import { connectdb } from "@/lib/connectdb";
import userIntroModel from "@/models/userIntroModel";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import jwt from "jsonwebtoken";
// your user model here
import User from "@/models/credentialAuthModel";


function getUserFromRequest(req) {
  const auth = req.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) return null;
  try { return jwt.verify(auth.slice(7), process.env.JWT_SECRET); }
  catch { return null; }
}

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
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await connectdb();
    const user = getUserFromRequest(req);
    if (!user) return Response.json({ error: "Not authenticated" }, { status: 401 });

    const body = await req.json();
    await User.findByIdAndUpdate(user.id, { ...body, hasIntro: true });
    return Response.json({ success: true });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}