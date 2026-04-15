// lib/getAuthUser.js
// Works for both NextAuth (web) and JWT Bearer (React Native)

import { getServerSession } from "next-auth";
import { authOptions }      from "@/app/api/auth/[...nextauth]/route";
import jwt                  from "jsonwebtoken";

export async function getAuthUser(req) {
  // 1. Try JWT Bearer token first (React Native)
  const authHeader = req.headers.get("authorization") || req.headers.get("Authorization");
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.slice(7);
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      // decoded has { id, email, name } — matches what your login route signs
      return { id: decoded.id, email: decoded.email, name: decoded.name };
    } catch (err) {
      // Invalid/expired token — fall through to NextAuth check
    }
  }

  // 2. Fall back to NextAuth session (web)
  const session = await getServerSession(authOptions);
  if (session?.user?.id) {
    return { id: session.user.id, email: session.user.email, name: session.user.name };
  }

  return null; // Not authenticated
}