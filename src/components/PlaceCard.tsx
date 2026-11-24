import { RestaurantPhoto } from "./RestaurantPhoto";
import { GoogleAttribution } from "./GoogleAttribution";
import { proximity } from "../discovery";
import React from "react";
import { Pressable, Text, View } from "react-native";
import { C, T, serif } from "../theme";
import { priceText, walk, type Place } from "../model";
import { useCrave } from "../store";
import { supabase } from "../backend";
import { foodSource } from "../assets";
import { Button, FoodImage, Icon } from "./UI";
import { useDetails } from "./details";
export function Why({ place }: { place: Place }) {
  return (
    <View
      style={{
        flexDirection: "row",
        gap: 10,
        backgroundColor: C.pink,
        borderRadius: 14,
        padding: 16,
      }}
    >
      <Icon name="zap" size={17} color={C.coral} />
      <View style={{ flex: 1, gap: 5 }}>
        <Text
          style={{
            fontSize: 12,
            fontWeight: "700",
            color: C.coral,
            letterSpacing: 0.7,
          }}
        >
          WHY THIS BITE
        </Text>
        <Text style={{ fontSize: 15, lineHeight: 22, color: C.ink }}>
          {place.reason ||
            `${place.cuisine} · ${priceText(place)} · ${proximity(place.meters)}`}
        </Text>
      </View>
    </View>
  );
}
export function PlaceCard({
  place,
  number,
  onSkip,
  compact = false,
}: {
  place: Place;
  number?: string;
  onSkip?: () => void;
  compact?: boolean;
}) {
  const s = useCrave(),
    details = useDetails(),
    saved = s.data.saves.includes(place.id);
  if (compact)
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`View ${place.name}`}
        onPress={() => details(place)}
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingVertical: 20,
          borderBottomWidth: 1,
          borderColor: C.line,
          gap: 18,
        }}
      >
        <RestaurantPhoto
          place={place}
          compact
          style={{ width: 88, height: 88, borderRadius: 16 }}
        />
        <View style={{ flex: 1, gap: 7 }}>
          <Text
            style={{
              fontFamily: serif,
              fontSize: 23,
              fontWeight: "600",
              color: C.ink,
            }}
          >
            {place.name}
          </Text>
          <Text style={T.muted}>{place.cuisine}</Text>
          <Text style={{ fontSize: 13, color: C.muted }}>
            {priceText(place)} · {proximity(place.meters)} ·{" "}
            {supabase ? "Hours in details" : "Demo · Open"}
          </Text>
          {!place.id.startsWith("demo-") ? <GoogleAttribution/> : null}
        </View>
        <Icon name="chevron-right" color={C.muted} />
      </Pressable>
    );
  return (
    <View
      style={{
        backgroundColor: "white",
        borderRadius: 24,
        borderWidth: 1,
        borderColor: C.line,
        overflow: "hidden",
        boxShadow: "0px 8px 32px #35172809",
      }}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`View ${place.name}`}
        onPress={() => details(place)}
      >
        <RestaurantPhoto
          place={place}
          style={{ height: 310 }}
        />
        {number ? (
          <View
            style={{
              position: "absolute",
              right: 18,
              top: 18,
              backgroundColor: "#351728BF",
              paddingHorizontal: 13,
              paddingVertical: 7,
              borderRadius: 20,
            }}
          >
            <Text style={{ color: "white", fontSize: 13, fontWeight: "600" }}>
              {number}
            </Text>
          </View>
        ) : null}
      </Pressable>
      <View style={{ padding: 24, gap: 17 }}>
        <View style={{ gap: 7 }}>
          <Text
            style={{
              fontFamily: serif,
              fontSize: 32,
              fontWeight: "600",
              color: C.ink,
            }}
          >
            {place.name}
          </Text>
          <Text style={T.muted}>
            {place.cuisine} · {priceText(place)} · {proximity(place.meters)}
          </Text>
        </View>
        <View style={[T.row, { justifyContent: "space-between", gap: 12 }]}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Read reviews for ${place.name}`}
            onPress={() => details(place, "reviews")}
            style={[T.row, { gap: 6, minHeight: 44 }]}
          >
            <Icon name="star" size={15} color={C.coral} />
            <Text style={{ fontSize: 14, color: C.ink, fontWeight: "600" }}>
              {place.count > 0 ? place.rating.toFixed(1) : "Not rated yet"}
            </Text>
            <Text style={T.muted}>
              {place.id.startsWith("demo-") ? "Sample reviews" : "Reviews"}
            </Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Reserve ${place.name}`}
            onPress={() => details(place, "reserve")}
            style={[T.row, { gap: 6, minHeight: 44 }]}
          >
            <Icon name="calendar" size={15} color={C.coral} />
            <Text style={{ fontSize: 14, color: C.coral, fontWeight: "600" }}>
              Reserve
            </Text>
          </Pressable>
        </View>
        {!place.id.startsWith("demo-") ? <GoogleAttribution/> : null}
        <Why place={place} />
        <View style={{ flexDirection: "row", gap: 10 }}>
          {onSkip ? (
            <Button
              label="Skip"
              secondary
              onPress={onSkip}
              style={{ flex: 1, paddingHorizontal: 10 }}
            />
          ) : null}
          <Button
            label={saved ? "Saved" : "Save"}
            icon={saved ? "check" : "bookmark"}
            onPress={() => s.save(place)}
            style={{ flex: 1, paddingHorizontal: 10 }}
          />
          <Button
            label="Details"
            secondary
            onPress={() => details(place)}
            style={{ flex: 1, paddingHorizontal: 10 }}
          />
        </View>
      </View>
    </View>
  );
}
