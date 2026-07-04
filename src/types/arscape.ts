export type ARScapeObjectSource = "builtin" | "sketchfab" | "upload";

export interface ARScapeObject {
  id: string;
  name: string;
  modelUrl: string;
  usdzUrl?: string;
  thumbnailUrl?: string;
  source: ARScapeObjectSource;
  sketchfabUid?: string;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
}

export type ARScapeStatus = "draft" | "published";

export interface ARScapeScene {
  id: string;
  teacherId: string;
  title: string;
  description?: string;
  objects: ARScapeObject[];
  arPrimaryObjectId?: string;
  status: ARScapeStatus;
  slug?: string;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ARScapeAsset {
  id: string;
  name: string;
  modelUrl: string;
  usdzUrl?: string;
  thumbnailUrl: string;
  source: ARScapeObjectSource;
  sketchfabUid?: string;
}

export interface SketchfabSearchResult {
  uid: string;
  name: string;
  thumbnailUrl: string;
  viewerUrl: string;
  isDownloadable: boolean;
  category?: string;
}
