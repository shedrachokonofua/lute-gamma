export const repeat = (value: number, times: number) =>
  Array.from({ length: times }, () => value);

export const flatCompact = <T>(arr: (T[] | undefined)[]) =>
  arr.reduce<T[]>((acc, val) => acc.concat(val || []), [] as T[]);
