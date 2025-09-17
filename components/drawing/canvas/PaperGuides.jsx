import React from "react";
import { Path } from "@shopify/react-native-skia";
import { makePathFromPoints } from "./utils";

export default function PaperGuides({ paperStyle, page }) {
  const nodes = [];
  if (paperStyle === "ruled") {
    const lineColor = "#e5e7eb";
    const gap = 28;
    for (let y = page.y + gap; y < page.y + page.h; y += gap) {
      nodes.push(
        <Path
          key={`r-${y}`}
          path={makePathFromPoints([
            { x: page.x + 12, y },
            { x: page.x + page.w - 12, y },
          ])}
          color={lineColor}
          strokeWidth={1}
          style="stroke"
        />
      );
    }
  } else if (paperStyle === "grid") {
    const lineColor = "#e6e7ea";
    const gap = 28;
    for (let y = page.y + gap; y < page.y + page.h; y += gap) {
      nodes.push(
        <Path
          key={`gy-${y}`}
          path={makePathFromPoints([
            { x: page.x + 12, y },
            { x: page.x + page.w - 12, y },
          ])}
          color={lineColor}
          strokeWidth={1}
          style="stroke"
        />
      );
    }
    for (let x = page.x + gap; x < page.x + page.w; x += gap) {
      nodes.push(
        <Path
          key={`gx-${x}`}
          path={makePathFromPoints([
            { x, y: page.y + 12 },
            { x, y: page.y + page.h - 12 },
          ])}
          color={lineColor}
          strokeWidth={1}
          style="stroke"
        />
      );
    }
  }
  return nodes;
}
