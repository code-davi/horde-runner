import type Phaser from 'phaser';
import { CHUNK_LENGTH_PX, OFFSCREEN_MARGIN_PX } from '../../core/balance';
import { ChunkGenerator, GATE_ROWS, type Chunk } from '../../core/chunks';
import { scrollSpeed } from '../../core/difficulty';
import type { Rng } from '../../core/rng';
import { GAME_HEIGHT, GAME_WIDTH } from '../dimensions';
import { GateRow } from '../entities/GateRow';
import { WeaponCrate } from '../entities/WeaponCrate';
import { advanceFrontier, shouldGenerateChunk } from './chunkTiming';
import type { EnemySystem } from './EnemySystem';

/** Transforma os trechos do gerador em portões, caixas e monstros que descem pela tela. */
export class ChunkSpawner {
  readonly gateRows: GateRow[] = [];
  readonly crates: WeaponCrate[] = [];
  /** Chamado quando um trecho de chefão é gerado (Task 13). */
  onBossChunk?: (bossNumber: number, y: number) => void;
  private readonly scene: Phaser.Scene;
  private readonly generator: ChunkGenerator;
  private readonly enemies: EnemySystem;
  private readonly troopCount: () => number;
  /** y (na tela) do topo do último trecho gerado; cresce conforme o caminho rola. */
  private frontierY = 0;
  private current!: Chunk;
  private bossActive = false;
  /** Um trecho de chefão foi gerado e o chefão ainda não foi derrotado. */
  private bossPending = false;

  /** `troopCount` informa a tropa atual: cada trecho é gerado conhecendo-a (ADR 0020). */
  constructor(
    scene: Phaser.Scene,
    rng: Rng,
    deps: { enemies: EnemySystem; troopCount: () => number },
  ) {
    this.scene = scene;
    this.generator = new ChunkGenerator(rng);
    this.enemies = deps.enemies;
    this.troopCount = deps.troopCount;
    this.spawnNext();
  }

  get currentChunk(): Chunk {
    return this.current;
  }

  /** Velocidade de rolagem em px/s; zero enquanto o chefão está na arena. */
  get scrollSpeed(): number {
    return this.bossActive ? 0 : scrollSpeed(this.current.index);
  }

  get isBossActive(): boolean {
    return this.bossActive;
  }

  /** O chefão chegou na arena: o caminho para (e nenhum trecho novo é gerado). */
  startBoss(): void {
    this.bossActive = true;
  }

  /** Chefão derrotado: o caminho volta a andar. */
  endBoss(): void {
    this.bossActive = false;
    this.bossPending = false;
  }

  update(deltaMs: number): void {
    const dy = (this.scrollSpeed * deltaMs) / 1000;
    this.frontierY = advanceFrontier({
      frontierY: this.frontierY,
      dy,
      bossPending: this.bossPending,
    });
    while (shouldGenerateChunk({ frontierY: this.frontierY, bossPending: this.bossPending })) {
      this.spawnNext();
    }
    this.gateRows.forEach((row) => row.moveTo(row.y + dy));
    this.crates.forEach((crate) => crate.moveTo(crate.y + dy));
    this.recycle();
  }

  private spawnNext(): void {
    const chunk = this.generator.next(this.troopCount());
    const top = this.frontierY - CHUNK_LENGTH_PX;
    this.frontierY = top;
    this.current = chunk;
    this.placeGates(chunk, top);
    if (chunk.crate) {
      const { x, offset } = chunk.crate;
      this.crates.push(new WeaponCrate(this.scene, x * GAME_WIDTH, top + offset * CHUNK_LENGTH_PX));
    }
    for (const { kind, hp, x, offset } of chunk.enemies) {
      this.enemies.spawn({ kind, hp, x: x * GAME_WIDTH, y: top + offset * CHUNK_LENGTH_PX });
    }
    if (chunk.bossNumber !== null) {
      this.bossPending = true;
      this.onBossChunk?.(chunk.bossNumber, top);
    }
  }

  private placeGates(chunk: Chunk, top: number): void {
    const rows = new Set(chunk.gates.map((placement) => placement.row));
    for (const row of rows) {
      const y = top + ((row + 1) * CHUNK_LENGTH_PX) / (GATE_ROWS + 1);
      const placements = chunk.gates.filter((placement) => placement.row === row);
      this.gateRows.push(new GateRow(this.scene, placements, y));
    }
  }

  private recycle(): void {
    const limit = GAME_HEIGHT + OFFSCREEN_MARGIN_PX;
    removeWhere(
      this.gateRows,
      (row) => row.y > limit,
      (row) => row.destroy(),
    );
    removeWhere(
      this.crates,
      (crate) => crate.consumed || crate.y > limit,
      (crate) => crate.destroy(),
    );
  }
}

/** Remove (in place) os itens que satisfazem `shouldRemove`, chamando `onRemove` em cada um. */
function removeWhere<T>(
  items: T[],
  shouldRemove: (item: T) => boolean,
  onRemove: (item: T) => void,
): void {
  for (let i = items.length - 1; i >= 0; i--) {
    const item = items[i]!;
    if (!shouldRemove(item)) continue;
    onRemove(item);
    items.splice(i, 1);
  }
}
