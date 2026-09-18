import mongoose, { Schema } from "mongoose";

/**
 * Core user document.
 *
 * Referral fields (v2.2.8):
 *   - `code` is this user's own permanent invite code (6 chars A-Z 0-9,
 *     unambiguous set — no O/0/I/1). Generated lazily by `/referrals/mine`
 *     the first time the user opens the Invite screen.
 *   - `refBalance` is how many CREDITED (not just pending) referrals they
 *     have. `useShowAds` on the client caches this via `/user-me` to know
 *     whether to hide banners.
 *   - `adsUntil` — if set, ads are hidden until this ISO date. If null,
 *     `refBalance >= 2` is the fallback trigger (ads-free forever after
 *     the two-friend milestone).
 */
const authSchema = new Schema({
  name: String,
  email: {
    type: String,
    unique: true,
    required: true,
  },
  photo: String,   // ← add this
  // Referral fields
  code:       { type: String, unique: true, sparse: true, index: true },
  refBalance: { type: Number, default: 0 },
  adsUntil:   { type: Date, default: null },
}, { timestamps: true });

export default mongoose.models.Auth || mongoose.model("Auth", authSchema);
