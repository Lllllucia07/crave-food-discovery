# Visual implementation reference

Reference: ../concept-english.png. All interface copy is English. Chat communication with the owner is Chinese.

White canvas, deep aubergine text #351728, coral actions #F15C45, blush task surface #FFF2F2. Editorial Georgia headings with system sans-serif controls. Desktop main layout is 46% craving selection / 54% untinted food imagery, a 3x4 emoji grid, and a floating white place card. Mobile uses the same three-column grid and switches navigation to the bottom; decorative hero imagery is omitted to prioritize the task. 16px body, 14–16px normal labels, 44px+ touch targets, 14px button radius, 18px tile radius, 24px card radius. Feather outline icons. Selection checks and a selected-count note are functional additions.

Allowed first-screen text: crave, East Village NYC, Discover, Tonight, My places, Good food. Your mood., Pick up to 3 cravings. Find your next great bite., the twelve craving labels, Find my next bite, Exploring East Village · Demo neighborhood, Noodle House, Hand-pulled noodles · 6 min walk. The demo-data and device-persistence disclosures are required functional additions. No invented marketing metrics, social feed, or rank scores.

Built-in ImageGen supplied the English UI concept and standalone noodle photograph. The hero prompt requested a portrait editorial photograph of spicy hand-pulled noodles, bok choy, scallions, jammy egg, chopsticks, and steam in warm restaurant light, without text or branding. Source assets are kept in the app.

The generated mobile icon is a single white editorial lowercase c on coral; assets/icon.png is the app icon, and assets/favicon.png is its web derivative.

## Fidelity verification

The English combined desktop/mobile concept was compared with the actual desktop screenshot using view_image. Desktop test size: 1440x1000; the combined reference board is 1487x1058, so each app surface is checked separately. Five inspected points: the exact two-line heading and main CTA; the 46/54 split; white/aubergine/coral/blush palette; editorial serif vs sans-serif hierarchy; and the three-column twelve-tile grid with the un-tinted hero and floating place card. Selection checks, demo disclosures, and the disabled-empty-selection button are intentional functional additions. Search/profile buttons from the generated concept are omitted because the MVP requires neither search nor a pre-value account wall. Emoji rendering follows the platform font. The central food asset was generated separately with the matching composition. No other material mismatch remains in the desktop composition. The mobile view omits the decorative hero and uses bottom navigation.

The in-app browser was used for QA. Early development hot-reload errors were resolved by moving final verification to the production export. Custom SDK 58 HTML includes all server document asset nodes. Google cache behavior follows current provider restrictions rather than the plan’s proposed unlimited cache. Demo maps use Leaflet with explicitly English controls and multiple pins; live Google embeds request English.

## Requested revision: cuisines, restaurant research, and reservations

The new homepage adds cuisine chips above the optional craving grid, following the existing palette, spacing, borders, and button families. Wide desktop craving tiles use a compact horizontal variant so the new filters and primary action fit more comfortably. Detail sheets use Overview / Menu / Reviews / Reserve tabs. Sample menus include prices and descriptions; sample reviews are labeled fictional. The reservation form stores a clearly labeled local demo plan, never a claim of a confirmed table. The private personal-feedback UI has been removed; existing history remains available. This revision supersedes the original first-screen copy inventory wherever the user-requested additions require new labels. No redesign or new raster assets were needed.

## Multi-selection revision
Cuisine and Set the mood are both checkbox groups. Each requires at least one selected option before discovery; neither imposes a selection-count cap. The former Any cuisine control is removed; users can select all ten cuisines explicitly. Old single-cuisine preferences migrate to an array. Selected cuisines are combined with OR semantics, and all selected moods contribute to scoring.

## Optional selection revision
Both checkbox groups now allow zero or more selections without a count limit. No cuisines selected means unrestricted cuisine; no moods selected means contextual default scoring. Both groups can be empty and the primary action remains enabled. This supersedes the previous minimum-one rule.
