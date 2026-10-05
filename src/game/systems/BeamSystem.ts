import type Phaser from 'phaser';
import {
  addCharge,
  beamBossDamage,
  beamCovers,
  initialBeam,
  isBeamActive,
  markBossHit,
  tickBeam,
  type BeamState,
} from '../../core/beam';
import type { Squad } from '../entities/Squad';
import { BeamView } from '../views/BeamView';
import type { BossEncounter } from './BossEncounter';
import type { CollisionEvents } from './Collisions';
import type { EnemySystem } from './EnemySystem';

interface BeamDeps {
  readonly enemies: EnemySystem;
  readonly squad: Squad;
  readonly boss: BossEncounter;
  readonly events: CollisionEvents;
}

/** O feixe na tela (ADR 0024): enche com abates por projétil, dispara sozinho e limpa uma coluna. */
export class BeamSystem {
  private state: BeamState = initialBeam;
  private readonly view: BeamView;
  private readonly deps: BeamDeps;

  constructor(scene: Phaser.Scene, deps: BeamDeps) {
    this.deps = deps;
    this.view = new BeamView(scene);
  }

  /** Carga da barra, de 0 a 1 (zero enquanto o feixe dispara). */
  get chargeRatio(): number {
    return this.state.charge;
  }

  /** Um projétil abateu um monstro: soma a carga dele (nada carrega com o chefão presente). */
  addKillCharge(amount: number): void {
    this.state = addCharge(this.state, amount, this.deps.boss.activeBoss !== null);
  }

  /** Debug: enche a barra e dispara o feixe na hora. */
  fill(): void {
    this.state = addCharge(this.state, 1, false);
  }

  update(deltaMs: number): void {
    if (!isBeamActive(this.state)) {
      this.view.hide();
      return;
    }
    const x = this.deps.squad.x;
    this.view.show(x);
    this.sweepEnemies(x);
    this.hitBoss(x);
    this.state = tickBeam(this.state, deltaMs);
  }

  private sweepEnemies(x: number): void {
    const { enemies, events } = this.deps;
    enemies.pool.forEachActive((enemy) => {
      if (!beamCovers(x, enemy.circle)) return;
      const at = { x: enemy.x, y: enemy.y };
      enemy.kill();
      events.onEnemyKilled(enemy.kind, at);
    });
  }

  /** Uma vez por disparo, tira a parte do feixe na vida do chefão (sem nunca derrotá-lo). */
  private hitBoss(x: number): void {
    const boss = this.deps.boss.activeBoss;
    if (!boss || this.state.bossHit || !beamCovers(x, boss.circle)) return;
    boss.damage(beamBossDamage(boss.health));
    this.state = markBossHit(this.state);
  }
}
