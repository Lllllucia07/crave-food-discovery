import { Platform, StyleSheet } from "react-native";
export const C = {
  ink: "#351728",
  muted: "#806977",
  coral: "#F15C45",
  pink: "#FFF2F2",
  pale: "#FCF7F8",
  line: "#EEE5E9",
  white: "#FFFFFF",
  green: "#2F785D",
};
export const serif = Platform.select({
  web: "Georgia, Times New Roman, serif",
  ios: "Georgia",
  android: "serif",
});
export const T = StyleSheet.create({
  body: { fontSize: 16, lineHeight: 25, color: C.ink },
  muted: { fontSize: 14, lineHeight: 21, color: C.muted },
  title: {
    fontFamily: serif,
    fontWeight: "600",
    fontSize: 44,
    lineHeight: 50,
    color: C.ink,
    letterSpacing: -1.4,
  },
  heading: {
    fontFamily: serif,
    fontSize: 28,
    fontWeight: "600",
    color: C.ink,
    lineHeight: 36,
  },
  row: { flexDirection: "row", alignItems: "center" },
  label: { fontSize: 15, color: C.ink, fontWeight: "600" },
});
