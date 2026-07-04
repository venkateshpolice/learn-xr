export interface SketchfabCategory {
  id: string;
  label: string;
  icon: string;
  query: string;
}

export const SKETCHFAB_CATEGORIES: SketchfabCategory[] = [
  { id: "all", label: "All", icon: "✨", query: "3d model" },
  { id: "animals", label: "Animals", icon: "🐾", query: "animal wildlife" },
  { id: "science", label: "Science", icon: "🔬", query: "science laboratory" },
  { id: "education", label: "Education", icon: "📚", query: "education learning school" },
  { id: "anatomy", label: "Anatomy", icon: "🫀", query: "anatomy human body" },
  { id: "space", label: "Space", icon: "🪐", query: "space planet solar system" },
  { id: "nature", label: "Nature", icon: "🌿", query: "nature plant tree environment" },
  { id: "vehicles", label: "Vehicles", icon: "🚗", query: "car vehicle transport" },
  { id: "characters", label: "Characters", icon: "🧑", query: "character human figure" },
  { id: "history", label: "History", icon: "🏛️", query: "historical artifact museum" },
  { id: "architecture", label: "Buildings", icon: "🏠", query: "architecture building house" },
];

export interface CuratedSketchfabModel {
  uid: string;
  name: string;
  category: string;
  thumbnailUrl: string;
  glbUrl: string;
  usdzUrl?: string;
}

const MV = "https://modelviewer.dev/shared-assets/models";
const S3 = "https://evoke-events-assets.s3.us-east-1.amazonaws.com/models/models/a-z";

export const CURATED_SKETCHFAB_MODELS: CuratedSketchfabModel[] = [
  {
    uid: "demo-astronaut",
    name: "Astronaut",
    category: "space",
    thumbnailUrl: `${MV}/Astronaut.webp`,
    glbUrl: `${MV}/Astronaut.glb`,
    usdzUrl: `${MV}/Astronaut.usdz`,
  },
  {
    uid: "demo-robot",
    name: "Expressive Robot",
    category: "characters",
    thumbnailUrl: `${MV}/RobotExpressive.webp`,
    glbUrl: `${MV}/RobotExpressive.glb`,
    usdzUrl: `${MV}/RobotExpressive.usdz`,
  },
  {
    uid: "demo-helmet",
    name: "Damaged Helmet",
    category: "history",
    thumbnailUrl: `${MV}/DamagedHelmet.webp`,
    glbUrl: `${MV}/DamagedHelmet.glb`,
    usdzUrl: `${MV}/DamagedHelmet.usdz`,
  },
  {
    uid: "demo-duck",
    name: "Rubber Duck",
    category: "animals",
    thumbnailUrl: "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/Duck/screenshot/screenshot.png",
    glbUrl: "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/Duck/glTF-Binary/Duck.glb",
  },
  {
    uid: "demo-fox",
    name: "Fox",
    category: "animals",
    thumbnailUrl: `${S3}/Fox.webp`,
    glbUrl: `${S3}/Fox.glb`,
    usdzUrl: `${S3}/Fox.usdz`,
  },
  {
    uid: "demo-elephant",
    name: "Elephant",
    category: "animals",
    thumbnailUrl: `${S3}/Elephant.webp`,
    glbUrl: `${S3}/Elephant.glb`,
    usdzUrl: `${S3}/Elephant.usdz`,
  },
  {
    uid: "demo-heart",
    name: "Heart",
    category: "anatomy",
    thumbnailUrl: `${S3}/Heart.webp`,
    glbUrl: `${S3}/Heart.glb`,
    usdzUrl: `${S3}/Heart.usdz`,
  },
  {
    uid: "demo-cat",
    name: "Cat",
    category: "animals",
    thumbnailUrl: `${S3}/cat/Screenshot%20from%202026-06-22%2012-52-26.png`,
    glbUrl: `${S3}/cat/animated_cat__3d_animal_model.glb`,
    usdzUrl: `${S3}/cat/Animated_Cat__3D_Animal_Model.usdz`,
  },
  {
    uid: "demo-shark",
    name: "Shark",
    category: "animals",
    thumbnailUrl: `${S3}/Shark.webp`,
    glbUrl: `${S3}/Shark.glb`,
    usdzUrl: `${S3}/Shark.usdz`,
  },
  {
    uid: "demo-solar",
    name: "Solar System",
    category: "space",
    thumbnailUrl: `${S3}/SolarSystem.webp`,
    glbUrl: `${S3}/SolarSystem.glb`,
    usdzUrl: `${S3}/SolarSystem.usdz`,
  },
  {
    uid: "demo-shoe",
    name: "Materials Shoe",
    category: "science",
    thumbnailUrl: `${MV}/MaterialsVariantsShoe.webp`,
    glbUrl: `${MV}/MaterialsVariantsShoe.glb`,
    usdzUrl: `${MV}/MaterialsVariantsShoe.usdz`,
  },
];

export function getCuratedByCategory(categoryId: string, query?: string): CuratedSketchfabModel[] {
  let list = CURATED_SKETCHFAB_MODELS;
  if (categoryId !== "all") {
    list = list.filter((m) => m.category === categoryId);
  }
  if (query?.trim()) {
    const q = query.toLowerCase();
    list = list.filter((m) => m.name.toLowerCase().includes(q));
  }
  return list;
}

export function getCategoryQuery(categoryId: string): string {
  return SKETCHFAB_CATEGORIES.find((c) => c.id === categoryId)?.query ?? "3d model";
}
