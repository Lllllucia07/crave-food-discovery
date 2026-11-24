import React from "react";
import {
  ScrollViewStyleReset,
  useServerDocumentContext,
} from "expo-router/html";
export default function HTML({ children }: { children: React.ReactNode }) {
  const { htmlAttributes, bodyAttributes, headNodes, bodyNodes } =
    useServerDocumentContext();
  return (
    <html lang="en" {...htmlAttributes}>
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, viewport-fit=cover"
        />
        <title>Crave — Find your next bite</title>
        <meta
          name="description"
          content="Pick a craving. Find a nearby bite. No rankings, no overthinking."
        />
        <ScrollViewStyleReset />
        {headNodes}
        <style
          dangerouslySetInnerHTML={{
            __html:
              ":focus-visible{outline:3px solid #F15C45;outline-offset:4px} body{background:#fff} @media(prefers-reduced-motion:reduce){*{animation-duration:0s!important;transition-duration:0s!important}}",
          }}
        />
      </head>
      <body {...bodyAttributes}>
        {children}
        {bodyNodes}
      </body>
    </html>
  );
}
