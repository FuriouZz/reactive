import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@furiouzz/reactive": __dirname,
    },
  },
});
