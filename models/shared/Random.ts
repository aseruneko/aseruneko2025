export function random<T>(arr: T[] | undefined): T | undefined {
  if (!arr) return undefined;
  if (arr.length === 0) return undefined;
  return arr.at(Math.floor(Math.random() * arr.length));
}

export function randomInt(x: number) {
  return Math.floor(Math.random() * x);
}
