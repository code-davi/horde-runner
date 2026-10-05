/** Marca no <body> qual cena está ativa; os testes do Playwright esperam por esse atributo. */
export function markScene(key: string): void {
  document.body.dataset['scene'] = key;
}

/** Marca no <body> se a partida está pausada (`data-paused`), para os testes do Playwright. */
export function markPaused(paused: boolean): void {
  document.body.dataset['paused'] = String(paused);
}
