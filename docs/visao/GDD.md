# Horde Runner — Game Design Document (GDD)

> **Status:** aprovado · **Última atualização:** 2026-10-03
> Nome provisório. Este é o documento-mestre da visão do jogo. Detalhes de implementação ficam nos specs de cada subprojeto (`docs/specs/`); o porquê de cada decisão fica nos ADRs (`docs/decisoes/`).

## 1. Visão em uma frase

Um jogo mobile infinito, de uma mão só, em que você guia uma tropa de heróis por um caminho cheio de hordas de monstros caricatos, escolhendo portões que multiplicam ou reduzem sua tropa e melhorando sua arma, até ser derrotado e ver seu score.

## 2. Objetivos do projeto

1. **Hobby e aprendizado:** o autor (dev web TS/React/Node, primeiro jogo) aprende desenvolvimento de games. Cada conceito novo ganha documentação de estudo em `docs/aprendendo/`.
2. **Publicar e monetizar** nas lojas (Android primeiro, iOS depois).
3. **Monetização saudável:** apenas anúncios recompensados, sempre por escolha do jogador. Nunca banner, nunca intersticial.

## 3. Público e tom

- **Público:** todas as idades, classificação 13+ na loja (fora do programa Families do Google — ver ADR 0003).
- **Tom:** monstros caricatos e carismáticos (referências: Plants vs. Zombies, Kingdom Rush, Survivor.io). Um esqueleto é lúdico, nunca de terror. Sem sangue/gore: monstros derrotados se desmontam/viram fumacinha.
- **Evitar aspecto de "jogo de flash":** animações expressivas e com vida. A direção de arte é definida no subprojeto 2.

## 4. Plataforma e tecnologia

- Phaser + TypeScript + Vite, 2D com visão de cima, tela em retrato.
- Empacotado para mobile com Capacitor; AdMob via plugin Capacitor.
- Regras do jogo em TypeScript puro, separadas do Phaser (ADR 0013).

## 5. Regras do jogo

### 5.1 Controle
Arrastar o dedo em qualquer lugar da tela move a tropa horizontalmente. A tropa avança sozinha e atira automaticamente para a frente.

### 5.2 Tropa
- O que importa é o **número total de heróis** (a "vida" da tropa).
- **O número só sobe com portões** (`+N`, `xN`, heróis evoluídos). **Desce com portões ruins** (`-N`, `÷N`) **e com monstros que encostam.** Derrotar monstros nunca dá heróis — dá pontos (e, no subprojeto 3, moedas).
- **Heróis evoluídos ("nota de dinheiro"):** o total é exibido decomposto em níveis (ex.: Recruta = 1, Cavaleiro = 50, Campeão = 250, Lenda = 1000). 237 heróis = 4 Cavaleiros + 37 Recrutas. Cada herói evoluído dispara projéteis que valem pelos heróis que representa + bônus de dano por nível. Evoluir nunca reduz o poder de fogo.

### 5.3 Arma
Compartilhada por toda a tropa, evolui em níveis (Estilingue → Arco → Besta → Cajado → Canhão → níveis extras só com números). Sobe por caixas de arma no caminho ou portões de arma.

### 5.4 Portões
- Tipos: `+N`, `-N`, `xN`, `÷N`, `Arma +1`, heróis evoluídos (ex.: `+1 Cavaleiro`).
- Atirar em portões `+N`/`-N` aumenta o valor em +1 por acerto. `xN`/`÷N` são fixos.

### 5.5 Inimigos
| Tipo | Ao encostar na tropa |
|---|---|
| Comum (zumbi, esqueleto) | tira 1 herói e some |
| Forte (ogro, golem — mais vida, mais lento) | tira vários heróis e some |
| Chefão (barra de vida, a cada X trechos) | **fim de jogo** |

### 5.6 Caminho infinito em trechos
O caminho é gerado proceduralmente em trechos, sorteados entre moldes com pesos que mudam com a dificuldade e respeitando travas de justiça (detalhes no spec do subprojeto 1). Dificuldade cresce por um "orçamento de ameaça" por trecho.

### 5.7 Fim de jogo e score
Fim quando a tropa chega a zero ou o chefão encosta. Score = distância + monstros derrotados + bônus por chefão.

## 6. Progressão (subprojeto 3)

- **Moedas** por partida: monstros (pouco), chefões (muito), distância.
- **4 upgrades permanentes** (até 10 níveis, preço crescente): Tropa inicial, Arma inicial, Bolsa de moedas (+% moedas), Caçador de chefões (+% dano em chefões). Ajudam sem eliminar a necessidade de habilidade.
- Save local no aparelho (sem conta/servidor), com versão de schema.

## 7. Anúncios (subprojeto 4)

- **Reviver** (1x por partida, inclusive após toque do chefão): volta com ~30% do pico de heróis da partida, chefão empurrado para trás, 2 s de invulnerabilidade.
- **Dobrar moedas** na tela de fim de jogo.
- Sem internet/anúncio indisponível: botão desativado, jogo 100% offline.
- Tela de consentimento (GDPR/LGPD) via UMP na primeira abertura.

## 8. Telas da v1.0

Menu (Jogar, Upgrades, recorde, moedas) · Jogo (heróis, nível da arma, score, pausa) · Fim de jogo (score, recorde, moedas, Reviver 📺, Dobrar moedas 📺, Jogar de novo) · Upgrades.

## 9. Roadmap em subprojetos

Cada subprojeto tem seu próprio ciclo spec → plano → implementação.

| # | Subprojeto | Resultado |
|---|---|---|
| 1 | Núcleo jogável (web, formas geométricas) | responde "é divertido?" |
| 2 | Arte, som e "juice" | direção de arte (a definir em brainstorming próprio), efeitos, sons |
| 3 | Progressão | moedas, upgrades, menus, save |
| 4 | Mobile e publicação | Capacitor, AdMob recompensado, consentimento, Play Store |

**Fora da v1.0:** compra para receber recompensas sem anúncio, skins, baú diário, missões, ranking online, save na nuvem, iOS (pode vir logo após).
