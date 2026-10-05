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

## Área jogável não é a tela inteira: a ponte

A tela lógica tem 720 px de largura, mas o jogo só acontece numa **ponte** de 480 px no meio dela (x de 120 a 600, ADR 0022). As laterais são cenário. Estreitar o caminho deixa as hordas mais densas e tira a rota de fuga pelas bordas.

Para que a largura da ponte seja **um número só**, o gerador de trechos não fala em pixels: ele sorteia posições como **frações da ponte** (`x = 0,1` é perto da borda esquerda, `x = 0,9` perto da direita). Só na hora de pôr o monstro no mundo a fração vira pixel, com `bridgeX(fração) = 120 + fração × 480`. Se a ponte mudar de largura, o gerador nem fica sabendo.

**Analogia web:** é como posicionar com porcentagem dentro de um container (`left: 10%`) em vez de `left: 48px`. O container (a ponte) pode mudar de tamanho que os filhos continuam no lugar relativo certo. As faixas, os portões e os limites da tropa também derivam de `BRIDGE_WIDTH`, como variáveis CSS calculadas com `calc()`.

## Onde está no código

- `src/game/dimensions.ts`: `GAME_WIDTH = 720` e `GAME_HEIGHT = 1280`
- `src/game/config.ts`: `scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH }`
- `src/core/balance.ts`: `LANE_SPLIT_X = 360` (meio da largura), a partir do Task 9 `SQUAD_Y` e, a partir do Task 15b, `BRIDGE_WIDTH` e as medidas que derivam dela (faixas, portões, limites da tropa)
- `src/core/bridge.ts`: `bridgeX`, que converte fração da ponte em x da tela
- `src/game/views/BridgeView.ts`: desenha a água e as bordas da ponte
- `index.html`: o `<div id="game">` onde o canvas é colocado, e o CSS `touch-action: none`, que impede o navegador de rolar a página quando você arrasta o dedo no jogo

## Mexa e veja

1. Abra o jogo no navegador, aperte F12 e ative o modo de dispositivo (ícone de celular). Troque entre aparelhos e veja o jogo escalar mantendo a proporção.
2. Em `config.ts`, troque `Phaser.Scale.FIT` por `Phaser.Scale.ENVELOP`. O jogo passa a preencher a tela toda, mas corta as bordas. Desfaça.
3. Em `StartScene`, mude o `y` do título de `GAME_HEIGHT * 0.35` para `0`. O texto fica cortado no topo, porque a origem é o canto superior e o texto é centralizado no ponto.
4. Em `balance.ts`, troque `BRIDGE_WIDTH` de 480 para 360 e jogue: portões, faixas, monstros e limites da tropa se ajustam sozinhos, e desviar fica bem mais difícil. Desfaça.
