import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.example.app",
  appName: "auto-garage-crm",
  webDir: "dist",
  plugins: {
    StatusBar: {
      overlay: false,
    },
  },
};

export default config;
