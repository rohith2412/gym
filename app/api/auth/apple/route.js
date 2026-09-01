export const dynamic = "force-dynamic";

import { connectdb } from "@/lib/connectdb";
import CredentialAuth from "@/models/credentialAuthModel";
import userIntroModel from "@/models/userIntroModel";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { createRemoteJWKSet, jwtVerify } from "jose";

// Apple publishes the public keys its identity tokens are signed with. jose
// caches and refreshes this for us, so it isn't fetched on every sign-in.
const APPLE_JWKS = createRemoteJWKSet(
  new URL("https://appleid.apple.com/auth/keys")
);

// The token's audience is our bundle id — the same app that asked for it.
const BUNDLE_ID = process.env.APPLE_BUNDLE_ID || "com.rohith.com.yourpocketgym";

export async function POST(req) {
  try {
    await connectdb();

    // `fullName` only ever arrives on the very first authorization; Apple never
    // puts a name in the token and never sends it again. If we don't capture it
    // now the user is permanently nameless, so it comes from the client.
    const { identityToken, fullName } = await req.json();

    if (!identityToken) {
      return Response.json({ error: "Missing identityToken" }, { status: 400 });
    }

    let payload;
    try {
      const verified = await jwtVerify(identityToken, APPLE_JWKS, {
        issuer: "https://appleid.apple.com",
        audience: BUNDLE_ID,
      });
      payload = verified.payload;
    } catch {
      return Response.json({ error: "Invalid Apple token" }, { status: 401 });
    }

    const appleUserId = payload.sub;
    if (!appleUserId) {
      return Response.json({ error: "Apple token has no subject" }, { status: 401 });
    }

    // With "Hide My Email" this is a @privaterelay.appleid.com address, which is
    // a real, deliverable address — we just must not assume it identifies the
    // human anywhere else.
    const email = payload.email || null;

    // Identity is the Apple subject, not the email. Look that up first.
    let user = await CredentialAuth.findOne({ appleUserId });

    if (!user && email) {
      // Someone who already signed up with Google or a password, now using
      // Apple with the same address: link it rather than making a second
      // account they can't see their data in.
      user = await CredentialAuth.findOne({ email });
      if (user) {
        user.appleUserId = appleUserId;
        await user.save();
      }
    }

    if (!user) {
      const name =
        (fullName && String(fullName).trim()) ||
        (email ? email.split("@")[0] : "PocketGym user");

      // Apple users have no password; a random hash satisfies the schema
      // without ever being a usable credential.
      const randomPassword = await bcrypt.hash(
        `apple:${appleUserId}:${Date.now()}`,
        10
      );

      user = await CredentialAuth.create({
        name,
        // No email means Hide My Email withheld it on a repeat authorization;
        // a stable placeholder keeps the required+unique index satisfied.
        email: email || `${appleUserId}@appleid.local`,
        password: randomPassword,
        appleUserId,
      });
    } else if (fullName && !user.name) {
      user.name = String(fullName).trim();
      await user.save();
    }

    const token = jwt.sign(
      { id: user._id, email: user.email, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: "30d" }
    );

    const introData = await userIntroModel.findOne({
      userId: user._id.toString(),
    });

    return Response.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        hasIntro: !!introData,
      },
    });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
