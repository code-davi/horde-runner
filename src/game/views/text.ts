import type Phaser from 'phaser';

const FONT_FAMILY = 'sans-serif';
const TEXT_COLOR = '#ffffff';

/** Posição do centro do texto e tamanho da fonte em px. */
export interface TextLayout {
  readonly x: number;
  readonly y: number;
  readonly size: number;
}

/** Escala que faz um conteúdo de `width` px caber em `maxWidth` px, sem nunca ampliar. */
export function fitScale(width: number, maxWidth: number): number {
  return Math.min(1, maxWidth / width);
}

/** Texto centralizado no ponto (x, y), no estilo padrão do jogo. */
export function centeredText(
  scene: Phaser.Scene,
  text: string,
  layout: TextLayout,
): Phaser.GameObjects.Text {
  return scene.add
    .text(layout.x, layout.y, text, {
      fontFamily: FONT_FAMILY,
      fontSize: `${layout.size}px`,
      color: TEXT_COLOR,
      align: 'center',
    })
    .setOrigin(0.5);
}
