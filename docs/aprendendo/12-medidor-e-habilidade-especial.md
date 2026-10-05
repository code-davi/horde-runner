# 12 — Medidor e habilidade especial (o feixe)

## O que é

Muitos jogos têm um **medidor** (*meter*): uma barra que enche conforme você joga bem e, cheia, libera uma **habilidade especial**. É o "especial" de jogos de luta, o "ultimate" de jogos de tiro, o "Star Power" de jogos de ritmo.

No Horde Runner, o medidor é a barra ciana no rodapé:

- cada monstro **abatido por projétil** enche um pouco a barra;
- cheia, ela dispara sozinha o **feixe**: uma coluna de 100 px que dura 1,5 s, segue a tropa e mata na hora comuns e fortes que toca;
- enquanto o feixe dura, e durante o encontro com o chefão, a barra não enche;
- o chefão perde 25% da vida máxima por feixe, mas o feixe nunca o derrota.

## Por que existe

O playtest de 2026-10-04 mostrou que o jogo era de **desviar**: matar monstros só dava pontos, então enfrentar era risco sem recompensa (ADR 0024). Um medidor transforma cada abate em progresso visível rumo a algo poderoso. É um **ciclo de recompensa**: enfrentar → barra enche → feixe limpa o caminho → mais fácil enfrentar de novo.

Dois detalhes evitam que ele quebre o jogo:

- **Medir em hordas, não em abates fixos.** Cada monstro vale `custo ÷ (orçamento da horda × 2)`. A barra enche ao derrotar o equivalente a 2 hordas inteiras, seja no trecho 2 ou no 40. Com um número fixo de abates, hordas grandes encheriam a barra o tempo todo.
- **Travas contra cadeia:** o feixe não carrega a própria barra, e o chefão não carrega nada. Senão um feixe geraria outro, e o chefão viraria uma sequência de feixes.

## Analogia com o mundo web

É um **token bucket**, o algoritmo de *rate limiting*: o balde enche com fichas e uma ação só acontece quando há fichas suficientes. A diferença é que aqui o balde não enche com o tempo, e sim com abates. A regra "nada carrega durante o feixe" equivale a não aceitar fichas enquanto a requisição está sendo processada.

A barra em si é uma `<progress value="0.45">`, desenhada pela mesma `ProgressBar` que mostra a vida do chefão.

## Onde está no código

- `src/core/beam.ts`: estado do feixe e regras puras (`killCharge`, `addCharge`, `tickBeam`, `beamCovers`, `beamBossDamage`), testadas em `tests/core/beam.test.ts`
- `src/core/balance.ts`: tabela `BEAM` (2 hordas, 100 px, 1,5 s, 25%)
- `src/core/chunkTemplates.ts`: cada monstro já nasce sabendo quanto de carga vale (`charge`), como já sabe a própria vida
- `src/game/systems/BeamSystem.ts`: recebe a carga dos abates, dispara, mata quem a coluna toca e acerta o chefão uma vez
- `src/game/systems/Collisions.ts`: só abates por projétil carregam a barra
- `src/game/views/BeamView.ts` e `src/game/views/Hud.ts`: a coluna e a barra no rodapé

## Mexa e veja

1. Abra o jogo com `?debug` e, no console (F12), rode `__horde.fillBeam()`: o feixe dispara na hora. Arraste a tropa enquanto ele dura.
2. Em `balance.ts`, troque `BEAM.hordesToCharge` de 2 para 0.5: a barra enche a cada meia horda e o jogo fica fácil demais. Desfaça.
3. Troque `BEAM.widthPx` para 300: o feixe cobre quase a ponte toda. Note como isso tira a graça de posicionar a tropa.
