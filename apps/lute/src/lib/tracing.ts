import { AsyncLocalStorage } from "async_hooks";
import { nanoid } from "nanoid";
import { trace } from "@opentelemetry/api";

const traceIdContext = new AsyncLocalStorage<string>();

const createTraceId = () => "lute:" + nanoid();

export const runWithTraceId = (
  ...args:
    | [cb: () => unknown]
    | [traceId: string | undefined, cb: () => unknown | Promise<unknown>]
) => {
  if (args.length === 1) {
    const [cb] = args;
    const traceId = createTraceId();
    traceIdContext.run(traceId, cb);
  } else {
    const [traceId = createTraceId(), cb] = args;
    traceIdContext.run(traceId, cb);
  }
};

export const getTraceIdFromContext = () => traceIdContext.getStore();

export const tracer = trace.getTracer("lute");
