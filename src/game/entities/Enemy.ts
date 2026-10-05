import Phaser from 'phaser';
import { enemyDef, type EnemyKind } from '../../core/enemies';
import type { Circle } from '../../core/geometry';
import { applyDamage, createHealth, isDepleted, type Health } from '../../core/health';
import type { Poolable } from '../systems/ObjectPool';
import { styleEnemy } from '../views/EnemyView';

/** Onde e como um monstro nasce: tipo, vida (já com a distância, ADR 0023), carga do feixe e posição. */
export interface EnemySpawnAt {
  readonly kind: EnemyKind;
  readonly hp: number;
  readonly charge: number;
  readonly x: number;
  readonly y: number;
}

/** Um monstro. Uma única classe para todos os tipos: o que muda vem de `enemyDef(kind)`. */
export class Enemy extends Phaser.GameObjects.Arc implements Poolable {
  kind: EnemyKind = 'common';
  health: Health = createHealth(1);
  /** Quanto da barra do feixe este monstro vale ao ser abatido por projétil. */
  charge = 0;

  constructor(scene: Phaser.Scene) {
    super(scene, 0, 0, enemyDef('common').radius);
  }

  spawn({ kind, hp, charge, x, y }: EnemySpawnAt): void {
    const { radius } = enemyDef(kind);
    this.kind = kind;
    this.charge = charge;
    this.health = createHealth(hp);
    styleEnemy(this, kind, radius);
    this.setActive(true).setVisible(true);
    const body = this.arcadeBody();
    body.enable = true;
    body.setCircle(radius);
    body.reset(x, y);
  }

  /** Aplica dano; devolve `true` se o monstro morreu (e já o devolve ao pool). */
  damage(amount: number): boolean {
    this.health = applyDamage(this.health, amount);
    if (!isDepleted(this.health)) return false;
    this.kill();
    return true;
  }

  get circle(): Circle {
    return { x: this.x, y: this.y, radius: enemyDef(this.kind).radius };
  }

  /** Velocidade em px/s: `vx` é a perseguição lateral, `vy` a queda (rolagem + caminhada). */
  move(vx: number, vy: number): void {
    this.arcadeBody().setVelocity(vx, vy);
  }

  kill(): void {
    this.setActive(false).setVisible(false);
    const body = this.arcadeBody();
    body.stop();
    body.enable = false;
  }

  private arcadeBody(): Phaser.Physics.Arcade.Body {
    // O pool é um grupo de física, então todo membro ganha um corpo Arcade dinâmico.
    return this.body as Phaser.Physics.Arcade.Body;
  }
}
