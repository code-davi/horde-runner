import type Phaser from 'phaser';
import { SQUAD_FOLLOW_SPEED, SQUAD_MAX_X, SQUAD_MIN_X, SQUAD_Y } from '../../core/balance';
import type { Circle } from '../../core/geometry';
import { approach, clamp } from '../../core/motion';
import { initialTroop, renderUnits, type RenderUnit, type TroopState } from '../../core/troop';
import { GAME_WIDTH } from '../dimensions';
import { SquadView } from '../views/SquadView';

/** A tropa na tela: guarda o estado de regra e a posição; o desenho fica com a SquadView. */
export class Squad {
  readonly y = SQUAD_Y;
  x = GAME_WIDTH / 2;
  private troop: TroopState = initialTroop;
  private renderedUnits: RenderUnit[] = renderUnits(initialTroop.count);
  private readonly view: SquadView;

  constructor(scene: Phaser.Scene) {
    this.view = new SquadView(scene);
    this.view.render(this, this.renderedUnits);
  }

  get state(): TroopState {
    return this.troop;
  }

  get units(): readonly RenderUnit[] {
    return this.renderedUnits;
  }

  get radius(): number {
    return this.view.radius;
  }

  /** Círculo que envolve a tropa inteira, para colisões por distância. */
  get circle(): Circle {
    return { x: this.x, y: this.y, radius: this.radius };
  }

  /** Troca o estado de regra; recalcula as unidades só se a contagem mudou. */
  setState(next: TroopState): void {
    if (next.count !== this.troop.count) this.renderedUnits = renderUnits(next.count);
    this.troop = next;
    this.view.render(this, this.renderedUnits);
  }

  /** Reação visual a dano. */
  flashHit(): void {
    this.view.flash();
  }

  /** Reação visual a uma mudança boa ou ruim (portão, arma). */
  punch(): void {
    this.view.punch();
  }

  /** Move a tropa em direção a `targetX`, limitada pela velocidade e pelas bordas. */
  update(deltaMs: number, targetX: number): void {
    const maxStep = (SQUAD_FOLLOW_SPEED * deltaMs) / 1000;
    this.x = approach(this.x, clamp(targetX, SQUAD_MIN_X, SQUAD_MAX_X), maxStep);
    this.view.render(this, this.renderedUnits);
  }
}
