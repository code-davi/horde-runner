# 0025 — Monstros perseguem a tropa

**Status:** aceito · 2026-10-04

## Contexto
Terceira rodada do playtest de 2026-10-04: monstros desciam em linha reta, sem movimento lateral. Quem não estava à frente da tropa nunca virava ameaça, então "deixar passar" era sempre seguro e desviar virou a estratégia dominante. Além disso, o chefão descia reto pelo centro: desviando dele, ele saía da tela sem ser removido e o caminho ficava parado para sempre (partida travada). O spec já dizia que o chefão "desce em direção à tropa".

## Opções
- **Manter a descida reta e só aumentar a densidade:** reduz os buracos, mas quem está ao lado continua inofensivo.
- **Perseguição lenta:** cada monstro anda de lado em direção à tropa, bem mais devagar do que a tropa se move.
- **Perseguição rápida (mira perfeita):** desviar ficaria quase impossível; o jogo vira só de tiro.

## Decisão
Enquanto estão na tela e acima da linha da tropa, comuns (30 px/s), fortes (45 px/s) e o chefão (20 px/s) andam de lado em direção ao x da tropa, sem ultrapassá-lo. Depois de passar da linha da tropa, seguem retos. A velocidade lateral é uma coluna da tabela de inimigos (`steer`, ADR 0017) e o cálculo é uma função pura no core. O chefão que alcança a linha da tropa sem ser derrotado encerra a partida, mesmo sem encostar. Detalhes no spec do subprojeto 1, §4.5.

## Consequências
Deixar um monstro passar deixa de ser grátis: ele vem na sua direção, e desviar exige tempo certo (a tropa ainda é muito mais rápida). Enfrentar passa a ser a resposta natural, o que combina com o feixe (ADR 0024). O chefão vira de fato o clímax e a partida nunca mais trava por desvio. Hordas tendem a se juntar na direção da tropa, o que deixa o feixe mais valioso. As três velocidades são alavancas de playtest.
