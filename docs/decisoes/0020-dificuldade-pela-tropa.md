# 0020 — Dificuldade acompanha o tamanho da tropa

**Status:** aceito · 2026-10-03

## Contexto
Playtest de 2026-10-03: o jogo ficou fácil demais. A dificuldade só crescia com a distância (índice do trecho), enquanto o poder da tropa crescia muito mais rápido. Com centenas de heróis, portões `-N` pequenos e monstros espaçados deixavam de ameaçar.

## Opções
- Só aumentar a curva por distância: continua desconectada do poder do jogador.
- **Pressão pelo tamanho da tropa:** o gerador conhece a tropa atual e escala as ameaças com ela.

## Decisão
Cada trecho é gerado com a tropa atual. Um nível de pressão (0–3, nos marcos de 50, 250 e 1000 heróis) aumenta a chance de inimigos fortes, o peso dos moldes punitivos e o orçamento da horda (+10% da tropa). Portões `-N` passam a ter N proporcional à tropa (10%–40%), surge o `÷3`, e as hordas chegam em 2–3 ondas agrupadas. A trava de justiça 1 passa a usar a tropa real. Números em `balance.ts` e no spec do subprojeto 1, §4.6.

## Consequências
Crescer a tropa deixa de ser "vitória garantida": quanto maior a tropa, maior o risco de cada escolha de portão. A geração deixa de depender só da seed: com a mesma seed, partidas com tropas diferentes geram trechos diferentes (a seed ainda reproduz a partida se as escolhas forem as mesmas). O teste de propriedade passa a cobrir vários tamanhos de tropa.
