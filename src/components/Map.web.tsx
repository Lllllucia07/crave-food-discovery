import React, { useEffect, useRef, useState } from "react";
import { View, Text } from "react-native";
import type { Map as LeafletMap, Marker } from "leaflet";
import "./leaflet.css";
import { supabase } from "../backend";
import { C, T } from "../theme";
import type { Place } from "../model";

export default function PlaceMap({ places, selected, onSelect }: {
  places: Place[]; selected?: Place; onSelect?: (p: Place) => void;
}) {
  const container = useRef<HTMLDivElement>(null);
  const map = useRef<LeafletMap | null>(null);
  const markers = useRef(new Map<string, Marker>());
  const callback = useRef(onSelect);
  callback.current = onSelect;
  const [error, setError] = useState("");
  useEffect(() => {
    if (supabase || !container.current || !places.length) return;
    let cancelled = false;
    import("leaflet").then((L) => {
      if (cancelled || !container.current) return;
      const instance = L.map(container.current, { scrollWheelZoom: false, zoomControl: false });
      map.current = instance;
      L.control.zoom({ zoomInTitle: "Zoom in", zoomOutTitle: "Zoom out" }).addTo(instance);
      L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap contributors</a>',
      }).on("tileerror", () => setError("Map tiles are unavailable. Your picks are still listed below.")).addTo(instance);
      places.forEach((p, i) => {
        const icon = L.divIcon({ className: "crave-map-pin", html: `<span style="display:flex;width:34px;height:34px;align-items:center;justify-content:center;background:#F15C45;color:white;border:3px solid white;border-radius:50%;font:700 14px system-ui;box-shadow:0 3px 9px #35172844">${i + 1}</span>`, iconSize: [34,34], iconAnchor: [17,17] });
        const content = document.createElement("span");
        content.textContent = p.name;
        const marker = L.marker([p.lat,p.lng], { icon, title:p.name, alt:p.name }).addTo(instance).bindPopup(content);
        marker.on("click", () => callback.current?.(p));
        markers.current.set(p.id, marker);
      });
      instance.fitBounds(L.latLngBounds(places.map(p => [p.lat,p.lng] as [number,number])), { padding:[45,45], maxZoom:16 });
      if (selected) markers.current.get(selected.id)?.openPopup();
    }).catch(() => setError("The map couldn’t load. You can still browse every place below."));
    return () => { cancelled = true; map.current?.remove(); map.current = null; markers.current.clear(); };
  }, [places]);
  useEffect(() => {
    if (!selected || !map.current) return;
    map.current.panTo([selected.lat,selected.lng], { animate:false });
    markers.current.get(selected.id)?.openPopup();
  }, [selected]);
  const p = selected || places[0];
  if (!p) return null;
  return <View style={{ borderRadius:22, overflow:"hidden", backgroundColor:C.pale }}>
    {supabase ? <iframe title={`Google map near ${p.name}`} src={`https://maps.google.com/maps?q=${p.lat},${p.lng}&z=15&output=embed&hl=en`} style={{width:"100%",height:400,border:0}} loading="lazy"/> : <div ref={container} role="region" aria-label="Map of your five nearby picks" style={{height:400,width:"100%",zIndex:0}}/>}
    <Text style={[T.muted,{padding:12,fontSize:13,backgroundColor:"white"}]}>{error || (supabase ? "Restaurant information and map: Google Maps." : "Tap a pin or choose a place below. Map © OpenStreetMap contributors.")}</Text>
  </View>;
}
