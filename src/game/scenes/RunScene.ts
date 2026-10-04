import Phaser from 'phaser';
import { bossPoints, type EnemyKind } from '../../core/enemies';
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
import { weaponStats } from '../../core/weapons';
import { createBrowserSaveStore } from '../../platform/storage';
import { installPauseOnBlur } from '../pauseOnBlur';
import { RunFeedback } from '../RunFeedback';
import { RunWorld } from '../RunWorld';
import { markScene } from '../sceneMarker';
import { DebugOverlay } from '../systems/DebugOverlay';
import type { UrlOptions } from '../urlOptions';
import { Hud } from '../views/Hud';
import type { GameOverData } from './GameOverScene';

/** A partida: liga os eventos do mundo às regras do core e cuida do score e do fim de jogo. */
export class RunScene extends Phaser.Scene {
  private world!: RunWorld;
  private feedback!: RunFeedback;
  private hud!: Hud;
  private debug: DebugOverlay | null = null;
  private seed = 0;
  private score: ScoreState = initialScore;
  private finished = false;

  constructor() {
    super('Run');
  }

  create(options: UrlOptions): void {
    this.score = initialScore;
    this.finished = false;
    this.seed = options.seed;
    this.world = new RunWorld(this, options.seed, {
      onEnemyKilled: (kind, at) => this.onEnemyKilled(kind, at),
      onSquadHit: (heroesLost) => this.onSquadHit(heroesLost),
      onGateCrossed: (gate) => this.onGateCrossed(gate),
      onWeaponUpgrade: () => this.onWeaponUpgrade(),
      onBossDefeated: (bossNumber) => this.onBossDefeated(bossNumber),
      onBossReachedSquad: () => this.finish(),
    });
    this.feedback = new RunFeedback(this, this.world.squad);
    this.hud = new Hud(this);
    this.debug = options.debug ? this.enableDebug() : null;
    installPauseOnBlur(this);
    markScene('Run');
  }

  override update(_time: number, delta: number): void {
    if (this.finished) return;
    const dt = clampDelta(delta);
    this.score = addDistance(this.score, (this.world.scrollSpeed * dt) / 1000);
    this.world.update(dt);
    this.refreshPanels();
  }

  private refreshPanels(): void {
    const { count, weaponLevel } = this.world.squad.state;
    const weaponName = weaponStats(weaponLevel).name;
    this.hud.update({ heroes: count, weaponName, weaponLevel, score: totalScore(this.score) });
    const chunk = this.world.spawner.currentChunk;
    this.debug?.update({
      fps: this.game.loop.actualFps,
      heroes: count,
      weaponLevel,
      chunkIndex: chunk.index,
      template: chunk.template,
      seed: this.seed,
    });
  }

  /** Painel de debug + `window.__horde` (`setTroop`, `endRun`), usados pelo smoke test e para testar à mão. */
  private enableDebug(): DebugOverlay {
    const setTroop = (count: number, weaponLevel: number): void =>
      this.world.squad.setState({ count, weaponLevel });
    Object.assign(window, { __horde: { setTroop, endRun: () => this.finish() } });
    return new DebugOverlay(this);
  }

  private onEnemyKilled(kind: EnemyKind, at: { x: number; y: number }): void {
    this.score = addKill(this.score, kind);
    this.feedback.enemyKilled(kind, at);
  }

  private onSquadHit(heroesLost: number): void {
    this.feedback.squadHit(heroesLost);
    this.changeTroop((troop) => takeHit(troop, heroesLost));
  }

  private onGateCrossed(gate: Gate): void {
    this.feedback.gateCrossed(gate);
    this.changeTroop((troop) => applyGate(troop, gate));
  }

  private onWeaponUpgrade(): void {
    this.feedback.weaponUpgraded();
    this.changeTroop(upgradeWeapon);
  }

  private onBossDefeated(bossNumber: number): void {
    this.score = addBossKill(this.score, bossNumber);
    this.feedback.bossDefeated(bossPoints(bossNumber));
  }

  /** Única porta de mudança da tropa: aplica a regra e checa a derrota. */
  private changeTroop(rule: (troop: TroopState) => TroopState): void {
    const squad = this.world.squad;
    squad.setState(rule(squad.state));
    if (isDefeated(squad.state)) this.finish();
  }

  /** Encerra a partida uma única vez, grava o recorde e vai para o fim de jogo. */
  private finish(): void {
    if (this.finished) return;
    this.finished = true;
    const score = totalScore(this.score);
    const store = createBrowserSaveStore();
    const previousBest = store.loadHighScore();
    const isNewRecord = score > previousBest;
    if (isNewRecord) store.saveHighScore(score);
    const data: GameOverData = { score, highScore: Math.max(score, previousBest), isNewRecord };
    this.scene.start('GameOver', data);
  }
}
