# 13 — Perseguição (steering "seek")

## O que é

Em jogos, **steering behaviors** são regrinhas simples que fazem personagens parecerem ter intenção: perseguir, fugir, desviar, andar em bando. A mais básica é o **seek** ("buscar"): a cada frame, o personagem anda um pouco na direção do alvo.

No Horde Runner, os monstros fazem um seek **só na horizontal** e **com velocidade limitada**:

- a queda (rolagem + caminhada) continua igual;
- além dela, cada monstro anda de lado em direção ao x da tropa: comum a 30 px/s, forte a 45 px/s, chefão a 20 px/s;
- só persegue enquanto está na tela e acima da linha da tropa; depois de passar, segue reto;
- quando já está alinhado (a menos de 2 px), para de corrigir, para não ficar "tremendo" de um lado para o outro.

## Por que existe

Antes, os monstros desciam em linha reta. Quem não estava na sua frente nunca virava ameaça, então a melhor jogada era sempre **desviar** (playtest de 2026-10-04, ADR 0025). Com a perseguição, deixar um monstro passar deixa de ser grátis: ele vem na sua direção. Como a tropa se move muito mais rápido (até 2200 px/s), ainda dá para desviar, mas no tempo certo; enfrentar vira a resposta natural.

A velocidade **limitada** é o que mantém o jogo justo: uma perseguição perfeita (mira instantânea) tornaria o desvio impossível.

## Analogia com o mundo web

Pense num elemento que segue o cursor do mouse, mas com velocidade máxima: a cada `requestAnimationFrame` você move o elemento alguns pixels na direção do cursor, sem teleportar. É exatamente o `chaseVelocityX`: ele não diz "vá para lá", diz "ande para lá a no máximo X px/s".

A "zona morta" de 2 px é o mesmo truque de um _debounce_ visual: abaixo de um limite, ignorar a diferença evita oscilação.

## Onde está no código

- `src/core/motion.ts`: `chaseVelocityX(perseguidor, alvoX, steer)` — regra pura, testada em `tests/core/motion.test.ts`
- `src/core/balance.ts`: coluna `steer` em `ENEMIES`, `BOSS.steer` e `CHASE_DEADZONE_PX`
- `src/game/systems/EnemySystem.ts`: aplica a velocidade lateral no corpo de física de cada monstro
- `src/game/entities/Boss.ts`: o chefão soma a velocidade lateral ao próprio `x`
- `src/game/systems/BossEncounter.ts`: se o chefão alcançar a linha da tropa, a partida acaba

## Mexa e veja

1. Em `balance.ts`, troque o `steer` do comum de 30 para 120 e jogue: a horda "gruda" na tropa e desviar fica quase impossível. Desfaça.
2. Troque para 0: os monstros voltam a descer retos e você consegue passar pelas hordas só desviando. É o jogo de antes.
3. Em `balance.ts`, troque `CHASE_DEADZONE_PX` por 0 e observe com `?debug` um monstro alinhado com a tropa: a linha de velocidade fica trocando de lado a cada frame.
