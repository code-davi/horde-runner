import { BRIDGE_LEFT_X, BRIDGE_WIDTH } from './balance';

/** Converte uma fração da largura da ponte (0 = borda esquerda, 1 = direita) em x da tela (ADR 0022). */
export function bridgeX(fraction: number): number {
  return BRIDGE_LEFT_X + fraction * BRIDGE_WIDTH;
}
