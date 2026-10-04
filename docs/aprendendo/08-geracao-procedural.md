# 08 — Geração procedural com moldes ponderados e travas

## O que é

**Geração procedural** é criar conteúdo do jogo (fases, mapas, inimigos) por código, em vez de desenhar tudo à mão. É o que torna o caminho do Horde Runner **infinito**: ninguém desenhou o trecho 347, ele é gerado na hora.

Nosso gerador usa três ideias:

1. **Moldes** (*templates*): formatos de trecho pré-definidos, como "par clássico" (um portão bom e um ruim), "portão solitário" e "corredor de obstáculos". O molde define a *estrutura*; os valores (`+7`, `÷2`, qual lado) são sorteados.
2. **Sorteio ponderado**: cada molde tem um peso, e pesos maiores saem mais. Os pesos mudam com o progresso: no começo não há moldes punitivos, e no trecho 30 eles já aparecem bastante.
3. **Travas de justiça**: regras que o resultado nunca pode violar. Se o sorteio gerar algo injusto, o gerador **sorteia de novo** (até 20 vezes) e, no último caso, usa um molde sempre seguro.

## Por que existe

Aleatório puro é injusto. Sem travas, um dia o jogo geraria dois portões `-30` lado a lado para uma tropa de 10, e o jogador perderia sem ter o que fazer. Com moldes e travas, o aleatório tem **variedade sem perder a justiça**:

| Trava | Garante que... |
|---|---|
| 1 | sempre existe um caminho que não zera a tropa esperada naquele ponto |
| 2 | o par "menos pior" sempre tem um `-N` que dá para melhorar atirando |
| 3 | nunca vêm mais de 2 trechos punitivos seguidos |
| 4 | o trecho antes do chefão sempre ajuda o jogador |
| 5 | os 4 primeiros trechos são simples, como um tutorial implícito |

## Analogia com o mundo web

- **Moldes** são como **componentes com props**: `<ClassicPair good={...} bad={...} />`. A estrutura é fixa e os dados variam.
- **Travas** são como **validação de schema** (Zod, Yup): o objeto é gerado e, se não passar na validação, é descartado.
- **O teste de 10.000 seeds** é **property-based testing** (como a biblioteca fast-check): em vez de testar 3 exemplos escolhidos à mão, testamos uma *propriedade* ("nenhuma trava é violada") contra milhares de entradas geradas.

## Onde está no código

- `src/core/chunks.ts`: tipos (`Chunk`, `GatePlacement`, `EnemySpawn`) e a classe `ChunkGenerator`, que escolhe o molde e tenta de novo se uma trava falhar.
- `src/core/chunkTemplates.ts`: como cada molde é preenchido e como a horda gasta o "orçamento de ameaça".
- `src/core/guardrails.ts`: `violatedGuardrails` (as 5 travas) e `bestPathResult` (a melhor tropa possível ao final de um trecho).
- `src/core/difficulty.ts` e `src/core/balance.ts`: pesos dos moldes e como eles mudam com o tempo.
- `tests/core/chunks.property.test.ts`: as 10.000 partidas de 60 trechos (600 mil trechos, cerca de 7 segundos).

## Mexa e veja

1. **Quebre o gerador de propósito.** Em `src/core/chunks.ts`, troque `.length === 0` por `.length >= 0` dentro de `fairChunk` (assim ele aceita qualquer trecho). Rode `npm test`: o teste de propriedade falha e mostra exatamente a seed e o trecho que violaram uma trava. Desfaça a mudança.
2. **Mude a dificuldade.** Em `balance.ts`, aumente o peso final de `obstacleCorridor` de `12` para `40`. Os testes continuam passando, porque as travas seguram, mas o jogo fica bem mais punitivo. É assim que balancear sem quebrar a justiça.
3. **Investigue uma seed.** Num teste temporário, crie `new ChunkGenerator(createRng(1))`, chame `next()` 10 vezes e dê `console.log` nos `template` de cada trecho. Com `?seed=1` na URL (a partir do Task 8), o jogo vai gerar exatamente essa sequência.
