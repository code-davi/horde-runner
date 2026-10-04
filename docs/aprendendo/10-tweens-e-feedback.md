# 10 — Tweens e feedback visual ("juice")

## O que é

Um **tween** (de *in-between*) anima uma propriedade de um objeto de um valor até outro ao longo do tempo: posição, transparência, escala, cor. Você diz **o quê**, **até onde** e **em quanto tempo**, e o Phaser calcula todos os quadros intermediários:

```ts
scene.tweens.add({
  targets: label,
  y: label.y - 60,       // sobe 60 px
  alpha: 0,              // até sumir
  duration: 700,         // em 0,7 s
  ease: 'Cubic.easeOut', // rápido no começo, suave no fim
  onComplete: () => label.destroy(),
});
```

O **easing** é a "curva" do movimento. `Linear` anda sempre na mesma velocidade e parece robótico. `easeOut` desacelera no fim e parece natural. `yoyo: true` faz o tween voltar ao valor original.

**"Juice"** é o nome que game designers dão a esse tipo de reação: números que pulam, coisas que piscam, a tropa que "estica" ao passar num portão. Nada disso muda as regras, mas muda muito a **sensação** do jogo.

## Por que existe

Sem feedback, o jogador não percebe o que aconteceu: "perdi 12 heróis? por quê?". Com feedback, cada evento importante tem uma reação imediata e legível:

| Evento | Reação |
|---|---|
| Passou por um portão | o efeito (`x2`, `-40`) sobe em verde ou vermelho e a tropa dá um "squash" |
| Monstro encostou | `-N` vermelho e a tropa pisca |
| Monstro morreu | os pontos sobem do lugar onde ele estava |
| Arma subiu | "Arma +1" em verde |
| Chefão derrotado | "Chefão! +500" |

Para não pesar com hordas grandes, existem no máximo **25 textos flutuantes** ao mesmo tempo: os excedentes são simplesmente ignorados.

Este é o primeiro passo contra o aspecto de "jogo de flash" (ADR 0004). No subprojeto 2 entram animações de verdade, partículas e som.

## Analogia com o mundo web

Tweens são **transições e animações CSS** (`transition: transform 90ms ease-out`) ou o `animate()` do **Framer Motion**. O `ease` do Phaser é o `transition-timing-function` do CSS, e o `yoyo` é o `animation-direction: alternate`.

## Onde está no código

- `src/game/views/feedback.ts`: `PopTexts` (textos flutuantes com limite), `flash` (piscar) e `punch` (squash)
- `src/game/RunFeedback.ts`: qual reação acontece em cada evento da partida
- `src/game/views/SquadView.ts`: `flash()` e `punch()` aplicados ao desenho da tropa
- `src/game/views/Hud.ts`: o placar, que só reescreve os textos que mudaram
- `src/game/systems/DebugOverlay.ts`: o painel do `?debug`

## Mexa e veja

1. Em `feedback.ts`, troque `ease: 'Cubic.easeOut'` por `ease: 'Linear'` nos textos flutuantes. Eles passam a subir de forma "mecânica". Depois experimente `'Back.easeOut'`, que passa do ponto e volta.
2. Em `punch`, aumente `scaleX` para `1.4` e `duration` para `200`. O squash fica exagerado e "borrachudo". Ache o ponto que você acha mais gostoso.
3. Abra o jogo com `?debug&seed=1`. No console do navegador (F12), rode `__horde.setTroop(500, 4)` e veja a tropa, os portões negativos e a pressão mudarem na hora.
