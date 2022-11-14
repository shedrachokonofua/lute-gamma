import pino from "pino";
import * as rTracer from "cls-rtracer";
import { config } from "./config";

export const logger = pino(
  {
    mixin() {
      return {
        rTraceId: rTracer.id(),
      };
    },
    level: "trace",
  },
  pino.transport({
    target: "pino-loki",
    options: {
      host: config.loki.host,
      basicAuth: {
        username: config.loki.username,
        password: config.loki.password,
      },
      labels: {
        env: config.env,
      },
    },
  })
);
