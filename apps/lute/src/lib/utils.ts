import * as rTracer from "cls-rtracer";

export const transformObject = <T extends Record<string, any>>(
  obj: T,
  transformers: Partial<Record<keyof T, (value: any) => any>>
): T => {
  const keys = [...Object.keys(obj), ...Object.keys(transformers)];
  const result = {} as T;
  for (const key of keys) {
    const value = obj[key];
    const transformer = transformers[key];
    result[key as keyof T] = transformer ? transformer(value) : value;
  }
  return result;
};

export const delay = (seconds: number) =>
  new Promise((resolve) => setTimeout(resolve, seconds * 1000));

export const retry = async (
  fn: () => Promise<void>,
  onFail: (error: Error) => Promise<void>,
  maxRetries = 5,
  delaySeconds = 3
): Promise<void> => {
  try {
    return await fn();
  } catch (error) {
    if (maxRetries === 0) {
      await onFail(error as Error);
      return;
    }
    await delay(delaySeconds);
    return retry(fn, onFail, maxRetries - 1, delaySeconds);
  }
};

export const runWithTraceId = rTracer.runWithId.bind(rTracer);
