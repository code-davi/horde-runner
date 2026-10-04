import type Phaser from 'phaser';
import { enemyDef, type EnemyKind } from '../core/enemies';
import { gateLabel, isGoodGate, type Gate } from '../core/gates';
import type { Squad } from './entities/Squad';
import { PopTexts } from './views/feedback';

const GOOD_COLOR = '#7CFC00';
const BAD_COLOR = '#ff4d4d';
const NEUTRAL_COLOR = '#fff3b0';
const ABOVE_SQUAD_PX = 90;

/** Reações visuais ("juice") aos eventos da partida. Não muda nenhuma regra. */
export class RunFeedback {
  private readonly pops: PopTexts;
  private readonly squad: Squad;

  constructor(scene: Phaser.Scene, squad: Squad) {
    this.pops = new PopTexts(scene);
    this.squad = squad;
  }

  gateCrossed(gate: Gate): void {
    this.pops.show(this.aboveSquad(), gateLabel(gate), isGoodGate(gate) ? GOOD_COLOR : BAD_COLOR);
    this.squad.punch();
  }

  squadHit(heroesLost: number): void {
    this.pops.show(this.aboveSquad(), `-${heroesLost}`, BAD_COLOR);
    this.squad.flashHit();
  }

  enemyKilled(kind: EnemyKind, at: { x: number; y: number }): void {
    this.pops.show(at, `+${enemyDef(kind).points}`, NEUTRAL_COLOR);
  }

  weaponUpgraded(): void {
    this.pops.show(this.aboveSquad(), 'Arma +1', GOOD_COLOR);
    this.squad.punch();
  }

  bossDefeated(points: number): void {
    this.pops.show(this.aboveSquad(), `Chefão! +${points}`, GOOD_COLOR);
  }

  private aboveSquad(): { x: number; y: number } {
    return { x: this.squad.x, y: this.squad.y - this.squad.radius - ABOVE_SQUAD_PX };
  }
}
