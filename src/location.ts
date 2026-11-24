export type SearchLocation = { lat: number; lng: number; label: string };
export const suggestedLocations: SearchLocation[] = [
 {lat:40.7283,lng:-73.9857,label:"East Village, NYC"},
 {lat:40.6782,lng:-73.9442,label:"Brooklyn, NYC"},
 {lat:37.7749,lng:-122.4194,label:"San Francisco"},
 {lat:51.5074,lng:-0.1278,label:"London"},
 {lat:35.6762,lng:139.6503,label:"Tokyo"},
];
export function validLocation(value: unknown): value is SearchLocation {
 const p=value as SearchLocation | undefined;
 return !!p && typeof p.lat==='number' && Number.isFinite(p.lat) && Math.abs(p.lat)<=90 && typeof p.lng==='number' && Number.isFinite(p.lng) && Math.abs(p.lng)<=180 && typeof p.label==='string' && !!p.label.trim() && p.label.length<=240;
}
export function distanceFrom(a: SearchLocation, b: {lat:number;lng:number}) {
 const rad=Math.PI/180;
 const h=Math.sin((b.lat-a.lat)*rad/2)**2+Math.cos(a.lat*rad)*Math.cos(b.lat*rad)*Math.sin((b.lng-a.lng)*rad/2)**2;
 return Math.round(6371000*2*Math.atan2(Math.sqrt(Math.min(1,h)),Math.sqrt(Math.max(0,1-h))));
}
export function parseLocationResults(data: any): SearchLocation[] {
 if(!Array.isArray(data?.features)) return [];
 return data.features.flatMap((f:any)=>{
  const p=f.properties || {}, coords=f.geometry?.coordinates;
  const street=[p.housenumber,p.street].filter(Boolean).join(' ');
  const label=[...new Set([p.name,street,p.city,p.state,p.country].filter((x):x is string=>typeof x==='string'&&!!x))].join(', ').slice(0,240);
  const result={lat:coords?.[1],lng:coords?.[0],label};
  return validLocation(result)?[result]:[];
 }).slice(0,5);
}
const cache=new Map<string,SearchLocation[]>();
export async function searchLocations(query:string,signal:AbortSignal):Promise<SearchLocation[]> {
 const key=query.trim().toLowerCase();
 if(key.length<2) return [];
 if(cache.has(key)) return cache.get(key)!;
 const endpoint=process.env.EXPO_PUBLIC_GEOCODER_URL || 'https://photon.komoot.io/api/';
 const url=new URL(endpoint);url.searchParams.set('q',query.trim());url.searchParams.set('lang','en');url.searchParams.set('limit','5');
 const response=await fetch(url.toString(),{signal});
 if(!response.ok) throw Error('Location search is unavailable. Try the map or a suggested place.');
 const results=parseLocationResults(await response.json());
 if(cache.size>=30) cache.delete(cache.keys().next().value!);
 cache.set(key,results);return results;
}
