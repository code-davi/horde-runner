import Phaser from 'phaser';
import type { EnemyKind } from '../../core/enemies';
import type { Gate } from '../../core/gates';
import {
  addBossKill,
  addDistance,
  addKill,
  initialScore,
  totalScore,
  type ScoreState,
} from '../../core/scoring';
import { clampDelta } from '../../core/time';
import { applyGate, isDefeated, takeHit, upgradeWeapon, type TroopState } from '../../core/troop';
import { createBrowserSaveStore } from '../../platform/storage';
import { installPauseOnBlur } from '../pauseOnBlur';
import { RunWorld } from '../RunWorld';
import { markScene } from '../sceneMarker';
import type { UrlOptions } from '../urlOptions';
import type { GameOverData } from './GameOverScene';

/** A partida: liga os eventos do mundo às regras do core e cuida do score e do fim de jogo. */
export class RunScene extends Phaser.Scene {
  private world!: RunWorld;
  private score: ScoreState = initialScore;
  private finished = false;

  constructor() {
    super('Run');
  }

  create(options: UrlOptions): void {
    this.score = initialScore;
    this.finished = false;
    this.world = new RunWorld(this, options.seed, {
      onEnemyKilled: (kind) => this.onEnemyKilled(kind),
      onSquadHit: (heroesLost) => this.changeTroop((troop) => takeHit(troop, heroesLost)),
      onGateCrossed: (gate) => this.onGateCrossed(gate),
      onWeaponUpgrade: () => this.changeTroop(upgradeWeapon),
      onBossDefeated: (bossNumber) => this.onBossDefeated(bossNumber),
      onBossReachedSquad: () => this.finish(totalScore(this.score)),
    });
    installPauseOnBlur(this);
    markScene('Run');
  }

  override update(_time: number, delta: number): void {
    if (this.finished) return;
    const dt = clampDelta(delta);
    this.score = addDistance(this.score, (this.world.scrollSpeed * dt) / 1000);
    this.world.update(dt);
  }

  private onEnemyKilled(kind: EnemyKind): void {
    this.score = addKill(this.score, kind);
  }

  private onBossDefeated(bossNumber: number): void {
    this.score = addBossKill(this.score, bossNumber);
  }

  private onGateCrossed(gate: Gate): void {
    this.changeTroop((troop) => applyGate(troop, gate));
  }

  /** Única porta de mudança da tropa: aplica a regra e checa a derrota. */
  private changeTroop(rule: (troop: TroopState) => TroopState): void {
    const squad = this.world.squad;
    squad.setState(rule(squad.state));
    if (isDefeated(squad.state)) this.finish(totalScore(this.score));
  }

  /** Encerra a partida uma única vez, grava o recorde e vai para o fim de jogo. */
  private finish(score: number): void {
    if (this.finished) return;
    this.finished = true;
    const store = createBrowserSaveStore();
    const previousBest = store.loadHighScore();
    const isNewRecord = score > previousBest;
    if (isNewRecord) store.saveHighScore(score);
    const data: GameOverData = { score, highScore: Math.max(score, previousBest), isNewRecord };
    this.scene.start('GameOver', data);
  }
}
