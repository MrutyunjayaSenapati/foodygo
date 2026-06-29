import { Platform } from "react-native";

const fontFamily = Platform.select({
  ios: "System",
  android: "Roboto",
  default: "System",
});

export const typography = {
  h1: { fontSize: 28, fontWeight: "700" as const, lineHeight: 34, fontFamily },
  h2: { fontSize: 24, fontWeight: "700" as const, lineHeight: 30, fontFamily },
  h3: { fontSize: 20, fontWeight: "600" as const, lineHeight: 26, fontFamily },
  h4: { fontSize: 18, fontWeight: "600" as const, lineHeight: 24, fontFamily },
  body: { fontSize: 16, fontWeight: "400" as const, lineHeight: 22, fontFamily },
  bodyBold: { fontSize: 16, fontWeight: "600" as const, lineHeight: 22, fontFamily },
  bodySmall: { fontSize: 14, fontWeight: "400" as const, lineHeight: 20, fontFamily },
  caption: { fontSize: 12, fontWeight: "400" as const, lineHeight: 16, fontFamily },
  captionBold: { fontSize: 12, fontWeight: "600" as const, lineHeight: 16, fontFamily },
  label: { fontSize: 14, fontWeight: "600" as const, lineHeight: 18, fontFamily },
  price: { fontSize: 18, fontWeight: "700" as const, lineHeight: 24, fontFamily },
  priceSmall: { fontSize: 14, fontWeight: "700" as const, lineHeight: 18, fontFamily },
} as const;
