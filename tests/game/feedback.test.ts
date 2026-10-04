import { describe, expect, it } from 'vitest';
import type Phaser from 'phaser';
import { flash, punch } from '../../src/game/views/feedback';

/**
 * Cena mínima: guarda os tweens ativos por alvo e os mata como o Phaser faz.
 * Um tween novo começa do valor ATUAL do alvo (é assim no Phaser 4).
 */
function fakeScene(): { scene: Phaser.Scene; active: Map<object, number> } {
  const active = new Map<object, number>();
  const tweens = {
    add: (config: { targets: object }) =>
      active.set(config.targets, (active.get(config.targets) ?? 0) + 1),
    killTweensOf: (target: object) => active.delete(target),
  };
  return { scene: { tweens } as unknown as Phaser.Scene, active };
}

describe('flash', () => {
  it('restarts from full opacity even if a previous flash was mid-flight', () => {
    const { scene, active } = fakeScene();
    const squad = { alpha: 1 };

    flash(scene, squad);
    squad.alpha = 0.6; // meio do primeiro flash
    flash(scene, squad);

    expect(squad.alpha).toBe(1);
    expect(active.get(squad)).toBe(1);
  });
});

describe('punch', () => {
  it('restarts from the normal scale even if a previous punch was mid-flight', () => {
    const { scene, active } = fakeScene();
    const squad = { scaleX: 1, scaleY: 1 };

    punch(scene, squad);
    squad.scaleX = 1.1;
    squad.scaleY = 0.9;
    punch(scene, squad);

    expect(squad).toEqual({ scaleX: 1, scaleY: 1 });
    expect(active.get(squad)).toBe(1);
  });
});
