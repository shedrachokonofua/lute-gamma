export const inNonEmptyArray = <T>(arr: T[] | undefined): arr is T[] =>
  arr !== undefined && arr.length > 0;

export const rangeInclusive = (start: number, end: number) =>
  Array.from({ length: end - start + 1 }, (_, i) => i + start);
