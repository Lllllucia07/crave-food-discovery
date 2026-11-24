import { normalizeRadius, proximity } from "../../../src/discovery.ts";
import { cuisines, normalizeCuisineSelection } from "../../../src/cuisines.ts";
import {
  authorize,
  coordinates,
  cors,
  googleFields,
  json,
  normalize,
} from "../_shared/core.ts";
Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);
  try {
    const { client, user } = await authorize(req),
      body = await req.json(),
      { lat, lng } = coordinates(body);
    const searchRadius = normalizeRadius(body.searchRadius);
    const selectedCuisines = normalizeCuisineSelection(
      body.cuisines,
      body.cuisine,
    );
    // Only discovery consumes the daily search allowance. Every Google request
    // (including photos/details) still consumes the atomic global monthly budget.
    if (typeof body.photoName !== "string" && typeof body.detailId !== "string" && !Array.isArray(body.ids)) {
      const { data: allowed, error: quotaError } = await client.rpc("consume_places_quota");
      if (quotaError) throw quotaError;
      if (!allowed) return json({error:"Daily discovery limit reached. Please come back tomorrow."},429);
    }
    const key = Deno.env.get("GOOGLE_PLACES_API_KEY");
    if (!key)
      return json(
        { error: "The restaurant service is not connected yet." },
        503,
      );
    const admin = (await import("npm:@supabase/supabase-js@2")).createClient(
      Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );
    async function charge(count: number) {
      if (!count) return;
      const { data, error } = await admin.rpc("consume_google_quota", { amount: count });
      if (error) throw error;
      if (!data) throw Error("Monthly classroom limit reached. Restaurant requests are paused until next month.");
    }
    if (typeof body.photoName === "string") {
      const match = /^places\/([A-Za-z0-9_-]+)\/photos\/([A-Za-z0-9_-]+)$/.exec(body.photoName);
      if (!match || body.photoName.length > 4096) return json({ error: "Invalid photo." }, 400);
      const { data: known, error } = await client.from("places").select("id").eq("id", match[1]).maybeSingle();
      if (error || !known) return json({ error: "Restaurant not found." }, 404);
      await charge(1);
      const r = await fetch(`https://places.googleapis.com/v1/${body.photoName}/media?maxWidthPx=900&skipHttpRedirect=true`, {
        headers: { "X-Goog-Api-Key": key }, signal: AbortSignal.timeout(8000),
      });
      if (!r.ok) return json({ error: "Photo unavailable." }, 502);
      const photo = await r.json();
      const uri = new URL(photo.photoUri);
      if (uri.protocol !== "https:" || !(uri.hostname.endsWith(".googleusercontent.com") || uri.hostname.endsWith(".ggpht.com"))) return json({ error: "Photo unavailable." }, 502);
      return json({ photoUri: uri.href });
    }
    let raw: any[] = [];
    if (typeof body.detailId === "string") {
      const { data: known, error: lookupError } = await client
        .from("places")
        .select("id")
        .eq("id", body.detailId)
        .maybeSingle();
      if (lookupError) throw lookupError;
      if (!known) return json({ error: "Restaurant not found." }, 404);
      await charge(1);
      const r = await fetch(
        `https://places.googleapis.com/v1/places/${encodeURIComponent(body.detailId)}?languageCode=en`,
        {
          headers: {
            "X-Goog-Api-Key": key,
            "X-Goog-FieldMask": googleFields + ",websiteUri,reviews",
          },
          signal: AbortSignal.timeout(8000),
        },
      );
      if (!r.ok)
        return json({ error: "Could not load restaurant details." }, 502);
      raw = [await r.json()];
    } else if (Array.isArray(body.ids)) {
      const ids = body.ids
        .filter((x: unknown) => typeof x === "string")
        .slice(0, 20);
      const [saves, logs] = await Promise.all([
        client.from("saves").select("place_id").eq("user_id", user.id),
        client.from("logs").select("place_id").eq("user_id", user.id),
      ]);
      if (saves.error || logs.error) throw Error("Could not load your places.");
      const owned = new Set(
        [...(saves.data || []), ...(logs.data || [])].map((x) => x.place_id),
      );
      const ownedIds = ids.filter((id: string) => owned.has(id));
      await charge(ownedIds.length);
      const responses = await Promise.all(
        ownedIds
          .map((id: string) =>
            fetch(
              `https://places.googleapis.com/v1/places/${encodeURIComponent(id)}?languageCode=en`,
              {
                headers: {
                  "X-Goog-Api-Key": key,
                  "X-Goog-FieldMask": googleFields,
                },
                signal: AbortSignal.timeout(8000),
              },
            ),
          ),
      );
      for (const r of responses) {
        if (!r.ok) throw Error("Could not refresh your saved places.");
        raw.push(await r.json());
      }
    } else {
      await charge(1);
      const r = await fetch(
        "https://places.googleapis.com/v1/places:searchNearby",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Goog-Api-Key": key,
            "X-Goog-FieldMask": googleFields
              .split(",")
              .map((f) => "places." + f)
              .join(","),
          },
          body: JSON.stringify({
            includedTypes: selectedCuisines.length
              ? cuisines
                  .filter((c) => selectedCuisines.includes(c.id))
                  .map((c) => c.googleType)
              : ["restaurant"],
            languageCode: "en",
            maxResultCount: 20,
            rankPreference: "DISTANCE",
            locationRestriction: {
              circle: {
                center: { latitude: lat, longitude: lng },
                radius: searchRadius,
              },
            },
          }),
          signal: AbortSignal.timeout(8000),
        },
      );
      if (!r.ok)
        return json(
          { error: "The restaurant service is temporarily unavailable." },
          502,
        );
      raw = (await r.json()).places || [];
    }
    const places = raw
      .filter((p) => p.id && p.location)
      .map((p) => normalize(p, lat, lng));
    // Verified menu/booking links are supplied by the operator, never guessed from a place name.
    let links: Record<string, { menuUrl?: string; reservationUrl?: string }> =
      {};
    try {
      links = JSON.parse(Deno.env.get("RESTAURANT_LINKS_JSON") || "{}");
    } catch {
      links = {};
    }
    const safe = (value: unknown) => {
      if (typeof value !== "string") return undefined;
      try {
        const u = new URL(value);
        return u.protocol === "https:" ? u.href : undefined;
      } catch {
        return undefined;
      }
    };
    const enriched = places.map((p) => ({
      ...p,
      menuUrl: safe(links[p.id]?.menuUrl),
      reservationUrl: safe(links[p.id]?.reservationUrl),
    }));
    // Persist exempt place IDs only; no Google names, ratings, hours, or photos.
    if (places.length) {
      const { error } = await admin.from("places").upsert(
        places.map((p) => ({
          id: p.id,
          google_place_id: p.id,
          source: "google",
        })),
      );
      if (error) throw error;
    }
    return json({ places: enriched, attribution: "Google Maps" });
  } catch (e) {
    if (e instanceof Error && e.message.startsWith("Monthly classroom limit")) return json({ error: e.message }, 429);
    return json(
      {
        error:
          e instanceof Error && e.message === "Unauthorized"
            ? "Unauthorized"
            : "Could not load places. Please try again.",
      },
      e instanceof Error && e.message === "Unauthorized" ? 401 : 400,
    );
  }
});
