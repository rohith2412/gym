// Cloudflare R2 client + presigned URL helper.
//
// Reads credentials from env vars — see README for setup. Uses the S3
// SDK because R2 is S3-compatible.
//
// One helper: presignUploadUrl(key, contentType) → { uploadUrl, publicUrl }.
// The client PUTs the raw image bytes to `uploadUrl` with a matching
// Content-Type header, then keeps `publicUrl` on the record.

import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// Reads the S3_* env vars that are already set in Vercel for the shared
// storage bucket. If you ever split this app onto its own bucket, swap the
// prefix here — nothing else in the codebase needs to change.
const {
  S3_ENDPOINT,
  S3_REGION,
  S3_ACCESS_KEY_ID,
  S3_SECRET_ACCESS_KEY,
  S3_BUCKET,
  S3_PUBLIC_URL,
} = process.env;

function requireEnv(name, value) {
  if (!value) throw new Error(`Missing env: ${name}`);
  return value;
}

const s3 = new S3Client({
  region: S3_REGION || "auto",
  endpoint: requireEnv("S3_ENDPOINT", S3_ENDPOINT),
  credentials: {
    accessKeyId: requireEnv("S3_ACCESS_KEY_ID", S3_ACCESS_KEY_ID),
    secretAccessKey: requireEnv("S3_SECRET_ACCESS_KEY", S3_SECRET_ACCESS_KEY),
  },
});

/**
 * Build an object key for the given namespace.
 *   scoped("scanned-food-image", userId, "jpg") →
 *     "scanned-food-image/<userId>/<epoch>-<rand>.jpg"
 */
export function scoped(prefix, userId, ext = "jpg") {
  const rand = Math.random().toString(36).slice(2, 8);
  return `${prefix}/${userId}/${Date.now()}-${rand}.${ext}`;
}

/**
 * Ask R2 for a 5-minute presigned PUT URL. Returns both the upload URL
 * (private, expires) and the public URL the client should persist.
 */
export async function presignUploadUrl(key, contentType) {
  const bucket = requireEnv("S3_BUCKET", S3_BUCKET);
  const publicBase = requireEnv("S3_PUBLIC_URL", S3_PUBLIC_URL).replace(/\/$/, "");
  const cmd = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    ContentType: contentType,
  });
  const uploadUrl = await getSignedUrl(s3, cmd, { expiresIn: 300 });
  return {
    uploadUrl,
    publicUrl: `${publicBase}/${key}`,
    key,
  };
}
