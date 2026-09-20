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
    // Referral fields (v2.2.8) — mobile users authenticate via /api/auth/*
    // which all write to THIS collection, so the referral system reads and
    // writes here (not the older `Auth` collection).
    //   - `code`       — permanent 4-char invite code, generated lazily on
    //                    first /api/referrals/mine call
    //   - `refBalance` — credited referrals not yet consumed by a reward
    //   - `adsUntil`   — end of the current ad-free window, or null
    code:       { type: String, unique: true, sparse: true, index: true },
    refBalance: { type: Number, default: 0 },
    adsUntil:   { type: Date, default: null },
    // Growth analytics — where the user first heard about PocketGym.
    // Populated once during onboarding by /api/user-source; first-write wins
    // so the value stays tied to the moment of acquisition.
    acquisitionSource:   { type: String, default: null, index: true },
    acquisitionSourceAt: { type: Date, default: null },
  },
  { timestamps: true }
);

const CredentialAuth =
  mongoose.models.CredentialAuth ||
  mongoose.model("CredentialAuth", credentialAuthSchema);

export default CredentialAuth;
