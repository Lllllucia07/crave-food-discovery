import "react-native-url-polyfill/auto";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";
import { createClient } from "@supabase/supabase-js";
import type { Place, Tag, MealLog } from "./model";
import type { CuisineId } from "./cuisines";
const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const key = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
const serverRender = Platform.OS === "web" && typeof window === "undefined";
export const supabase =
  url && key
    ? createClient(url, key, {
        auth: {
          storage: serverRender ? undefined : AsyncStorage,
          autoRefreshToken: !serverRender,
          persistSession: !serverRender,
          detectSessionInUrl: false,
          flowType: "pkce",
        },
      })
    : null;
export async function session() {
  if (!supabase) return null;
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (session) return session;
  const { data, error } = await supabase.auth.signInAnonymously();
  if (error) throw error;
  return data.session;
}
export async function recommendations(
  tags: Tag[],
  lat: number,
  lng: number,
  selectedCuisines: CuisineId[],
  searchRadius: number,
): Promise<Place[]> {
  if (!supabase) return [];
  await session();
  const fetchResult = await supabase.functions.invoke("fetch-places", {
    body: { lat, lng, cuisines: selectedCuisines, searchRadius },
  });
  if (fetchResult.error)
    throw Error(
      "We couldn’t load nearby restaurants. Please try again shortly.",
    );
  const { data, error } = await supabase.functions.invoke("recommend", {
    body: {
      tags,
      searchRadius,
      cuisines: selectedCuisines,
      lat,
      lng,
      hour: new Date().getHours(),
      candidates: fetchResult.data.places,
    },
  });
  if (error) throw error;
  return data.places.map((p: Place) => ({ ...p, reason: undefined }));
}
export async function cloudSave(id: string, saving: boolean) {
  if (!supabase) return;
  const s = await session();
  if (!s) throw Error("Your session could not be started.");
  const r = saving
    ? await supabase.from("saves").upsert({ user_id: s.user.id, place_id: id })
    : await supabase
        .from("saves")
        .delete()
        .eq("user_id", s.user.id)
        .eq("place_id", id);
  if (r.error) throw r.error;
}
export async function cloudLog(log: MealLog, contextTags: Tag[]) {
  if (!supabase) return;
  const s = await session();
  if (!s) throw Error("Your session could not be started.");
  const { error } = await supabase.from("logs").upsert(
    {
      user_id: s.user.id,
      place_id: log.placeId,
      reaction: log.reaction,
      dish_tags: log.dishes,
      context_tags: contextTags,
      visited_at: log.at,
    },
    { onConflict: "user_id,place_id" },
  );
  if (error) throw error;
}
export async function linkAccount(provider: "google" | "apple") {
  if (!supabase)
    throw Error(
      "Account linking is available after the live service is connected. Your demo saves are kept on this device.",
    );
  await session();
  const redirectTo =
    typeof window !== "undefined"
      ? `${window.location.origin}/auth/callback`
      : "crave://auth/callback";
  const { data, error } = await supabase.auth.linkIdentity({
    provider,
    options: { redirectTo, skipBrowserRedirect: true },
  });
  if (error) throw error;
  return data.url;
}

export async function restoreCloud(lat: number, lng: number) {
  if (!supabase) return null;
  const s = await session();
  if (!s) return null;
  const [a, b] = await Promise.all([
    supabase.from("saves").select("place_id").eq("user_id", s.user.id),
    supabase.from("logs").select("*").eq("user_id", s.user.id),
  ]);
  if (a.error || b.error) throw Error("Could not restore your places.");
  const saves = (a.data || []).map((x) => x.place_id),
    logs: MealLog[] = (b.data || []).map((x) => ({
      placeId: x.place_id,
      reaction: x.reaction,
      dishes: x.dish_tags,
      at: x.visited_at,
    }));
  const ids = [...new Set([...saves, ...logs.map((l) => l.placeId)])];
  let places: Place[] = [];
  for (let start = 0; start < ids.length; start += 20) {
    const { data, error } = await supabase.functions.invoke("fetch-places", {
      body: { ids: ids.slice(start, start + 20), lat, lng },
    });
    if (error) throw error;
    places.push(...data.places);
  }
  return { saves, logs, places };
}

export async function restaurantDetails(place: Place): Promise<Place> {
  if (!supabase || place.id.startsWith("demo-")) return place;
  await session();
  const { data, error } = await supabase.functions.invoke("fetch-places", {
    body: { detailId: place.id, lat: place.lat, lng: place.lng },
  });
  if (error || !data?.places?.[0])
    throw Error("Restaurant details could not be loaded. Please try again.");
  return { ...place, ...data.places[0], reason: place.reason };
}

// Deduplicate transient photo requests; failed requests must remain retryable.
const photoRequests = new Map<string, Promise<string>>();
export function restaurantPhoto(place: Place, retry = false): Promise<string> {
  if (!supabase || !place.photoName) return Promise.resolve("");
  const name = place.photoName;
  if (retry) photoRequests.delete(name);
  if (!photoRequests.has(name)) {
    const request = (async () => {
      await session();
      const {data, error} = await supabase!.functions.invoke("fetch-places", {body:{photoName:name,lat:place.lat,lng:place.lng}});
      if (error) {
        let reason = "";
        try { reason = (await error.context?.json())?.error || ""; } catch {}
        if (reason.startsWith("Daily discovery limit")) throw Error("Today's restaurant request limit has been reached. Try again tomorrow or view photos on Google Maps.");
        if (reason.startsWith("Monthly classroom limit")) throw Error("The monthly restaurant request limit has been reached. You can still view photos on Google Maps.");
        throw Error("The photo couldn’t be loaded. Please try again.");
      }
      if (!data?.photoUri) throw Error("This photo is unavailable. Try another photo or open Google Maps.");
      return data.photoUri as string;
    })().catch(error => {
      if (photoRequests.get(name) === request) photoRequests.delete(name);
      throw error;
    });
    photoRequests.set(name, request);
  }
  return photoRequests.get(name)!;
}
