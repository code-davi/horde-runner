# 0024 — Feixe carregado por abates

**Status:** aceito · 2026-10-04

## Contexto
Terceira rodada do playtest de 2026-10-04: o jogo parecia de **desviar**, não de enfrentar. Matar monstros só dava pontos, que não mudam nada durante a partida; desviar não custava nada e enfrentar só trazia risco. Heróis só podem subir por portões (regra do autor), então a recompensa por lutar precisa ser outra.

## Opções
- **Abates sobem a arma (+1):** reaproveita o que existe, mas compete com portões e caixas de arma e acelera a escala que o ADR 0023 acabou de conter.
- **Abates enchem um feixe (habilidade especial):** recompensa imediata e visível, que não mexe em heróis nem em arma.
- **Abates dão moedas:** recompensa só fora da partida (subprojeto 3); não muda a sensação durante o jogo.

## Decisão
Monstros derrotados por projéteis enchem uma barra. Cada um vale `custo ÷ (orçamentoDaHorda × 2)`: a barra enche ao derrotar o equivalente a 2 hordas inteiras, com ritmo parecido do começo ao fim, mesmo com hordas maiores. Cheia, ela dispara sozinha um feixe: uma coluna de 100 px, centrada na tropa, que dura 1,5 s, segue a tropa e mata na hora comuns e fortes que toca. O chefão perde 25% da vida máxima uma vez por feixe, sem nunca morrer pelo feixe. Portões e caixas não são afetados. Durante o feixe nada carrega a barra, para não haver feixes em cadeia. A regra vive em `src/core/beam.ts`; números em `balance.ts`; detalhes no spec do subprojeto 1, §4.10.

O disparo é automático (escolha do autor) em vez de um botão: mantém o controle de um dedo só. A decisão de "quando usar" fica para depois, se o playtest pedir.

## Consequências
Lutar passa a ter recompensa própria: quanto mais você enfrenta, mais cedo vem o feixe, que limpa uma coluna e abre caminho. Medir a carga em hordas (e não em abates fixos) evita que uma tropa grande tenha feixe o tempo todo. Cada monstro passa a carregar seu valor de carga desde o spawn, como já carrega a vida. O HUD ganha uma barra. Os números (2 hordas, 100 px, 1,5 s, 25%) são alavancas de playtest.
