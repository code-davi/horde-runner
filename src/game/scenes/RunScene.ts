import Phaser from 'phaser';
import { createBrowserSaveStore } from '../../platform/storage';
import { GAME_HEIGHT, GAME_WIDTH } from '../dimensions';
import { installPauseOnBlur } from '../pauseOnBlur';
import { markScene } from '../sceneMarker';
import type { UrlOptions } from '../urlOptions';
import { centeredText } from '../views/text';
import type { GameOverData } from './GameOverScene';

/** Placeholder do Task 8: a partida real é construída nos Tasks 9–14. */
const PLACEHOLDER_RUN_MS = 3000;

export class RunScene extends Phaser.Scene {
  constructor() {
    super('Run');
  }

  create(_options: UrlOptions): void {
    centeredText(this, 'Correndo…', { x: GAME_WIDTH / 2, y: GAME_HEIGHT / 2, size: 56 });
    installPauseOnBlur(this);
    this.time.delayedCall(PLACEHOLDER_RUN_MS, () => this.finish(0));
    markScene('Run');
  }

  private finish(score: number): void {
    const store = createBrowserSaveStore();
    const previousBest = store.loadHighScore();
    const isNewRecord = score > previousBest;
    if (isNewRecord) store.saveHighScore(score);
    const data: GameOverData = { score, highScore: Math.max(score, previousBest), isNewRecord };
    this.scene.start('GameOver', data);
  }
}
