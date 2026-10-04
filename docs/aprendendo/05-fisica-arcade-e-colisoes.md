# 05 — Física Arcade e colisões

## O que é

O Phaser traz motores de física. Usamos o mais simples e rápido, a **física Arcade**: cada objeto pode ganhar um **corpo** (*body*), um retângulo ou círculo invisível com posição e velocidade. A cada frame, o motor:

1. move os corpos de acordo com a velocidade (`body.setVelocity(0, -900)` = 900 px/s para cima)
2. descobre quais corpos estão se tocando

Para "se tocando" existem dois modos:

| Modo | O que faz | Usamos para |
|---|---|---|
| `overlap` | só **avisa** que dois corpos se sobrepõem (chama uma função) | projétil × monstro |
| `collide` | avisa **e empurra** um para fora do outro, como objetos sólidos | ainda não usamos |

Além disso, há um terceiro jeito, feito à mão: **colisão por distância entre círculos**. Dois círculos se tocam quando a distância entre os centros é menor que a soma dos raios.

## Por que existe

- **Projétil × monstro** pode ter 400 projéteis contra 300 monstros, o que daria 120 mil pares por frame se testássemos todos. O `overlap` do Arcade usa uma **árvore espacial** que só compara objetos próximos, e por isso é rápido.
- **Tropa × monstro** usa distância de círculos (`circlesOverlap`, em `core/geometry.ts`) porque a tropa não é um objeto único de física: é uma formação de vários heróis desenhados, envolvida por um círculo. É uma conta simples, testada com Vitest, e serve também para a caixa de arma e o chefão.

Um cuidado: dentro de um mesmo frame, dois projéteis podem acertar o mesmo monstro. Por isso o código checa `active` antes de aplicar dano. Um monstro que já morreu naquele frame não morre de novo nem dá pontos duas vezes.

## Analogia com o mundo web

O `overlap` é como o **`IntersectionObserver`**: você não fica calculando posições, só registra "me avise quando A cruzar B", e o navegador (aqui, o motor de física) faz a conta de forma otimizada. A colisão de círculos é como calcular à mão se um clique caiu dentro de um elemento com `getBoundingClientRect()`.

## Onde está no código

- `src/game/systems/Collisions.ts`: `CollisionSystem` registra o `overlap` projétil × monstro e checa tropa × monstro a cada frame
- `src/core/geometry.ts`: `circlesOverlap`, com testes
- `src/game/entities/Enemy.ts` e `Projectile.ts`: ligam e desligam o corpo (`body.enable`) ao sair e voltar do pool
- `src/game/entities/Squad.ts`: `circle`, o círculo que envolve a formação
- `src/game/config.ts`: `physics: { default: 'arcade' }`

## Mexa e veja

1. Abra o jogo com o debug de física: em `config.ts`, coloque `arcade: { gravity: { x: 0, y: 0 }, debug: true }`. Aparecem os contornos dos corpos e as setas de velocidade. Desfaça (no Task 14 isso vira `?debug` na URL).
2. Em `balance.ts`, aumente o `radius` do monstro `common` para `40`. Os monstros ficam maiores e mais fáceis de acertar, e também encostam na tropa mais cedo.
3. Em `Collisions.ts`, remova a linha `if (!projectile.active || !enemy.active) return;` e mate monstros com uma tropa grande. Às vezes a pontuação sobe duas vezes pelo mesmo monstro. Desfaça.
