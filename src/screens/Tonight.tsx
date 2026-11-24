import React, { useState } from "react";
import { ScrollView, Text, View, useWindowDimensions } from "react-native";
import { C, T, serif } from "../theme";
import { useCrave } from "../store";
import { Button, Empty, Icon } from "../components/UI";
import { PlaceCard } from "../components/PlaceCard";
export default function Tonight() {
  const s = useCrave(),
    mobile = useWindowDimensions().width < 780,
    [revealed, setRevealed] = useState(false),
    [index, setIndex] = useState(0);
  const p = s.results.length ? s.results[index % s.results.length] : undefined,
    backup =
      s.results.length > 1
        ? s.results[(index + 1) % s.results.length]
        : undefined;
  return (
    <ScrollView
      contentContainerStyle={{ padding: mobile ? 24 : 48, flexGrow: 1 }}
    >
      <View
        style={{ maxWidth: 1000, width: "100%", alignSelf: "center", gap: 30 }}
      >
        <View
          style={{
            alignItems: "center",
            gap: 12,
            paddingTop: mobile ? 12 : 18,
          }}
        >
          <Text
            accessibilityRole="header"
            style={[
              T.title,
              {
                fontSize: mobile ? 40 : 52,
                lineHeight: mobile ? 46 : 58,
                textAlign: "center",
              },
            ]}
          >
            Let dinner find you.
          </Text>
          <Text
            style={[
              T.body,
              { color: C.muted, textAlign: "center", maxWidth: 470 },
            ]}
          >
            One great pick. One backup. A little less deciding.
          </Text>
        </View>
        {!revealed ? (
          <View
            style={{
              alignItems: "center",
              paddingVertical: mobile ? 35 : 60,
              gap: 28,
            }}
          >
            <View
              style={{
                width: 140,
                height: 140,
                backgroundColor: C.pink,
                borderRadius: 70,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text style={{ fontSize: 66 }}>🍽️</Text>
            </View>
            <View style={{ gap: 10, alignItems: "center" }}>
              <Text style={T.heading}>What sounds good? We’ve got it.</Text>
              <Text
                style={[
                  T.body,
                  { textAlign: "center", color: C.muted, maxWidth: 380 },
                ]}
              >
                We’ll consider your cuisines, your mood, and your search area.
              </Text>
            </View>
            <Button
              label="Pick for me"
              icon="zap"
              loading={s.loading}
              onPress={async () => {
                if (await s.discover(true)) {
                  setRevealed(true);
                  setIndex(0);
                }
              }}
              style={{ minWidth: 230 }}
            />
            <Text style={T.muted}>
              No rankings. No overthinking. Just dinner.
            </Text>
          </View>
        ) : p ? (
          <View
            style={{
              flexDirection: mobile ? "column" : "row",
              gap: 32,
              alignItems: "flex-start",
            }}
          >
            <View style={{ flex: 1, width: "100%", gap: 16 }}>
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: "700",
                  color: C.coral,
                  letterSpacing: 1,
                }}
              >
                TONIGHT’S PICK
              </Text>
              <PlaceCard place={p} />
              <Button
                label="Try another"
                secondary
                icon="refresh-cw"
                onPress={() => setIndex((i) => i + 1)}
              />
            </View>
            {backup ? (
              <View
                style={{
                  width: mobile ? "100%" : 300,
                  gap: 12,
                  paddingTop: mobile ? 8 : 32,
                }}
              >
                <Text style={T.heading}>A very good backup.</Text>
                <Text style={T.muted}>In case you’re in a different mood.</Text>
                <PlaceCard place={backup} compact />
                <View
                  style={{
                    backgroundColor: C.pink,
                    padding: 20,
                    borderRadius: 16,
                    gap: 10,
                  }}
                >
                  <Icon name="heart" color={C.coral} />
                  <Text style={T.body}>Good food. All planned.</Text>
                  <Text style={T.muted}>
                    Check the menu, read diner reviews, and make a plan for your
                    next bite.
                  </Text>
                </View>
              </View>
            ) : null}
          </View>
        ) : (
          <Empty
            title="Let’s widen your appetite."
            body="No nearby picks match your recent feedback. Try discovery again with a different craving."
          />
        )}
      </View>
    </ScrollView>
  );
}
