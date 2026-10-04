export interface Circle {
  readonly x: number;
  readonly y: number;
  readonly radius: number;
}

/** Se dois círculos se sobrepõem; só encostar não conta. */
export function circlesOverlap(a: Circle, b: Circle): boolean {
  return Math.hypot(a.x - b.x, a.y - b.y) < a.radius + b.radius;
}
