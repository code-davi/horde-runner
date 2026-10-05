import type Phaser from 'phaser';
import { GAME_HEIGHT, GAME_WIDTH } from '../dimensions';
import { PALETTE } from './palette';
import { ProgressBar } from './ProgressBar';

const MARGIN = 24;
const DEPTH = 100;
const STYLE = { fontFamily: 'sans-serif', color: '#ffffff', stroke: '#000000', strokeThickness: 6 };
/** Barra de carga do feixe, no rodapé (abaixo da tropa). */
const BEAM_BAR = { width: 300, height: 18, y: GAME_HEIGHT - 48 };

export interface HudData {
  readonly heroes: number;
  readonly weaponName: string;
  readonly weaponLevel: number;
  readonly score: number;
  /** Carga do feixe, de 0 a 1. */
  readonly beamCharge: number;
}

/** Placar no topo (heróis, arma, score) e barra do feixe no rodapé. Só reescreve textos que mudaram. */
export class Hud {
  private readonly heroes: Phaser.GameObjects.Text;
  private readonly weapon: Phaser.GameObjects.Text;
  private readonly score: Phaser.GameObjects.Text;
  private readonly beamBar: ProgressBar;

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
    this.beamBar = new ProgressBar(scene, { ...BEAM_BAR, color: PALETTE.beam });
    this.beamBar.setPosition(GAME_WIDTH / 2, BEAM_BAR.y);
    this.beamBar.setDepth(DEPTH);
  }

  update(data: HudData): void {
    setIfChanged(this.heroes, `${data.heroes} heróis`);
    setIfChanged(this.weapon, `${data.weaponName} (nv ${data.weaponLevel})`);
    setIfChanged(this.score, `${data.score}`);
    this.beamBar.setRatio(data.beamCharge);
  }
}

function setIfChanged(label: Phaser.GameObjects.Text, text: string): void {
  if (label.text !== text) label.setText(text);
}
