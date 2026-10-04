import { describe, expect, it } from 'vitest';
import { ENEMIES, STRONG_ENEMY_MIN_CHUNK, threatBudget } from '../../src/core/balance';
import { ChunkGenerator, type Chunk } from '../../src/core/chunks';
import { violatedGuardrails } from '../../src/core/guardrails';
import { createRng } from '../../src/core/rng';

const SEEDS = 10_000;
const CHUNKS_PER_RUN = 60;

function enemyCost(chunk: Chunk): number {
  return chunk.enemies.reduce((sum, enemy) => sum + ENEMIES[enemy.kind].cost, 0);
}

/** Problemas de um trecho gerado na posição `n`, dado o histórico anterior. */
function chunkProblems(chunk: Chunk, n: number, history: readonly Chunk[]): string[] {
  const broken = violatedGuardrails(history, chunk);
  const checks: [boolean, string][] = [
    [chunk.index !== n, `índice ${chunk.index}`],
    [broken.length > 0, `travas ${broken.join(',')}`],
    [n % 8 === 0 && (chunk.template !== 'boss' || chunk.bossNumber !== n / 8), 'chefão'],
    [chunk.template !== 'boss' && enemyCost(chunk) > threatBudget(n), 'orçamento'],
    [n < STRONG_ENEMY_MIN_CHUNK && chunk.enemies.some((e) => e.kind === 'strong'), 'forte cedo'],
  ];
  return checks.filter(([failed]) => failed).map(([, problem]) => problem);
}

function collectViolations(seed: number): string[] {
  const generator = new ChunkGenerator(createRng(seed));
  const history: Chunk[] = [];
  const problems: string[] = [];

  for (let n = 1; n <= CHUNKS_PER_RUN; n++) {
    const chunk = generator.next();
    const found = chunkProblems(chunk, n, history);
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
      expect(a.next()).toEqual(b.next());
    }
  });
});
