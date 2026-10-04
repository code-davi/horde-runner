import {
  BOSS_EVERY,
  MAX_GENERATION_ATTEMPTS,
  PUNITIVE_STREAK_LIMIT,
  TUTORIAL_CHUNKS,
} from './balance';
import { bossHorde, fillHorde, fillTemplate } from './chunkTemplates';
import { bossNumberAt, isBossChunk, templateWeights, type TemplateKind } from './difficulty';
import type { EnemyKind } from './enemies';
import type { Gate } from './gates';
import { violatedGuardrails } from './guardrails';
import type { Lane } from './lanes';
import type { Rng } from './rng';

/** Fileiras de portões por trecho: 0 (topo) a GATE_ROWS - 1. */
export const GATE_ROWS = 4;

export interface GatePlacement {
  readonly lane: Lane;
  readonly row: number;
  readonly gate: Gate;
}

/** `x` em [0.1, 0.9] da largura; `offset` em [0, 1) do comprimento do trecho. */
export interface EnemySpawn {
  readonly kind: EnemyKind;
  readonly x: number;
  readonly offset: number;
}

export interface Chunk {
  readonly index: number;
  readonly template: TemplateKind | 'boss';
  readonly gates: readonly GatePlacement[];
  readonly crate: { readonly x: number; readonly offset: number } | null;
  readonly enemies: readonly EnemySpawn[];
  readonly bossNumber: number | null;
}

const TUTORIAL_TEMPLATES: readonly TemplateKind[] = ['classicPair', 'loneGate', 'hordeOnly'];
const PRE_BOSS_TEMPLATES: readonly TemplateKind[] = ['bestOfGood', 'weaponCrate'];

/** Gera o caminho infinito, trecho a trecho, sempre respeitando as travas de justiça. */
export class ChunkGenerator {
  private readonly rng: Rng;
  private readonly recent: Chunk[] = [];
  private index = 0;

  constructor(rng: Rng) {
    this.rng = rng;
  }

  next(): Chunk {
    this.index += 1;
    const chunk = isBossChunk(this.index) ? this.bossChunk() : this.fairChunk();
    this.recent.push(chunk);
    if (this.recent.length > PUNITIVE_STREAK_LIMIT) this.recent.shift();
    return chunk;
  }

  private bossChunk(): Chunk {
    return {
      index: this.index,
      template: 'boss',
      gates: [],
      crate: null,
      enemies: bossHorde(this.index, this.rng),
      bossNumber: bossNumberAt(this.index),
    };
  }

  private fairChunk(): Chunk {
    for (let attempt = 0; attempt < MAX_GENERATION_ATTEMPTS; attempt++) {
      const candidate = this.build(this.chooseTemplate());
      if (violatedGuardrails(this.recent, candidate).length === 0) return candidate;
    }
    return this.build(this.isPreBoss() ? 'weaponCrate' : 'hordeOnly');
  }

  private chooseTemplate(): TemplateKind {
    if (this.isPreBoss()) return this.rng.pick(PRE_BOSS_TEMPLATES);
    if (this.index <= TUTORIAL_CHUNKS) return this.rng.pick(TUTORIAL_TEMPLATES);
    return this.rng.weighted(templateWeights(this.index));
  }

  private isPreBoss(): boolean {
    return this.index % BOSS_EVERY === BOSS_EVERY - 1;
  }

  private build(template: TemplateKind): Chunk {
    const content = fillTemplate(template, this.index, this.rng);
    const enemies = fillHorde(this.index, this.rng);
    return { index: this.index, template, ...content, enemies, bossNumber: null };
  }
}
