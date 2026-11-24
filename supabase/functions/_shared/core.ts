import { cravings } from "../../../src/preferences.ts";
import { cuisineFor } from "../../../src/cuisines.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
export const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
export const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: {
      ...cors,
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
    },
  });
export async function authorize(req: Request) {
  const token = req.headers.get("Authorization");
  if (!token) throw new Error("Unauthorized");
  const client = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    { global: { headers: { Authorization: token } } },
  );
  const { data, error } = await client.auth.getUser();
  if (error || !data.user) throw new Error("Unauthorized");
  return { client, user: data.user };
}
export const tagIds: string[] = cravings.map(c => c.id);
export function coordinates(body: Record<string, unknown>) {
  const lat = Number(body.lat),
    lng = Number(body.lng);
  if (
    !Number.isFinite(lat) ||
    !Number.isFinite(lng) ||
    Math.abs(lat) > 90 ||
    Math.abs(lng) > 180
  )
    throw Error("Invalid coordinates");
  return { lat, lng };
}
export function meters(lat: number, lng: number, plat: number, plng: number) {
  const r = Math.PI / 180,
    a =
      Math.sin(((plat - lat) * r) / 2) ** 2 +
      Math.cos(lat * r) *
        Math.cos(plat * r) *
        Math.sin(((plng - lng) * r) / 2) ** 2;
  return Math.round(6371000 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}
export function tagPlace(
  types: string[],
  name: string,
  price: number,
): string[] {
  const s = (types.join(" ") + " " + name).toLowerCase(),
    tags = new Set<string>();
  const mapping: Record<string, RegExp> = {
    seafood: /seafood|fish|oyster/,
    steak: /steak/,
    bbq: /barbecue|grill/,
    dumplings: /dumpling|dim_sum/,
    soup: /soup|pho|ramen/,
    salad: /salad/,
    coffee: /coffee|cafe/,
    breakfast: /breakfast|brunch/,
    lunch: /restaurant|deli|sandwich/,
    dinner: /restaurant/,
    quick: /fast_food|meal_takeaway|sandwich/,
    family: /family_restaurant/,
    fine: /fine_dining/,
    buffet: /buffet/,
    sandwiches: /sandwich|deli/,
    chicken: /fried_chicken|chicken_wings/,
    hotpot: /hot_pot/,
    tacos: /taco|mexican/,
    spicy: /thai|sichuan|szechuan|indian|spicy|mexican|korean/,
    noodles: /ramen|noodle|thai|vietnamese|pho/,
    pizza: /pizza|italian/,
    sushi: /sushi|japanese/,
    burgers: /burger|american/,
    plant: /vegan|vegetarian|salad|healthy/,
    brunch: /breakfast|brunch|cafe/,
    sweet: /bakery|dessert|ice_cream|coffee/,
  };
  for (const [tag, pattern] of Object.entries(mapping))
    if (pattern.test(s)) tags.add(tag);
  if (price && price <= 2) tags.add("cheap");
  if (price >= 3) tags.add("date");
  if (tags.has("noodles") || tags.has("burgers") || tags.has("pizza"))
    tags.add("comfort");
  return [...tags];
}
export const googleFields =
  "id,displayName,formattedAddress,location,types,primaryTypeDisplayName,priceLevel,priceRange,photos,rating,userRatingCount,currentOpeningHours,googleMapsUri,googleMapsLinks.photosUri";
export function normalize(p: any, lat: number, lng: number) {
  const price: Record<string, number> = {
    PRICE_LEVEL_FREE: 1,
    PRICE_LEVEL_INEXPENSIVE: 1,
    PRICE_LEVEL_MODERATE: 2,
    PRICE_LEVEL_EXPENSIVE: 3,
    PRICE_LEVEL_VERY_EXPENSIVE: 4,
  };
  const cost = price[p.priceLevel] || 0,
    name = p.displayName?.text || "Restaurant",
    tags = tagPlace(p.types || [], name, cost);
  const periods = p.currentOpeningHours?.periods || [];
  if (
    periods.some(
      (x: any) => x.close?.hour >= 23 || x.close?.day !== x.open?.day,
    )
  )
    tags.push("late");
  return {
    id: p.id,
    name,
    cuisine: p.primaryTypeDisplayName?.text || "Neighborhood restaurant",
    cuisineId: cuisineFor({ name, types: p.types || [] }),
    tags,
    price: cost,
    priceRange: p.priceRange?.startPrice?.currencyCode ? {
      start: Number(p.priceRange.startPrice.units || 0) + Number(p.priceRange.startPrice.nanos || 0) / 1e9,
      end: p.priceRange.endPrice ? Number(p.priceRange.endPrice.units || 0) + Number(p.priceRange.endPrice.nanos || 0) / 1e9 : undefined,
      currency: p.priceRange.startPrice.currencyCode,
    } : undefined,
    photos: (p.photos || []).slice(0, 10).filter((photo: any) => typeof photo.name === "string").map((photo: any) => ({
      name: photo.name,
      authors: (photo.authorAttributions || []).map((a: any) => ({name: a.displayName || "Google Maps contributor", url: a.uri})),
      mapsUrl: photo.googleMapsUri,
    })),
    photosUrl: p.googleMapsLinks?.photosUri,
    photoName: p.photos?.[0]?.name,
    photoAuthors: (p.photos?.[0]?.authorAttributions || []).map((a: any) => ({name: a.displayName || "Google Maps contributor", url: a.uri})),
    rating: p.rating ?? 0,
    count: p.userRatingCount || 0,
    lat: p.location.latitude,
    lng: p.location.longitude,
    meters: meters(lat, lng, p.location.latitude, p.location.longitude),
    open: p.currentOpeningHours?.openNow === true,
    hours:
      p.currentOpeningHours?.weekdayDescriptions?.join(" · ") ||
      "Check hours with the restaurant",
    address: p.formattedAddress || "",
    image: "",
    dishes: [],
    note: "Restaurant information provided by Google Maps.",
    websiteUrl: p.websiteUri || undefined,
    mapsUrl: p.googleMapsUri || undefined,
    reviews: (p.reviews || [])
      .filter((r: any) => r.text?.text && r.googleMapsUri)
      .map((r: any, i: number) => ({
        id: r.name || `${p.id}-review-${i}`,
        author: r.authorAttribution?.displayName || "Google Maps reviewer",
        authorUrl: r.authorAttribution?.uri,
        rating: r.rating || 0,
        text: r.text.text,
        relativeTime: r.relativePublishTimeDescription || "",
        source: "google",
        sourceUrl: r.googleMapsUri,
        visitDate:
          typeof r.visitDate === "string"
            ? r.visitDate
            : r.visitDate?.year && r.visitDate?.month
              ? `${r.visitDate.year}-${String(r.visitDate.month).padStart(2, "0")}`
              : undefined,
      })),
  };
}
