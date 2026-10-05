# Spec — Subprojeto 1: Núcleo jogável

> **Status:** implementado (aguardando playtest final) · **Data:** 2026-10-03 · **Implementado:** 2026-10-04 · **Revisado:** 2026-10-04 (playtests: ponte e contenção da escala; feixe e perseguição)
> **Visão:** `docs/visao/GDD.md` · **Decisões:** `docs/decisoes/`

## 1. Objetivo

Construir uma versão jogável no navegador (desktop e celular via rede local), com formas geométricas no lugar de arte, que contenha todo o loop principal: corredor, tropa, portões, armas, 3 tipos de inimigo, chefão, fim de jogo e score.

**Pergunta que este subprojeto responde:** *o jogo é divertido?* A resposta é registrada em playtests (`docs/playtests/`).

## 2. Escopo

**Dentro:** tudo da seção 5 do GDD (regras), score, recorde local, modo debug, documentação de aprendizado dos conceitos usados.

**Fora (outros subprojetos):** arte, som, animações elaboradas (2); moedas, upgrades, menu, telas de upgrade (3); Capacitor, anúncios, reviver, consentimento (4).

## 3. Experiência do jogador

1. Abre o jogo → tela "Toque para começar" com o recorde.
2. Partida: tropa começa com 1 Recruta e arma nível 1. Arrasta o dedo para mover; tiro automático.
3. Fim de jogo → tela com score, recorde e "Jogar de novo" (um toque reinicia).
4. Jogo pausa automaticamente se a aba/app perder o foco.

## 4. Regras detalhadas

Todos os números abaixo são **valores iniciais** e vivem em `src/core/balance.ts`. Ajustá-los é esperado durante os playtests.

### 4.1 Tropa e níveis de herói
- Estado: `count` (inteiro ≥ 0).
- Níveis: Recruta = 1, Cavaleiro = 10, Campeão = 250, Lenda = 1000.
- **Composição visual** = decomposição gulosa de `count` do maior nível para o menor, recalculada a cada mudança. (Perder 1 herói sem Recrutas soltos simplesmente gera a nova composição — ex.: 10 → 9 Recrutas.)
- Cada unidade visual dispara projéteis. Dano do projétil = `danoDaArma × valorDoNível × (1 + 0,05 × índiceDoNível)` (Recruta índice 0, Cavaleiro 1, Campeão 2, Lenda 3).

*(Cavaleiro e bônus por nível revisados no playtest de 2026-10-04.)*
- Formação: unidades agrupadas num aglomerado compacto centrado na posição X da tropa; unidades maiores no centro.

### 4.2 Arma
| Nível | Nome | Dano base | Tiros/s por unidade |
|---|---|---|---|
| 1 | Estilingue | 1 | 1 |
| 2 | Arco | 1,5 | 1,5 |
| 3 | Besta | 2,25 | 1,5 |
| 4 | Cajado | 3,4 | 2 |
| 5 | Canhão | 5 | 2 |
| 6+ | (Canhão +N) | ×1,2 por nível | 2 |

Projéteis voam a 450 px/s. *(Revisado após playtest de 2026-10-03: a cadência escalava rápido demais; a progressão das armas vem principalmente do dano. Em 2026-10-04: 700 px/s era rápido demais e 200 px/s lento demais; o bônus após o Canhão caiu de ×1,5 para ×1,2 por nível; na terceira rodada, 300 → 450 px/s para compensar hordas mais densas.)*

O pool de projéteis comporta o pior caso (unidades desenhadas × tiros/s × tempo de voo até sair da tela): nenhum tiro é descartado em silêncio.

### 4.3 Portões
- `+N` / `-N`: soma/subtrai N. Cada projétil que acerta adiciona +1 ao valor, **até um teto = máx(2 × valor inicial, +10)** (ADR 0021): um `-8` atingido 10 vezes vira `+2` e para em `+10`; um `+45` para em `+90`. O acerto consome o projétil mesmo com o portão no teto.
- `xN` (N ∈ {2, 3}; o `x3` só aparece com tropa abaixo de 250, §4.6) / `÷N` (N ∈ {2, 3}, arredonda para baixo): fixos; projéteis passam por eles sem efeito.
- `Arma +1`: sobe um nível de arma.
- `+1 Cavaleiro`: soma exatamente o valor de um Cavaleiro (§4.1; hoje 10 heróis).
- Passar por um portão aplica o efeito uma vez; `count` nunca fica negativo (mínimo 0 → fim de jogo).

