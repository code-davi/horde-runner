import type Phaser from 'phaser';
import { GAME_WIDTH } from '../dimensions';

const MARGIN = 24;
const DEPTH = 100;
const STYLE = { fontFamily: 'sans-serif', color: '#ffffff', stroke: '#000000', strokeThickness: 6 };

export interface HudData {
  readonly heroes: number;
  readonly weaponName: string;
  readonly weaponLevel: number;
  readonly score: number;
}

/** Placar no topo: heróis (grande), arma e score. Só reescreve textos que mudaram. */
export class Hud {
  private readonly heroes: Phaser.GameObjects.Text;
  private readonly weapon: Phaser.GameObjects.Text;
  private readonly score: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene) {
    this.heroes = scene.add
      .text(MARGIN, MARGIN, '', { ...STYLE, fontSize: '52px', fontStyle: 'bold' })
      .setDepth(DEPTH);
    this.weapon = scene.add
      .text(MARGIN, MARGIN + 64, '', { ...STYLE, fontSize: '28px' })
      .setDepth(DEPTH);
    this.score = scene.add
      .text(GAME_WIDTH - MARGIN, MARGIN, '', { ...STYLE, fontSize: '36px' })
      .setOrigin(1, 0)
      .setDepth(DEPTH);
  }

  update(data: HudData): void {
    setIfChanged(this.heroes, `${data.heroes} heróis`);
    setIfChanged(this.weapon, `${data.weaponName} (nv ${data.weaponLevel})`);
    setIfChanged(this.score, `${data.score}`);
  }
}

function setIfChanged(label: Phaser.GameObjects.Text, text: string): void {
  if (label.text !== text) label.setText(text);
}
