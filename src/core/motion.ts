/** Aproxima `current` de `target` andando no máximo `maxStep`, sem passar do alvo. */
export function approach(current: number, target: number, maxStep: number): number {
  const distance = target - current;
  if (Math.abs(distance) <= maxStep) return target;
  return current + Math.sign(distance) * maxStep;
}

/** Limita `value` ao intervalo [min, max]. */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}
