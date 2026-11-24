import React, { useState } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
  type ImageSourcePropType,
} from "react-native";
import Feather from "@expo/vector-icons/Feather";
import { C, T } from "../theme";
export const Icon = ({
  name,
  size = 20,
  color = C.ink,
}: {
  name: React.ComponentProps<typeof Feather>["name"];
  size?: number;
  color?: string;
}) => <Feather name={name} size={size} color={color} />;
export function Button({
  label,
  onPress,
  secondary = false,
  disabled = false,
  loading = false,
  icon,
  style,
}: {
  label: string;
  onPress: () => void;
  secondary?: boolean;
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ComponentProps<typeof Feather>["name"];
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: disabled || loading }}
      disabled={disabled || loading}
      onPress={onPress}
      style={({ pressed }) => [
        {
          minHeight: 52,
          paddingHorizontal: 22,
          paddingVertical: 14,
          borderRadius: 14,
          backgroundColor: secondary ? C.white : C.coral,
          borderWidth: 1,
          borderColor: secondary ? C.line : C.coral,
          opacity: disabled ? 0.45 : pressed ? 0.78 : 1,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          gap: 9,
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={secondary ? C.ink : C.white} />
      ) : (
        <>
          {icon ? (
            <Icon name={icon} size={18} color={secondary ? C.ink : C.white} />
          ) : null}
          <Text
            style={{
              fontSize: 16,
              fontWeight: "600",
              color: secondary ? C.ink : C.white,
            }}
          >
            {label}
          </Text>
        </>
      )}
    </Pressable>
  );
}
export function FoodImage({
  uri,
  style,
  label,
  contain = false,
  onLoad,
  onError,
}: {
  onLoad?: () => void;
  onError?: () => void;
  contain?: boolean;
  uri: string | ImageSourcePropType;
  style?: StyleProp<ViewStyle>;
  label: string;
}) {
  const [failed, setFailed] = useState(false);
  return (
    <View style={[{ overflow: "hidden", backgroundColor: C.pink }, style]}>
      {failed || !uri ? (
        <View
          style={{
            flex: 1,
            minHeight: 0,
            alignItems: "center",
            justifyContent: "center",
            gap: 12,
          }}
        >
          <Text style={{ fontSize: 50 }}>🍽️</Text>
          <Text style={T.muted}>A good bite awaits</Text>
        </View>
      ) : (
        <Image
          accessibilityLabel={label}
          source={typeof uri === "string" ? { uri } : uri}
          onLoad={onLoad}
          onError={() => {setFailed(true); onError?.();}}
          style={{ width: "100%", height: "100%", position: "absolute" }}
          resizeMode={contain ? "contain" : "cover"}
        />
      )}
    </View>
  );
}
export function Empty({
  title,
  body,
  action,
}: {
  title: string;
  body: string;
  action?: React.ReactNode;
}) {
  return (
    <View style={{ alignItems: "center", padding: 48, gap: 16 }}>
      <Text style={{ fontSize: 44 }}>🍽️</Text>
      <Text style={[T.heading, { textAlign: "center" }]}>{title}</Text>
      <Text
        style={[T.body, { color: C.muted, textAlign: "center", maxWidth: 400 }]}
      >
        {body}
      </Text>
      {action}
    </View>
  );
}
