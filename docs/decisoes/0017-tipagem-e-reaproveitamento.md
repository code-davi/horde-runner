# 0017 — Tipagem e reaproveitamento

**Status:** aceito · 2026-10-03

## Contexto
O autor sabe quando reaproveitar em React, mas não conhece os equivalentes em game dev. O plano inicial tinha duplicações: dois pools quase iguais, lógica de vida repetida em três entidades, colisão por distância repetida e duas barras de progresso.

## Decisão

**Tipagem**
- Cada tipo mora no módulo dono do conceito (`Gate` em `gates.ts`, `TroopState` em `troop.ts`). Não existe pasta `types/` central.
- Conceitos com variantes usam union discriminada por `kind`, tratadas com `switch` exaustivo.
- O estado de regra é imutável, com funções puras `(estado, evento) → novoEstado`, como um reducer.
- Tabelas de dados usam `as const satisfies Record<string, Def>`, e os tipos derivam delas (`type EnemyKind = keyof typeof ENEMIES`).
- O Phaser só conversa com o core por funções e tipos exportados.

**Reaproveitamento**
- **Entidades guiadas por dados:** uma classe por *comportamento*, não por *variante*. Um monstro novo é uma linha em `balance.ts`.
- **Composição em vez de herança:** lógica comum vira módulo puro (`core/health.ts`, `core/geometry.ts`) ou view reutilizável (`views/ProgressBar.ts`).
- **Infraestrutura genérica:** `ObjectPool<T>` único para tudo que é reciclado.
- **Regra de três:** algo só vira genérico quando aparece 3 vezes, ou 2 vezes com crescimento certo.
- Nos assets (subprojeto 2): atlas de sprites, tint, 9-slice, animação esquelética e manifesto tipado de assets.

## Consequências
Menos código duplicado e mais módulos pequenos testáveis. A lógica comum é testada uma vez só. Adicionar variantes (monstros, armas) passa a ser editar dados.
