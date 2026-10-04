import type Phaser from 'phaser';
import type { EnemyKind } from '../../core/enemies';
import { PALETTE } from './palette';

const OUTLINE_WIDTH = 4;

const FILL_BY_KIND: Record<EnemyKind, number> = {
  common: PALETTE.common,
  strong: PALETTE.strong,
};

/**
 * Aparência de um inimigo no subprojeto 1: círculo colorido com contorno grosso.
 * No subprojeto 2 vira sprite animado; só este arquivo muda.
 */
export function styleEnemy(shape: Phaser.GameObjects.Arc, kind: EnemyKind, radius: number): void {
  shape.setRadius(radius);
  shape.setFillStyle(FILL_BY_KIND[kind]);
  shape.setStrokeStyle(OUTLINE_WIDTH, PALETTE.enemyOutline);
}
