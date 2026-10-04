import { resolveRowCrossing } from '../../core/crossing';
import type { Gate } from '../../core/gates';
import { circlesOverlap } from '../../core/geometry';
import type { Projectile } from '../entities/Projectile';
import type { Squad } from '../entities/Squad';
import type { ChunkSpawner } from './ChunkSpawner';
import type { ObjectPool } from './ObjectPool';

/** O que a cena quer saber de portões e caixas; as regras de cada efeito ficam no core. */
export interface PathEvents {
  onGateCrossed(gate: Gate): void;
  onWeaponUpgrade(): void;
}

interface PathCollisionDeps {
  readonly projectiles: ObjectPool<Projectile>;
  readonly spawner: ChunkSpawner;
  readonly squad: Squad;
  readonly events: PathEvents;
}

/** Colisões com o "caminho": tiros em portões e caixas, tropa cruzando portões e caixas. */
export class PathCollisionSystem {
  private readonly deps: PathCollisionDeps;

  constructor(deps: PathCollisionDeps) {
    this.deps = deps;
  }

  update(): void {
    this.deps.projectiles.forEachActive((projectile) => {
      if (!this.hitGate(projectile)) this.hitCrate(projectile);
    });
    this.crossGates();
    this.touchCrates();
  }

  /** Projétil em portão de soma: o valor sobe (ADR 0009). Os demais portões são atravessados. */
  private hitGate(projectile: Projectile): boolean {
    for (const row of this.deps.spawner.gateRows) {
      const lane = row.shootableLaneAt(projectile.x, projectile.y);
      if (!lane) continue;
      row.hit(lane);
      projectile.kill();
      return true;
    }
    return false;
  }

  private hitCrate(projectile: Projectile): void {
    const shot = { x: projectile.x, y: projectile.y, radius: projectile.radius };
    for (const crate of this.deps.spawner.crates) {
      if (crate.consumed || !circlesOverlap(shot, crate.circle)) continue;
      projectile.kill();
      if (crate.hit()) {
        crate.consume();
        this.deps.events.onWeaponUpgrade();
      }
      return;
    }
  }

  /** A fileira passou pela linha da tropa: aplica o portão da faixa em que ela está. */
  private crossGates(): void {
    const { spawner, squad, events } = this.deps;
    for (const row of spawner.gateRows) {
      if (row.consumed || row.y < squad.y) continue;
      const crossed = resolveRowCrossing(row.placements, squad.x);
      row.consume();
      if (crossed) events.onGateCrossed(crossed.gate);
    }
  }

  private touchCrates(): void {
    const { spawner, squad, events } = this.deps;
    for (const crate of spawner.crates) {
      if (crate.consumed || !circlesOverlap(squad.circle, crate.circle)) continue;
      crate.consume();
      events.onWeaponUpgrade();
    }
  }
}
