import pino from "pino";
import * as rTracer from "cls-rtracer";

export const buildLogger = ({
  name,
  mongoUrl,
}: {
  name: string;
  mongoUrl: string;
}) => {
  const logger = pino(
    {
      mixin() {
        return {
          _service: name,
          _traceId: rTracer.id(),
        };
      },
      level: "trace",
    },
    pino.transport({
      target: "pino-mongodb",
      options: {
        uri: mongoUrl,
        collection: "logs",
        database: "lute-logs",
      },
    })
  );
  return logger;
};
