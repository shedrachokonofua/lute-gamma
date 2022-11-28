const union = (a: string[], b: string[]): string[] =>
  Array.from(new Set([...a, ...b]));

const intersection = (a: string[], b: string[]): string[] =>
  a.filter((value) => b.includes(value));

export const getJaccardSimilarity = (a: string[], b: string[]): number =>
  intersection(b, a).length / union(b, a).length;
