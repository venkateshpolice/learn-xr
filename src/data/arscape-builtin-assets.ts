import type { ARScapeAsset } from "@/types/arscape";

const S3 = "https://evoke-events-assets.s3.us-east-1.amazonaws.com/models/models/a-z";

export const BUILTIN_ASSETS: ARScapeAsset[] = [
  {
    id: "astronaut",
    name: "Astronaut",
    modelUrl: "https://modelviewer.dev/shared-assets/models/Astronaut.glb",
    thumbnailUrl: "https://modelviewer.dev/shared-assets/models/Astronaut.webp",
    source: "builtin",
  },
  {
    id: "robot",
    name: "Robot",
    modelUrl: "https://modelviewer.dev/shared-assets/models/RobotExpressive.glb",
    thumbnailUrl: "https://modelviewer.dev/shared-assets/models/RobotExpressive.webp",
    source: "builtin",
  },
  {
    id: "helmet",
    name: "Damaged Helmet",
    modelUrl: "https://modelviewer.dev/shared-assets/models/DamagedHelmet.glb",
    thumbnailUrl: "https://modelviewer.dev/shared-assets/models/DamagedHelmet.webp",
    source: "builtin",
  },
  {
    id: "brain",
    name: "Brain Stem",
    modelUrl: "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/BrainStem/glTF-Binary/BrainStem.glb",
    thumbnailUrl: "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/BrainStem/screenshot/screenshot.jpg",
    source: "builtin",
  },
  {
    id: "duck",
    name: "Rubber Duck",
    modelUrl: "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/Duck/glTF-Binary/Duck.glb",
    thumbnailUrl: "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/Duck/screenshot/screenshot.png",
    source: "builtin",
  },
  {
    id: "fox",
    name: "Fox",
    modelUrl: `${S3}/Fox.glb`,
    thumbnailUrl: `${S3}/Fox.webp`,
    source: "builtin",
  },
  {
    id: "elephant",
    name: "Elephant",
    modelUrl: `${S3}/Elephant.glb`,
    thumbnailUrl: `${S3}/Elephant.webp`,
    source: "builtin",
  },
  {
    id: "heart",
    name: "Heart",
    modelUrl: `${S3}/Heart.glb`,
    thumbnailUrl: `${S3}/Heart.webp`,
    source: "builtin",
  },
];
