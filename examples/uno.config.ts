import { defineConfig, presetWind3 } from "unocss";

export default defineConfig({
  presets: [presetWind3()],
  theme: {
    animation: {
      keyframes: {
        "render-count":
          "{0%{transform:scale(1.3)} 45%{transform:scale(1.1)} 100%{transform:scale(1)}}",
      },
      durations: {
        "render-count": "320ms",
      },
      timingFns: {
        "render-count": "cubic-bezier(0.16, 1, 0.3, 1)",
      },
      properties: {
        "render-count": {
          "transform-origin": "center",
        },
      },
    },
  },
});
