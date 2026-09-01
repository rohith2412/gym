import mongoose from "mongoose";

const credentialAuthSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    // Apple's stable subject id. Required because "Hide My Email" hands us a
    // per-app relay address that we must not treat as the user's identity —
    // matching on email alone would create a second account if Apple ever
    // rotates it. `sparse` so the unique index ignores the many users without
    // one (Google and password sign-ups).
    appleUserId: { type: String, unique: true, sparse: true, index: true },
  },
  { timestamps: true }
);

const CredentialAuth =
  mongoose.models.CredentialAuth ||
  mongoose.model("CredentialAuth", credentialAuthSchema);

export default CredentialAuth;
