import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { generateObjectId } from "@/lib/arscape-utils";

/** Vercel/serverless has a read-only filesystem — cannot write to public/ */
export function isReadOnlyServerless(): boolean {
  return process.env.VERCEL === "1" || !!process.env.AWS_LAMBDA_FUNCTION_NAME;
}

async function cacheToPublicUploads(
  remoteUrl: string,
  prefix: string,
  ext: "glb" | "usdz" | "gltf",
): Promise<string> {
  const res = await fetch(remoteUrl, { redirect: "follow" });
  if (!res.ok) {
    throw new Error(`Failed to download ${ext} (${res.status})`);
  }

  const id = generateObjectId();
  const filename = `${prefix}-${id}.${ext}`;
  const uploadDir = path.join(process.cwd(), "public", "uploads", "arscape");
  await mkdir(uploadDir, { recursive: true });

  const buffer = Buffer.from(await res.arrayBuffer());
  await writeFile(path.join(uploadDir, filename), buffer);

  return `/uploads/arscape/${filename}`;
}

/**
 * Returns a URL suitable for model-viewer.
 * On serverless: uses Sketchfab/CDN signed URL directly (no local disk).
 * Locally: caches under public/uploads/arscape for stable paths.
 */
export async function resolveModelDownloadUrl(
  remoteUrl: string,
  prefix: string,
  ext: "glb" | "usdz" | "gltf",
): Promise<string> {
  if (isReadOnlyServerless()) {
    return remoteUrl;
  }

  try {
    return await cacheToPublicUploads(remoteUrl, prefix, ext);
  } catch (err) {
    console.warn(`Local model cache failed, using remote URL:`, err);
    return remoteUrl;
  }
}
