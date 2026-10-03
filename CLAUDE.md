# Horde Runner

Jogo mobile 2D (Phaser + TypeScript + Vite; Capacitor para mobile). Projeto de hobby e aprendizado: o autor é dev web (TS/React/Node) fazendo seu primeiro jogo.

## Spec-Driven Development (obrigatório)

- `docs/visao/GDD.md` — visão do jogo. `docs/specs/` — um spec por subprojeto/feature. `docs/decisoes/` — ADRs. `docs/planos/` — planos de implementação. `docs/playtests/` — notas de playtest.
- **Nenhuma feature sem spec aprovado.** Mudou uma regra do jogo? Atualize spec/ADR primeiro, depois o código.
- Specs têm status: rascunho → aprovado → implementado → substituído.
- Toda decisão relevante vira um ADR novo (`NNNN-titulo.md`: contexto, opções, decisão, consequências). ADRs não são editados; são substituídos por novos.

## Documentação de aprendizado

Todo conceito de game dev novo introduzido no código ganha (ou atualiza) um arquivo em `docs/aprendendo/`, em português claro: o que é, por que existe, analogia com desenvolvimento web, onde está no código, exercício "mexa e veja".

## Arquitetura

- `src/core/` — regras puras, sem Phaser nem APIs de browser. TDD com Vitest.
- `src/game/` — Phaser (cenas, entidades, views, sistemas). Só `game/views/` sabe como algo é desenhado.
- `src/platform/` — integrações com o dispositivo atrás de interfaces.
- Todos os números de balanceamento ficam em `src/core/balance.ts`.

## Idioma

Docs em português. Código (nomes, identificadores) em inglês.
