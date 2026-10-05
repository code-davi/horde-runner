import { CHASE_DEADZONE_PX, SQUAD_Y } from './balance';

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

/**
 * Velocidade lateral de quem persegue a tropa (ADR 0025): `steer` px/s na direção de `targetX`,
 * só enquanto está na tela e acima da linha da tropa.
 */
export function chaseVelocityX(
  chaser: { x: number; y: number },
  targetX: number,
  steer: number,
): number {
  const distance = targetX - chaser.x;
  const chasing = chaser.y >= 0 && chaser.y < SQUAD_Y;
  if (!chasing || Math.abs(distance) <= CHASE_DEADZONE_PX) return 0;
  return Math.sign(distance) * steer;
}
