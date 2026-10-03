# Spec — Subprojeto 1: Núcleo jogável

> **Status:** rascunho (aguardando revisão) · **Data:** 2026-10-03
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
- Níveis: Recruta = 1, Cavaleiro = 50, Campeão = 250, Lenda = 1000.
- **Composição visual** = decomposição gulosa de `count` do maior nível para o menor, recalculada a cada mudança. (Perder 1 herói sem Recrutas soltos simplesmente gera a nova composição — ex.: 50 → 49 Recrutas.)
- Cada unidade visual dispara projéteis. Dano do projétil = `danoDaArma × valorDoNível × (1 + 0,15 × índiceDoNível)` (Recruta índice 0, Cavaleiro 1, Campeão 2, Lenda 3).
- Formação: unidades agrupadas num aglomerado compacto centrado na posição X da tropa; unidades maiores no centro.

### 4.2 Arma
| Nível | Nome | Dano base | Tiros/s por unidade |
|---|---|---|---|
| 1 | Estilingue | 1 | 2 |
| 2 | Arco | 1,5 | 2,5 |
| 3 | Besta | 2,25 | 3 |
| 4 | Cajado | 3,4 | 3 |
| 5 | Canhão | 5 | 3 |
| 6+ | (Canhão +N) | ×1,5 por nível | 3 |

### 4.3 Portões
- `+N` / `-N`: soma/subtrai N. Cada projétil que acerta adiciona +1 ao valor (um `-8` atingido 10 vezes vira `+2`). O acerto consome o projétil.
- `xN` (N ∈ {2, 3}) / `÷N` (N = 2, arredonda para baixo): fixos; projéteis passam por eles sem efeito.
- `Arma +1`: sobe um nível de arma.
- `+1 Cavaleiro`: soma 50 heróis.
- Passar por um portão aplica o efeito uma vez; `count` nunca fica negativo (mínimo 0 → fim de jogo).

### 4.4 Caixa de arma
Aparece no caminho. Sobe a arma +1 se a tropa passar por ela **ou** se receber projéteis suficientes (vida inicial: 20).

### 4.5 Inimigos
| Tipo | Vida | Velocidade relativa | Heróis removidos ao encostar | Pontos |
|---|---|---|---|---|
| Comum | 3 | 1,0 | 1 | 10 |
| Forte | 40 | 0,6 | 5 | 50 |
| Chefão | 400 × (1,6 ^ nº do chefão) | 0,35 | **fim de jogo** | 500 × nº do chefão |

Comuns e fortes somem ao encostar. Se o encontro remove mais heróis do que a tropa tem, `count` vai a 0.

### 4.6 Trechos (geração procedural)
O caminho é uma sequência de trechos. Um **sorteador ponderado** escolhe o próximo **molde**, preenche seus parâmetros com o RNG e aplica as **travas de justiça**.

**Moldes** (peso no início → peso a partir do trecho 30, interpolação linear):

| Molde | Conteúdo | Peso |
|---|---|---|
| Par clássico | 1 portão bom + 1 ruim lado a lado, + horda | 30 → 15 |
| Par "menos pior" | 2 ruins, ao menos 1 deles `-N`, + horda | 0 → 12 |
| Par "melhor dos bons" | 2 bons, + horda | 15 → 8 |
| Portão solitário | 1 portão em um lado, + horda | 15 → 15 |
| Corredor de obstáculos | 2–4 portões ruins solitários alternando lado, + horda | 0 → 12 |
| Caixa de arma | caixa no meio da horda | 8 → 8 |
| Só horda | apenas combate | 20 → 15 |

**Horda:** cada trecho gasta um **orçamento de ameaça** = `8 + 3 × índiceDoTrecho` (custo: comum = 1, forte = 8; fortes só a partir do trecho 5).

**Valores de portão** escalam com o índice do trecho (ex.: `+N` com N entre 5 e `5 + índice`; `-N` similar), definidos em `balance.ts`.

**Chefão:** os trechos de índice múltiplo de 8 (8, 16, 24…) são trechos de chefão (não usam moldes). No trecho do chefão o avanço do caminho para; o chefão desce em direção à tropa acompanhado de uma horda leve. Derrotado, o caminho volta a andar.

**Travas de justiça** (o gerador nunca as viola):
1. Todo trecho tem ao menos um caminho horizontal que, sozinho, não zera uma tropa com o tamanho mínimo esperado naquele ponto, dado pela função `minExpectedTroop(índiceDoTrecho)` em `balance.ts` (valor inicial: `max(1, 2 × índiceDoTrecho)`).
2. Par "menos pior" sempre contém um `-N` melhorável por tiros.
3. No máximo 2 trechos punitivos seguidos (punitivos = "menos pior" e "corredor de obstáculos").
4. O trecho imediatamente anterior ao chefão é sempre "par melhor dos bons" ou "caixa de arma".
5. Trechos 1–4 só usam "par clássico", "portão solitário" com portão bom, e "só horda".

### 4.7 Velocidade
Velocidade de avanço inicial definida em `balance.ts`, crescendo 1% por trecho até +50%.

### 4.8 Score e recorde
`score = metrosPercorridos + pontosDeMonstros + bônusDeChefões`. Recorde salvo localmente (localStorage, atrás da interface `SaveStore`).

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

- [ ] Jogo roda via `npm run dev` no desktop e no celular pela rede local (`vite --host`).
- [ ] Todas as regras da seção 4 implementadas e visíveis com formas geométricas.
- [ ] Testes de `core/`, teste de propriedade e smoke test passando no CI.
- [ ] Modo debug funcional.
- [ ] 10 documentos de aprendizado escritos.
- [ ] Primeiro playtest registrado em `docs/playtests/`.
