/** Gera o próximo trecho quando o topo do último está a menos disso da tela, em px. */
export const SPAWN_LOOKAHEAD_PX = 200;

/**
 * Se é hora de gerar o próximo trecho. Com um chefão pendente, nada novo é gerado
 * até ele ser derrotado: só a horda leve dele acompanha a luta (spec §4.6).
 */
export function shouldGenerateChunk(state: { frontierY: number; bossPending: boolean }): boolean {
  return !state.bossPending && state.frontierY > -SPAWN_LOOKAHEAD_PX;
}

/** Avança a fronteira com a rolagem; com chefão pendente, ela para logo acima da tela. */
export function advanceFrontier(state: {
  frontierY: number;
  dy: number;
  bossPending: boolean;
}): number {
  const next = state.frontierY + state.dy;
  return state.bossPending ? Math.min(next, -SPAWN_LOOKAHEAD_PX) : next;
}
