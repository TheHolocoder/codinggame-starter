export class Point {
    x: number = 0;
    y: number = 0;
}

export function equals(a: Point, b: Point): boolean {
    return a.x === b.x && a.y === b.y;
}

export function add(a: Point, b: Point): Point {
    return { x: a.x + b.x, y: a.y + b.y };
}

export function inverse(vec: Point): Point {
    return { x: -vec.x, y: -vec.y };
}

/**
 * Distance between two points (sqrt(dX² + dY²)).
 */
export function distance(a: Point, b: Point): number {
    return Math.sqrt((b.x - a.x) * (b.x - a.x) + (b.y - a.y) * (b.y - a.y));
}

/**
 * Distance between two points in a grid (cells to traverse).
 */
export function gridDistance(a: Point, b: Point): number {
    return Math.abs(b.x - a.x) + Math.abs(b.y - a.y);
}
