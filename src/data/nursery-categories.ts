export interface CategoryItem {
  name: string;
  modelUrl: string;
  poster: string;
}

export interface Category {
  id: string;
  label: string;
  emoji: string;
  color: string;
  gradient: string;
  description: string;
  items: CategoryItem[];
  /** Link to a dedicated experience instead of the default category page */
  href?: string;
  badge?: string;
}

export const nurseryCategories: Category[] = [
  {
    id: "a-z",
    label: "A–Z Alphabet",
    emoji: "🔤",
    color: "indigo",
    gradient: "from-indigo-500 to-violet-400",
    description: "Explore A–Z objects in 3D and Augmented Reality",
    href: "/nursery/a-z",
    badge: "AR",
    items: "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").map((letter) => ({
      name: letter,
      modelUrl: "/nursery/a-z",
      poster: "",
    })),
  },
  {
    id: "transport",
    label: "Transport",
    emoji: "🚗",
    color: "blue",
    gradient: "from-blue-500 to-sky-400",
    description: "Learn about vehicles that help us travel",
    items: [
      { name: "Car", modelUrl: "https://modelviewer.dev/shared-assets/models/Astronaut.glb", poster: "" },
      { name: "Bus", modelUrl: "https://modelviewer.dev/shared-assets/models/Astronaut.glb", poster: "" },
      { name: "Train", modelUrl: "https://modelviewer.dev/shared-assets/models/Astronaut.glb", poster: "" },
      { name: "Airplane", modelUrl: "https://modelviewer.dev/shared-assets/models/Astronaut.glb", poster: "" },
      { name: "Helicopter", modelUrl: "https://modelviewer.dev/shared-assets/models/Astronaut.glb", poster: "" },
      { name: "Boat", modelUrl: "https://modelviewer.dev/shared-assets/models/Astronaut.glb", poster: "" },
      { name: "Bicycle", modelUrl: "https://modelviewer.dev/shared-assets/models/Astronaut.glb", poster: "" },
      { name: "Truck", modelUrl: "https://modelviewer.dev/shared-assets/models/Astronaut.glb", poster: "" },
    ],
  },
  {
    id: "animals",
    label: "Animals",
    emoji: "🐘",
    color: "amber",
    gradient: "from-amber-500 to-orange-400",
    description: "Meet amazing animals from around the world",
    items: [
      { name: "Lion", modelUrl: "https://modelviewer.dev/shared-assets/models/Astronaut.glb", poster: "" },
      { name: "Elephant", modelUrl: "https://modelviewer.dev/shared-assets/models/Astronaut.glb", poster: "" },
      { name: "Tiger", modelUrl: "https://modelviewer.dev/shared-assets/models/Astronaut.glb", poster: "" },
      { name: "Monkey", modelUrl: "https://modelviewer.dev/shared-assets/models/Astronaut.glb", poster: "" },
      { name: "Giraffe", modelUrl: "https://modelviewer.dev/shared-assets/models/Astronaut.glb", poster: "" },
      { name: "Zebra", modelUrl: "https://modelviewer.dev/shared-assets/models/Astronaut.glb", poster: "" },
      { name: "Bear", modelUrl: "https://modelviewer.dev/shared-assets/models/Astronaut.glb", poster: "" },
      { name: "Deer", modelUrl: "https://modelviewer.dev/shared-assets/models/Astronaut.glb", poster: "" },
    ],
  },
  {
    id: "shapes",
    label: "Shapes",
    emoji: "🔺",
    color: "purple",
    gradient: "from-purple-500 to-violet-400",
    description: "Discover shapes all around you",
    items: [
      { name: "Circle", modelUrl: "https://modelviewer.dev/shared-assets/models/Astronaut.glb", poster: "" },
      { name: "Square", modelUrl: "https://modelviewer.dev/shared-assets/models/Astronaut.glb", poster: "" },
      { name: "Triangle", modelUrl: "https://modelviewer.dev/shared-assets/models/Astronaut.glb", poster: "" },
      { name: "Rectangle", modelUrl: "https://modelviewer.dev/shared-assets/models/Astronaut.glb", poster: "" },
      { name: "Star", modelUrl: "https://modelviewer.dev/shared-assets/models/Astronaut.glb", poster: "" },
      { name: "Oval", modelUrl: "https://modelviewer.dev/shared-assets/models/Astronaut.glb", poster: "" },
      { name: "Heart", modelUrl: "https://modelviewer.dev/shared-assets/models/Astronaut.glb", poster: "" },
    ],
  },
  {
    id: "fruits",
    label: "Fruits",
    emoji: "🍎",
    color: "red",
    gradient: "from-red-500 to-rose-400",
    description: "Learn about delicious and healthy fruits",
    items: [
      { name: "Apple", modelUrl: "https://modelviewer.dev/shared-assets/models/Astronaut.glb", poster: "" },
      { name: "Banana", modelUrl: "https://modelviewer.dev/shared-assets/models/Astronaut.glb", poster: "" },
      { name: "Orange", modelUrl: "https://modelviewer.dev/shared-assets/models/Astronaut.glb", poster: "" },
      { name: "Mango", modelUrl: "https://modelviewer.dev/shared-assets/models/Astronaut.glb", poster: "" },
      { name: "Grapes", modelUrl: "https://modelviewer.dev/shared-assets/models/Astronaut.glb", poster: "" },
      { name: "Watermelon", modelUrl: "https://modelviewer.dev/shared-assets/models/Astronaut.glb", poster: "" },
      { name: "Strawberry", modelUrl: "https://modelviewer.dev/shared-assets/models/Astronaut.glb", poster: "" },
      { name: "Pineapple", modelUrl: "https://modelviewer.dev/shared-assets/models/Astronaut.glb", poster: "" },
    ],
  },
  {
    id: "vegetables",
    label: "Vegetables",
    emoji: "🥕",
    color: "green",
    gradient: "from-green-500 to-emerald-400",
    description: "Explore vegetables that keep us healthy",
    items: [
      { name: "Carrot", modelUrl: "https://modelviewer.dev/shared-assets/models/Astronaut.glb", poster: "" },
      { name: "Tomato", modelUrl: "https://modelviewer.dev/shared-assets/models/Astronaut.glb", poster: "" },
      { name: "Potato", modelUrl: "https://modelviewer.dev/shared-assets/models/Astronaut.glb", poster: "" },
      { name: "Onion", modelUrl: "https://modelviewer.dev/shared-assets/models/Astronaut.glb", poster: "" },
      { name: "Brinjal", modelUrl: "https://modelviewer.dev/shared-assets/models/Astronaut.glb", poster: "" },
      { name: "Cabbage", modelUrl: "https://modelviewer.dev/shared-assets/models/Astronaut.glb", poster: "" },
      { name: "Cauliflower", modelUrl: "https://modelviewer.dev/shared-assets/models/Astronaut.glb", poster: "" },
      { name: "Spinach", modelUrl: "https://modelviewer.dev/shared-assets/models/Astronaut.glb", poster: "" },
    ],
  },
  {
    id: "birds",
    label: "Birds",
    emoji: "🦜",
    color: "teal",
    gradient: "from-teal-500 to-cyan-400",
    description: "Watch beautiful birds fly and sing",
    items: [
      { name: "Parrot", modelUrl: "https://modelviewer.dev/shared-assets/models/Astronaut.glb", poster: "" },
      { name: "Peacock", modelUrl: "https://modelviewer.dev/shared-assets/models/Astronaut.glb", poster: "" },
      { name: "Eagle", modelUrl: "https://modelviewer.dev/shared-assets/models/Astronaut.glb", poster: "" },
      { name: "Owl", modelUrl: "https://modelviewer.dev/shared-assets/models/Astronaut.glb", poster: "" },
      { name: "Sparrow", modelUrl: "https://modelviewer.dev/shared-assets/models/Astronaut.glb", poster: "" },
      { name: "Penguin", modelUrl: "https://modelviewer.dev/shared-assets/models/Astronaut.glb", poster: "" },
      { name: "Flamingo", modelUrl: "https://modelviewer.dev/shared-assets/models/Astronaut.glb", poster: "" },
      { name: "Crow", modelUrl: "https://modelviewer.dev/shared-assets/models/Astronaut.glb", poster: "" },
    ],
  },
  {
    id: "nature",
    label: "Nature",
    emoji: "🌳",
    color: "emerald",
    gradient: "from-emerald-500 to-green-400",
    description: "Explore the wonders of nature",
    items: [
      { name: "Tree", modelUrl: "https://modelviewer.dev/shared-assets/models/Astronaut.glb", poster: "" },
      { name: "Flower", modelUrl: "https://modelviewer.dev/shared-assets/models/Astronaut.glb", poster: "" },
      { name: "Mountain", modelUrl: "https://modelviewer.dev/shared-assets/models/Astronaut.glb", poster: "" },
      { name: "River", modelUrl: "https://modelviewer.dev/shared-assets/models/Astronaut.glb", poster: "" },
      { name: "Sun", modelUrl: "https://modelviewer.dev/shared-assets/models/Astronaut.glb", poster: "" },
      { name: "Moon", modelUrl: "https://modelviewer.dev/shared-assets/models/Astronaut.glb", poster: "" },
      { name: "Rainbow", modelUrl: "https://modelviewer.dev/shared-assets/models/Astronaut.glb", poster: "" },
      { name: "Cloud", modelUrl: "https://modelviewer.dev/shared-assets/models/Astronaut.glb", poster: "" },
    ],
  },
  {
    id: "my-home",
    label: "My Home",
    emoji: "🏠",
    color: "pink",
    gradient: "from-pink-500 to-rose-400",
    description: "Learn about things in your home",
    items: [
      { name: "Chair", modelUrl: "https://modelviewer.dev/shared-assets/models/Astronaut.glb", poster: "" },
      { name: "Table", modelUrl: "https://modelviewer.dev/shared-assets/models/Astronaut.glb", poster: "" },
      { name: "Bed", modelUrl: "https://modelviewer.dev/shared-assets/models/Astronaut.glb", poster: "" },
      { name: "Lamp", modelUrl: "https://modelviewer.dev/shared-assets/models/Astronaut.glb", poster: "" },
      { name: "Clock", modelUrl: "https://modelviewer.dev/shared-assets/models/Astronaut.glb", poster: "" },
      { name: "Television", modelUrl: "https://modelviewer.dev/shared-assets/models/Astronaut.glb", poster: "" },
      { name: "Fan", modelUrl: "https://modelviewer.dev/shared-assets/models/Astronaut.glb", poster: "" },
      { name: "Door", modelUrl: "https://modelviewer.dev/shared-assets/models/Astronaut.glb", poster: "" },
    ],
  },
];

