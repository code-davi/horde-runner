import { OFFSCREEN_MARGIN_PX } from '../../core/balance';
import { advanceCadence, retrackCadence } from '../../core/cadence';
import { formationOffsets } from '../../core/formation';
import { unitShotDamage, type RenderUnit } from '../../core/troop';
import { weaponStats } from '../../core/weapons';
import type { Projectile } from '../entities/Projectile';
import type { Squad } from '../entities/Squad';
import type { ObjectPool } from './ObjectPool';

/** Disparo automático: cada unidade da tropa atira no ritmo da arma atual. */
export class FiringSystem {
  private readonly pool: ObjectPool<Projectile>;
  private trackedUnits: readonly RenderUnit[] = [];
  private offsets: { x: number; y: number }[] = [];
  private elapsed: number[] = [];
  private trackedLevel = 0;

  constructor(pool: ObjectPool<Projectile>) {
    this.pool = pool;
  }

  update(deltaMs: number, squad: Squad): void {
    const { units, state } = squad;
    const intervalMs = 1000 / weaponStats(state.weaponLevel).shotsPerSecond;
    if (units !== this.trackedUnits || state.weaponLevel !== this.trackedLevel) {
      this.track(units, state.weaponLevel, intervalMs);
    }

    units.forEach((unit, index) => {
      const step = advanceCadence(this.elapsed[index]!, deltaMs, intervalMs);
      this.elapsed[index] = step.elapsedMs;
      const damage = unitShotDamage(state.weaponLevel, unit);
      const offset = this.offsets[index]!;
      for (let shot = 0; shot < step.shots; shot++) {
        this.pool.acquire()?.fire(squad.x + offset.x, squad.y + offset.y, damage);
      }
    });

    this.recycleOffscreen();
  }

  /** Recalcula posições e ajusta os relógios (sem zerá-los) quando a tropa ou a arma mudam. */
  private track(units: readonly RenderUnit[], level: number, intervalMs: number): void {
    this.trackedUnits = units;
    this.trackedLevel = level;
    this.offsets = formationOffsets(units);
    this.elapsed = retrackCadence(this.elapsed, units.length, intervalMs);
  }

  private recycleOffscreen(): void {
    this.pool.forEachActive((projectile) => {
      if (projectile.y < -OFFSCREEN_MARGIN_PX) projectile.kill();
    });
  }
}
