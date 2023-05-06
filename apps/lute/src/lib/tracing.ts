import { AsyncLocalStorage } from "async_hooks";
import { nanoid } from "nanoid";
import { trace } from "@opentelemetry/api";

const traceIdContext = new AsyncLocalStorage<string>();

export const runWithTraceId = (
  ...args:
    | [cb: () => unknown]
    | [traceId: string, cb: () => unknown | Promise<unknown>]
) => {
  if (args.length === 1) {
    const [cb] = args;
    return traceIdContext.run(`lute:` + nanoid(), cb);
  } else {
    const [traceId, cb] = args;
    return traceIdContext.run(traceId, cb);
  }
};

export const getTraceIdFromContext = () => traceIdContext.getStore();

export const tracer = trace.getTracer("lute");