export function getCategoryById(id: string): Category | undefined {
  return nurseryCategories.find((c) => c.id === id);
}

export function getCategoryHref(category: Category): string {
  return category.href ?? `/nursery/${category.id}`;
}

export function getItemEmoji(categoryId: string, itemName: string): string {
  const emojiMap: Record<string, Record<string, string>> = {
    transport: {
      Car: "🚗", Bus: "🚌", Train: "🚆", Airplane: "✈️",
      Helicopter: "🚁", Boat: "⛵", Bicycle: "🚲", Truck: "🚚",
    },
    animals: {
      Lion: "🦁", Elephant: "🐘", Tiger: "🐯", Monkey: "🐒",
      Giraffe: "🦒", Zebra: "🦓", Bear: "🐻", Deer: "🦌",
    },
    shapes: {
      Circle: "⚪", Square: "🟦", Triangle: "🔺", Rectangle: "▬",
      Star: "⭐", Oval: "🥚", Heart: "❤️",
    },
    "a-z": Object.fromEntries(
      "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").map((l) => [l, l]),
    ),
    fruits: {
      Apple: "🍎", Banana: "🍌", Orange: "🍊", Mango: "🥭",
      Grapes: "🍇", Watermelon: "🍉", Strawberry: "🍓", Pineapple: "🍍",
    },
    vegetables: {
      Carrot: "🥕", Tomato: "🍅", Potato: "🥔", Onion: "🧅",
      Brinjal: "🍆", Cabbage: "🥬", Cauliflower: "🥦", Spinach: "🥬",
    },
    birds: {
      Parrot: "🦜", Peacock: "🦚", Eagle: "🦅", Owl: "🦉",
      Sparrow: "🐦", Penguin: "🐧", Flamingo: "🦩", Crow: "🐦‍⬛",
    },
    nature: {
      Tree: "🌳", Flower: "🌸", Mountain: "⛰️", River: "🏞️",
      Sun: "☀️", Moon: "🌙", Rainbow: "🌈", Cloud: "☁️",
    },
    "my-home": {
      Chair: "🪑", Table: "🪵", Bed: "🛏️", Lamp: "💡",
      Clock: "🕐", Television: "📺", Fan: "🌀", Door: "🚪",
    },
  };
  return emojiMap[categoryId]?.[itemName] || "📦";
}
