import { PreferencePicker } from "../components/PreferencePicker";
import { radiusOptions, radiusLabel, proximity } from "../discovery";
import React, { useState } from "react";
import {
  Pressable,
  ScrollView,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { useRouter } from "expo-router";
import { C, T, serif } from "../theme";
import { useCrave } from "../store";
import { cuisines } from "../cuisines";
import { cravings, demoPlaces } from "../model";
import { Button, FoodImage, Icon } from "../components/UI";
import { useDetails } from "../components/details";
import { hero } from "../assets";
import { supabase } from "../backend";
export default function Discover() {
  const { width, height } = useWindowDimensions(),
    mobile = width < 780,
    s = useCrave(),
    router = useRouter(),
    details = useDetails();
  const [picker, setPicker] = useState<"cuisines" | "moods" | null>(null);
  return (
    <>
    <ScrollView
      contentContainerStyle={{
        flexGrow: 1,
        paddingHorizontal: mobile ? 0 : 40,
        paddingVertical: mobile ? 0 : 30,
      }}
    >
      <View
        style={{
          width: "100%",
          maxWidth: 1264,
          alignSelf: "center",
          flexDirection: mobile ? "column" : "row",
          borderRadius: mobile ? 0 : 26,
          overflow: "hidden",
          minHeight: mobile ? 0 : Math.max(720, height - 160),
          backgroundColor: C.pink,
        }}
      >
        <View
          style={{
            width: mobile ? "100%" : "46%",
            padding: mobile ? 24 : 40,
            paddingTop: mobile ? 27 : 40,
            justifyContent: "space-between",
          }}
        >
          <View>
            <Text
              accessibilityRole="header"
              style={{
                fontFamily: serif,
                fontSize: mobile ? 42 : width < 1200 ? 48 : 56,
                lineHeight: mobile ? 45 : width < 1200 ? 51 : 58,
                fontWeight: "700",
                color: C.ink,
                letterSpacing: -2,
              }}
            >
              Good food.{"\n"}Your mood.
            </Text>
            <Text
              style={{
                fontSize: mobile ? 16 : 18,
                lineHeight: 27,
                color: C.muted,
                marginTop: 16,
                marginBottom: mobile ? 24 : 28,
              }}
            >
              Choose cuisines and moods, or leave them open and let us pick.
            </Text>
            <View style={{ gap: 12, marginBottom: 24 }}>
              <View
                style={[T.row, { justifyContent: "space-between", gap: 12 }]}
              >
                <Text style={T.label}>Cuisine</Text>
                <Text style={T.muted}>Optional · choose any</Text>
              </View>
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                {cuisines
                  .filter((c) => c.id !== "any")
                  .filter((c, i) => i < 6 || s.data.cuisines.includes(c.id))
                  .map((c) => {
                    const active = s.data.cuisines.includes(c.id);
                    return (
                      <Pressable
                        key={c.id}
                        accessibilityRole="checkbox"
                        accessibilityLabel={c.label}
                        accessibilityState={{ checked: active }}
                        aria-checked={active}
                        onPress={() => s.chooseCuisine(c.id)}
                        style={({ pressed }) => ({
                          minHeight: 42,
                          paddingHorizontal: 13,
                          paddingVertical: 10,
                          backgroundColor: active ? C.ink : "white",
                          borderWidth: 1,
                          borderColor: active ? C.ink : C.line,
                          borderRadius: 22,
                          opacity: pressed ? 0.75 : 1,
                        })}
                      >
                        <Text
                          style={{
                            fontSize: 14,
                            fontWeight: active ? "600" : "400",
                            color: active ? "white" : C.ink,
                          }}
                        >
                          {c.emoji} {c.label}
                        </Text>
                      </Pressable>
                    );
                  })}
              </View>
              <Pressable accessibilityRole="button" onPress={() => setPicker("cuisines")} style={{paddingVertical:6}}><Text style={{color:C.coral,fontWeight:"600"}}>Explore all 28 cuisines</Text></Pressable>
            </View>
            <View
              style={[
                T.row,
                { justifyContent: "space-between", marginBottom: 12 },
              ]}
            >
              <Text style={T.label}>Set the mood</Text>
              <Text style={T.muted}>Optional · choose any</Text>
            </View>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
              {cravings.filter((c, i) => i < 6 || s.data.selected.includes(c.id)).map((c) => {
                const selected = s.data.selected.includes(c.id);
                return (
                  <Pressable
                    key={c.id}
                    accessibilityRole="checkbox"
                    accessibilityLabel={c.label}
                    accessibilityState={{ checked: selected }}
                    aria-checked={selected}
                    onPress={() => s.choose(c.id)}
                    style={({ pressed }) => ({
                      width: "31.6%",
                      height: !mobile && width >= 1200 ? 60 : mobile ? 84 : 90,
                      flexDirection:
                        !mobile && width >= 1200 ? "row" : "column",
                      borderRadius: 18,
                      borderWidth: selected ? 2 : 1,
                      borderColor: selected ? C.coral : "#FFE4E8",
                      backgroundColor: selected ? "#FFF9F7" : "#FFFFFFB8",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 8,
                      opacity: pressed ? 0.7 : 1,
                    })}
                  >
                    <Text
                      style={{
                        fontSize: !mobile && width >= 1200 ? 20 : 29,
                        lineHeight: !mobile && width >= 1200 ? 28 : 35,
                      }}
                    >
                      {c.emoji}
                    </Text>
                    <Text
                      style={{
                        fontSize: mobile ? 13 : 14,
                        fontWeight: "600",
                        color: C.ink,
                        textAlign: "center",
                      }}
                    >
                      {c.label}
                    </Text>
                    {selected ? (
                      <View
                        style={{
                          position: "absolute",
                          right: 7,
                          top: 7,
                          width: 16,
                          height: 16,
                          borderRadius: 8,
                          backgroundColor: C.coral,
                          justifyContent: "center",
                          alignItems: "center",
                        }}
                      >
                        <Icon name="check" color="white" size={11} />
                      </View>
                    ) : null}
                  </Pressable>
                );
              })}
            </View>
            <Pressable accessibilityRole="button" onPress={() => setPicker("moods")} style={{paddingVertical:14}}><Text style={{color:C.coral,fontWeight:"600"}}>Explore all 30 moods & cravings</Text></Pressable>
            <View style={{gap:10,marginTop:4}}>
             <View style={[T.row,{justifyContent:"space-between"}]}><Text style={T.label}>How far?</Text><Text style={T.muted}>From your location</Text></View>
             <View style={{flexDirection:"row",flexWrap:"wrap",gap:7}}>{radiusOptions.map(r=><Pressable key={r} accessibilityRole="radio" accessibilityLabel={radiusLabel(r)} accessibilityState={{checked:s.data.searchRadius===r}} aria-checked={s.data.searchRadius===r} onPress={()=>s.setRadius(r)} style={{paddingVertical:10,paddingHorizontal:14,borderWidth:1,borderColor:s.data.searchRadius===r?C.ink:C.line,borderRadius:22,backgroundColor:s.data.searchRadius===r?C.ink:C.white}}><Text style={{fontSize:14,color:s.data.searchRadius===r?C.white:C.ink}}>{radiusLabel(r)}</Text></Pressable>)}</View>
             <Text style={{fontSize:12,lineHeight:18,color:C.muted}}>Straight-line radius · Expand for more neighborhoods</Text>
            </View>
          </View>
          <View style={{ marginTop: 24, gap: 15 }}>
            <Button
              label={
                s.loading ? "Finding your next bite…" : "Find my next bite"
              }
              loading={s.loading}
              onPress={async () => {
                if (await s.discover()) router.push("/results");
              }}
            />
            <View style={[T.row, { gap: 7, alignItems: "flex-start" }]}>
              <Icon name="map-pin" size={15} color={C.muted} />
              <Text
                style={{
                  fontSize: 12,
                  lineHeight: 18,
                  color: C.muted,
                  flex: 1,
                }}
              >
                {supabase
                  ? `Exploring ${s.location.label}`
                  : `Exploring ${s.location.label} · Demo restaurants`}
                {` · ${s.data.cuisines.length} ${s.data.cuisines.length === 1 ? "cuisine" : "cuisines"} · ${s.data.selected.length} ${s.data.selected.length === 1 ? "mood" : "moods"} selected`}
              </Text>
            </View>
          </View>
        </View>
        {!mobile ? (
          <View style={{ flex: 1, minHeight: 720 }}>
            <FoodImage
              uri={hero}
              label="A bowl of spicy hand-pulled noodles"
              style={{
                position: "absolute",
                width: "100%",
                height: "100%",
                borderTopLeftRadius: 40,
              }}
            />
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={supabase ? "Find real restaurants" : "Preview Noodle House"}
              onPress={async () => { if(supabase) { if(await s.discover()) router.push("/results"); } else details(s.places.find(p => p.id === "demo-1") || demoPlaces[0]); }}
              style={{
                position: "absolute",
                bottom: 34,
                left: 28,
                right: 28,
                borderRadius: 22,
                backgroundColor: "white",
                padding: 22,
                flexDirection: "row",
                alignItems: "center",
                gap: 14,
                boxShadow: "0px 6px 30px #35172812",
              }}
            >
              <FoodImage
                uri={hero}
                label={supabase ? "Illustrative noodle dish" : "Noodle House sample dish"}
                style={{ width: 70, height: 70, borderRadius: 14 }}
              />
              <View style={{ flex: 1, gap: 7 }}>
                <Text
                  style={{
                    fontFamily: serif,
                    fontSize: 27,
                    fontWeight: "700",
                    color: C.ink,
                  }}
                >
                  {supabase ? "Your next favorite" : "Noodle House"}
                </Text>
                <Text style={{ fontSize: 14, color: C.muted }}>
                  {supabase ? "Real restaurants, around you" : `Hand-pulled noodles · ${proximity((s.places.find(p => p.id === "demo-1") || demoPlaces[0]).meters)}`}
                </Text>
              </View>
              <Icon name="chevron-right" />
            </Pressable>
          </View>
        ) : null}
      </View>
      <Text
        style={{
          textAlign: "center",
          fontSize: 12,
          color: C.muted,
          paddingTop: 18,
          paddingBottom: mobile ? 20 : 0,
        }}
      >
        {supabase
          ? "Restaurant data & photos: Google Maps · Home illustration is decorative"
          : "Demo restaurants & sample hours · Your saves stay on this device"}
      </Text>
    </ScrollView>
    <PreferencePicker visible={picker === "cuisines"} onClose={() => setPicker(null)} title="Cuisines" options={cuisines.filter(c=>c.id!=="any")} selected={s.data.cuisines} onToggle={s.chooseCuisine}/>
    <PreferencePicker visible={picker === "moods"} onClose={() => setPicker(null)} title="Moods & cravings" options={cravings} selected={s.data.selected} onToggle={s.choose}/>
    </>
  );
}
