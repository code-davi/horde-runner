import Phaser from 'phaser';
import { GAME_HEIGHT, GAME_WIDTH } from './dimensions';
import { centeredText } from './views/text';

const OVERLAY_DEPTH = 1000;

/** Pausa a cena quando a aba/app perde o foco e volta com "Toque para continuar". */
export function installPauseOnBlur(scene: Phaser.Scene): void {
  const onVisibilityChange = (): void => {
    if (document.hidden && scene.scene.isActive()) pauseUntilTap(scene);
  };
  document.addEventListener('visibilitychange', onVisibilityChange);
  scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () =>
    document.removeEventListener('visibilitychange', onVisibilityChange),
  );
}

function pauseUntilTap(scene: Phaser.Scene): void {
  const center = { x: GAME_WIDTH / 2, y: GAME_HEIGHT / 2 };
  const overlay = centeredText(scene, 'Toque para continuar', { ...center, size: 48 }).setDepth(
    OVERLAY_DEPTH,
  );
  scene.scene.pause();
  // Cena pausada não recebe input do Phaser, então o toque é ouvido direto no canvas.
  scene.game.canvas.addEventListener(
    'pointerdown',
    () => {
      overlay.destroy();
      scene.scene.resume();
    },
    { once: true },
  );
}
