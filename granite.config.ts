import { defineConfig } from "@apps-in-toss/web-framework/config";

export default defineConfig({
  appName: "%%appName%%", // 앱인토스 콘솔에서 설정한 앱 이름으로 변경
  brand: {
    displayName: "%%displayName%%", // 화면에 노출될 앱의 한글 이름으로 변경
    primaryColor: "#3182F6",
    icon: "", // 콘솔에서 업로드한 이미지 URL (우클릭 → 링크 복사)
  },
  web: {
    host: "localhost",
    port: 5173,
    commands: {
      dev: "vite",
      build: "vite build",
    },
  },
  permissions: [],
  outdir: "dist",
  webViewProps: {
    type: "partner",
  },
});
