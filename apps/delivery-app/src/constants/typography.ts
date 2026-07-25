import { Platform, type TextStyle } from "react-native";

const fontFamily = Platform.select({ ios: "System", default: "Roboto" });

function createStyle(size: number, weight: TextStyle["fontWeight"]): TextStyle {
  return { fontFamily, fontSize: size, fontWeight: weight };
}

export const typography = {
  h1: createStyle(28, "700"),
  h2: createStyle(24, "700"),
  h3: createStyle(20, "600"),
  h4: createStyle(18, "600"),
  body: createStyle(16, "400"),
  bodyBold: createStyle(16, "600"),
  bodySmall: createStyle(14, "400"),
  caption: createStyle(12, "400"),
  captionBold: createStyle(12, "600"),
  label: createStyle(14, "600"),
  price: createStyle(18, "700"),
  priceSmall: createStyle(14, "700"),
};
