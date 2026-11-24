# Crave

An English-only, craving-first food discovery MVP built with Expo SDK 58, React Native, Expo Router, and TypeScript. Web preview and a shared iOS/Android source tree are included.

## Run

Requires Node 22+ and pnpm.

```sh
pnpm install
pnpm web
pnpm typecheck
pnpm build
```

The default app is a fully interactive, clearly labeled **demo**. No account or API key is needed. All twenty restaurants are fictional; hours, addresses, distances, and dishes are samples. Hero food photography was generated with the built-in ImageGen tool. Other illustrative food photographs are served by Unsplash. Missing images have an accessible fallback.

## Implemented

- 28 cuisine categories and 30 mood options. Both groups are optional and allow zero or more selections without a selection-count cap. Empty cuisine selection searches all restaurants; empty mood selection uses contextual default scoring. Both empty still produces recommendations. No login wall.
- Up to five explained recommendations, strictly filtered to any of the selected cuisines and weighted by craving match, walking distance, Bayesian quality, affinity, and novelty.
- Swipe right to save, left to skip; explicit buttons and direct card selection are also available.
- Card, list, and map views; multiple map pins and place selection on web and mobile.
- Restaurant detail tabs: Overview, Menu, Reviews, Reserve. Sample menus include dishes, descriptions, sections, and USD prices. Sample reviews include authors, ratings, and review text; each is clearly labeled fictional.
- Saved / My plans, with existing Loved / Meal history retained only for users with previous logs; open-first, distance-second ordering. The How was your bite? section and its feedback controls have been removed. Existing records are preserved.
- Tonight Mode: one pick plus a backup, using the chosen cuisine, time, distance, and any previously stored feedback.
- Demo reservation form: party size 1–8, the next seven dates, sample time options, a device-persisted plan, and removal from My plans. The receipt explicitly states that no restaurant was contacted and no table was reserved.
- Device persistence, empty/error/loading states, keyboard labels, English document metadata.
- Optional Supabase anonymous sessions and Apple/Google identity linking after the third save. The demo explains device-only persistence instead of pretending sign-in is connected.
- Supabase migration with PostGIS, user-scoped RLS, transactional preference updates, SQL ranking, and per-user daily discovery limits; two Edge Functions.

## Connect live services

The app is now configured with a live Supabase project and Google Places API (New). Nearby restaurant search, ranking, rating/review counts and attributed written reviews have passed live API tests. Without public Supabase build configuration, source checkouts still run the explicitly labeled demo.

1. Create a Supabase project and enable anonymous sign-ins. Apple/Google OAuth and manual identity linking are optional and are not configured for this coursework deployment. If you add them later, register your deployed web `/auth/callback` URL and `crave://auth/callback` as redirect URLs.
2. For a fresh project, apply all three files in `supabase/migrations/` in timestamp order. The existing hosted project was bootstrapped through SQL Editor; follow BOOTSTRAP-NOTES.md before using CLI migrations on it.
3. Enable Google Places API (New) in Google Cloud. Restrict the server key, configure per-API quotas and budget alerts, and set `GOOGLE_PLACES_API_KEY` as a Supabase Edge secret. Never put it in an `EXPO_PUBLIC_` value.
4. Deploy `fetch-places` and `recommend` with the Supabase CLI. The function runtime supplies Supabase URL, anon key, and service-role key. Only the server uses the service-role key.
5. Copy `.env.example` to `.env.local`, set the public Supabase URL and publishable key, and restart/rebuild Expo. Configure equivalent build environment values for hosted/native builds. Demo mode is chosen only when these values are absent; API failures in live mode show errors rather than silently fabricating results.
6. Complete service smoke tests: anonymous auth, RLS isolation between two users, nearby fetch, device-location denial/fallback, save/log restoration, account linking without changing user ID, and API quota behavior. These require your service accounts.

### Provider-specific adjustments to the plan

