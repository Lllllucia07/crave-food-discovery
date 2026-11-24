import { formatPrice, type PriceRange } from "./pricing";
import type { SearchLocation } from "./location";
import { cuisineFor, type CuisineId } from "./cuisines";
import { cravings } from "./preferences";
export { cravings } from "./preferences";
import { DEFAULT_RADIUS, normalizeRadius, proximity } from "./discovery";
export type Tag = (typeof cravings)[number]["id"];
export type Reaction = "loved" | "fine" | "nope";
export type Place = {
  id: string;
  name: string;
  cuisine: string;
  tags: Tag[];
  price: number;
  priceRange?: PriceRange;
  photos?: {name: string; authors: {name: string; url?: string}[]; mapsUrl?: string}[];
  photosUrl?: string;
  photoName?: string;
  photoAuthors?: {name: string; url?: string}[];
  rating: number;
  count: number;
  meters: number;
  lat: number;
  lng: number;
  open: boolean;
  hours: string;
  address: string;
  image: string;
  dishes: string[];
  note: string;
  reason?: string;
  cuisineId?: CuisineId;
  reviews?: RestaurantReview[];
  menu?: MenuItem[];
  websiteUrl?: string;
  menuUrl?: string;
  reservationUrl?: string;
  mapsUrl?: string;
};
export type RestaurantReview = {
  id: string;
  author: string;
  authorUrl?: string;
  rating: number;
  text: string;
  relativeTime: string;
  source: "demo" | "google";
  sourceUrl?: string;
  visitDate?: string;
};
export type MenuItem = {
  id: string;
  name: string;
  description: string;
  price: number;
  section: string;
  dietary?: string;
};
export type Booking = {
  id: string;
  placeId: string;
  placeName: string;
  date: string;
  time: string;
  party: number;
  kind: "demo";
  createdAt: string;
};
export type MealLog = {
  placeId: string;
  reaction: Reaction;
  dishes: string[];
  at: string;
};
export type Stored = {
  version: 1;
  selected: Tag[];
  saves: string[];
  logs: MealLog[];
  signupSeen: boolean;
  cuisine?: CuisineId; // Legacy single-choice value, retained for migration.
  cuisines: CuisineId[];
  bookings?: Booking[];
  searchRadius: number;
  location?: SearchLocation;
};
export const initial: Stored = {
  version: 1,
  selected: [],
  saves: [],
  logs: [],
  signupSeen: false,
  cuisines: [],
  searchRadius: DEFAULT_RADIUS,
};
export const DEMO_LOCATION = {
  lat: 40.7283,
  lng: -73.9857,
  label: "East Village, NYC",
};
const photo = (id: string) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1100&q=85`;
const seeds: Array<[string, string, Tag[], number, number, string, string[]]> =
  [
    [
      "Noodle House",
      "Hand-pulled noodles",
      ["spicy", "noodles", "cheap", "comfort", "late"],
      2,
      420,
      "photo-1569718212165-3a8278d5f624",
      ["Chili noodles", "Dumplings", "Broth"],
    ],
    [
      "Little Basil",
      "Thai kitchen",
      ["spicy", "noodles", "date", "plant"],
      2,
      510,
      "photo-1559314809-0d155014e29e",
      ["Pad Thai", "Green curry", "Tofu"],
    ],
    [
      "Sunday Table",
      "Neighborhood brunch",
      ["brunch", "comfort", "sweet", "plant"],
      2,
      290,
      "photo-1525351484163-7529414344d8",
      ["Eggs on toast", "Pancakes", "Coffee"],
    ],
    [
      "Slice Society",
      "New York pizza",
      ["pizza", "cheap", "late", "comfort"],
      1,
      360,
      "photo-1579751626657-72bc17010498",
      ["Margherita", "Pepperoni", "Mushroom"],
    ],
    [
      "Mori",
      "Japanese kitchen",
      ["sushi", "date", "noodles"],
      3,
      650,
      "photo-1579871494447-9811cf80d66c",
      ["Salmon roll", "Miso soup", "Edamame"],
    ],
    [
      "The Green Fork",
      "Seasonal bowls",
      ["plant", "cheap", "brunch"],
      2,
      480,
      "photo-1512621776951-a57141f2eefd",
      ["Grain bowl", "Avocado", "Falafel"],
    ],
    [
      "After Hours",
      "Smash burgers",
      ["burgers", "late", "cheap", "comfort"],
      2,
      580,
      "photo-1568901346375-23c9450c58cd",
      ["Smash burger", "Fries", "Veggie burger"],
    ],
    [
      "Peach & Crumb",
      "Bakery & coffee",
      ["sweet", "brunch", "date"],
      2,
      310,
      "photo-1484723091739-30a097e8f929",
      ["French toast", "Pastry", "Latte"],
    ],
    [
      "Red Lantern",
      "Sichuan comfort food",
      ["spicy", "noodles", "comfort", "cheap", "hotpot"],
      2,
      730,
      "photo-1569718212165-3a8278d5f624",
      ["Dan dan noodles", "Mapo tofu", "Dumplings"],
    ],
    [
      "Olive Room",
      "Wood-fired Italian",
      ["pizza", "date", "plant"],
      3,
      810,
      "photo-1579751626657-72bc17010498",
      ["Burrata", "Wood-fired pizza", "Tiramisu"],
    ],
    [
      "Rice & Sea",
      "Sushi counter",
      ["sushi", "cheap", "plant"],
      2,
      560,
      "photo-1579871494447-9811cf80d66c",
      ["Hand roll", "Avocado roll", "Rice bowl"],
    ],
    [
      "Midnight Bowl",
      "Ramen & small plates",
      ["noodles", "late", "spicy", "comfort"],
      2,
      890,
      "photo-1569718212165-3a8278d5f624",
      ["Spicy ramen", "Gyoza", "Mushrooms"],
    ],
    [
      "Seoul Table",
      "Korean comfort kitchen",
      ["spicy", "comfort", "date"],
      2,
      440,
      "photo-1553163147-622ab57be1c7",
      ["Bibimbap", "Kimchi pancake", "Bulgogi"],
    ],
    [
      "Kimchi Corner",
      "Korean small plates",
      ["spicy", "cheap", "late"],
      2,
      670,
      "photo-1553163147-622ab57be1c7",
      ["Tteokbokki", "Japchae", "Tofu stew"],
    ],
    [
      "Casa Verde",
      "Mexican neighborhood kitchen",
      ["spicy", "cheap", "plant"],
      2,
      390,
      "photo-1551504734-5ee1c4a1479b",
      ["Birria tacos", "Elote", "Mushroom tacos"],
    ],
    [
      "Curry Leaf",
      "Indian home-style cooking",
      ["spicy", "comfort", "plant"],
      2,
      620,
      "photo-1505253758473-96b7015fcd40",
      ["Butter chicken", "Chana masala", "Garlic naan"],
    ],
    [
      "Pasta Social",
      "Italian pasta kitchen",
      ["date", "comfort", "plant"],
      2,
      530,
      "photo-1473093295043-cdd812d0e601",
      ["Basil pesto pasta", "Burrata", "Tiramisu"],
    ],
    [
      "Bangkok Garden",
      "Thai neighborhood kitchen",
      ["spicy", "noodles", "plant"],
      2,
      760,
      "photo-1559314809-0d155014e29e",
      ["Drunken noodles", "Panang curry", "Papaya salad"],
    ],
    [
      "Taco Luna",
      "Mexican taqueria",
      ["cheap", "spicy", "late"],
      1,
      840,
      "photo-1551504734-5ee1c4a1479b",
      ["Carnitas tacos", "Guacamole", "Churros"],
    ],
    [
      "Masala House",
      "Indian tandoor kitchen",
      ["spicy", "date", "comfort"],
      2,
      910,
      "photo-1505253758473-96b7015fcd40",
      ["Tandoori paneer", "Dal makhani", "Samosas"],
    ],
    ["French Table", "French kitchen", ["date", "comfort", "fine"], 2, 1800, "photo-1547592180-85f173990554", ["French house special", "Seasonal side", "Chef’s dessert"]],
    ["Vietnamese Table", "Vietnamese kitchen", ["noodles", "soup", "cheap"], 2, 2400, "photo-1547592180-85f173990554", ["Vietnamese house special", "Seasonal side", "Chef’s dessert"]],
    ["Greek Table", "Greek kitchen", ["salad", "plant", "seafood"], 2, 3100, "photo-1547592180-85f173990554", ["Greek house special", "Seasonal side", "Chef’s dessert"]],
    ["Spanish Table", "Spanish kitchen", ["seafood", "date", "dinner"], 2, 4200, "photo-1547592180-85f173990554", ["Spanish house special", "Seasonal side", "Chef’s dessert"]],
    ["Turkish Table", "Turkish kitchen", ["bbq", "lunch", "quick"], 2, 5500, "photo-1547592180-85f173990554", ["Turkish house special", "Seasonal side", "Chef’s dessert"]],
    ["Lebanese Table", "Lebanese kitchen", ["plant", "salad", "family"], 2, 6500, "photo-1547592180-85f173990554", ["Lebanese house special", "Seasonal side", "Chef’s dessert"]],
    ["Caribbean Table", "Caribbean kitchen", ["spicy", "chicken", "comfort"], 2, 8200, "photo-1547592180-85f173990554", ["Caribbean house special", "Seasonal side", "Chef’s dessert"]],
    ["Ethiopian Table", "Ethiopian kitchen", ["plant", "spicy", "family"], 2, 12000, "photo-1547592180-85f173990554", ["Ethiopian house special", "Seasonal side", "Chef’s dessert"]],
    ["Peruvian Table", "Peruvian kitchen", ["seafood", "dinner", "date"], 2, 18000, "photo-1547592180-85f173990554", ["Peruvian house special", "Seasonal side", "Chef’s dessert"]],
    ["Brazilian Table", "Brazilian kitchen", ["steak", "bbq", "buffet"], 2, 22000, "photo-1547592180-85f173990554", ["Brazilian house special", "Seasonal side", "Chef’s dessert"]],
    ["Filipino Table", "Filipino kitchen", ["comfort", "lunch", "family"], 2, 2700, "photo-1547592180-85f173990554", ["Filipino house special", "Seasonal side", "Chef’s dessert"]],
    ["Indonesian Table", "Indonesian kitchen", ["spicy", "chicken", "dinner"], 2, 3400, "photo-1547592180-85f173990554", ["Indonesian house special", "Seasonal side", "Chef’s dessert"]],
    ["Malaysian Table", "Malaysian kitchen", ["noodles", "spicy", "soup"], 2, 4600, "photo-1547592180-85f173990554", ["Malaysian house special", "Seasonal side", "Chef’s dessert"]],
    ["German Table", "German kitchen", ["comfort", "sandwiches", "lunch"], 2, 5800, "photo-1547592180-85f173990554", ["German house special", "Seasonal side", "Chef’s dessert"]],
    ["British Table", "British kitchen", ["comfort", "breakfast", "coffee"], 2, 7400, "photo-1547592180-85f173990554", ["British house special", "Seasonal side", "Chef’s dessert"]],
    ["Middle Eastern Table", "Middle Eastern kitchen", ["plant", "salad", "quick"], 2, 9000, "photo-1547592180-85f173990554", ["Middle Eastern house special", "Seasonal side", "Chef’s dessert"]],
    ["Moroccan Table", "Moroccan kitchen", ["comfort", "soup", "dinner"], 2, 14000, "photo-1547592180-85f173990554", ["Moroccan house special", "Seasonal side", "Chef’s dessert"]],
    ["Persian Table", "Persian kitchen", ["bbq", "dinner", "family"], 2, 20000, "photo-1547592180-85f173990554", ["Persian house special", "Seasonal side", "Chef’s dessert"]],

  ];
export const demoPlaces: Place[] = seeds.map(
  ([name, cuisine, tags, price, meters, img, dishes], i) => ({
    id: `demo-${i + 1}`,
    name,
    cuisine,
    cuisineId: cuisineFor({ name, cuisine }),
    tags: [...new Set<Tag>([...tags, ...(dishes.some(d => /dumpling|gyoza/i.test(d)) ? ["dumplings" as Tag] : []), ...(dishes.some(d => /taco/i.test(d)) ? ["tacos" as Tag] : []), ...(dishes.some(d => /coffee|latte/i.test(d)) ? ["coffee" as Tag] : []), "lunch", "dinner"])],
    price,
    meters,
    rating: 4.3 + (i % 4) * 0.1,
    count: 100 + i * 63,
    lat: 40.7283 + (Math.sin(i * 2) * meters) / 111320,
    lng: -73.9857 + (Math.cos(i * 2) * meters) / (111320 * 0.758),
    open: true,
    hours: "Demo hours · 11:00 AM–11:00 PM",
    address: `${80 + i * 9} East ${6 + (i % 5)}th Street, New York`,
    image: photo(img),
    dishes,
    note:
      i === 0
        ? "Big bowls, a little heat, and the kind of noodles you come back for."
        : "A neighborhood spot for your next great bite.",
  }),
);
export const walk = (p: Place) => Math.max(1, Math.round(p.meters / 75));
export const priceText = formatPrice;
export function rank(
  places: Place[],
  selected: Tag[],
  logs: MealLog[],
  now = new Date(),
  selectedCuisines: readonly CuisineId[] = [],
  searchRadius = DEFAULT_RADIUS,
): Place[] {
  const byId = new Map(places.map((p) => [p.id, p]));
  const loved = logs
    .filter((l) => l.reaction === "loved")
    .map((l) => byId.get(l.placeId))
    .filter((p): p is Place => !!p);
  const disliked = new Map<Tag, number>(),
    weights = new Map<Tag, number>();
  logs.forEach((l) =>
    byId.get(l.placeId)?.tags.forEach((t) => {
      if (l.reaction === "nope") disliked.set(t, (disliked.get(t) || 0) + 1);
      weights.set(
        t,
        (weights.get(t) || 0) +
          (l.reaction === "loved" ? 0.2 : l.reaction === "nope" ? -0.3 : 0),
      );
    }),
  );
  return places
    .filter(
      (p) =>
        (!selectedCuisines.length ||
          selectedCuisines.includes(cuisineFor(p))) &&
        p.open &&
        p.meters <= normalizeRadius(searchRadius) &&
        !logs.some((l) => l.placeId === p.id && l.reaction === "nope") &&
        !p.tags.some(
          (t) =>
            ["noodles", "sushi", "pizza", "burgers"].includes(t) &&
            (disliked.get(t) || 0) >= 3,
        ),
    )
    .map((p) => {
      const match = selected.length
        ? selected.reduce(
            (n, t) =>
              n +
              (p.tags.includes(t)
                ? Math.max(0.1, 1 + (weights.get(t) || 0))
                : 0),
            0,
          ) /
          selected.reduce(
            (n, t) => n + Math.max(0.1, 1 + (weights.get(t) || 0)),
            0,
          )
        : p.tags.includes(
              now.getHours() >= 21
                ? "late"
                : now.getHours() < 14
                  ? "brunch"
                  : "comfort",
            )
          ? 1
          : 0.3;
      const affinity = loved.length
        ? Math.max(
            ...loved.map(
              (l) =>
                l.tags.filter((t) => p.tags.includes(t)).length /
                Math.max(l.tags.length, 1),
            ),
          )
        : 0;
      const quality = (p.rating * p.count + 4.2 * 50) / (p.count + 50) / 5;
      const novelty = logs.some((l) => l.placeId === p.id) ? 0 : 1;
      const score =
        0.35 * match +
        0.25 * Math.exp(-p.meters / Math.max(800, normalizeRadius(searchRadius) * 0.6)) +
        0.2 * quality +
        0.15 * affinity +
        0.05 * novelty;
      const matched = selected
        .filter((t) => p.tags.includes(t))
        .map((t) => cravings.find((c) => c.id === t)!.label.toLowerCase());
      const reason = `${matched.length ? matched.join(" + ") : p.cuisine} · ${priceText(p)} · ${proximity(p.meters)}${affinity > 0.5 ? " · Similar to your Loves" : ""}`;
      return { p: { ...p, reason }, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
    .map((r) => r.p);
}
