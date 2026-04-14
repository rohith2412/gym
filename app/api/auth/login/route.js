export const dynamic = "force-dynamic";

import { connectdb } from "@/lib/connectdb";
import CredentialAuth from "@/models/credentialAuthModel";
import userIntroModel from "@/models/userIntroModel";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export async function POST(req) {
  try {
    await connectdb();
    const { email, password } = await req.json();

    if (!email || !password)
      return Response.json({ error: "All fields required" }, { status: 400 });

    const user = await CredentialAuth.findOne({ email });
    if (!user)
      return Response.json({ error: "Invalid email or password" }, { status: 401 });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return Response.json({ error: "Invalid email or password" }, { status: 401 });

    const token = jwt.sign(
      { id: user._id, email: user.email, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: "30d" }
    );

    

    // Check if user has completed the intro — same logic as Google auth
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