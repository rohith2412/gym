export const dynamic = "force-dynamic";
// app/api/user-intro/get/route.js
import { connectdb }        from "@/lib/connectdb";
import userIntroModel       from "@/models/userIntroModel";
import { getServerSession } from "next-auth";
import { authOptions }      from "@/app/api/auth/[...nextauth]/route";
import jwt                  from "jsonwebtoken";

async function getUserFromRequest(req) {
  const auth = req.headers.get("authorization");
  if (auth?.startsWith("Bearer ")) {
    const raw = auth.slice(7);
    if (!raw || raw === "null" || raw === "undefined") return null;
    try {
      const decoded = jwt.verify(raw, process.env.JWT_SECRET);
      return { id: decoded.id.toString() };
    } catch { return null; }
  }
  const session = await getServerSession(authOptions);
  if (session?.user?.id) return { id: session.user.id };
  return null;
}

export async function GET(req) {
  try {
    await connectdb();
    const user = await getUserFromRequest(req);
    if (!user?.id)
      return Response.json({ error: "Not authenticated" }, { status: 401 });

    const intro = await userIntroModel.findOne({ userId: user.id });
    return Response.json({ success: true, data: intro || null });
  } catch (err) {
    console.error("[user-intro/get]", err);
    return Response.json({ success: false, error: err.message }, { status: 500 });
  }
}