import Phaser from 'phaser';
import { GAME_HEIGHT, GAME_WIDTH } from '../dimensions';

export class BootScene extends Phaser.Scene {
  constructor() {
    super('Boot');
  }

  create(): void {
    this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'Horde Runner', {
        fontFamily: 'sans-serif',
        fontSize: '64px',
        color: '#ffffff',
      })
      .setOrigin(0.5);
  }
}
