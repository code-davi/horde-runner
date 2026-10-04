/** Opções lidas da URL: `?seed=123` repete uma partida, `?debug` liga o painel de debug. */
export interface UrlOptions {
  readonly seed: number;
  readonly debug: boolean;
}

export function parseUrlOptions(search: string, fallbackSeed: number): UrlOptions {
  const params = new URLSearchParams(search);
  const seed = Number.parseInt(params.get('seed') ?? '', 10);
  return {
    seed: Number.isFinite(seed) ? seed : fallbackSeed,
    debug: params.has('debug'),
  };
}
