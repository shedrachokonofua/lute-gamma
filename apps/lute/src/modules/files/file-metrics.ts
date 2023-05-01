import { Histogram } from "prom-client";

export const fileUploadDurationHistogram = new Histogram({
  name: "file_upload_duration_ms",
  help: "Duration of file uploads",
  buckets: [50, 100, 250, 500, 750, 1000, 1500, 2500, 5000, 10000],
});

export const fileMetrics = {
  async observeFileUploadDuration(duration: number) {
    fileUploadDurationHistogram.observe(duration);
  },
} as const;
