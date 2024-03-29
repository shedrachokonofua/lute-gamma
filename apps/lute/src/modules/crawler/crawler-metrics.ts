import { Gauge, Histogram } from "prom-client";

export const crawlerQueueLengthGauge = new Gauge({
  name: "crawler_queue_length",
  help: "Number of items in the crawler queue",
});

export const crawlerMetrics = {
  async setQueueLength(length: number) {
    crawlerQueueLengthGauge.set(length);
  },
  async incrementQueueLength() {
    crawlerQueueLengthGauge.inc();
  },
  async decrementQueueLength() {
    crawlerQueueLengthGauge.dec();
  },
  downloadDuration: new Histogram({
    name: "crawler_file_download_duration_ms",
    help: "Duration of file downloads",
    buckets: [
      100, 250, 500, 1000, 2500, 5000, 10000, 15000, 30000, 60000, 120000,
    ],
  }),
} as const;
