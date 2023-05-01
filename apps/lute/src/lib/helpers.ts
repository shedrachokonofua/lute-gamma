export const extIsMhtml = (name: string) => name.endsWith(".mhtml");

export const executionTimer = () => {
  const start = Date.now();
  return () => Date.now() - start;
};

export const executeWithTimer = async <T>(
  fn: () => Promise<T>
): Promise<[T, number]> => {
  const getElapsedTime = executionTimer();
  const result = await fn();
  return [result, getElapsedTime()];
};

export const pFilter = async <T>(
  items: T[],
  predicate: (item: T) => Promise<boolean>
): Promise<T[]> => {
  const results = await Promise.all(items.map(predicate));
  return items.filter((_, index) => results[index]);
};

export const generateHistogramBuckets = (
  start: number,
  end: number,
  bucketCount: number
): number[] => {
  const buckets = [];
  const step = (end - start) / bucketCount;
  for (let i = 0; i < bucketCount; i++) {
    buckets.push(start + step * i);
  }
  return buckets;
};
