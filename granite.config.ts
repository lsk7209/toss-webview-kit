import { defineConfig } from "@apps-in-toss/web-framework/config";

export default defineConfig({
  appName: "nyangtarot",
  brand: {
    displayName: "냥타로",
    icon: "https://raw.githubusercontent.com/lsk7209/toss-webview-kit/main/asset/logo.png",
    primaryColor: "#FF8A65",
  },
  outdir: "dist",
  permissions: [],
  web: {
    commands: {
      build: "vite build",
      dev: "vite",
    },
    host: "localhost",
    port: 5173,
  },
  webViewProps: {
    type: "partner",
  },
});
