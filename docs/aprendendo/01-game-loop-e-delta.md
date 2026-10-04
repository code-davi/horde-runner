# 01 — Game loop e delta time

## O que é

Um jogo é um **loop infinito** que, várias vezes por segundo (idealmente 60):

1. lê a entrada (toques, teclas)
2. **atualiza** o mundo (move a tropa, os monstros, os tiros)
3. **desenha** o resultado na tela

Cada volta é um **frame**. No Phaser, o passo 2 é o método `update(time, delta)` da cena, chamado automaticamente a cada frame.

**Delta time** (`delta`) é quanto tempo passou desde o frame anterior, em milissegundos. A 60 FPS ele vale cerca de 16,7 ms; a 30 FPS, cerca de 33 ms.

## Por que existe

Se a tropa andasse "10 px por frame", ela seria **duas vezes mais rápida** num celular de 120 Hz do que num de 60 Hz, e ficaria lenta quando o jogo engasgasse. Multiplicando pela duração do frame, a velocidade passa a ser **por segundo** e fica igual em qualquer aparelho:

```ts
const maxStep = (SQUAD_FOLLOW_SPEED * deltaMs) / 1000; // px/s × s = px neste frame
```

**Por que `clampDelta`?** Quando o app vai para segundo plano, o loop para. Ao voltar, o primeiro `delta` pode ser de **minutos**. Sem limite, um monstro "andaria" 10.000 px em um frame e atravessaria a tropa sem colidir. `clampDelta` limita o delta a 50 ms: o jogo só "perde" aquele tempo, sem teletransportes.

## Analogia com o mundo web

É o `requestAnimationFrame`, que o Phaser usa por baixo:

```js
let last = performance.now();
function frame(now) {
  const delta = now - last; last = now;
  update(delta); render();
  requestAnimationFrame(frame);
}
```

A diferença para o React: no React a tela só é redesenhada quando **o estado muda**. Num jogo, a tela é redesenhada **o tempo todo**, mudando ou não.

## Onde está no código

- `src/game/scenes/RunScene.ts`: `update(_time, delta)` chama `clampDelta(delta)` e passa o resultado para a tropa
- `src/core/time.ts`: `clampDelta`
- `src/game/entities/Squad.ts`: `update(deltaMs, targetX)` converte velocidade (px/s) em passo do frame
- `src/core/balance.ts`: `SQUAD_FOLLOW_SPEED` (px/s) e `MAX_FRAME_DELTA_MS`

## Mexa e veja

1. Em `balance.ts`, troque `SQUAD_FOLLOW_SPEED` de `2200` para `300`. A tropa passa a "atrasar" atrás do dedo, como se estivesse pesada.
2. Em `Squad.update`, troque `(SQUAD_FOLLOW_SPEED * deltaMs) / 1000` por um valor fixo como `30` (px por frame) e abra o jogo com o DevTools limitando a CPU (aba Performance → CPU throttling 6x). A tropa fica bem mais lenta, porque o movimento passou a depender da taxa de frames. Desfaça.
3. Em `RunScene.update`, adicione temporariamente `console.log(delta)` e veja os valores no console, perto de 16,7.
