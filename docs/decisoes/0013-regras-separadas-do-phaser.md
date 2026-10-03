# 0013 — Regras do jogo em TS puro, separadas do Phaser

**Status:** aceito · 2026-10-03

## Decisão
- `src/core/` contém as regras, sem dependência de Phaser nem do browser.
- `src/game/` desenha e detecta colisões, e delega os efeitos ao core.
- `src/game/views/` isola o desenho.
- `src/platform/` isola o dispositivo atrás de interfaces.

## Consequências
TDD possível nas regras; arte trocável sem mexer nas regras; migração de engine viável.
