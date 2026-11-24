// Native resolves this implementation; web resolves Map.web.tsx.
import React from "react";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import type { Place } from "../model";
export default function PlaceMap({
  places,
  selected,
  onSelect,
}: {
  places: Place[];
  selected?: Place;
  onSelect?: (p: Place) => void;
}) {
  const p = selected || places[0];
  if (!p) return null;
  return (
    <MapView
      provider={PROVIDER_GOOGLE}
      style={{ height: 430, borderRadius: 22 }}
      region={{
        latitude: p.lat,
        longitude: p.lng,
        latitudeDelta: Math.max(.018, ...places.map(x => Math.abs(x.lat - p.lat) * 2.4)),
        longitudeDelta: Math.max(.018, ...places.map(x => Math.abs(x.lng - p.lng) * 2.4)),
      }}
    >
      {places.map((place) => (
        <Marker
          key={place.id}
          coordinate={{ latitude: place.lat, longitude: place.lng }}
          title={place.name}
          pinColor="#F15C45"
          onPress={() => onSelect?.(place)}
        />
      ))}
    </MapView>
  );
}
