import { describe, expect, it } from 'vitest';
import type Phaser from 'phaser';
import { DragInput } from '../../src/game/systems/DragInput';

type Handler = (pointer: { x: number; isDown: boolean }) => void;

/** Entrada mínima: registra os handlers como o `scene.input` do Phaser. */
function fakeInput(): { scene: Phaser.Scene; emit: (event: string, x: number) => void } {
  const handlers = new Map<string, Handler>();
  const input = { on: (event: string, handler: Handler) => handlers.set(event, handler) };
  const emit = (event: string, x: number): void =>
    handlers.get(event)?.({ x, isDown: event !== 'pointerup' });
  return { scene: { input } as unknown as Phaser.Scene, emit };
}

describe('DragInput', () => {
  it('ignores a finger still down from the previous scene', () => {
    const { scene, emit } = fakeInput();
    const drag = new DragInput(scene, 360);

    emit('pointermove', 400);

    expect(drag.targetX).toBe(360);
  });

  it('moves by how much the finger moved after touching this scene', () => {
    const { scene, emit } = fakeInput();
    const drag = new DragInput(scene, 360);

    emit('pointerdown', 400);
    emit('pointermove', 450);

    expect(drag.targetX).toBe(410);
  });

  it('stops following after the finger is lifted', () => {
    const { scene, emit } = fakeInput();
    const drag = new DragInput(scene, 360);

    emit('pointerdown', 400);
    emit('pointerup', 400);
    emit('pointermove', 600);

    expect(drag.targetX).toBe(360);
  });
});
