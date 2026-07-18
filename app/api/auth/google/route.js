export const dynamic = "force-dynamic";

import { connectdb } from "@/lib/connectdb";
import CredentialAuth from "@/models/credentialAuthModel";
import userIntroModel from "@/models/userIntroModel";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";

// Client IDs allowed as the token audience. iOS client is required;
// add a Web client id here too once you create one in Google Cloud.
const ALLOWED_AUDIENCES = [
  "387235327844-liqf9v0o9o6hid6195l0t9qq00png4jc.apps.googleusercontent.com",
  process.env.GOOGLE_WEB_CLIENT_ID,
].filter(Boolean);

const client = new OAuth2Client();

// handleGoogleLogin
export async function POST(req) {
  try {
    await connectdb();

    const { idToken } = await req.json();

    if (!idToken) {
      return Response.json({ error: "Missing idToken" }, { status: 400 });
    }

    // Verify the Google-issued token server-side.
    let payload;
    try {
      const ticket = await client.verifyIdToken({
        idToken,
        audience: ALLOWED_AUDIENCES,
      });
      payload = ticket.getPayload();
    } catch {
      return Response.json({ error: "Invalid Google token" }, { status: 401 });
    }

    if (!payload?.email || !payload.email_verified) {
      return Response.json(
        { error: "Google account email not verified" },
        { status: 401 }
      );
    }

    const email = payload.email;
    const name = payload.name || email.split("@")[0];

    // Find-or-create the user by email.
    let user = await CredentialAuth.findOne({ email });

    if (!user) {
      // Google users have no password; store a random hash to satisfy the schema.
      const randomPassword = await bcrypt.hash(
        `google:${payload.sub}:${Date.now()}`,
        10
      );
      user = await CredentialAuth.create({
        name,
        email,
        password: randomPassword,
      });
    }

    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        name: user.name,
      },
      process.env.JWT_SECRET,
      { expiresIn: "30d" }
    );

    const introData = await userIntroModel.findOne({
      userId: user._id.toString(),
    });

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
