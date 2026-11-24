import { RestaurantGallery } from "./RestaurantGallery";
import { RestaurantPhoto } from "./RestaurantPhoto";
import { GoogleAttribution } from "./GoogleAttribution";
import { proximity } from "../discovery";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Linking,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { C, T } from "../theme";
import {
  priceText,
  walk,
  type Place,
  type Booking,
  type RestaurantReview,
} from "../model";
import { cuisines, cuisineFor } from "../cuisines";
import {
  bookingDays,
  bookingDateLabel,
  demoMenu,
  demoReviews,
  externalUrl,
  isDemo,
  timeOptions,
} from "../restaurant";
import { restaurantDetails } from "../backend";
import { useCrave } from "../store";
import { foodSource } from "../assets";
import { Sheet } from "./Sheet";
import { Button, FoodImage, Icon } from "./UI";
import { Why } from "./PlaceCard";
import type { DetailTab } from "./details";

export function PlaceSheet({
  place,
  onClose,
  initialTab = "overview",
}: {
  place: Place | null;
  onClose: () => void;
  initialTab?: DetailTab;
}) {
  const s = useCrave();
  const [tab, setTab] = useState<DetailTab>(initialTab),
    [remote, setRemote] = useState<Place | null>(null),
    [loading, setLoading] = useState(false),
    [error, setError] = useState(""),
    [attempt, setAttempt] = useState(0);
  useEffect(() => {
    setTab(initialTab);
  }, [place?.id, initialTab]);
  useEffect(() => {
    let alive = true;
    setRemote(null);
    setError("");
    if (!place || isDemo(place)) {
      setLoading(false);
      return;
    }
    setLoading(true);
    restaurantDetails(place)
      .then((p) => {
        if (alive) setRemote(p);
      })
      .catch(() => {
        if (alive)
          setError("We couldn’t load the latest reviews and restaurant links.");
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [place?.id, attempt]);
  const p = remote?.id === place?.id ? remote : place;
  async function open(url?: string) {
    const safe = externalUrl(url);
    if (!safe) {
      s.notify("This restaurant hasn’t shared that link yet.");
      return;
    }
    try {
      await Linking.openURL(safe);
    } catch {
      s.notify("Could not open the restaurant link. Please try again.");
    }
  }
  if (!p)
    return (
      <Sheet visible={false} title="Restaurant details" onClose={onClose}>
        {null}
      </Sheet>
    );
  const demo = isDemo(p),
    reviews = demoReviews(p),
    menu = demoMenu(p);
  return (
    <Sheet
      visible={!!place}
      onClose={onClose}
      title={demo ? "Explore this place · Demo" : "Explore this place"}
    >
      {tab === "overview" ? (
        <RestaurantPhoto
          place={p}
          style={{ height: 210, borderRadius: 18 }}
        />
      ) : null}
      <View style={{ gap: 9 }}>
        <Text
          accessibilityRole="header"
          style={[T.title, { fontSize: 34, lineHeight: 39 }]}
        >
          {p.name}
        </Text>
        <Text style={T.body}>
          {cuisines.find((c) => c.id === cuisineFor(p))?.label || p.cuisine} ·{" "}
          {priceText(p)} · {proximity(p.meters)}
        </Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Read restaurant reviews"
          onPress={() => setTab("reviews")}
          style={[T.row, { gap: 7, alignSelf: "flex-start", minHeight: 36 }]}
        >
          <Icon name="star" size={16} color={C.coral} />
          <Text style={{ fontSize: 15, fontWeight: "600", color: C.ink }}>
            {p.count > 0 ? p.rating.toFixed(1) : "Not rated yet"}
          </Text>
          <Text style={T.muted}>
            {demo ? `${p.count} sample ratings` : `${p.count} Google ratings`}
          </Text>
        </Pressable>
      </View>
      {!demo ? <GoogleAttribution/> : null}
      <View style={{ flexDirection: "row", gap: 10 }}>
        <Button
          label={s.data.saves.includes(p.id) ? "Saved" : "Save place"}
          icon={s.data.saves.includes(p.id) ? "check" : "bookmark"}
          onPress={() => s.save(p)}
          secondary
          style={{ flex: 1, paddingHorizontal: 10 }}
        />
        <Button
          label="Reserve a table"
          icon="calendar"
          onPress={() => setTab("reserve")}
          style={{ flex: 1, paddingHorizontal: 10 }}
        />
      </View>
      <View
        accessibilityRole="tablist"
        style={{
          flexDirection: "row",
          borderBottomWidth: 1,
          borderColor: C.line,
        }}
      >
        {(["overview", "menu", "photos", "reviews", "reserve"] as const).map((t) => (
          <Pressable
            key={t}
            accessibilityRole="tab"
            accessibilityLabel={t[0].toUpperCase() + t.slice(1)}
            accessibilityState={{ selected: tab === t }}
            onPress={() => setTab(t)}
            style={{
              flex: 1,
              alignItems: "center",
              paddingVertical: 15,
              borderBottomWidth: 2,
              borderColor: tab === t ? C.coral : "transparent",
            }}
          >
            <Text
              style={{
                fontSize: 14,
                fontWeight: tab === t ? "700" : "500",
                color: tab === t ? C.coral : C.muted,
              }}
            >
              {t[0].toUpperCase() + t.slice(1)}
            </Text>
          </Pressable>
        ))}
      </View>
      {loading ? (
        <View accessibilityLiveRegion="polite" style={[T.row, { gap: 9 }]}>
          <ActivityIndicator color={C.coral} />
          <Text style={T.muted}>Getting the latest restaurant details…</Text>
        </View>
      ) : null}
      {error ? (
        <View
          style={{
            backgroundColor: C.pink,
            padding: 16,
            borderRadius: 14,
            gap: 12,
          }}
        >
          <Text style={T.body}>{error}</Text>
          <Button
            label="Try details again"
            secondary
            onPress={() => setAttempt((n) => n + 1)}
          />
        </View>
      ) : null}
      {tab === "overview" ? (
        <>
          <Why place={p} />
          <Text style={T.body}>{p.note}</Text>
          <View style={[T.row, { gap: 10, alignItems: "flex-start" }]}>
            <Icon name="clock" size={18} color={C.muted} />
            <Text style={[T.muted, { flex: 1 }]}>
              {demo ? "Sample hours" : p.open ? "Open now" : "Currently closed"}{" "}
              · {p.hours}
            </Text>
          </View>
          <View style={[T.row, { gap: 10, alignItems: "flex-start" }]}>
            <Icon name="map-pin" size={18} color={C.muted} />
            <Text style={[T.muted, { flex: 1 }]}>
              {p.address}
              {demo ? " · Sample address" : ""}
            </Text>
          </View>
          <Button
            label={demo ? "View demo area" : "Get directions"}
            icon="navigation"
            secondary
            onPress={() =>
              open(
                demo
                  ? "https://www.openstreetmap.org/?locale=en#map=16/40.7283/-73.9857"
                  : `https://www.google.com/maps/dir/?api=1&destination=${p.lat},${p.lng}`,
              )
            }
          />
          <View
            style={{
              gap: 12,
              padding: 20,
              borderRadius: 18,
              backgroundColor: C.pale,
            }}
          >
            <Text style={T.heading}>A closer look before you go.</Text>
            <Text style={T.body}>
              Explore the menu, hear what diners think, and make a dinner plan.
            </Text>
            {!demo ? <Button label={`View photos${p.photos?.length ? ` (${p.photos.length})` : ""}`} secondary icon="image" onPress={() => setTab("photos")} /> : null}
            <Button
              label="Explore the menu"
              secondary
              onPress={() => setTab("menu")}
            />
          </View>
        </>
      ) : null}
      {tab === "photos" ? <RestaurantGallery key={p.id} place={p} open={open}/> : null}
      {tab === "menu" ? (
        <View style={{ gap: 18 }}>
          <View style={{ gap: 8 }}>
            <Text style={T.heading}>
              {demo ? "A taste of the menu" : "Restaurant menu"}
            </Text>
            <Text style={T.muted}>
              {demo
                ? "Sample menu · Prices in USD · For preview only"
                : "Menus and prices may change. Check the restaurant’s latest menu."}
            </Text>
          </View>
          {menu.length ? (
            Array.from(new Set(menu.map((d) => d.section))).map((section) => (
              <View key={section} style={{ gap: 5 }}>
                <Text style={[T.label, { color: C.coral, marginBottom: 6 }]}>
                  {section}
                </Text>
                {menu
                  .filter((d) => d.section === section)
                  .map((d) => (
                    <View
                      key={d.id}
                      style={{
                        paddingVertical: 16,
                        borderBottomWidth: 1,
                        borderColor: C.line,
                        gap: 8,
                      }}
                    >
                      <View
                        style={[
                          T.row,
                          {
                            justifyContent: "space-between",
                            alignItems: "flex-start",
                            gap: 16,
                          },
                        ]}
                      >
                        <Text
                          style={[
                            T.label,
                            { flex: 1, fontSize: 17, lineHeight: 23 },
                          ]}
                        >
                          {d.name}
                        </Text>
                        <Text style={T.label}>${d.price.toFixed(2)}</Text>
                      </View>
                      <Text style={T.body}>{d.description}</Text>
                      {d.dietary ? (
                        <Text style={T.muted}>{d.dietary}</Text>
                      ) : null}
                    </View>
                  ))}
              </View>
            ))
          ) : (
            <Text style={T.body}>
              A verified menu hasn’t been added inside Crave yet. You may find menu photos in the restaurant’s Google Maps gallery.
            </Text>
          )}
          {!demo && (p.menuUrl || p.websiteUrl) ? (
            <Button
              label={
                p.menuUrl
                  ? "View the restaurant menu"
                  : "Visit restaurant website"
              }
              icon="external-link"
              onPress={() => open(p.menuUrl || p.websiteUrl)}
            />
          ) : null}
          {!demo ? <View style={{gap:12,padding:18,borderRadius:16,backgroundColor:C.pale}}>
            <Text style={T.heading}>Looking for menu photos?</Text>
            <Text style={T.body}>Diners sometimes upload menus to Google Maps. Browse the photos and look for a Menu category on Google Maps, if available.</Text>
            <Button label="Browse restaurant photos" secondary icon="image" onPress={() => setTab("photos")}/>
            {p.photosUrl || p.mapsUrl ? <Button label="Find menu photos on Google Maps" icon="external-link" secondary onPress={() => open(p.photosUrl || p.mapsUrl)}/> : null}
          </View> : null}
          <Text style={T.muted}>
            For allergies or dietary needs, please confirm ingredients directly
            with the restaurant.
          </Text>
        </View>
      ) : null}
      {tab === "reviews" ? (
        <View style={{ gap: 18 }}>
          <View style={{ gap: 8 }}>
            <Text style={T.heading}>What diners are saying</Text>
            <Text style={T.muted}>
              {demo
                ? "Fictional sample reviews · Not real diner experiences"
                : "Google Maps reviews · A selection sorted by relevance"}
            </Text>
          </View>
          {reviews.length ? (
            reviews.map((r) => <ReviewCard key={r.id} review={r} open={open} />)
          ) : !loading ? (
            <Text style={T.body}>
              No written reviews are available here yet.
            </Text>
          ) : null}
          {!demo && p.mapsUrl ? (
            <Button
              label="Read more on Google Maps"
              secondary
              icon="external-link"
              onPress={() => open(p.mapsUrl)}
            />
          ) : null}
          {!demo ? (
            <Pressable
              accessibilityRole="link"
              accessibilityLabel="Google Maps review policy"
              onPress={() =>
                open(
                  "https://support.google.com/contributionpolicy/answer/7400114",
                )
              }
            >
              <Text style={[T.muted, { textDecorationLine: "underline" }]}>
                About Google Maps reviews
              </Text>
            </Pressable>
          ) : null}
        </View>
      ) : null}
      {tab === "reserve" ? (
        <ReservePanel place={p} onClose={onClose} open={open} />
      ) : null}
      <Text style={[T.muted, { fontSize: 12 }]}>
        {demo
          ? "Demo restaurant. Menu, reviews, prices, address, and hours are illustrative."
          : "Restaurant information and reviews: Google Maps. Please confirm details before visiting."}
      </Text>
    </Sheet>
  );
}
function ReviewCard({
  review: r,
  open,
}: {
  review: RestaurantReview;
  open: (u?: string) => void;
}) {
  return (
    <View
      style={{
        borderWidth: 1,
        borderColor: C.line,
        borderRadius: 18,
        padding: 19,
        gap: 14,
      }}
    >
      <View style={[T.row, { gap: 12 }]}>
        <View
          style={{
            width: 42,
            height: 42,
            backgroundColor: C.pink,
            borderRadius: 21,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text style={T.label}>{r.author.slice(0, 1)}</Text>
        </View>
        <View style={{ flex: 1, gap: 4 }}>
          <Text style={T.label}>{r.author}</Text>
          <Text style={T.muted}>
            {r.relativeTime}
            {r.visitDate ? ` · Visited ${r.visitDate}` : ""}
          </Text>
        </View>
      </View>
      <View
        accessibilityLabel={`${r.rating} out of 5 stars`}
        style={[T.row, { gap: 5 }]}
      >
        {[1, 2, 3, 4, 5].map((n) => (
          <Icon
            key={n}
            name="star"
            size={16}
            color={n <= r.rating ? C.coral : C.line}
          />
        ))}
      </View>
      <Text style={T.body}>{r.text}</Text>
      {r.source === "google" ? (
        <View style={[T.row, { flexWrap: "wrap", gap: 16 }]}>
          {r.authorUrl ? (
            <Pressable
              accessibilityRole="link"
              onPress={() => open(r.authorUrl)}
            >
              <Text style={[T.muted, { textDecorationLine: "underline" }]}>
                View author
              </Text>
            </Pressable>
          ) : null}
          {r.sourceUrl ? (
            <Pressable
              accessibilityRole="link"
              onPress={() => open(r.sourceUrl)}
            >
              <Text style={[T.muted, { textDecorationLine: "underline" }]}>
                View review on Google Maps
              </Text>
            </Pressable>
          ) : null}
        </View>
      ) : (
        <Text style={[T.muted, { fontSize: 12 }]}>Sample review</Text>
      )}
    </View>
  );
}
function ReservePanel({
  place: p,
  onClose,
  open,
}: {
  place: Place;
  onClose: () => void;
  open: (u?: string) => void;
}) {
  const s = useCrave(),
    router = useRouter(),
    demo = isDemo(p),
    days = bookingDays();
  const [date, setDate] = useState(days[0].value),
    [time, setTime] = useState("7:00 PM"),
    [party, setParty] = useState(2),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [done, setDone] = useState<Booking | null>(null);
  useEffect(() => {
    setDone(null);
    setError("");
    setDate(bookingDays()[0].value);
    setTime("7:00 PM");
    setParty(2);
  }, [p.id]);
  async function submit() {
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      setDone(await s.book(p, date, time, party));
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Could not save your plan. Please try again.",
      );
    } finally {
      setBusy(false);
    }
  }
  if (!demo)
    return (
      <View style={{ gap: 18 }}>
        <Text style={T.heading}>A table for your next bite.</Text>
        <Text style={T.body}>
          {p.reservationUrl
            ? "Complete your reservation with the restaurant’s booking partner. Availability and confirmation are handled there."
            : p.websiteUrl
              ? "Visit the restaurant’s official website for current reservation options. Your booking is complete only when the restaurant confirms it."
              : "This restaurant hasn’t shared an online reservation link yet."}
        </Text>
        {p.reservationUrl || p.websiteUrl ? (
          <Button
            label={
              p.reservationUrl
                ? "Book with the restaurant"
                : "Check restaurant booking options"
            }
            icon="external-link"
            onPress={() => open(p.reservationUrl || p.websiteUrl)}
          />
        ) : null}
        {p.mapsUrl ? (
          <Button
            label="View contact details on Google Maps"
            secondary
            onPress={() => open(p.mapsUrl)}
          />
        ) : null}
      </View>
    );
  if (done)
    return (
      <View accessibilityLiveRegion="polite" style={{ gap: 20 }}>
        <View
          style={{
            alignItems: "center",
            padding: 24,
            gap: 14,
            backgroundColor: C.pink,
            borderRadius: 20,
          }}
        >
          <Icon name="check-circle" size={42} color={C.coral} />
          <Text style={T.heading}>Demo booking saved</Text>
          <Text style={[T.body, { fontWeight: "600" }]}>{done.placeName}</Text>
          <Text style={[T.body, { textAlign: "center" }]}>
            {bookingDateLabel(done.date)} · {done.time}
            {"\n"}
            {done.party} {done.party === 1 ? "guest" : "guests"}
          </Text>
        </View>
        <Text style={T.body}>
          This is a preview. No table was reserved and nothing was sent to the
          restaurant.
        </Text>
        <Button
          label="View my plans"
          onPress={() => {
            onClose();
            router.push({ pathname: "/places", params: { tab: "bookings" } });
          }}
        />
        <Button label="Back to picks" secondary onPress={onClose} />
      </View>
    );
  return (
    <View style={{ gap: 20 }}>
      <View style={{ gap: 8 }}>
        <Text style={T.heading}>Make a dinner plan.</Text>
        <Text style={T.body}>
          Try the reservation flow with this demo restaurant.
        </Text>
        <Text style={[T.muted, { color: C.coral }]}>
          Demo only · Times are illustrative · No availability is checked
        </Text>
      </View>
      <Text style={T.label}>Party size</Text>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
        {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
          <Choice
            key={n}
            label={String(n)}
            accessibilityLabel={`${n} ${n === 1 ? "guest" : "guests"}`}
            active={party === n}
            onPress={() => setParty(n)}
          />
        ))}
      </View>
      <Text style={T.label}>Date</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 8, paddingBottom: 4 }}
      >
        {days.map((d) => (
          <Choice
            key={d.value}
            label={d.label}
            active={date === d.value}
            onPress={() => setDate(d.value)}
          />
        ))}
      </ScrollView>
      <Text style={T.label}>Sample time</Text>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
        {timeOptions.map((t) => (
          <Choice
            key={t}
            label={t}
            active={time === t}
            onPress={() => setTime(t)}
          />
        ))}
      </View>
      <View
        style={{
          padding: 16,
          borderRadius: 14,
          backgroundColor: C.pale,
          gap: 8,
        }}
      >
        <Text style={T.label}>{p.name}</Text>
        <Text style={T.body}>
          {bookingDateLabel(date)} · {time} · {party}{" "}
          {party === 1 ? "guest" : "guests"}
        </Text>
      </View>
      {error ? (
        <Text
          accessibilityRole="alert"
          style={{ fontSize: 14, color: C.coral }}
        >
          {error}
        </Text>
      ) : null}
      <Button
        label="Save demo booking"
        icon="calendar"
        loading={busy}
        onPress={submit}
      />
      <Text style={T.muted}>
        Saved on this device only. No booking request will be sent.
      </Text>
    </View>
  );
}
function Choice({
  label,
  accessibilityLabel,
  active,
  onPress,
}: {
  label: string;
  accessibilityLabel?: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityLabel={accessibilityLabel || label}
      accessibilityState={{ checked: active }}
      onPress={onPress}
      style={{
        minHeight: 44,
        minWidth: 36,
        paddingHorizontal: 13,
        paddingVertical: 11,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: active ? C.coral : C.line,
        backgroundColor: active ? C.pink : "white",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Text
        style={{
          fontSize: 14,
          fontWeight: active ? "600" : "400",
          color: active ? C.coral : C.ink,
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}
