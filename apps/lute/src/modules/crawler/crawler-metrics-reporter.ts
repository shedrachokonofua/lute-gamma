import { Gauge } from "prom-client";

export const crawlerQueueLengthGauge = new Gauge({
  name: "crawler_queue_length",
  help: "Number of items in the crawler queue",
});

export const crawlerMetricsReporter = {
  async setQueueLength(length: number) {
    crawlerQueueLengthGauge.set(length);
  },
  async incrementQueueLength() {
    crawlerQueueLengthGauge.inc();
  },
  async decrementQueueLength() {
    crawlerQueueLengthGauge.dec();
  },
} as const;
