# 0023 — Contenção da escala da tropa

**Status:** aceito · 2026-10-04 · complementa a 0020

## Contexto
Playtest de 2026-10-04: mesmo com a pressão pela tropa (ADR 0020), ficar forte continuava fácil. Três causas:
1. O dano de cada tiro é `arma × heróis da unidade`, ou seja, o poder de fogo cresce na proporção da tropa. A vida dos monstros era a mesma do trecho 1 ao 100, e a horda só ganhava 10% da tropa no orçamento.
2. Os portões `x2`/`x3` são exponenciais e apareciam com a mesma frequência com 10 ou 500 heróis.
3. O jogo estava lento (rolagem de 100 px/s).

## Opções
- **Reduzir o dano por tamanho da tropa (ex.: raiz quadrada):** quebra a fantasia central do gênero ("mais heróis = mais forte") e a regra das unidades como notas de dinheiro (ADR 0007).
- **Escalar a ameaça e conter o crescimento:** a vida dos monstros cresce com a distância, a horda cresce mais com a tropa e os multiplicadores ficam mais raros com tropa grande.
- **Só mexer em números existentes:** já tentado no playtest de 2026-10-03; não ataca a causa 1.

## Decisão
- Comuns e fortes nascem com `vidaBase × (1 + 0,05 × (trecho − 1))`. A vida é calculada no core e viaja no spawn do trecho.
- O orçamento extra da horda com pressão ≥ 1 passa de 10% para 25% da tropa.
- No sorteio do portão bom, o `xN` pesa `1 ÷ (1 + pressão)` (os demais tipos pesam 1). Com pressão ≥ 2 (250+ heróis), o multiplicador é sempre `x2`.
- A rolagem começa em 120 px/s e cresce 2% por trecho (teto de +50% mantido).

Números em `balance.ts` e no spec do subprojeto 1, §4.5–4.7.

## Consequências
O poder da tropa continua proporcional ao tamanho, mas a ameaça passa a acompanhar a distância e a tropa, e o crescimento exponencial fica mais raro justamente quando a tropa já é grande. O sorteio do portão bom passa a usar pesos, o que muda as sequências geradas por seed em relação à versão anterior (a seed continua reproduzindo a partida dentro da mesma versão). Os quatro números novos (`ENEMY_HP_GROWTH_PER_CHUNK`, `HORDE_TROOP_SHARE`, peso do `xN` e `DOUBLE_ONLY_PRESSURE`) são as alavancas para o próximo playtest.