The plan’s proposed indefinite Google cache is not implemented. Only exempt Google place IDs are persisted. Names, ratings, hours, and other Google content remain request/session data and are fetched again. The open-now/rating/price field mask invokes higher-priced Places SKUs; check your Cloud billing before switching on live traffic. See [Google Places policies](https://developers.google.com/maps/documentation/places/web-service/policies), [field/SKU documentation](https://developers.google.com/maps/documentation/places/web-service/data-fields), and [Expo SDK 58 static rendering](https://docs.expo.dev/router/web/static-rendering/).

Live Google results use Google maps rather than displaying them on an OpenStreetMap base. Demo maps use Leaflet with English controls and OpenStreetMap tiles and attribution. Live cards load one image per visible restaurant through an authenticated Edge Function. Restaurant details include a gallery of up to 10 Google-provided photos, loading only the selected photo; Menu links to this gallery and the Google Maps photo collection without claiming every photo is a menu. Photo requests share the global monthly 500-request cap. Temporary Google photo URLs are held in session memory only; required author credits appear beside each image. Missing photos use a neutral placeholder. Google price ranges are displayed per person when available, otherwise a descriptive price tier appears; absent prices are not guessed. Live reviews are fetched on demand when opening restaurant details, with author and source links and Google Maps attribution. The detail field mask requests `reviews` and `websiteUri`, so review details can use a higher-priced Places SKU. Reviews are not written to the database or device storage.

Google Places does not supply a complete structured restaurant menu or a universal booking endpoint. Supply verified menu/booking links through the server-only `RESTAURANT_LINKS_JSON` secret, a JSON object keyed by Google place ID with optional `menuUrl` and `reservationUrl` HTTPS values. Without those links, the app offers the official restaurant website when available and clearly states that a booking must be confirmed there. Example shape: `{ "GOOGLE_PLACE_ID": { "menuUrl": "https://restaurant.example/menu", "reservationUrl": "https://restaurant.example/reservations" } }`. These example URLs are documentation only and are not configured or used by the app.

Live-service acceptance checks also need to cover cuisine-specific search, review attribution and source links, empty reviews/menus, verified website/menu/booking links, and external-provider booking confirmation. Demo bookings are device-local preview records and are never submitted to a restaurant, Supabase booking table, or reservation partner.

Recommendation explanations currently use the deterministic template fallback. A model-generated wording layer, PostHog/Sentry account integrations, a thousand-restaurant dataset, survey results, and recorded rehearsals are not shipped. They do not block the demo’s core discovery flow.

## Native builds

```sh
pnpm exec expo start
pnpm dlx eas-cli build --profile preview --platform android
pnpm dlx eas-cli build --profile preview --platform ios
```

For development builds, install `expo-dev-client` with `expo install` and use the development profile. EAS login/project setup, signing credentials, and real-device verification are still required. Native Google Maps needs platform-specific Maps SDK keys and the react-native-maps config plugin. Configure those keys through build secrets before building; the Places server key is separate. No IPA/APK, TestFlight upload, or app-store release is claimed by this delivery.

## Source map

`app/` contains routes. `src/screens/` contains the four main product screens. `src/components/` contains the shared shell, place card, sheets and platform-specific maps. `src/model.ts` contains sample data and local scoring. `src/cuisines.ts` is the shared cuisine vocabulary and matcher; `src/restaurant.ts` holds demo menu/review content and reservation validation. `src/store.tsx` persists device state. `src/backend.ts` contains the live-service adapter. `supabase/` contains the server integration.

The Site identity is retained in `.openai/hosting.json`; do not create a second Site for this project.

## Expanded discovery

28 cuisines and 30 optional moods support zero or more selections with no count limit. Searchable pickers keep the home screen compact. Radius options are 1, 3, 5, 10 and 25 km (straight-line, default 5 km), stored on the device and applied to demo ranking and both live Edge Functions. The demo contains 38 fictional places with distances up to 22 km. Nearby Search still returns at most 20 candidates per request; a wider radius does not guarantee more results in a dense area.

Apply `supabase/migrations/202611230002_discovery_radius.sql` after the initial migration and before deploying the updated Edge Functions. The migration replaces the former three-argument ranking RPC with a radius-aware four-argument function. Live service and native-device acceptance tests remain necessary. Cuisine types follow [Google’s current Place Types](https://developers.google.com/maps/documentation/places/web-service/place-types).

## Location selection

The location sheet supports foreground GPS (only after pressing Use my location), manual city/neighborhood/address search, suggested places, and map tap/drag selection. Changes are drafts until Use this location. The search center persists in device storage and invalidates previous results. Demo restaurant coordinates remain in NYC; distances are recomputed from the chosen center, so distant cities correctly have no demo results.

Search uses the public Photon demo API on explicit submission, with a 12-second timeout, cancellation and a small in-memory query cache. No GPS coordinates are sent to geocoding. Results request English names. Set EXPO_PUBLIC_GEOCODER_URL to a compatible Photon endpoint for production capacity; the public demo has no availability guarantee ([Photon documentation](https://github.com/komoot/photon)). Web map picking uses OpenStreetMap tiles; native uses the platform map. Attribution is shown. Browser permission denial, offline map/search fallback, native-device GPS, and live restaurant service need environment-specific acceptance checks.

## Classroom Google request cap

Apply all three migrations, including `20261123224431_google_classroom_limits.sql`. It adds explicit Data API grants for new projects plus a service-only atomic budget of 500 outbound Google requests per UTC calendar month across all users. The limit counts requests before contacting Google, including every requested saved-place detail, so failures may also consume allowance. Per-user daily request limiting remains active. The cap applies to this app, not other projects sharing a Google billing account, and does not guarantee an overall zero bill. Both functions authenticate the user JWT in code; `verify_jwt=false` disables only the legacy gateway verification layer. Use a public publishable key for the frontend. Google/admin keys remain server-only. See `supabase/BOOTSTRAP-NOTES.md` for the current hosted-project state.

Live restaurant cards/details show the official unmodified Google Maps attribution logo, obtained from https://developers.google.com/static/maps/documentation/images/Google_Maps_Attribution_Assets.zip. Ratings/reviews are fetched from Google at request time; none are written to device or database storage. Optional OAuth account-link prompts are disabled unless EXPO_PUBLIC_ACCOUNT_LINKING_ENABLED=true. Anonymous sessions persist per device.

Daily search limits count discoveries only. Photo/detail/restore requests retain authenticated access and the shared monthly 500-request hard cap. Photo loading, errors and retry are explicit; failed promises are not cached.
