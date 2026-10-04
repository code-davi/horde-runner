# 11 — Reaproveitamento em jogos: o "React" do game dev

## O que é

As mesmas perguntas que você faz no React ("isso vira componente?", "isso vira hook?", "isso deve ser genérico?") existem em jogos, com outros nomes. A tabela abaixo é o mapa (ADR 0017):

| React | Game dev | Exemplo neste projeto |
|---|---|---|
| Componente configurado por props | **Entidade guiada por dados** (*data-driven*) | um único `Enemy` para todos os monstros; o que muda vem da tabela `ENEMIES` em `balance.ts` (Task 11) |
| Hook (`useHealth`) | **Módulo de comportamento compartilhado** | `core/health.ts`: vida e dano do monstro, do chefão e da caixa de arma |
| Biblioteca de UI | **Views reutilizáveis** | `views/text.ts` (`centeredText`) e, no Task 12, `ProgressBar` |
| Composição > herança | **o mesmo princípio** | `Boss` não herda de `Enemy`: os dois *usam* `health.ts` e `geometry.ts` |
| Utilitário genérico tipado | **Infraestrutura genérica** | `ObjectPool<T>` serve para projéteis e inimigos |
| "Regra de três" | **a mesma regra** | `centeredText` só nasceu quando 3 cenas precisaram de texto centralizado |

## Por que existe

- **Variantes por dados, não por classes.** Para criar um monstro novo, basta uma linha na tabela, e o tipo `EnemyKind` se atualiza sozinho (é derivado de `keyof typeof ENEMIES`). Nenhuma classe nova, nenhum `switch` esquecido.
- **Lógica testada uma vez só.** `applyDamage` tem 4 testes e serve para três entidades diferentes.
- **Sem generalizar cedo demais.** Generalizar com um uso só costuma criar abstrações erradas, que custam mais para desfazer do que a duplicação.

## Analogia com o mundo web

A própria tabela acima é a analogia. O detalhe que muda em jogos é a palavra **ECS** (*Entity Component System*): é o extremo da composição, em que entidades são só um ID e todo comportamento vive em "sistemas". Engines grandes usam ECS. Para nós seria exagero: os sistemas de `game/systems/` (`FiringSystem`, `ObjectPool`) já pegam a parte boa da ideia sem a cerimônia.

**Nos assets (subprojeto 2), o reaproveitamento tem formas próprias:**

| Técnica | O que faz | Equivalente web |
|---|---|---|
| Atlas de sprites | todas as imagens numa só, carregada uma vez | CSS sprites |
| Tint | um desenho em cinza colorido por código gera variantes (zumbi verde e roxo) | variáveis CSS / temas |
| 9-slice | painel de UI que estica sem distorcer as bordas | `border-image` |
| Animação esquelética | um "esqueleto" animado reaproveitado entre personagens | componente de animação reutilizável |
| Manifesto tipado de assets | chaves dos assets num objeto tipado, sem strings soltas | constantes de rotas |

## Onde está no código

- `src/game/systems/ObjectPool.ts`: infraestrutura genérica
- `src/core/health.ts` e `src/core/geometry.ts`: comportamentos puros compartilhados
- `src/core/balance.ts` (`ENEMIES`) e `src/core/enemies.ts` (`EnemyKind` derivado): entidades guiadas por dados
- `src/game/views/text.ts`: view reutilizável
- `docs/decisoes/0017-tipagem-e-reaproveitamento.md`: a decisão completa

## Mexa e veja

1. Em `balance.ts`, adicione uma linha em `ENEMIES`: `tiny: { hp: 1, speed: 1.6, heroesLost: 1, points: 5, cost: 1, radius: 12 }`. Rode `npm run typecheck`: o tipo `EnemyKind` já inclui `'tiny'` sem você escrever nada. Desfaça.
2. Procure no projeto (`Ctrl+Shift+F`) por `applyDamage`. A partir do Task 13, você vai encontrar três usos diferentes da mesma função.
3. Tente criar um segundo pool só para inimigos copiando `ObjectPool`. Você vai perceber que não há nada para mudar: é o sinal de que o genérico está certo.
