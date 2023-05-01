import pino from "pino";
import * as rTracer from "cls-rtracer";

export const logger = pino({
  mixin() {
    return {
      rTraceId: rTracer.id(),
    };
  },
  level: "trace",
});

// Ensure unhandled errors are logged
process.on("unhandledRejection", (reason: any, promise) => {
  logger.error({ promise }, "Unhandled Rejection at:", reason.stack || reason);
});

// Ensure uncaught exceptions are logged
process.on("uncaughtException", (err) => {
  logger.fatal(err, "Uncaught Exception thrown");
  process.exit(1);
});
