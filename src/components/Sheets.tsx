import React, { useState } from "react";
import { Linking, Text } from "react-native";
import { C, T } from "../theme";
import { useCrave } from "../store";
import { linkAccount, supabase } from "../backend";
import { Button } from "./UI";
import { Sheet } from "./Sheet";
export { PlaceSheet } from "./RestaurantDetails";
export { LocationSheet } from "./LocationSheet";
export function AccountSheet() {
  const s = useCrave(),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  async function link(provider: "google" | "apple") {
    setBusy(true);
    try {
      const url = await linkAccount(provider);
      if (url) await Linking.openURL(url);
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Could not connect. Your saves are safe.",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <Sheet
      visible={s.signup}
      onClose={s.dismissSignup}
      title="Keep your good finds"
    >
      <Text style={{ fontSize: 44, textAlign: "center" }}>🔖</Text>
      <Text style={T.title}>Three good finds. All yours.</Text>
      <Text style={T.body}>
        {supabase
          ? "Link an account to keep your places across devices. Your anonymous saves stay with you."
          : "Your first three saves are ready. In this demo, your places stay on this device. Account linking becomes available when the live service is connected."}
      </Text>
      {supabase ? (
        <>
          <Button
            label="Continue with Apple"
            loading={busy}
            onPress={() => link("apple")}
          />
          <Button
            label="Continue with Google"
            secondary
            loading={busy}
            onPress={() => link("google")}
          />
        </>
      ) : null}
      <Button
        label={supabase ? "Maybe later" : "Continue on this device"}
        secondary
        onPress={s.dismissSignup}
      />
      {error ? (
        <Text style={{ color: C.coral, fontSize: 14 }}>{error}</Text>
      ) : null}
    </Sheet>
  );
}
