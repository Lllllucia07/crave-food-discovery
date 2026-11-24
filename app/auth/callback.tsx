import React, { useEffect, useState } from "react";
import { Text, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { supabase } from "../../src/backend";
import { T } from "../../src/theme";
import { Button } from "../../src/components/UI";
export default function Callback() {
  const p = useLocalSearchParams<{ code: string; error_description: string }>(),
    router = useRouter(),
    [message, setMessage] = useState("Finishing your account connection…");
  useEffect(() => {
    if (p.error_description) {
      setMessage(p.error_description);
      return;
    }
    if (!supabase || !p.code) {
      setMessage(
        "No account connection to finish. Your places are still here.",
      );
      return;
    }
    supabase.auth
      .exchangeCodeForSession(p.code)
      .then(({ error }) =>
        setMessage(
          error
            ? error.message
            : "You’re connected. Your places stayed with you.",
        ),
      );
  }, [p.code]);
  return (
    <View style={{ padding: 32, gap: 24 }}>
      <Text style={T.heading}>{message}</Text>
      <Button
        label="Back to my places"
        onPress={() => router.replace("/places")}
      />
    </View>
  );
}
