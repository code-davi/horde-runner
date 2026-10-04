import { describe, expect, it } from 'vitest';
import { ENEMIES, STRONG_ENEMY_MIN_CHUNK } from '../../src/core/balance';
import { ChunkGenerator, type Chunk } from '../../src/core/chunks';
import { hordeBudget } from '../../src/core/difficulty';
import { violatedGuardrails } from '../../src/core/guardrails';
import { createRng } from '../../src/core/rng';

const SEEDS = 10_000;
const CHUNKS_PER_RUN = 60;
/** Tamanhos de tropa cobrindo todos os níveis de pressão (ADR 0020). */
const TROOP_SIZES = [1, 7, 49, 50, 180, 250, 900, 1000, 5000];

function enemyCost(chunk: Chunk): number {
  return chunk.enemies.reduce((sum, enemy) => sum + ENEMIES[enemy.kind].cost, 0);
}

/** Um trecho gerado na posição `n`, com o histórico anterior e a tropa usada para gerá-lo. */
interface Generated {
  readonly chunk: Chunk;
  readonly n: number;
  readonly troop: number;
}

function chunkProblems({ chunk, n, troop }: Generated, history: readonly Chunk[]): string[] {
  const broken = violatedGuardrails(history, chunk, troop);
  const checks: [boolean, string][] = [
    [chunk.index !== n, `índice ${chunk.index}`],
    [broken.length > 0, `travas ${broken.join(',')}`],
    [n % 8 === 0 && (chunk.template !== 'boss' || chunk.bossNumber !== n / 8), 'chefão'],
    [chunk.template !== 'boss' && enemyCost(chunk) > hordeBudget(n, troop), 'orçamento'],
    [n < STRONG_ENEMY_MIN_CHUNK && chunk.enemies.some((e) => e.kind === 'strong'), 'forte cedo'],
  ];
  return checks.filter(([failed]) => failed).map(([, problem]) => problem);
}

function collectViolations(seed: number): string[] {
  const generator = new ChunkGenerator(createRng(seed));
  const troopRng = createRng(seed + 1_000_000);
  const history: Chunk[] = [];
  const problems: string[] = [];

  for (let n = 1; n <= CHUNKS_PER_RUN; n++) {
    const troop = troopRng.pick(TROOP_SIZES);
    const chunk = generator.next(troop);
    const found = chunkProblems({ chunk, n, troop }, history);
    problems.push(...found.map((problem) => `seed ${seed}, trecho ${n}: ${problem}`));
    history.push(chunk);
  }
  return problems;
}

describe('ChunkGenerator over many seeds', () => {
  it(
    `never breaks a rule in ${SEEDS} runs of ${CHUNKS_PER_RUN} chunks`,
    { timeout: 120_000 },
    () => {
      const problems: string[] = [];
      for (let seed = 1; seed <= SEEDS; seed++) {
        problems.push(...collectViolations(seed));
      }

      expect(problems.slice(0, 10)).toEqual([]);
    },
  );

  it('produces the same chunks for the same seed', () => {
    const a = new ChunkGenerator(createRng(99));
    const b = new ChunkGenerator(createRng(99));

    for (let n = 0; n < 20; n++) {
      expect(a.next(120)).toEqual(b.next(120));
    }
  });
});
