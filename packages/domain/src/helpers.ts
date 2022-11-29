export const inNonEmptyArray = <T>(arr: T[] | undefined): arr is T[] =>
  arr !== undefined && arr.length > 0;
