# 09 — Regras × entidades × views

## O que é

O código do jogo é dividido em três camadas, cada uma com uma única responsabilidade:

| Camada | Pasta | Responsabilidade | Sabe de Phaser? |
|---|---|---|---|
| **Regras** | `src/core/` | *o que acontece*: quantos heróis sobram depois de um `÷2`, quanto dano um Cavaleiro causa | não |
| **Entidades** | `src/game/entities/` | *onde as coisas estão e se movem*: posição, velocidade, colisão | sim |
| **Views** | `src/game/views/` | *como as coisas aparecem*: cores, formas, tamanhos | sim |

Exemplo com a tropa:

- `core/troop.ts` decide que 237 heróis são 4 Cavaleiros e 37 Recrutas (`renderUnits`)
- `core/formation.ts` decide onde cada um fica em relação ao centro (espiral de girassol)
- `entities/Squad.ts` guarda a posição `x`, segue o dedo e chama as regras quando o estado muda
- `views/SquadView.ts` desenha um círculo colorido por herói

## Por que existe

1. **Testar regras sem abrir o jogo.** As 95 verificações de `npm test` rodam em menos de 1 segundo, sem navegador. Testar "o `÷2` arredonda para baixo" jogando seria lento e não daria para repetir.
2. **Trocar a arte sem mexer nas regras.** No subprojeto 2, os círculos viram personagens animados. Só `views/` muda; `troop.ts` e `Squad.ts` ficam iguais.
3. **Regras que o ESLint protege.** `src/core/` é proibido de importar Phaser ou usar `window` (veja `eslint.config.js`). Se alguém tentar, o commit é recusado.

## Analogia com o mundo web

| Jogo | React + Redux |
|---|---|
| `core/` (funções puras `(estado, evento) → novoEstado`) | reducers / lógica de domínio |
| `entities/` (estado de tela + orquestração) | containers / hooks que ligam estado e UI |
| `views/` (só desenho) | componentes de apresentação ("dumb components") |

`applyGate(state, gate)` é literalmente um reducer: recebe o estado e uma "ação" e devolve um estado novo, sem mutar o antigo.

## Onde está no código

- `src/core/troop.ts`, `src/core/formation.ts`, `src/core/motion.ts`: regras e matemática puras
- `src/game/entities/Squad.ts`: guarda `TroopState`, decide quando recalcular as unidades
- `src/game/views/SquadView.ts`: o único arquivo que sabe que a tropa é feita de círculos
- `src/game/views/palette.ts`: todas as cores num lugar só
- `eslint.config.js`: o bloco de `src/core/**` que proíbe Phaser e APIs do navegador

## Mexa e veja

1. Em `SquadView.ts`, troque `fillCircle`/`strokeCircle` por `fillRect(offset.x - radius, offset.y - radius, radius * 2, radius * 2)`. A tropa vira quadrados e nenhum teste quebra: só o desenho mudou.
2. Em `src/core/troop.ts`, adicione `import Phaser from 'phaser';` e rode `npm run lint`. O ESLint recusa, protegendo a fronteira. Desfaça.
3. Em `src/core/balance.ts`, mude o `value` do Cavaleiro de `50` para `10` e rode `npm test`. Os testes de regra quebram (eles conhecem o número), mas nenhum arquivo de `game/` precisa mudar.
