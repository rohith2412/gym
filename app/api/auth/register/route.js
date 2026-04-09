import { connectdb } from "@/lib/connectdb";
import CredentialAuth from "@/models/credentialAuthModel";
import bcrypt from "bcryptjs";

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
    await CredentialAuth.create({ name, email, password: hashed });

    return Response.json({ success: true });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}