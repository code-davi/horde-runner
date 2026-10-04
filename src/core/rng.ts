/** Gerador de números aleatórios reproduzível: a mesma seed sempre gera a mesma sequência. */
export interface Rng {
  /** Número em [0, 1). */
  next(): number;
  /** Inteiro em [min, max], inclusivo nas duas pontas. */
  int(min: number, max: number): number;
  /** Um elemento qualquer da lista (não vazia). */
  pick<T>(items: readonly T[]): T;
  /** Uma chave sorteada com probabilidade proporcional ao peso; pesos ≤ 0 nunca saem. */
  weighted<K extends string>(weights: Record<K, number>): K;
}

const UINT32_RANGE = 2 ** 32;

/** Cria um RNG com o algoritmo mulberry32 (rápido, 32 bits, bom o bastante para jogos). */
export function createRng(seed: number): Rng {
  let state = seed >>> 0;

  const next = (): number => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / UINT32_RANGE;
  };

  const int = (min: number, max: number): number => min + Math.floor(next() * (max - min + 1));

  const pick = <T>(items: readonly T[]): T => {
    const item = items[int(0, items.length - 1)];
    if (item === undefined) throw new Error('pick() precisa de uma lista não vazia');
    return item;
  };

  const weighted = <K extends string>(weights: Record<K, number>): K => {
    const entries = (Object.entries(weights) as [K, number][]).filter(([, weight]) => weight > 0);
    const total = entries.reduce((sum, [, weight]) => sum + weight, 0);
    if (total === 0) throw new Error('weighted() precisa de ao menos um peso positivo');

    let roll = next() * total;
    for (const [key, weight] of entries) {
      roll -= weight;
      if (roll < 0) return key;
    }
    // Arredondamento de ponto flutuante pode sobrar um resto mínimo: fica com o último.
    return entries[entries.length - 1]![0];
  };

  return { next, int, pick, weighted };
}
