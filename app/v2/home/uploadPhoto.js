/**
 * Web port of gym-ios/src/lib/r2Upload.ts's uploadImageToR2 -- same
 * two-step presign flow, same /api/uploads/presign contract, just a
 * direct browser `fetch` PUT instead of expo-file-system's
 * uploadAsync. R2's presigned URL is designed for direct client PUTs
 * from anywhere, so nothing on the backend needed to change for this
 * to work from the browser too.
 */
export async function uploadFoodPhoto(file) {
  const ext = (file.type?.split("/")[1] || "jpg").toLowerCase();
  const normalizedExt = ext === "jpeg" ? "jpg" : ext;

  const presignRes = await fetch("/api/uploads/presign", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ kind: "food", ext: normalizedExt }),
  });
  const presignJson = await presignRes.json();
  if (!presignRes.ok || !presignJson.success) {
    throw new Error(presignJson.error || "Couldn't get upload URL");
  }
  const { uploadUrl, publicUrl } = presignJson.data;

  const putRes = await fetch(uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": file.type || "image/jpeg" },
    body: file,
  });
  if (!putRes.ok) {
    throw new Error(`R2 upload failed (${putRes.status})`);
  }

  return publicUrl;
}
