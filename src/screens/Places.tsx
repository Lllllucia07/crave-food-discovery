import React, { useState } from "react";
import {
  Pressable,
  ScrollView,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { useEffect } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { C, T } from "../theme";
import { useCrave } from "../store";
import { Button, Empty, Icon } from "../components/UI";
import { bookingDateLabel } from "../restaurant";
import { PlaceCard } from "../components/PlaceCard";
export default function Places() {
  const s = useCrave(),
    router = useRouter(),
    mobile = useWindowDimensions().width < 780,
    [tab, setTab] = useState<"saved" | "loved" | "history" | "bookings">(
      "saved",
    );
  const params = useLocalSearchParams<{ tab?: string }>();
  useEffect(() => {
    if (params.tab === "bookings") setTab("bookings");
  }, [params.tab]);
  const ids =
    tab === "saved"
      ? s.data.saves
      : s.data.logs
          .filter((l) => tab === "history" || l.reaction === "loved")
          .map((l) => l.placeId);
  const list = s.places
    .filter((p) => ids.includes(p.id))
    .sort((a, b) => Number(b.open) - Number(a.open) || a.meters - b.meters);
  return (
    <ScrollView
      contentContainerStyle={{ padding: mobile ? 24 : 48, flexGrow: 1 }}
    >
      <View
        style={{ width: "100%", maxWidth: 900, alignSelf: "center", gap: 24 }}
      >
        <View style={{ gap: 12 }}>
          <Text
            accessibilityRole="header"
            style={[
              T.title,
              { fontSize: mobile ? 38 : 48, lineHeight: mobile ? 44 : 54 },
            ]}
          >
            Good places. Kept close.
          </Text>
          <Text style={[T.body, { color: C.muted }]}>
            Your good finds and your dinner plans, all in one place.
          </Text>
        </View>
        <View
          accessibilityRole="tablist"
          style={{
            flexDirection: "row",
            borderBottomWidth: 1,
            borderColor: C.line,
            gap: 20,
            flexWrap: "wrap",
          }}
        >
          {(
            [
              "saved",
              "bookings",
              ...(s.data.logs.length ? (["loved", "history"] as const) : []),
            ] as const
          ).map((t) => (
            <Pressable
              key={t}
              accessibilityRole="tab"
              accessibilityLabel={
                t === "bookings"
                  ? "My plans"
                  : t === "saved"
                    ? "Saved places"
                    : t === "loved"
                      ? "Loved places"
                      : "Meal history"
              }
              accessibilityState={{ selected: tab === t }}
              onPress={() => setTab(t)}
              style={{
                paddingVertical: 16,
                borderBottomWidth: 2,
                borderColor: tab === t ? C.coral : "transparent",
              }}
            >
              <Text
                style={{
                  fontSize: 15,
                  fontWeight: "600",
                  color: tab === t ? C.coral : C.muted,
                }}
              >
                {t === "bookings"
                  ? `My plans (${(s.data.bookings || []).length})`
                  : t === "saved"
                    ? `Saved (${s.data.saves.length})`
                    : t === "loved"
                      ? `Loved (${s.data.logs.filter((l) => l.reaction === "loved").length})`
                      : "Meal history"}
              </Text>
            </Pressable>
          ))}
        </View>
        {tab === "bookings" ? (
          s.data.bookings?.length ? (
            <View style={{ gap: 16 }}>
              {s.data.bookings.map((b) => (
                <View
                  key={b.id}
                  style={{
                    borderWidth: 1,
                    borderColor: C.line,
                    borderRadius: 20,
                    padding: 22,
                    gap: 14,
                  }}
                >
                  <View
                    style={[
                      T.row,
                      { justifyContent: "space-between", gap: 12 },
                    ]}
                  >
                    <Text style={[T.heading, { fontSize: 25, flex: 1 }]}>
                      {b.placeName}
                    </Text>
                    <Icon name="calendar" color={C.coral} />
                  </View>
                  <Text style={T.body}>
                    {bookingDateLabel(b.date)} · {b.time} · {b.party}{" "}
                    {b.party === 1 ? "guest" : "guests"}
                  </Text>
                  <Text style={[T.muted, { color: C.coral }]}>
                    Demo plan · Not a confirmed reservation
                  </Text>
                  <Text style={T.muted}>
                    Saved on this device. Nothing was sent to the restaurant.
                  </Text>
                  <Button
                    label={`Remove demo plan for ${b.placeName}`}
                    secondary
                    onPress={() => s.cancelBooking(b.id)}
                  />
                </View>
              ))}
            </View>
          ) : (
            <Empty
              title="Something good to look forward to."
              body="Open a restaurant and choose Reserve to try the demo booking flow."
              action={
                <Button
                  label="Find a dinner spot"
                  onPress={() => router.push("/")}
                />
              }
            />
          )
        ) : list.length ? (
          <>
            <View style={[T.row, { justifyContent: "space-between" }]}>
              <Text style={T.muted}>
                {list.length} {list.length === 1 ? "place" : "places"}
              </Text>
              <Text style={T.muted}>Open first · Closest next</Text>
            </View>
            <View>
              {list.map((p) => (
                <View key={p.id}>
                  <PlaceCard place={p} compact />
                  {tab === "history" ? (
                    <Text
                      style={{
                        fontSize: 13,
                        color: C.muted,
                        paddingVertical: 8,
                      }}
                    >
                      {s.data.logs
                        .find((l) => l.placeId === p.id)
                        ?.reaction.toUpperCase()}{" "}
                      ·{" "}
                      {s.data.logs
                        .find((l) => l.placeId === p.id)
                        ?.dishes.join(", ") || "A bite to remember"}
                    </Text>
                  ) : null}
                </View>
              ))}
            </View>
          </>
        ) : (
          <Empty
            title={
              tab === "saved"
                ? "Your next favorite is out there."
                : tab === "loved"
                  ? "Make room for a little love."
                  : "Every bite has a story."
            }
            body={
              tab === "saved"
                ? "Save a place that catches your eye. It’ll be right here when the craving hits."
                : tab === "loved"
                  ? "Places you previously marked Loved will appear here."
                  : "Your previous meal records will appear here."
            }
            action={
              <Button
                label="Find a good bite"
                onPress={() => router.push("/")}
              />
            }
          />
        )}
        <View
          style={[T.row, { gap: 8, marginTop: 20, justifyContent: "center" }]}
        >
          <Icon name="lock" size={14} color={C.muted} />
          <Text style={[T.muted, { fontSize: 12 }]}>
            Your taste is personal. Your places are private.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}
