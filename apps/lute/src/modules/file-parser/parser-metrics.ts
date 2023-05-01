import { Histogram } from "prom-client";

export const parseDurationHistogram = new Histogram({
  name: "parse_duration_ms",
  help: "Duration of file parsing",
  buckets: [1, 5, 10, 25, 50, 100, 250, 500, 750, 1000, 2500],
  labelNames: ["pageType"],
});

export const parserMetrics = {
  async observeParseDuration(pageType: string, duration: number) {
    parseDurationHistogram.observe({ pageType }, duration);
  },
} as const;
