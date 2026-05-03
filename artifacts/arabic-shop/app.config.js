// Dynamic Expo config so the dev server can be reached from the v0 / Vercel
// Sandbox preview proxy domain (which changes per session).
//
// Set EXPO_ROUTER_ORIGIN to the public URL that the browser uses to reach the
// Expo dev server (e.g. https://vm-xxxx.vusercontent.net). When unset we fall
// back to Replit-style env vars or to the previous hard-coded value, so this
// config keeps working in every environment.

const replitDomain = process.env.REPLIT_DEV_DOMAIN
  ? `https://${process.env.REPLIT_DEV_DOMAIN}`
  : null;

const origin =
  process.env.EXPO_ROUTER_ORIGIN ||
  process.env.EXPO_PACKAGER_PROXY_URL ||
  replitDomain ||
  "https://vm-74k16mcm8040e87vgixzibl3.vusercontent.net";

module.exports = {
  expo: {
    name: "سوق",
    slug: "arabic-shop",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    scheme: "arabic-shop",
    userInterfaceStyle: "light",
    newArchEnabled: true,
    splash: {
      image: "./assets/images/icon.png",
      resizeMode: "contain",
      backgroundColor: "#E63946",
    },
    ios: {
      supportsTablet: false,
      bundleIdentifier: "com.arabic.shop",
    },
    android: {
      package: "com.arabic.shop",
    },
    web: {
      favicon: "./assets/images/icon.png",
    },
    plugins: [
      [
        "expo-router",
        {
          origin,
        },
      ],
      "expo-font",
      "expo-web-browser",
    ],
    experiments: {
      typedRoutes: true,
      reactCompiler: true,
    },
  },
};
