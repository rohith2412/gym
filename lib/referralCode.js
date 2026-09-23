import CredentialAuth from "@/models/credentialAuthModel";

/**
 * Generate a 4-char referral code from an unambiguous alphabet — no 0/O,
 * no 1/I/L. Users read these off a share sheet and type them manually, so
 * every character has to survive a squint. 4 chars from the 31-char
 * alphabet = ~923k unique codes — enough runway to comfortably reach 50k
 * users before we'd need to bump the length.
 */
const ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789"; // 31 chars

export function makeRandomCode(len = 4) {
  let out = "";
  for (let i = 0; i < len; i++) {
    out += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
  }
  return out;
}

/**
 * Return the user's permanent code, generating one the first time it's
 * asked for. Retries on the (astronomically unlikely) collision.
 *
 * Codespace = 31^6 ≈ 887M — enough headroom that we can burn a few tries.
 */
export async function ensureCode(userId) {
  const existing = await CredentialAuth.findById(userId).select("code").lean();
  if (existing?.code) return existing.code;

  for (let attempt = 0; attempt < 8; attempt++) {
    const candidate = makeRandomCode();
    // Try to claim it — unique index makes this atomic.
    try {
      await CredentialAuth.updateOne(
        { _id: userId, code: { $exists: false } },
        { $set: { code: candidate } },
      );
      // Read back — if someone else claimed our code between the update and
      // the read, the second updateOne is a no-op and we loop.
      const now = await CredentialAuth.findById(userId).select("code").lean();
      if (now?.code === candidate) return candidate;
      if (now?.code) return now.code; // Someone raced us; use the winner.
    } catch (err) {
      // Duplicate key = the code we picked already exists on another user.
      if (err?.code !== 11000) throw err;
    }
  }
  throw new Error("Could not allocate a unique referral code");
}

/** Normalize user input — uppercase, strip whitespace + hyphens. */
export function normalizeCode(raw) {
  return String(raw || "")
    .toUpperCase()
    .replace(/[\s\-_]/g, "");
}
