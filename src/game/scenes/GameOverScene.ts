import Phaser from 'phaser';
import { GAME_HEIGHT, GAME_WIDTH } from '../dimensions';
import { markScene } from '../sceneMarker';
import { centeredText } from '../views/text';

export interface GameOverData {
  readonly score: number;
  readonly highScore: number;
  readonly isNewRecord: boolean;
}

export class GameOverScene extends Phaser.Scene {
  constructor() {
    super('GameOver');
  }

  create(data: GameOverData): void {
    const x = GAME_WIDTH / 2;
    centeredText(this, 'Fim de jogo', { x, y: GAME_HEIGHT * 0.3, size: 72 });
    centeredText(this, `Score: ${data.score}`, { x, y: GAME_HEIGHT * 0.45, size: 48 });
    centeredText(this, `Recorde: ${data.highScore}`, { x, y: GAME_HEIGHT * 0.53, size: 40 });
    if (data.isNewRecord)
      centeredText(this, 'Novo recorde!', { x, y: GAME_HEIGHT * 0.61, size: 44 });
    centeredText(this, 'Toque para jogar de novo', { x, y: GAME_HEIGHT * 0.75, size: 40 });

    this.input.once('pointerdown', () => this.scene.start('Start'));
    markScene('GameOver');
  }
}
