import React from "react";
import { Slot } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Provider } from "../src/store";
import { Shell } from "../src/components/Shell";
export default function Root() {
  return (
    <Provider>
      <StatusBar style="dark" />
      <Shell>
        <Slot />
      </Shell>
    </Provider>
  );
}
