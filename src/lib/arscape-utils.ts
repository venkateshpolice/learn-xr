import crypto from "crypto";
import type { IARScape } from "@/models/ARScape";
import type { ARScapeScene } from "@/types/arscape";

export function generateSlug(): string {
  return crypto.randomBytes(6).toString("base64url").slice(0, 10).toLowerCase();
}

export function generateObjectId(): string {
  return crypto.randomBytes(8).toString("hex");
}

export function toARScapeScene(doc: IARScape): ARScapeScene {
  return {
    id: doc._id.toString(),
    teacherId: doc.teacherId,
    title: doc.title,
    description: doc.description,
    objects: doc.objects,
    arPrimaryObjectId: doc.arPrimaryObjectId,
    status: doc.status,
    slug: doc.slug,
    publishedAt: doc.publishedAt?.toISOString(),
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
  };
}

export function getARViewUrl(slug: string, origin?: string): string {
  const base = origin ?? (typeof window !== "undefined" ? window.location.origin : "");
  return `${base}/ar/view/${slug}`;
}
