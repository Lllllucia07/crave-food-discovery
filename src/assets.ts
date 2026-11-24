export const hero = require("../assets/noodles.jpg");
export function foodSource(p: { id: string; image: string }) {
  return ["demo-1", "demo-9", "demo-12"].includes(p.id) ? hero : p.image;
}