### 4.4 Caixa de arma
Aparece no caminho. Sobe a arma +1 se a tropa passar por ela **ou** se receber projéteis suficientes (vida inicial: 60).

### 4.5 Inimigos
| Tipo | Vida base | Velocidade relativa | Heróis removidos ao encostar | Pontos |
|---|---|---|---|---|
| Comum | 10 | 1,1 | 2 | 10 |
| Forte | 100 | 0,7 | 20 | 50 |
| Chefão | 1000 × (1,6 ^ nº do chefão) | 0,35 | **fim de jogo** | 500 × nº do chefão |

**Vida cresce com a distância (ADR 0023):** comuns e fortes nascem com `vidaBase × (1 + 0,05 × (índiceDoTrecho − 1))` — trecho 10 ≈ ×1,45; trecho 20 ≈ ×1,95; trecho 40 ≈ ×2,95. O chefão mantém só o crescimento próprio (×1,6 por chefão).

*(Vidas dobradas após playtest de 2026-10-03; tabela revisada e crescimento por distância acrescentado após o de 2026-10-04.)*

Comuns e fortes somem ao encostar. Se o encontro remove mais heróis do que a tropa tem, `count` vai a 0.

**Tamanho:** o comum tem o tamanho de um Recruta (raio 10 px); o forte, raio 32 px; o chefão, raio 70 px.

**Perseguição (ADR 0025):** enquanto estão na tela e acima da linha da tropa, os monstros também andam de lado em direção ao x da tropa, sem ultrapassá-lo: comum a 30 px/s, forte a 45 px/s, chefão a 20 px/s. Depois de passar da linha da tropa, seguem retos. Como a tropa se move muito mais rápido (até 2200 px/s), desviar continua possível, mas exige tempo certo: deixar um monstro passar deixa de ser grátis.

**Chefão que alcança a tropa:** se o chefão chegar à linha da tropa (y da tropa) sem ter sido derrotado, mesmo sem encostar, é fim de jogo. *(Corrige uma partida travada: desviando do chefão, ele saía da tela e o caminho ficava parado para sempre.)*

### 4.6 Trechos (geração procedural)
O caminho é uma sequência de trechos. Um **sorteador ponderado** escolhe o próximo **molde**, preenche seus parâmetros com o RNG e aplica as **travas de justiça**.

**Moldes** (peso no início → peso a partir do trecho 30, interpolação linear; os pesos dos moldes punitivos são multiplicados pela pressão da tropa, abaixo):

| Molde | Conteúdo | Peso |
|---|---|---|
| Par clássico | 1 portão bom + 1 ruim lado a lado, + horda | 30 → 15 |
| Par "menos pior" | 2 ruins, ao menos 1 deles `-N`, + horda | 0 → 12 |
| Par "melhor dos bons" | 2 bons, + horda | 15 → 8 |
| Portão solitário | 1 portão em um lado, + horda | 2 → 15 |
| Corredor de obstáculos | 2–4 portões ruins solitários alternando lado, + horda | 0 → 12 |
| Caixa de arma | caixa no meio da horda | 8 → 8 |
| Só horda | apenas combate | 15 → 15 |

**Pressão pela tropa (ADR 0020):** cada trecho é gerado conhecendo a tropa atual. O nível de pressão segue os marcos dos níveis de herói:

| Tropa | Pressão | Chance de inimigo forte | Multiplicador dos pesos punitivos | Orçamento extra da horda | Peso do `xN` no portão bom | `xN` possíveis |
|---|---|---|---|---|---|---|
| < 50 | 0 | 25% | ×1 | 0 | 1 | x2, x3 |
| 50–249 | 1 | 35% | ×1,5 | 25% da tropa | 1/2 | x2, x3 |
| 250–999 | 2 | 45% | ×2 | 25% da tropa | 1/3 | x2 |
| ≥ 1000 | 3 | 60% | ×3 | 25% da tropa | 1/4 | x2 |

**Portão bom (ADR 0023):** o tipo é sorteado com peso 1 para `+N`, `Arma +1` e `+1 Cavaleiro` (este só a partir do trecho 8), e peso `1 ÷ (1 + pressão)` para o `xN`. Com pressão ≥ 2 o multiplicador é sempre `x2`.

