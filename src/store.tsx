import { distanceFrom, validLocation, type SearchLocation } from "./location";
import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  demoPlaces,
  initial,
  rank,
  DEMO_LOCATION,
  type Stored,
  type Tag,
  type Place,
  type MealLog,
  type Booking,
} from "./model";
import {
  supabase,
  recommendations,
  cloudSave,
  cloudLog,
  restoreCloud,
} from "./backend";
import { normalizeCuisineSelection, type CuisineId } from "./cuisines";
import { validateBooking } from "./restaurant";
import { toggleSelection } from "./selection";
import { normalizeRadius } from "./discovery";
const KEY = "crave.v1";
type State = {
  data: Stored;
  ready: boolean;
  places: Place[];
  results: Place[];
  loading: boolean;
  error: string;
  toast: string;
  signup: boolean;
  location: SearchLocation;
  setRadius: (r: number) => void;
  choose: (t: Tag) => void;
  chooseCuisine: (c: CuisineId) => void;
  book: (
    p: Place,
    date: string,
    time: string,
    party: number,
  ) => Promise<Booking>;
  cancelBooking: (id: string) => void;
  discover: (tonight?: boolean) => Promise<boolean>;
  save: (p: Place) => Promise<void>;
  log: (l: MealLog) => Promise<void>;
  notify: (s: string) => void;
  dismissSignup: () => void;
  setLocation: (l: SearchLocation) => void;
  clearError: () => void;
};
const Context = createContext<State>(null!);
export function Provider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<Stored>(initial),
    [ready, setReady] = useState(false),
    [places, setPlaces] = useState<Place[]>(supabase ? [] : demoPlaces),
    [results, setResults] = useState<Place[]>([]),
    [loading, setLoading] = useState(false),
    [error, setError] = useState(""),
    [toast, setToast] = useState(""),
    [signup, setSignup] = useState(false),
    [location, updateLocation] = useState<SearchLocation>(DEMO_LOCATION);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null),
    saving = useRef(new Set<string>());
  const notify = (s: string) => {
    setToast(s);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setToast(""), 4000);
  };
  useEffect(() => {
    let alive = true;
    AsyncStorage.getItem(KEY)
      .then((raw) => {
        if (!alive) return;
        if (raw) {
          try {
            const d = JSON.parse(raw);
            if (
              d.version === 1 &&
              Array.isArray(d.saves) &&
              Array.isArray(d.logs) &&
              Array.isArray(d.selected)
            )
              {
              if(validLocation(d.location)) updateLocation(d.location);
              setData({
                ...d,
                cuisines: normalizeCuisineSelection(d.cuisines, d.cuisine),
                searchRadius: normalizeRadius(d.searchRadius),
                location: validLocation(d.location) ? d.location : DEMO_LOCATION,
                bookings: Array.isArray(d.bookings) ? d.bookings : [],
              });
              }
          } catch {
            setError("Saved data could not be read. You can keep exploring.");
          }
        }
      })
      .catch(() =>
        setError("Device storage is unavailable. Changes may not persist."),
      )
      .finally(() => {
        if (alive) setReady(true);
      });
    return () => {
      alive = false;
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);
  useEffect(() => {
    if (ready)
      AsyncStorage.setItem(KEY, JSON.stringify(data)).catch(() =>
        setError(
          "Could not save on this device. Please check available storage.",
        ),
      );
  }, [data, ready]);
  useEffect(() => {
    if (!ready || !supabase) return;
    let alive = true;
    restoreCloud(location.lat, location.lng)
      .then((r) => {
        if (!alive || !r) return;
        setData((d) => ({ ...d, saves: r.saves, logs: r.logs }));
        setPlaces(r.places);
      })
      .catch(() => {
        if (alive)
          setError(
            "Could not refresh your saved places. Please try again later.",
          );
      });
    return () => {
      alive = false;
    };
  }, [ready, location.lat, location.lng]);
  useEffect(() => {
    if (!supabase) setPlaces(demoPlaces.map(p => ({...p, meters: location.lat === DEMO_LOCATION.lat && location.lng === DEMO_LOCATION.lng ? p.meters : distanceFrom(location, p)})));
  }, [location.lat, location.lng]);
  const setLocation = (l: SearchLocation) => {
    if(!validLocation(l)) return;
    updateLocation(l);
    setData(d=>({...d,location:l}));
    setResults([]);
  };
  const choose = (tag: Tag) =>
    setData((d) => ({ ...d, selected: toggleSelection(d.selected, tag) }));
  const chooseCuisine = (cuisine: CuisineId) => {
    if (cuisine !== "any")
      setData((d) => ({
        ...d,
        cuisines: toggleSelection(d.cuisines, cuisine),
      }));
  };
  async function book(
    p: Place,
    date: string,
    time: string,
    party: number,
  ): Promise<Booking> {
    validateBooking(p, date, time, party);
    const booking: Booking = {
      id: `demo-booking-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      placeId: p.id,
      placeName: p.name,
      date,
      time,
      party,
      kind: "demo",
      createdAt: new Date().toISOString(),
    };
    const next = { ...data, bookings: [booking, ...(data.bookings || [])] };
    await AsyncStorage.setItem(KEY, JSON.stringify(next));
    setData(next);
    return booking;
  }
  const cancelBooking = (id: string) => {
    setData((d) => ({
      ...d,
      bookings: (d.bookings || []).filter((b) => b.id !== id),
    }));
    notify("Demo booking removed. No restaurant was contacted.");
  };
  async function discover(tonight = false) {
    setLoading(true);
    setError("");
    try {
      const list = supabase
        ? await recommendations(
            data.selected,
            location.lat,
            location.lng,
            data.cuisines,
            data.searchRadius,
          )
        : rank(places, data.selected, data.logs, new Date(), data.cuisines, data.searchRadius);
      if (supabase)
        setPlaces((p) =>
          Array.from(new Map([...p, ...list].map((x) => [x.id, x])).values()),
        );
      setResults(list);
      return true;
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Could not find nearby places. Please try again.",
      );
      return false;
    } finally {
      setLoading(false);
    }
  }
  async function save(p: Place) {
    if (saving.current.has(p.id)) return;
    saving.current.add(p.id);
    const exists = data.saves.includes(p.id);
    try {
      await cloudSave(p.id, !exists);
      setData((d) => ({
        ...d,
        saves: exists
          ? d.saves.filter((x) => x !== p.id)
          : [...new Set([...d.saves, p.id])],
      }));
      notify(
        exists ? "Removed from your places" : "Saved for your next craving",
      );
      if (process.env.EXPO_PUBLIC_ACCOUNT_LINKING_ENABLED === "true" && !exists && data.saves.length === 2 && !data.signupSeen)
        setSignup(true);
    } catch {
      notify("Could not save this place. Please try again.");
    } finally {
      saving.current.delete(p.id);
    }
  }
  async function log(l: MealLog) {
    await cloudLog(
      l,
      places.find((p) => p.id === l.placeId)?.tags || data.selected,
    );
    setData((d) => ({
      ...d,
      logs: [...d.logs.filter((x) => x.placeId !== l.placeId), l],
    }));
    if (l.reaction === "nope")
      setResults((r) => r.filter((p) => p.id !== l.placeId));
    notify(
      l.reaction === "loved"
        ? "A new Love. Your next picks will learn from it."
        : l.reaction === "nope"
          ? "Noted. We’ll leave this place out of your picks."
          : "Meal logged. Thanks for the taste check.",
    );
  }
  return (
    <Context.Provider
      value={{
        data,
        ready,
        places,
        results,
        loading,
        error,
        toast,
        signup,
        location,
        setRadius: (r) => setData(d => ({...d, searchRadius: normalizeRadius(r)})),
        choose,
        chooseCuisine,
        book,
        cancelBooking,
        discover,
        save,
        log,
        notify,
        dismissSignup: () => {
          setSignup(false);
          setData((d) => ({ ...d, signupSeen: true }));
        },
        setLocation,
        clearError: () => setError(""),
      }}
    >
      {children}
    </Context.Provider>
  );
}
export const useCrave = () => useContext(Context);
