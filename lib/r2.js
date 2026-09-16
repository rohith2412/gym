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

const {
  R2_ACCOUNT_ID,
  R2_ACCESS_KEY_ID,
  R2_SECRET_ACCESS_KEY,
  R2_BUCKET,
  R2_PUBLIC_URL,
} = process.env;

function requireEnv(name, value) {
  if (!value) throw new Error(`Missing env: ${name}`);
  return value;
}

const s3 = new S3Client({
  region: "auto",
  endpoint: `https://${requireEnv("R2_ACCOUNT_ID", R2_ACCOUNT_ID)}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: requireEnv("R2_ACCESS_KEY_ID", R2_ACCESS_KEY_ID),
    secretAccessKey: requireEnv("R2_SECRET_ACCESS_KEY", R2_SECRET_ACCESS_KEY),
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
  const bucket = requireEnv("R2_BUCKET", R2_BUCKET);
  const publicBase = requireEnv("R2_PUBLIC_URL", R2_PUBLIC_URL).replace(/\/$/, "");
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