**Horda:** cada trecho gasta um **orçamento de ameaça** = `13 + 5 × índiceDoTrecho` + o extra da pressão (custo: comum = 1, forte = 8; fortes a partir do trecho 2). Os monstros chegam em **2 ou 3 ondas agrupadas** por trecho (não espalhados pelo trecho inteiro).

**Valores de portão:**
- `+N`: N entre 3 e `3 + índice` (só a distância; com tropa grande ele fica relativamente pequeno e quem escala são os multiplicadores).
- `-N`: N = o maior entre um sorteio em `[5, 5 + índice]` e um sorteio de **20% a 60% da tropa atual** (ex.: com 500 heróis, entre `-100` e `-300`).
- `÷N`: N sorteado entre 2 e 3. O par "menos pior" pode combinar, por exemplo, `÷2` × `÷3` ou `-100` × `-20`.

*(Pesos, faixas de portão, fortes a partir do trecho 2 e `-N` de 20%–60% ajustados pelo autor no playtest de 2026-10-04; orçamento extra de 25% e `xN` contido acrescentados no mesmo playtest, ADR 0023.)*

**Chefão:** os trechos de índice múltiplo de 8 (8, 16, 24…) são trechos de chefão (não usam moldes). No trecho do chefão o avanço do caminho para; o chefão desce em direção à tropa acompanhado de uma horda leve. Derrotado, o caminho volta a andar.

**Travas de justiça** (o gerador nunca as viola):
1. Todo trecho tem ao menos um caminho horizontal que, sozinho, não zera a **tropa atual** no momento em que o trecho é gerado.
2. Par "menos pior" sempre contém um `-N` melhorável por tiros.
3. No máximo 2 trechos punitivos seguidos (punitivos = "menos pior" e "corredor de obstáculos").
4. O trecho imediatamente anterior ao chefão é sempre "par melhor dos bons" ou "caixa de arma".
5. Trechos 1–4 só usam "par clássico", "portão solitário" com portão bom, e "só horda".

### 4.7 Velocidade
O caminho rola a 120 px/s no trecho 1, crescendo 2% por trecho até +50% (alcançado no trecho 26). Os monstros caminham a `50 px/s × velocidadeRelativa`, somados à rolagem. *(Revisado após o playtest de 2026-10-04: o jogo estava lento.)*

### 4.8 Score e recorde
`score = metrosPercorridos + pontosDeMonstros + bônusDeChefões`. Recorde salvo localmente (localStorage, atrás da interface `SaveStore`).

### 4.9 Ponte (área jogável) — ADR 0022
- O caminho é uma **ponte** de 420 px de largura centrada na tela de 720 px (x de 150 a 570). Fora dela, as laterais são desenhadas como água/abismo e nada acontece ali.
- Duas faixas: esquerda (centro x = 255) e direita (centro x = 465), divididas em x = 360. Cada portão tem 190 px de largura.
- O centro da tropa fica preso entre x = 180 e x = 540.
- Monstros nascem entre 5% e 95% da largura da ponte (x de 171 a 549): não há borda segura. A caixa de arma nasce entre 30% e 70%; o chefão, no centro.
- *(Terceira rodada do playtest de 2026-10-04: 480 → 420 px e 10–90% → 5–95%, junto com ~60% mais monstros no orçamento da horda.)*
- Rótulos de portão que não cabem na largura do portão são reduzidos até caber.

### 4.10 Feixe — ADR 0024
- **Carga:** cada monstro derrotado por **projétil** enche a barra do feixe em `custo ÷ (orçamentoDaHorda × 2)`, onde o orçamento é o da horda do trecho em que o monstro nasceu (`hordeBudget`). Ou seja, a barra enche ao derrotar o equivalente a **2 hordas inteiras**, com ritmo parecido do começo ao fim da partida. O valor de carga é calculado no core e viaja no spawn, como a vida.
- **Chefão não carrega:** durante o encontro com o chefão (do surgimento até a derrota) a barra não carrega: nem o dano no chefão, nem a derrota dele, nem a horda leve que o acompanha. Senão ficaria fácil demais vencer o chefão com feixes seguidos.
- **Disparo:** automático assim que a barra enche. Enquanto o feixe está ativo, nada carrega a barra (nem tiros, nem o próprio feixe); ela recomeça do zero quando o feixe acaba.
- **Forma:** uma coluna de **100 px** de largura, centrada na tropa, da tropa até o topo da tela, que dura **1,5 s** e **segue a tropa** (dá para varrer a ponte arrastando).
- **Efeito:** comuns e fortes que tocam a coluna, acima da linha da tropa, morrem na hora (dão os pontos normais). O **chefão** perde **25% da vida máxima**, uma única vez por feixe, mas o feixe nunca o deixa com menos de 1 de vida: o golpe final é sempre dos tiros. Portões e caixa de arma não são afetados (ADR 0009). Os tiros normais continuam durante o feixe.
- **Na tela:** uma barra de carga no HUD e a coluna luminosa enquanto o feixe dura. No modo debug, `__horde.fillBeam()` enche a barra.

