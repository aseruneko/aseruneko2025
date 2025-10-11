export type Coord = [number, number];
export type Direction = [number, number];

export const Dircection: Record<string, Coord> = {
  N: [0, -1],
  NE: [1, -1],
  E: [1, 0],
  SE: [1, 1],
  S: [0, 1],
  SW: [-1, 1],
  W: [-1, 0],
  NW: [-1, 1],
} as const;

export const Directions: Coord[] = Object.values(Dircection);

export function plus([x1, y1]: Coord, [x2, y2]: Direction): Coord {
  return [x1 + x2, y1 + y2];
}

export function width<T>(arr: T[][]): number {
  return arr.at(0)?.length ?? 0;
}

export function height<T>(arr: T[][]): number {
  return arr.length;
}

export function at<T>(arr: T[][], [x, y]: Coord): T | undefined {
  if (!within([x, y], width(arr), height(arr))) return undefined;
  return arr[y][x];
}

export function within([x, y]: Coord, w: number, h: number) {
  return between(x, w) && between(y, h);
}

export function between(x: number, w: number) {
  return 0 <= x && x < w;
}

export function crop(x: number, from: number, to: number) {
  if (x < from) return from;
  if (x > to) return to;
  return x;
}
