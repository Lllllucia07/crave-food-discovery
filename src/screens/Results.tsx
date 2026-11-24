import { radiusLabel } from "../discovery";
import React, { useEffect, useRef, useState } from "react";
import {
  PanResponder,
  Pressable,
  ScrollView,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { useRouter } from "expo-router";
import { useCrave } from "../store";
import { C, T } from "../theme";
import { Button, Empty, Icon } from "../components/UI";
import { PlaceCard } from "../components/PlaceCard";
import PlaceMap from "../components/Map";
import type { Place } from "../model";
import { supabase } from "../backend";
export default function Results() {
  const s = useCrave(),
    router = useRouter(),
    mobile = useWindowDimensions().width < 780;
  const [mode, setMode] = useState<"cards" | "list" | "map">("cards"),
    [index, setIndex] = useState(0),
    [pin, setPin] = useState<Place>();
  useEffect(() => {
    setIndex(0);
  }, [s.results]);
  const current = s.results[index];
  const gesture = PanResponder.create({
    onMoveShouldSetPanResponder: (_, g) =>
      Math.abs(g.dx) > 25 && Math.abs(g.dy) < 35,
    onPanResponderRelease: (_, g) => {
      if (g.dx > 75 && current) {
        s.save(current);
        setIndex((i) => i + 1);
      } else if (g.dx < -75) setIndex((i) => i + 1);
    },
  });
  return (
    <ScrollView
      contentContainerStyle={{
        padding: mobile ? 24 : 40,
        paddingTop: mobile ? 26 : 40,
        flexGrow: 1,
      }}
    >
      <View
        style={{ width: "100%", maxWidth: 1060, alignSelf: "center", gap: 24 }}
      >
        <View style={{ gap: 12 }}>
          <Pressable
            accessibilityRole="link"
            accessibilityLabel="Edit cravings"
            onPress={() => router.push("/")}
            style={[T.row, { gap: 7, alignSelf: "flex-start" }]}
          >
            <Icon name="sliders" color={C.muted} size={16} />
            <Text style={T.muted}>Edit cravings</Text>
          </Pressable>
          <View
            style={{
              flexDirection: mobile ? "column" : "row",
              alignItems: mobile ? "flex-start" : "center",
              justifyContent: "space-between",
              gap: 20,
            }}
          >
            <View style={{ gap: 9 }}>
              <Text
                accessibilityRole="header"
                style={[
                  T.title,
                  { fontSize: mobile ? 36 : 46, lineHeight: mobile ? 42 : 52 },
                ]}
              >
                Your next great bite.
              </Text>
              <Text style={T.body}>
                {s.results.length} {s.results.length === 1 ? "pick" : "picks"} within {radiusLabel(s.data.searchRadius)}. A very good feeling.
              </Text>
            </View>
            <View
              accessibilityRole="tablist"
              style={{
                flexDirection: "row",
                backgroundColor: C.pale,
                padding: 5,
                borderRadius: 14,
              }}
            >
              {(["cards", "list", "map"] as const).map((m) => (
                <Pressable
                  key={m}
                  accessibilityRole="tab"
                  accessibilityLabel={`${m[0].toUpperCase() + m.slice(1)} view`}
                  accessibilityState={{ selected: mode === m }}
                  onPress={() => setMode(m)}
                  style={[
                    T.row,
                    {
                      paddingHorizontal: 16,
                      paddingVertical: 10,
                      gap: 7,
                      borderRadius: 10,
                      backgroundColor: mode === m ? "white" : "transparent",
                    },
                  ]}
                >
                  <Icon
                    name={
                      m === "map" ? "map" : m === "list" ? "list" : "layers"
                    }
                    size={16}
                    color={mode === m ? C.coral : C.muted}
                  />
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: "600",
                      color: mode === m ? C.ink : C.muted,
                    }}
                  >
                    {m[0].toUpperCase() + m.slice(1)}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        </View>
        {!s.results.length ? (
          <Empty
            title="No bites in this area yet."
            body="Try a wider search radius or different cuisines. Moods are always optional."
            action={
              <Button
                label="Adjust search"
                onPress={() => router.push("/")}
              />
            }
          />
        ) : mode === "cards" ? (
          <View
            style={{
              maxWidth: 600,
              width: "100%",
              alignSelf: "center",
              gap: 20,
            }}
          >
            {current ? (
              <View {...gesture.panHandlers}>
                <PlaceCard
                  place={current}
                  number={`${index + 1} / ${s.results.length}`}
                  onSkip={() => setIndex((i) => i + 1)}
                />
              </View>
            ) : (
              <Empty
                title="That’s your five."
                body="Your next favorite might already be in your saved places. You can also take another look."
                action={
                  <Button label="See picks again" onPress={() => setIndex(0)} />
                }
              />
            )}
            <View
              style={{ flexDirection: "row", justifyContent: "center", gap: 8 }}
            >
              {s.results.map((p, i) => (
                <Pressable
                  key={p.id}
                  accessibilityRole="button"
                  accessibilityLabel={`Show pick ${i + 1}`}
                  onPress={() => setIndex(i)}
                  style={{
                    width: 30,
                    height: 30,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <View
                    style={{
                      width: index === i ? 24 : 7,
                      height: 7,
                      borderRadius: 5,
                      backgroundColor: index === i ? C.coral : C.line,
                    }}
                  />
                </Pressable>
              ))}
            </View>
            <Text style={[T.muted, { textAlign: "center" }]}>
              Swipe right to save. Left to keep exploring.
            </Text>
          </View>
        ) : (
          <View style={{ maxWidth: 850, width: "100%", alignSelf: "center" }}>
            {mode === "map" ? (
              <PlaceMap places={s.results} selected={pin} onSelect={setPin} />
            ) : null}
            {s.results.map((p) =>
              mode === "map" ? (
                <View key={p.id}>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`Show ${p.name} on map`}
                    onPress={() => setPin(p)}
                    style={{
                      backgroundColor:
                        pin?.id === p.id ? C.pink : "transparent",
                      padding: 12,
                      borderRadius: 12,
                      marginTop: 10,
                    }}
                  >
                    <Text style={T.label}>
                      {p.name} · {Math.round(p.meters)} m
                    </Text>
                  </Pressable>
                  <PlaceCard place={p} compact />
                </View>
              ) : (
                <PlaceCard key={p.id} place={p} compact />
              ),
            )}
          </View>
        )}
        <Text style={[T.muted, { textAlign: "center", fontSize: 12 }]}>
          {supabase
            ? "Hours can change. Check with the restaurant before visiting."
            : "Demo picks · Sample distances & hours · Food photos are illustrative"}
        </Text>
      </View>
    </ScrollView>
  );
}
