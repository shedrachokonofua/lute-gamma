import { Histogram, Counter } from "prom-client";

export const eventBatchConsumedDurationHistogram = new Histogram({
  name: "event_batch_consumed_duration_ms",
  help: "Duration of event batch consumption",
  labelNames: ["subscriberName"],
  buckets: [1, 5, 10, 25, 50, 100, 250, 500, 1000, 2500, 5000],
});

export const eventConsumedGauge = new Counter({
  name: "event_consumed",
  help: "Number of events consumed",
  labelNames: ["subscriberName"],
});

export const eventBusMetrics = {
  async observeEventBatchConsumed({
    subscriberName,
    elapsedTime,
    eventCount,
  }: {
    subscriberName: string;
    elapsedTime: number;
    eventCount: number;
  }) {
    eventBatchConsumedDurationHistogram.observe(
      { subscriberName },
      elapsedTime
    );
    eventConsumedGauge.inc({ subscriberName }, eventCount);
  },
} as const;
