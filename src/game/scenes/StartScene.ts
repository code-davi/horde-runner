import Phaser from 'phaser';
import { createBrowserSaveStore } from '../../platform/storage';
import { GAME_HEIGHT, GAME_WIDTH } from '../dimensions';
import { markScene } from '../sceneMarker';
import { parseUrlOptions } from '../urlOptions';
import { centeredText } from '../views/text';

const SEED_RANGE = 2 ** 31;

export class StartScene extends Phaser.Scene {
  constructor() {
    super('Start');
  }

  create(): void {
    const highScore = createBrowserSaveStore().loadHighScore();
    const x = GAME_WIDTH / 2;
    centeredText(this, 'Horde Runner', { x, y: GAME_HEIGHT * 0.35, size: 72 });
    centeredText(this, `Recorde: ${highScore}`, { x, y: GAME_HEIGHT * 0.5, size: 40 });
    centeredText(this, 'Toque para começar', { x, y: GAME_HEIGHT * 0.7, size: 44 });

    this.input.once('pointerdown', () => {
      this.scene.start('Run', parseUrlOptions(window.location.search, Date.now() % SEED_RANGE));
    });
    markScene('Start');
  }
}
