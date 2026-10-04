import type Phaser from 'phaser';

/** Algo que pode voltar para o pool: desativa, esconde e desliga o corpo físico. */
export interface Poolable {
  kill(): void;
}

type PoolMember = Phaser.GameObjects.GameObject & Poolable;

/**
 * Pool genérico de objetos com física (ADR 0017): recicla em vez de criar e destruir.
 * Usado por projéteis e inimigos.
 */
export class ObjectPool<T extends PoolMember> {
  readonly group: Phaser.Physics.Arcade.Group;

  constructor(
    scene: Phaser.Scene,
    options: { classType: new (scene: Phaser.Scene) => T; maxSize: number },
  ) {
    this.group = scene.physics.add.group({
      classType: options.classType,
      maxSize: options.maxSize,
      runChildUpdate: false,
    });
  }

  /** Um objeto livre, ou `null` se o pool estiver cheio (quem chama ignora em silêncio). */
  acquire(): T | null {
    // Fronteira com o Phaser: o grupo só cria/guarda membros de `classType`, que é T.
    return (this.group.get() as T | null) ?? null;
  }

  forEachActive(callback: (item: T) => void): void {
    (this.group.getMatching('active', true) as T[]).forEach(callback);
  }
}
