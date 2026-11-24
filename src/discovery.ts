export const radiusOptions = [1000, 3000, 5000, 10000, 25000] as const;
export const DEFAULT_RADIUS = 5000;
export const normalizeRadius = (value: unknown): number => radiusOptions.some(r => r === value) ? value as number : DEFAULT_RADIUS;
export const radiusLabel = (meters: number) => `${meters / 1000} km`;
export const proximity = (meters: number) => meters <= 1000 ? `${Math.max(1, Math.round(meters / 75))} min walk` : `${(meters / 1000).toFixed(1)} km away`;
