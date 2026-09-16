export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { getAuthUser } from "@/lib/getAuthUser";
import { presignUploadUrl, scoped } from "@/lib/r2";

/**
 * POST /api/uploads/presign
 *
 * Body: { kind: "food" | "profile", ext?: "jpg" | "png" | "webp" }
 *
 * Returns a short-lived presigned R2 URL the client PUTs the image bytes
 * to. The client persists `publicUrl` on the food entry / user photo
 * field. Backend never touches the image bytes.
 *
 * Food photos live under `scanned-food-image/<userId>/`, profile photos
 * under `profile-photos/<userId>/` — each user's uploads stay
 * cleanly namespaced.
 */
export async function POST(req) {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser)
      return Response.json({ error: "Not authenticated" }, { status: 401 });

    const body = await req.json();
    const kind = body?.kind;
    const ext = (body?.ext || "jpg").replace(/[^a-z0-9]/gi, "").toLowerCase();

    if (kind !== "food" && kind !== "profile") {
      return Response.json(
        { success: false, error: "kind must be 'food' or 'profile'" },
        { status: 400 },
      );
    }
    if (!["jpg", "jpeg", "png", "webp", "heic"].includes(ext)) {
      return Response.json(
        { success: false, error: "unsupported extension" },
        { status: 400 },
      );
    }

    const prefix = kind === "food" ? "scanned-food-image" : "profile-photos";
    const key = scoped(prefix, String(authUser.id), ext);

    const contentType =
      ext === "png"
        ? "image/png"
        : ext === "webp"
        ? "image/webp"
        : ext === "heic"
        ? "image/heic"
        : "image/jpeg";

    const signed = await presignUploadUrl(key, contentType);
    return Response.json({
      success: true,
      data: signed, // { uploadUrl, publicUrl, key }
    });
  } catch (err) {
    console.error("[uploads/presign POST]", err);
    return Response.json(
      { success: false, error: err.message },
      { status: 500 },
    );
  }
}
