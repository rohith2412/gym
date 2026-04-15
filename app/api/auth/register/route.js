export const dynamic = "force-dynamic";

import { connectdb } from "@/lib/connectdb";
import CredentialAuth from "@/models/credentialAuthModel";
import userIntroModel from "@/models/userIntroModel";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
// Add these two imports back
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route"; // adjust path to your NextAuth file

export async function POST(req) {
  try {
    await connectdb();
    const { name, email, password } = await req.json();

    if (!name || !email || !password)
      return Response.json({ error: "All fields required" }, { status: 400 });

    const existing = await CredentialAuth.findOne({ email });
    if (existing)
      return Response.json({ error: "Email already registered" }, { status: 400 });

    const hashed = await bcrypt.hash(password, 10);
    const user = await CredentialAuth.create({ name, email, password: hashed });

    const token = jwt.sign(
      { id: user._id, email: user.email, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: "30d" }
    );


    
    // New users never have an intro yet — but we check anyway for consistency
    const introData = await userIntroModel.findOne({ userId: user._id.toString() });
    const hasIntro = !!introData;

    return Response.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        hasIntro,
      },
    });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}