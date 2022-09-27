import rTracer from "cls-rtracer";

export const transformObject = <T extends Record<string, any>>(
  obj: T,
  tranformers: Partial<Record<keyof T, (value: any) => any>>
): T =>
  Object.entries(obj).reduce((acc, [key, value]) => {
    const keyOfT = key as keyof T;
    const transformer = tranformers[keyOfT];
    acc[keyOfT] = transformer ? transformer(value) : value;
    return acc;
  }, {} as T);

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
