import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { usePathname, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { C, T, serif } from "../theme";
import { useCrave } from "../store";
import { supabase } from "../backend";
import type { Place } from "../model";
import { Icon, Button } from "./UI";
import { PlaceSheet, LocationSheet, AccountSheet } from "./Sheets";
import { Overlay, type DetailTab } from "./details";
const nav = [
  { label: "Discover", path: "/", icon: "compass" },
  { label: "Tonight", path: "/tonight", icon: "moon" },
  { label: "My places", path: "/places", icon: "bookmark" },
] as const;
export function Shell({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const { width } = useWindowDimensions(),
    mobile = !mounted || width < 780,
    router = useRouter(),
    path = usePathname();
  const store = useCrave();
  const [place, setPlace] = useState<Place | null>(null),
    [loc, setLoc] = useState(false),
    [detailTab, setDetailTab] = useState<DetailTab>("overview");
  function Nav({ bottom = false }: { bottom?: boolean }) {
    return (
      <View
        style={{
          flexDirection: "row",
          gap: bottom ? 0 : 40,
          flex: bottom ? 1 : undefined,
        }}
      >
        {nav.map((n) => {
          const active =
            n.path === "/"
              ? path === "/" || path === "/results"
              : path === n.path;
          return (
            <Pressable
              key={n.path}
              onPress={() => router.push(n.path)}
              accessibilityRole="link"
              accessibilityLabel={n.label}
              style={{
                paddingVertical: bottom ? 12 : 29,
                flex: bottom ? 1 : undefined,
                alignItems: "center",
                gap: 7,
                borderBottomWidth: bottom ? 0 : 3,
                borderColor: active ? C.coral : "transparent",
              }}
            >
              {bottom ? (
                <Icon
                  name={n.icon}
                  color={active ? C.coral : C.muted}
                  size={22}
                />
              ) : null}
              <Text
                style={{
                  fontSize: bottom ? 12 : 16,
                  fontWeight: active ? "700" : "500",
                  color: active ? C.coral : C.ink,
                }}
              >
                {n.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    );
  }
  return (
    <Overlay.Provider
      value={(p, tab = "overview") => {
        setDetailTab(tab);
        setPlace(p);
      }}
    >
      <SafeAreaView
        style={{ flex: 1, backgroundColor: C.white }}
        edges={["top", "left", "right"]}
      >
        <View style={{ flex: 1 }}>
          <View
            style={{
              borderBottomWidth: 1,
              borderColor: C.line,
              backgroundColor: C.white,
              zIndex: 5,
            }}
          >
            <View
              style={{
                width: "100%",
                maxWidth: 1344,
                alignSelf: "center",
                paddingHorizontal: mobile ? 22 : 40,
                height: mobile ? 76 : 92,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 20,
              }}
            >
              <View style={[T.row, { gap: mobile ? 16 : 28 }]}>
                <Pressable
                  accessibilityLabel="Crave home"
                  accessibilityRole="link"
                  onPress={() => router.push("/")}
                >
                  <Text
                    style={{
                      fontFamily: serif,
                      fontSize: mobile ? 38 : 48,
                      fontWeight: "700",
                      letterSpacing: -2,
                      color: C.coral,
                    }}
                  >
                    crave
                  </Text>
                </Pressable>
                {!mobile ? (
                  <View
                    style={{ width: 1, height: 30, backgroundColor: C.line }}
                  />
                ) : null}
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Choose neighborhood"
                  onPress={() => setLoc(true)}
                  style={[
                    T.row,
                    {
                      gap: 7,
                      paddingHorizontal: mobile ? 11 : 16,
                      paddingVertical: 11,
                      borderRadius: 22,
                      backgroundColor: C.pale,
                    },
                  ]}
                >
                  <Icon name="map-pin" size={16} />
                  <Text
                    numberOfLines={1}
                    style={{
                      fontSize: mobile ? 12 : 14,
                      fontWeight: "600",
                      color: C.ink,
                      maxWidth: mobile ? 145 : 200,
                    }}
                  >
                    {store.location.label}
                  </Text>
                  <Icon name="chevron-down" size={14} />
                </Pressable>
              </View>
              {!mobile ? <Nav /> : null}
            </View>
          </View>
          {!store.ready ? (
            <View
              style={{
                flex: 1,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <ActivityIndicator color={C.coral} />
            </View>
          ) : (
            children
          )}
          {store.error ? (
            <View
              accessibilityRole="alert"
              style={{
                position: "absolute",
                bottom: mobile ? 90 : 24,
                left: 20,
                right: 20,
                maxWidth: 580,
                alignSelf: "center",
                padding: 16,
                backgroundColor: "#FFF0ED",
                borderRadius: 14,
                borderWidth: 1,
                borderColor: C.coral,
                zIndex: 20,
              }}
            >
              <Text style={T.body}>{store.error}</Text>
              <Pressable accessibilityRole="button" onPress={store.clearError}>
                <Text
                  style={{ color: C.coral, fontWeight: "600", paddingTop: 10 }}
                >
                  Dismiss
                </Text>
              </Pressable>
            </View>
          ) : null}
          {store.toast ? (
            <View
              accessibilityLiveRegion="polite"
              style={{
                position: "absolute",
                bottom: mobile ? 96 : 26,
                alignSelf: "center",
                maxWidth: "90%",
                backgroundColor: C.ink,
                paddingHorizontal: 24,
                paddingVertical: 15,
                borderRadius: 16,
                zIndex: 30,
              }}
            >
              <Text style={{ fontSize: 15, lineHeight: 22, color: "white" }}>
                {store.toast}
              </Text>
            </View>
          ) : null}
          {mobile ? (
            <SafeAreaView
              edges={["bottom"]}
              style={{
                borderTopWidth: 1,
                borderColor: C.line,
                backgroundColor: "white",
              }}
            >
              <Nav bottom />
            </SafeAreaView>
          ) : null}
          <PlaceSheet
            initialTab={detailTab}
            place={place}
            onClose={() => setPlace(null)}
          />
          <LocationSheet visible={loc} onClose={() => setLoc(false)} />
          <AccountSheet />
        </View>
      </SafeAreaView>
    </Overlay.Provider>
  );
}
