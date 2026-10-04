/** Fração áurea: espalha fases de forma uniforme e sem padrões repetidos. */
const GOLDEN_RATIO_FRACTION = 0.6180339887;

/** Avança o relógio de disparo de uma unidade e diz quantos tiros venceram neste frame. */
export function advanceCadence(
  elapsedMs: number,
  deltaMs: number,
  intervalMs: number,
): { shots: number; elapsedMs: number } {
  const total = elapsedMs + deltaMs;
  const shots = Math.floor(total / intervalMs);
  return { shots, elapsedMs: total - shots * intervalMs };
}

/** Fase inicial da unidade `index`, para as unidades não atirarem todas no mesmo instante. */
export function staggeredStart(index: number, intervalMs: number): number {
  return ((index * GOLDEN_RATIO_FRACTION) % 1) * intervalMs;
}

/**
 * Relógios de disparo depois que a tropa mudou: unidades que continuam mantêm o progresso
 * (limitado ao novo intervalo) e só as novas começam escalonadas. Sem isso, cada dano ou
 * portão zeraria o relógio da unidade mais forte e ela quase nunca atiraria em combate.
 */
export function retrackCadence(
  previous: readonly number[],
  unitCount: number,
  intervalMs: number,
): number[] {
  return Array.from({ length: unitCount }, (_, index) => {
    const kept = previous[index];
    return kept === undefined ? staggeredStart(index, intervalMs) : Math.min(kept, intervalMs);
  });
}
