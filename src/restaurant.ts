import type { Place, MenuItem, RestaurantReview, Booking } from "./model";
import { cuisineFor } from "./cuisines";
export const isDemo = (p: Place) => p.id.startsWith("demo-");
const descriptions: Record<string, string> = {
  "Chili noodles": "Hand-pulled noodles, chili oil, sesame, and scallions.",
  Dumplings: "Pan-seared vegetable dumplings with a ginger dipping sauce.",
  Broth: "A warming seasonal broth with herbs and greens.",
  Bibimbap: "Rice, seasonal vegetables, a soft egg, and gochujang on the side.",
  "Kimchi pancake": "Crisp kimchi pancake with a soy-sesame dipping sauce.",
  Bulgogi: "Soy-marinated beef with steamed rice and seasonal sides.",
  Tteokbokki: "Chewy rice cakes in a gently sweet, spicy gochujang sauce.",
  Japchae: "Sweet potato glass noodles tossed with vegetables and sesame.",
  "Tofu stew": "Silken tofu, mushrooms, and scallions in a spicy broth.",
  "Pad Thai":
    "Stir-fried rice noodles with tamarind, lime, and crushed peanuts.",
  "Green curry": "Coconut curry with Thai basil, vegetables, and jasmine rice.",
  "Basil pesto pasta":
    "Pasta with basil pesto, toasted pine nuts, and parmesan.",
  Burrata: "Creamy burrata with tomatoes, basil, and toasted sourdough.",
  Tiramisu: "Espresso-soaked sponge with mascarpone and cocoa.",
  "Butter chicken":
    "Roasted chicken in a gently spiced tomato and cream sauce.",
  "Chana masala":
    "Chickpeas simmered with tomatoes, ginger, and warming spices.",
  "Garlic naan": "Tandoor-style flatbread brushed with garlic butter.",
  Margherita: "Tomato, mozzarella, fresh basil, and extra-virgin olive oil.",
  Pepperoni: "Tomato, mozzarella, and crisp pepperoni.",
  "Birria tacos": "Slow-braised beef tacos with a rich dipping broth.",
  Elote: "Roasted corn with lime, cheese, and a little chili.",
  "Mushroom tacos": "Roasted mushrooms, salsa verde, and fresh cilantro.",
  "Salmon roll": "Salmon, cucumber, and seasoned sushi rice.",
  Edamame: "Steamed soybeans finished with sea salt.",
};
export function demoMenu(p: Place): MenuItem[] {
  if (!isDemo(p)) return p.menu || [];
  const cuisine = cuisineFor(p);
  const additions =
    cuisine === "korean"
      ? ["Steamed rice", "Citrus iced tea"]
      : cuisine === "italian"
        ? ["Mixed green salad", "Sparkling lemonade"]
        : ["Seasonal side salad", "House iced tea"];
  return [...p.dishes, ...additions].map((name, i) => ({
    id: `${p.id}-dish-${i}`,
    name,
    description:
      descriptions[name] ||
      (i >= p.dishes.length
        ? i === p.dishes.length
          ? "A fresh side to round out your meal."
          : "A chilled, refreshing finish."
        : `A house-style ${name.toLowerCase()}, prepared to order.`),
    price:
      i >= p.dishes.length
        ? i === p.dishes.length
          ? 6
          : 5
        : p.price * 5 + 4 + i * 2,
    section: i >= p.dishes.length ? "Sides & drinks" : "House favorites",
  }));
}
export function demoReviews(p: Place): RestaurantReview[] {
  if (!isDemo(p)) return p.reviews || [];
  const signature = p.dishes[0] || "signature dish";
  return [
    {
      id: `${p.id}-review-1`,
      author: "Alex M.",
      rating: 5,
      text: `The ${signature.toLowerCase()} was the highlight. Full of flavor, generous portions, and an easy place to settle in with friends.`,
      relativeTime: "2 days ago",
      source: "demo",
    },
    {
      id: `${p.id}-review-2`,
      author: "Jamie L.",
      rating: 4,
      text: "A relaxed neighborhood spot with friendly service. We went early and had a lovely dinner. I would happily come back to try more of the menu.",
      relativeTime: "1 week ago",
      source: "demo",
    },
    {
      id: `${p.id}-review-3`,
      author: "Taylor R.",
      rating: 4,
      text: `Really enjoyed the ${signature.toLowerCase()}. It got busy around dinner, so I would plan ahead for a larger group.`,
      relativeTime: "2 weeks ago",
      source: "demo",
    },
  ];
}
export const timeOptions = [
  "12:00 PM",
  "12:30 PM",
  "1:00 PM",
  "1:30 PM",
  "5:30 PM",
  "6:00 PM",
  "6:30 PM",
  "7:00 PM",
  "7:30 PM",
  "8:00 PM",
  "8:30 PM",
];
export function localDay(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}
export function bookingDays(now = new Date()) {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(now);
    d.setDate(d.getDate() + i + 1);
    return {
      value: localDay(d),
      label: new Intl.DateTimeFormat("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      }).format(d),
    };
  });
}
export function validateBooking(
  p: Place,
  date: string,
  time: string,
  party: number,
  now = new Date(),
) {
  if (!isDemo(p))
    throw Error("Live reservations must be completed with the restaurant.");
  if (!bookingDays(now).some((d) => d.value === date))
    throw Error("Please choose a date in the next seven days.");
  if (!timeOptions.includes(time)) throw Error("Please choose a sample time.");
  if (!Number.isInteger(party) || party < 1 || party > 8)
    throw Error("Please choose a party size from 1 to 8.");
}
export function bookingDateLabel(date: string) {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(new Date(`${date}T12:00:00`));
}
export function externalUrl(value?: string) {
  if (!value) return undefined;
  try {
    const u = new URL(value);
    return ["https:", "http:"].includes(u.protocol) ? u.href : undefined;
  } catch {
    return undefined;
  }
}
