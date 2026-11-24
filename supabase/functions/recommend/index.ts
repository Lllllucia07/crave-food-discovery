import { normalizeRadius, proximity } from "../../../src/discovery.ts";
import {
  cuisineFor,
  normalizeCuisineSelection,
} from "../../../src/cuisines.ts";
import { authorize, cors, json, tagIds } from "../_shared/core.ts";
Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);
  try {
    const { client } = await authorize(req),
      body = await req.json();
    if (!Array.isArray(body.candidates) || body.candidates.length > 20)
      return json({ error: "Expected up to 20 nearby candidates." }, 400);
    const tags = Array.isArray(body.tags)
      ? [
          ...new Set(
            body.tags.filter(
              (t: unknown) => typeof t === "string" && tagIds.includes(t),
            ),
          ),
        ]
      : [];
    const searchRadius = normalizeRadius(body.searchRadius);
    const selectedCuisines = normalizeCuisineSelection(
      body.cuisines,
      body.cuisine,
    );
    const candidates = body.candidates.filter(
      (p: any) =>
        (!selectedCuisines.length ||
          selectedCuisines.includes(cuisineFor(p))) &&
        typeof p.id === "string" &&
        typeof p.name === "string" &&
        Array.isArray(p.tags) &&
        typeof p.meters === "number" &&
        Number.isFinite(p.meters) &&
        p.meters >= 0 &&
        p.meters <= searchRadius &&
        typeof p.rating === "number" &&
        p.rating >= 0 &&
        p.rating <= 5 &&
        typeof p.count === "number" &&
        p.count >= 0 &&
        typeof p.open === "boolean",
    );
    const hour =
      Number.isInteger(body.hour) && body.hour >= 0 && body.hour < 24
        ? body.hour
        : 18;
    const { data, error } = await client.rpc("rank_candidates", {
      candidates,
      selected_tags: tags,
      context_hour: hour,
      search_radius: searchRadius,
    });
    if (error) throw error;
    const places = (data || []).map(({ place: p, score }: any) => ({
      ...p,
      score,
      reason: `${tags.filter((t) => p.tags.includes(t)).join(" + ") || p.cuisine} · ${"$".repeat(Math.max(1, Math.min(p.price || 2, 4)))} · ${proximity(p.meters)}`,
    }));
    // Template reasons are deterministic and never wait for a language-model API.
    return json({ places });
  } catch (e) {
    return json(
      {
        error:
          e instanceof Error && e.message === "Unauthorized"
            ? "Unauthorized"
            : "Could not recommend places. Please try again.",
      },
      e instanceof Error && e.message === "Unauthorized" ? 401 : 400,
    );
  }
});
