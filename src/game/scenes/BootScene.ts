import Phaser from 'phaser';
import { markScene } from '../sceneMarker';

/** Primeira cena: no futuro carrega assets (subprojeto 2); hoje só segue para o menu. */
export class BootScene extends Phaser.Scene {
  constructor() {
    super('Boot');
  }

  create(): void {
    markScene('Boot');
    this.scene.start('Start');
  }
}
