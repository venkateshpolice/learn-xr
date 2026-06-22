export interface AZLetterModel {
  letter: string;
  word: string;
  emoji: string;
  glb?: string;
  usdz?: string;
  poster?: string;
}

export const azLetterModels: AZLetterModel[] = [
  {
    letter: "A",
    word: "Apple",
    emoji: "🍎",
    glb: "/models/a-z/apple/apple.glb",
    usdz: "/models/a-z/apple/Apple.usdz",
    poster: "/models/a-z/apple/Screenshot%20from%202026-06-22%2012-55-02.png",
  },
  {
    letter: "B",
    word: "Ball",
    emoji: "🏐",
    glb: "/models/a-z/ball/3d_free_volley_ball_game_asset_pbr_texture_model.glb",
    usdz: "/models/a-z/ball/3D_Free_Volley_Ball_Game_Asset_PBR_Texture_Mode.usdz",
    poster: "/models/a-z/ball/Screenshot%20from%202026-06-22%2012-51-46.png",
  },
  {
    letter: "C",
    word: "Cat",
    emoji: "🐱",
    glb: "/models/a-z/cat/animated_cat__3d_animal_model.glb",
    usdz: "/models/a-z/cat/Animated_Cat__3D_Animal_Model.usdz",
    poster: "/models/a-z/cat/Screenshot%20from%202026-06-22%2012-52-26.png",
  },
  {
    letter: "D",
    word: "Dog",
    emoji: "🐕",
    glb: "/models/a-z/dog/Labrador.glb",
    usdz: "/models/a-z/dog/Labrador_Dog.usdz",
    poster: "/models/a-z/dog/Screenshot%20from%202026-06-22%2012-53-14.png",
  },
  {
    letter: "E",
    word: "Elephant",
    emoji: "🐘",
    glb: "/models/a-z/elephant/african_elephant.glb",
    usdz: "/models/a-z/elephant/African_Elephant.usdz",
    poster: "/models/a-z/elephant/Screenshot%20from%202026-06-22%2012-53-59.png",
  },
  {
    letter: "F",
    word: "Fish",
    emoji: "🐟",
    glb: "/models/a-z/fish/tropical_alien_fish_animated.glb",
    usdz: "/models/a-z/fish/Tropical_Alien_Fish_Animated.usdz",
    poster: "/models/a-z/fish/Screenshot%20from%202026-06-22%2012-41-05.png",
  },
  {
    letter: "G",
    word: "Guitar",
    emoji: "🎸",
    glb: "/models/a-z/guiter/jazz_guiter.glb",
    usdz: "/models/a-z/guiter/Jazz_Guiter.usdz",
    poster: "/models/a-z/guiter/Screenshot%20from%202026-06-22%2013-01-33.png",
  },
  {
    letter: "H",
    word: "Hen",
    emoji: "🐔",
    glb: "/models/a-z/hen/hen_3d_model.glb",
    usdz: "/models/a-z/hen/hen_3d_model.usdz",
    poster: "/models/a-z/hen/Screenshot%20from%202026-06-22%2013-04-56.png",
  },
  {
    letter: "I",
    word: "Ice Cream",
    emoji: "🍦",
    glb: "/models/a-z/ice-cream/ice_cream.glb",
    usdz: "/models/a-z/ice-cream/Ice_cream.usdz",
    poster: "/models/a-z/ice-cream/Screenshot%20from%202026-06-22%2013-09-06.png",
  },
  {
    letter: "J",
    word: "Jar",
    emoji: "🫙",
    glb: "/models/a-z/jar/cookies_in_the_jar.glb",
    usdz: "/models/a-z/jar/Cookies_in_the_jar.usdz",
    poster: "/models/a-z/jar/Screenshot%20from%202026-06-22%2013-17-02.png",
  },
  {
    letter: "K",
    word: "Kettle",
    emoji: "🫖",
    glb: "/models/a-z/kettle/retro_kettle.glb",
    usdz: "/models/a-z/kettle/Retro_Kettle.usdz",
    poster: "/models/a-z/kettle/Screenshot%20from%202026-06-22%2013-56-47.png",
  },
  {
    letter: "L",
    word: "Lamp",
    emoji: "💡",
    glb: "/models/a-z/lamp/bankers_lamp.glb",
    usdz: "/models/a-z/lamp/Bankers_Lamp.usdz",
    poster: "/models/a-z/lamp/Screenshot%20from%202026-06-22%2014-17-17.png",
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
