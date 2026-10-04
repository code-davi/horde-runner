# 0016 — Phaser 4

**Status:** aceito · 2026-10-03

## Contexto
O spec do subprojeto 1 deixou a versão do Phaser para ser confirmada no planejamento. Em 2026-10-03, a tag `latest` do Phaser no npm é a 4.2.1.

## Opções
Phaser 3.x (mais exemplos antigos na internet) · **Phaser 4.x** (versão estável atual, renderizador novo).

## Decisão
Phaser `^4.2.1`, importado como `import Phaser from 'phaser'` (o build ESM tem export default; `esModuleInterop` no tsconfig).

## Consequências
Muitos tutoriais e respostas na internet ainda são do Phaser 3. Antes de copiar um exemplo, confira a API na documentação do Phaser 4.
