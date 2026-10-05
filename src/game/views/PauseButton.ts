import type Phaser from 'phaser';
import { GAME_WIDTH } from '../dimensions';
import { PALETTE } from './palette';

/** Centro e área de toque do botão: abaixo do score, 80 × 80 px lógicos (spec §3, item 4). */
const BUTTON = { x: GAME_WIDTH - 64, y: 130, size: 80 } as const;
const BAR = { width: 10, height: 34, gap: 8 } as const;
const BACKDROP_RADIUS = 30;
const BACKDROP_ALPHA = 0.35;
const DEPTH = 100;

/** Desenha o botão ⏸ do HUD; um toque nele chama `onPress`. */
export function addPauseButton(scene: Phaser.Scene, onPress: () => void): void {
  scene.add
    .circle(BUTTON.x, BUTTON.y, BACKDROP_RADIUS, PALETTE.iconBackdrop, BACKDROP_ALPHA)
    .setDepth(DEPTH);
  const barOffset = (BAR.width + BAR.gap) / 2;
  for (const dx of [-barOffset, barOffset]) {
    scene.add
      .rectangle(BUTTON.x + dx, BUTTON.y, BAR.width, BAR.height, PALETTE.icon)
      .setDepth(DEPTH);
  }
  scene.add
    .zone(BUTTON.x, BUTTON.y, BUTTON.size, BUTTON.size)
    .setInteractive()
    .on('pointerdown', () => onPress());
}
