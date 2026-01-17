import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./"),
      "@contracts": path.resolve(__dirname, "../delta0_contracts"),
      "@components": path.resolve(__dirname, "./src/components"),
      "@public": path.resolve(__dirname, "./public"),
      "@util": path.resolve(__dirname, "./src/util"),
      "@service": path.resolve(__dirname, "./src/service"),
    },
  },
});
