# 04 — Entrada de toque e arrasto

## O que é

O Phaser unifica mouse e toque num único conceito: o **ponteiro** (`Phaser.Input.Pointer`). Os eventos mais usados:

| Evento | Quando acontece |
|---|---|
| `pointerdown` | dedo encostou / botão do mouse apertado |
| `pointermove` | ponteiro se moveu (com ou sem botão apertado; `pointer.isDown` diz qual) |
| `pointerup` | dedo saiu / botão solto |

As coordenadas `pointer.x` e `pointer.y` já vêm no **sistema lógico do jogo** (720 × 1280, doc 03), mesmo que a tela real seja de outro tamanho.

O Horde Runner usa **arrasto relativo**: o que importa é *quanto* o dedo andou, não *onde* ele está. Arrastar 100 px para a direita, em qualquer ponto da tela, move a tropa 100 px para a direita.

## Por que existe

- **Relativo, e não absoluto:** se a tropa fosse até onde o dedo está, o dedo **cobriria a tropa**. Com o arrasto relativo, você pode arrastar na parte de baixo da tela e enxergar tudo.
- **Sem "folga" na borda:** cada movimento é somado a um alvo que já está limitado às bordas. Se você empurrar o dedo além da borda e voltar, a tropa responde **na hora**, sem precisar "desfazer" o excesso.
- **Seguir com velocidade máxima:** a tropa vai até o alvo com uma velocidade limitada (`SQUAD_FOLLOW_SPEED`), o que deixa o movimento suave mesmo com toques imprecisos.

## Analogia com o mundo web

São os **Pointer Events** do DOM (`pointerdown`, `pointermove`, `pointerup`), que também unificam mouse, toque e caneta. O `touch-action: none` no `index.html` é o mesmo truque usado em sliders e mapas para o navegador não rolar a página enquanto você arrasta.

## Onde está no código

- `src/game/systems/DragInput.ts`: guarda o último `x` do ponteiro e soma cada deslocamento ao alvo limitado
- `src/core/motion.ts`: `clamp` (limitar às bordas) e `approach` (andar até o alvo sem passar dele), com testes
- `src/game/entities/Squad.ts`: usa `approach` a cada frame para seguir o alvo
- `index.html`: `touch-action: none`

## Mexa e veja

1. Em `DragInput`, troque o cálculo do alvo por `this.target = pointer.x` (arrasto absoluto). Jogue no celular e repare como o dedo esconde a tropa. Desfaça.
2. Ainda em `DragInput`, multiplique o deslocamento por `1.5` (`(pointer.x - this.lastPointerX) * 1.5`). O controle fica mais "sensível": movimentos curtos de dedo levam a tropa mais longe.
3. Em `balance.ts`, aproxime `SQUAD_MIN_X` e `SQUAD_MAX_X` (ex.: `200` e `520`) e veja a área jogável encolher.
