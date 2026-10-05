import Phaser from 'phaser';
import { GAME_HEIGHT, GAME_WIDTH } from './dimensions';
import { markPaused } from './sceneMarker';
import { centeredText } from './views/text';

const OVERLAY_DEPTH = 1000;

/** Pausa a partida sozinha quando a aba/app perde o foco. */
export function installPauseOnBlur(scene: Phaser.Scene): void {
  const onVisibilityChange = (): void => {
    if (document.hidden) pauseUntilTap(scene);
  };
  document.addEventListener('visibilitychange', onVisibilityChange);
  scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () =>
    document.removeEventListener('visibilitychange', onVisibilityChange),
  );
}

/** Pausa a partida (botão ⏸ ou perda de foco) com "Pausado · toque para continuar"; qualquer toque retoma. */
export function pauseUntilTap(scene: Phaser.Scene): void {
  if (!scene.scene.isActive()) return;
  const center = { x: GAME_WIDTH / 2, y: GAME_HEIGHT / 2 };
  const overlay = centeredText(scene, 'Pausado\nToque para continuar', {
    ...center,
    size: 48,
  }).setDepth(OVERLAY_DEPTH);
  scene.scene.pause();
  markPaused(true);
  // Cena pausada não recebe input do Phaser, então o toque é ouvido direto no canvas.
  scene.game.canvas.addEventListener(
    'pointerdown',
    () => {
      overlay.destroy();
      markPaused(false);
      scene.scene.resume();
    },
    { once: true },
  );
}
