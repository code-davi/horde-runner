# 03 — Coordenadas, câmera e escala de tela

## O que é

O jogo é desenhado num "papel" de tamanho fixo: **720 × 1280 pixels lógicos**, em retrato. Toda posição no código usa essas coordenadas:

- a origem `(0, 0)` é o **canto superior esquerdo**
- `x` cresce para a direita (até 720)
- `y` cresce **para baixo** (até 1280), ao contrário da matemática da escola

Na hora de mostrar na tela real, o Phaser **escala** esse papel inteiro com o modo `Scale.FIT`: aumenta ou diminui mantendo a proporção até caber, e centraliza (`CENTER_BOTH`). Num celular mais alto que 9:16, sobram faixas em cima e embaixo. Num tablet mais largo, sobram faixas nas laterais.

## Por que existe

Existem milhares de tamanhos de tela. Se o código usasse pixels reais, cada posição (onde fica a tropa, onde nascem os portões, o tamanho de cada coisa) teria que ser recalculada para cada aparelho. Com coordenadas lógicas fixas, a tropa está sempre em `y = 1100` e a divisa entre as faixas sempre em `x = 360`, em qualquer celular.

## Analogia com o mundo web

É exatamente o **`viewBox` de um SVG**: você desenha em um sistema de coordenadas próprio (`viewBox="0 0 720 1280"`) e o navegador escala o resultado para o tamanho do elemento, com `preserveAspectRatio="xMidYMid meet"`, que é o equivalente ao `Scale.FIT` + `CENTER_BOTH`.

A diferença em relação ao CSS é que não existe "layout responsivo": o jogo inteiro escala como uma imagem.

## Onde está no código

- `src/game/dimensions.ts`: `GAME_WIDTH = 720` e `GAME_HEIGHT = 1280`
- `src/game/config.ts`: `scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH }`
- `src/core/balance.ts`: `LANE_SPLIT_X = 360` (meio da largura) e, a partir do Task 9, `SQUAD_Y`
- `index.html`: o `<div id="game">` onde o canvas é colocado, e o CSS `touch-action: none`, que impede o navegador de rolar a página quando você arrasta o dedo no jogo

## Mexa e veja

1. Abra o jogo no navegador, aperte F12 e ative o modo de dispositivo (ícone de celular). Troque entre aparelhos e veja o jogo escalar mantendo a proporção.
2. Em `config.ts`, troque `Phaser.Scale.FIT` por `Phaser.Scale.ENVELOP`. O jogo passa a preencher a tela toda, mas corta as bordas. Desfaça.
3. Em `StartScene`, mude o `y` do título de `GAME_HEIGHT * 0.35` para `0`. O texto fica cortado no topo, porque a origem é o canto superior e o texto é centralizado no ponto.
