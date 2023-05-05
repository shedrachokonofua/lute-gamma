import { Histogram } from "prom-client";
import { SpanStatusCode } from "@opentelemetry/api";
import { executeWithTimer } from "./helpers";
import { tracer } from "./tracing";

/**
 * Decorator that measures the duration of a method and records it in a histogram.
 */
export const measure =
  (histogram: Histogram) =>
  (target: any, name: string, descriptor: PropertyDescriptor) => {
    const originalMethod = descriptor.value;
    descriptor.value = async function (...args: any[]) {
      const [result, duration] = await executeWithTimer(() =>
        originalMethod.apply(this, args)
      );
      histogram.observe(duration);
      return result;
    };
  };

export const span = (
  target: any,
  name: string,
  descriptor: PropertyDescriptor
) => {
  const className = target.constructor.name;
  const originalMethod = descriptor.value;
  descriptor.value = async function (...args: any[]) {
    return tracer.startActiveSpan(`${className}.${name}`, async (span) => {
      span.setAttribute("className", className);
      try {
        const result = await originalMethod.apply(this, args);
        span.end();
        return result;
      } catch (error: any) {
        span.recordException(error);
        span.setStatus({
          code: SpanStatusCode.ERROR,
          message: error.message,
        });
        throw error;
      } finally {
        span.end();
      }
    });
  };
};
