import type Phaser from 'phaser';
import { GATE_HEIGHT, GATE_WIDTH, LANE_CENTER_X } from '../../core/balance';
import type { GatePlacement } from '../../core/chunks';
import { hitGate, isShootable } from '../../core/gates';
import { laneAt, type Lane } from '../../core/lanes';
import { GateView } from '../views/GateView';

interface LaneGate {
  placement: GatePlacement;
  readonly view: GateView;
}

/** Uma fileira de portões (1 ou 2, um por faixa) que desce com o caminho. */
export class GateRow {
  y: number;
  consumed = false;
  private readonly lanes = new Map<Lane, LaneGate>();

  constructor(scene: Phaser.Scene, placements: readonly GatePlacement[], y: number) {
    this.y = y;
    for (const placement of placements) {
      const view = new GateView(scene, LANE_CENTER_X[placement.lane], placement.gate);
      this.lanes.set(placement.lane, { placement, view });
    }
    this.moveTo(y);
  }

  /** Portões atuais da fileira (com os valores já alterados por tiros). */
  get placements(): GatePlacement[] {
    return [...this.lanes.values()].map((laneGate) => laneGate.placement);
  }

  /** Faixa de um portão atirável que contém o ponto (x, y), ou `null`. Não aloca memória. */
  shootableLaneAt(x: number, y: number): Lane | null {
    if (this.consumed || Math.abs(y - this.y) > GATE_HEIGHT / 2) return null;
    const lane = laneAt(x);
    const laneGate = this.lanes.get(lane);
    if (!laneGate || !isShootable(laneGate.placement.gate)) return null;
    return Math.abs(x - LANE_CENTER_X[lane]) <= GATE_WIDTH / 2 ? lane : null;
  }

  /** Um projétil acertou o portão desta faixa. */
  hit(lane: Lane): void {
    const laneGate = this.lanes.get(lane);
    if (!laneGate) return;
    laneGate.placement = { ...laneGate.placement, gate: hitGate(laneGate.placement.gate) };
    laneGate.view.show(laneGate.placement.gate);
  }

  consume(): void {
    this.consumed = true;
    this.lanes.forEach(({ view }) => view.fade());
  }

  moveTo(y: number): void {
    this.y = y;
    this.lanes.forEach(({ view }) => view.setY(y));
  }

  destroy(): void {
    this.lanes.forEach(({ view }) => view.destroy());
  }
}
