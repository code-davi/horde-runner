import type Phaser from 'phaser';
import { BRIDGE_LEFT_X, BRIDGE_RIGHT_X } from '../../core/balance';
import { GAME_HEIGHT, GAME_WIDTH } from '../dimensions';
import { PALETTE } from './palette';

const EDGE_WIDTH = 8;

/** Desenha a ponte: água nas laterais e uma borda em cada lado da área jogável (ADR 0022). */
export function drawBridge(scene: Phaser.Scene): void {
  const strip = (left: number, width: number, color: number): void => {
    scene.add.rectangle(left, 0, width, GAME_HEIGHT, color).setOrigin(0, 0);
  };
  strip(0, BRIDGE_LEFT_X, PALETTE.water);
  strip(BRIDGE_RIGHT_X, GAME_WIDTH - BRIDGE_RIGHT_X, PALETTE.water);
  strip(BRIDGE_LEFT_X - EDGE_WIDTH, EDGE_WIDTH, PALETTE.bridgeEdge);
  strip(BRIDGE_RIGHT_X, EDGE_WIDTH, PALETTE.bridgeEdge);
}
