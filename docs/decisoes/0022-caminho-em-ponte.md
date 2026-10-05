# 0022 — O caminho é uma ponte estreita

**Status:** aceito · 2026-10-04

## Contexto
Playtest de 2026-10-04: os monstros nasciam espalhados por quase toda a largura da tela (576 dos 720 px) e a tropa podia andar de x = 80 a x = 640. Resultado: hordas espaçadas, fáceis de contornar pela lateral, e um jogo "lento e fácil de ficar se esquivando". O autor pediu um corredor mais fechado, que no jogo pronto vira uma ponte.

## Opções
- **Só estreitar a área de spawn dos monstros:** a tropa ainda poderia fugir pelas bordas livres; o desvio continuaria fácil.
- **Estreitar o caminho inteiro (ponte):** tropa, portões, caixas e monstros vivem na mesma faixa estreita; as laterais são cenário.
- **Mudar a resolução lógica (tela mais estreita):** mexe em escala, HUD e menus por um efeito que só o mundo da partida precisa.

## Decisão
O caminho é uma ponte de 480 px centrada na tela (x de 120 a 600). A geometria vive em `balance.ts` (`BRIDGE_LEFT_X`, `BRIDGE_WIDTH`) e o core converte frações da ponte em x da tela (`bridgeX`). Os portões passam a ter 220 px, as faixas ficam centradas em 240 e 480, a tropa fica presa entre 150 e 570 e os monstros nascem entre 10% e 90% da ponte. A view desenha as laterais como água; no subprojeto 2 elas viram arte. Detalhes no spec do subprojeto 1, §4.9.

## Consequências
A mesma horda ocupa cerca de 2/3 da largura de antes (≈ 1,5× mais densa) e não há rota livre pela lateral. Isso deixa o desvio mais difícil e o jogo mais próximo do "corredor" do gênero. Os rótulos de portão precisam caber em 220 px, por isso a view reduz o texto quando necessário. O limite da tropa vale para o centro da formação: uma tropa muito larga pode passar visualmente da borda (a observar no próximo playtest). A largura da ponte é um único número, ajustável em playtests.