## 5. Arquitetura

```
src/
  core/            regras puras (sem Phaser), testadas com Vitest
    balance.ts     todos os números
    rng.ts         RNG com seed
    troop.ts       count, aplicar portão, receber dano, composição em níveis, dano por unidade
    weapons.ts     níveis da arma
    gates.ts       tipos, aplicação, tiro em portão
    enemies.ts     definições
    chunks.ts      moldes, sorteador ponderado, travas
    difficulty.ts  orçamento de ameaça, pesos, velocidade
    scoring.ts     score
  game/            Phaser
    scenes/        Boot, Start, Run, GameOver
    entities/      Squad, Enemy, Boss, Gate, WeaponCrate, Projectile
    views/         desenho de cada entidade (formas geométricas agora; trocável no subprojeto 2)
    systems/       pools, input, colisões, debug overlay
  platform/
    storage.ts     interface SaveStore + implementação localStorage
  main.ts
```

**Regras de fronteira:**
- `core/` não importa nada de Phaser nem do browser. Funções puras ou classes com estado simples.
- `game/entities/` cuidam de posição/física; o efeito de qualquer evento passa por `core/` (ex.: colisão projétil×portão → `gates.hit(gate)`).
- `game/views/` é a única camada que sabe como algo é desenhado. Entidades pedem à view para atualizar; trocar a arte não toca em entidades nem em regras.

**Desempenho:** pools para projéteis e inimigos; resolução lógica 720×1280 com `Scale.FIT`; meta 60 FPS em desktop neste subprojeto.

**Versão do Phaser:** a estável mais recente na data do plano (3.x ou 4), confirmada durante o planejamento.

## 6. Modo debug

URL `?seed=<n>` fixa a seed da partida. `?debug` mostra hitboxes, FPS, `count`, nível da arma, índice e molde do trecho atual.

## 7. Tratamento de casos especiais

- Perda de foco (aba/app) → pausa; volta com "toque para continuar".
- `localStorage` indisponível ou save ilegível → recorde = 0, jogo segue normalmente.
- `count` nunca negativo; divisões arredondam para baixo.

## 8. Testes

- **TDD em `core/`** com Vitest: tropa (portões, dano, composição, dano por unidade), arma, portões (incl. tiro), score, dificuldade.
- **Teste de propriedade do gerador:** 10.000 seeds × 60 trechos — nenhuma trava violada; orçamento de ameaça não decrescente.
- **Smoke test Playwright:** o jogo carrega, a partida inicia com `?seed=1`, roda 5 s sem erro no console, screenshot salvo.
- **CI** (GitHub Actions): lint, typecheck, Vitest, Playwright.

## 9. Documentação de aprendizado

Cada conceito ganha um arquivo em `docs/aprendendo/` (o que é, por que existe, analogia com desenvolvimento web, onde está no código, exercício "mexa e veja"). Mínimo esperado neste subprojeto:

1. Game loop e delta time
2. Cenas no Phaser
3. Coordenadas, câmera e escala de tela
4. Entrada de toque/arrasto
5. Física arcade e colisões
6. Object pooling
7. RNG com seed
8. Geração procedural com moldes ponderados e travas
9. Separação regras × renderização
10. Tweens e feedback visual básico

## 10. Critérios de aceitação

- [x] Jogo roda via `npm run dev` no desktop e no celular pela rede local (`vite --host`).
- [x] Todas as regras da seção 4 implementadas e visíveis com formas geométricas.
- [ ] Testes de `core/`, teste de propriedade e smoke test passando no CI. *(Passam localmente; o workflow de CI existe, mas ainda não rodou porque o repositório não tem remoto no GitHub.)*
- [x] Modo debug funcional.
- [x] 10 documentos de aprendizado escritos (11, com o de reaproveitamento).
- [x] Primeiro playtest registrado em `docs/playtests/`.
