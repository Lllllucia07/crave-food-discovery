export const cuisines = [
  { id: "any", label: "Any cuisine", emoji: "🍽️", googleType: "restaurant" },
  {
    id: "korean",
    label: "Korean",
    emoji: "🥢",
    googleType: "korean_restaurant",
  },
  {
    id: "italian",
    label: "Italian",
    emoji: "🍝",
    googleType: "italian_restaurant",
  },
  { id: "thai", label: "Thai", emoji: "🌿", googleType: "thai_restaurant" },
  {
    id: "japanese",
    label: "Japanese",
    emoji: "🍣",
    googleType: "japanese_restaurant",
  },
  {
    id: "chinese",
    label: "Chinese",
    emoji: "🥟",
    googleType: "chinese_restaurant",
  },
  {
    id: "mexican",
    label: "Mexican",
    emoji: "🌮",
    googleType: "mexican_restaurant",
  },
  {
    id: "indian",
    label: "Indian",
    emoji: "🍛",
    googleType: "indian_restaurant",
  },
  {
    id: "american",
    label: "American",
    emoji: "🍔",
    googleType: "american_restaurant",
  },
  {
    id: "mediterranean",
    label: "Mediterranean",
    emoji: "🫒",
    googleType: "mediterranean_restaurant",
  },
  { id: "cafe", label: "Café & bakery", emoji: "☕", googleType: "cafe" },
  {"id": "french", "label": "French", "emoji": "🥐", "googleType": "french_restaurant"},
  {"id": "vietnamese", "label": "Vietnamese", "emoji": "🍜", "googleType": "vietnamese_restaurant"},
  {"id": "greek", "label": "Greek", "emoji": "🫒", "googleType": "greek_restaurant"},
  {"id": "spanish", "label": "Spanish", "emoji": "🥘", "googleType": "spanish_restaurant"},
  {"id": "turkish", "label": "Turkish", "emoji": "🥙", "googleType": "turkish_restaurant"},
  {"id": "lebanese", "label": "Lebanese", "emoji": "🧆", "googleType": "lebanese_restaurant"},
  {"id": "caribbean", "label": "Caribbean", "emoji": "🌴", "googleType": "caribbean_restaurant"},
  {"id": "ethiopian", "label": "Ethiopian", "emoji": "🍲", "googleType": "ethiopian_restaurant"},
  {"id": "peruvian", "label": "Peruvian", "emoji": "🐟", "googleType": "peruvian_restaurant"},
  {"id": "brazilian", "label": "Brazilian", "emoji": "🍖", "googleType": "brazilian_restaurant"},
  {"id": "filipino", "label": "Filipino", "emoji": "🍚", "googleType": "filipino_restaurant"},
  {"id": "indonesian", "label": "Indonesian", "emoji": "🍢", "googleType": "indonesian_restaurant"},
  {"id": "malaysian", "label": "Malaysian", "emoji": "🥥", "googleType": "malaysian_restaurant"},
  {"id": "german", "label": "German", "emoji": "🥨", "googleType": "german_restaurant"},
  {"id": "british", "label": "British", "emoji": "🥧", "googleType": "british_restaurant"},
  {"id": "middle_eastern", "label": "Middle Eastern", "emoji": "🥙", "googleType": "middle_eastern_restaurant"},
  {"id": "moroccan", "label": "Moroccan", "emoji": "🫖", "googleType": "moroccan_restaurant"},
  {"id": "persian", "label": "Persian", "emoji": "🍚", "googleType": "persian_restaurant"},
] as const;
export type CuisineId = (typeof cuisines)[number]["id"];
export function cuisineFor(p: {
  cuisineId?: CuisineId;
  name?: string;
  cuisine?: string;
  types?: string[];
}): CuisineId {
  if (p.cuisineId && cuisines.some((c) => c.id === p.cuisineId))
    return p.cuisineId;
  const text = [p.name, p.cuisine, ...(p.types || [])].join(" ").toLowerCase();
  const exact = cuisines.find(c => c.id !== "any" && (p.types || []).includes(c.googleType));
  if (exact) return exact.id;
  const regional = cuisines.slice(11).find(c => text.includes(c.label.toLowerCase()) || text.includes(c.id));
  if (regional) return regional.id;
  const rules: Array<[CuisineId, RegExp]> = [
    ["korean", /korean|kimchi|seoul|bibimbap|bulgogi/],
    ["thai", /thai|basil|bangkok/],
    ["italian", /italian|pizza|pasta|trattoria/],
    ["japanese", /japanese|sushi|ramen|mori|rice & sea/],
    ["chinese", /chinese|sichuan|szechuan|hand.pulled|dumpling|noodle house/],
    ["mexican", /mexican|taco|cantina/],
    ["indian", /indian|masala|tandoor|curry/],
    ["mediterranean", /mediterranean|greek|falafel|seasonal bowl/],
    ["cafe", /cafe|café|bakery|coffee|pastry/],
    ["american", /american|burger|brunch|diner/],
  ];
  return rules.find(([, pattern]) => pattern.test(text))?.[0] || "any";
}

/** Migrate the former single cuisine and retain every valid selected cuisine. */
export function normalizeCuisineSelection(
  value: unknown,
  legacy?: unknown,
): CuisineId[] {
  const values = Array.isArray(value)
    ? value
    : typeof legacy === "string"
      ? [legacy]
      : [];
  return [
    ...new Set(
      values.filter(
        (id): id is CuisineId =>
          typeof id === "string" &&
          id !== "any" &&
          cuisines.some((c) => c.id === id),
      ),
    ),
  ];
}
