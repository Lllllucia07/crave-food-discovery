import { createContext, useContext } from "react";
import type { Place } from "../model";
export type DetailTab = "overview" | "photos" | "menu" | "reviews" | "reserve";
export const Overlay = createContext<(p: Place, tab?: DetailTab) => void>(
  () => {},
);
export const useDetails = () => useContext(Overlay);
