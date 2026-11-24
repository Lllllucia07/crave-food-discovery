export type PriceRange = { start: number; end?: number; currency: string };
export function formatPrice(p: { price: number; priceRange?: PriceRange }) {
  const r = p.priceRange;
  if (r && Number.isFinite(r.start) && r.start >= 0) {
    const money = (v: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: r.currency, maximumFractionDigits: 2 }).format(v);
    return `${money(r.start)}${r.end !== undefined && Number.isFinite(r.end) ? `–${money(r.end)}` : '+'} per person`;
  }
  return ['Price unavailable', 'Budget-friendly', 'Moderate price', 'Higher price', 'Premium price'][p.price] || 'Price unavailable';
}
