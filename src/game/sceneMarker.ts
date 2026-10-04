/** Marca no <body> qual cena está ativa; os testes do Playwright esperam por esse atributo. */
export function markScene(key: string): void {
  document.body.dataset['scene'] = key;
}
