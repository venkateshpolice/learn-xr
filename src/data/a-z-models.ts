export interface AZLetterModel {
  letter: string;
  word: string;
  emoji: string;
  glb?: string;
  usdz?: string;
  poster?: string;
}

const AZ_MODELS_S3_BASE =
  "https://evoke-events-assets.s3.us-east-1.amazonaws.com/models/models/a-z";

function azModel(path: string): string {
  return `${AZ_MODELS_S3_BASE}/${path}`;
}

export const azLetterModels: AZLetterModel[] = [
  {
    letter: "A",
    word: "Apple",
    emoji: "🍎",
    glb: azModel("apple/apple.glb"),
    usdz: azModel("apple/Apple.usdz"),
    poster: azModel("apple/Screenshot%20from%202026-06-22%2012-55-02.png"),
  },
  {
    letter: "B",
    word: "Ball",
    emoji: "🏐",
    glb: azModel("ball/3d_free_volley_ball_game_asset_pbr_texture_model.glb"),
    usdz: azModel("ball/3D_Free_Volley_Ball_Game_Asset_PBR_Texture_Mode.usdz"),
    poster: azModel("ball/Screenshot%20from%202026-06-22%2012-51-46.png"),
  },
  {
    letter: "C",
    word: "Cat",
    emoji: "🐱",
    glb: azModel("cat/animated_cat__3d_animal_model.glb"),
    usdz: azModel("cat/Animated_Cat__3D_Animal_Model.usdz"),
    poster: azModel("cat/Screenshot%20from%202026-06-22%2012-52-26.png"),
  },
  {
    letter: "D",
    word: "Dog",
    emoji: "🐕",
    glb: azModel("dog/Labrador.glb"),
    usdz: azModel("dog/Labrador_Dog.usdz"),
    poster: azModel("dog/Screenshot%20from%202026-06-22%2012-53-14.png"),
  },
  {
    letter: "E",
    word: "Elephant",
    emoji: "🐘",
    glb: azModel("elephant/african_elephant.glb"),
    usdz: azModel("elephant/African_Elephant.usdz"),
    poster: azModel("elephant/Screenshot%20from%202026-06-22%2012-53-59.png"),
  },
  {
    letter: "F",
    word: "Fish",
    emoji: "🐟",
    glb: azModel("fish/tropical_alien_fish_animated.glb"),
    usdz: azModel("fish/Tropical_Alien_Fish_Animated.usdz"),
    poster: azModel("fish/Screenshot%20from%202026-06-22%2012-41-05.png"),
  },
  {
    letter: "G",
    word: "Guitar",
    emoji: "🎸",
    glb: azModel("guiter/jazz_guiter.glb"),
    usdz: azModel("guiter/Jazz_Guiter.usdz"),
    poster: azModel("guiter/Screenshot%20from%202026-06-22%2013-01-33.png"),
  },
  {
    letter: "H",
    word: "Hen",
    emoji: "🐔",
    glb: azModel("hen/hen_3d_model.glb"),
    usdz: azModel("hen/hen_3d_model.usdz"),
    poster: azModel("hen/Screenshot%20from%202026-06-22%2013-04-56.png"),
  },
  {
    letter: "I",
    word: "Ice Cream",
    emoji: "🍦",
    glb: azModel("ice-cream/ice_cream.glb"),
    usdz: azModel("ice-cream/Ice_cream.usdz"),
    poster: azModel("ice-cream/Screenshot%20from%202026-06-22%2013-09-06.png"),
  },
  {
    letter: "J",
    word: "Jar",
    emoji: "🫙",
    glb: azModel("jar/cookies_in_the_jar.glb"),
    usdz: azModel("jar/Cookies_in_the_jar.usdz"),
    poster: azModel("jar/Screenshot%20from%202026-06-22%2013-17-02.png"),
  },
  {
    letter: "K",
    word: "Kettle",
    emoji: "🫖",
    glb: azModel("kettle/retro_kettle.glb"),
    usdz: azModel("kettle/Retro_Kettle.usdz"),
    poster: azModel("kettle/Screenshot%20from%202026-06-22%2013-56-47.png"),
  },
  {
    letter: "L",
    word: "Lamp",
    emoji: "💡",
    glb: azModel("lamp/bankers_lamp.glb"),
    usdz: azModel("lamp/Bankers_Lamp.usdz"),
    poster: azModel("lamp/Screenshot%20from%202026-06-22%2014-17-17.png"),
  },
  { letter: "M", word: "Moon", emoji: "🌙" },
  { letter: "N", word: "Nest", emoji: "🪺" },
  { letter: "O", word: "Orange", emoji: "🍊" },
  { letter: "P", word: "Parrot", emoji: "🦜" },
  { letter: "Q", word: "Queen", emoji: "👑" },
  { letter: "R", word: "Rabbit", emoji: "🐰" },
  { letter: "S", word: "Sun", emoji: "☀️" },
  { letter: "T", word: "Tiger", emoji: "🐯" },
  { letter: "U", word: "Umbrella", emoji: "☂️" },
  { letter: "V", word: "Van", emoji: "🚐" },
  { letter: "W", word: "Watch", emoji: "⌚" },
  { letter: "X", word: "Xylophone", emoji: "🎵" },
  { letter: "Y", word: "Yak", emoji: "🐂" },
  { letter: "Z", word: "Zebra", emoji: "🦓" },
];

export function getLetterModel(letter: string): AZLetterModel | undefined {
  return azLetterModels.find((m) => m.letter === letter.toUpperCase());
}

export function hasArModel(model: AZLetterModel): boolean {
  return Boolean(model.glb && model.usdz);
}
