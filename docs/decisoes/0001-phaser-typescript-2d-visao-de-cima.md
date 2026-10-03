# 0001 — Phaser + TypeScript, 2D com visão de cima

**Status:** aceito · 2026-10-03

## Contexto
Primeiro jogo de um dev web experiente em TS/React/Node. Objetivos: aprender, iterar rápido, publicar em mobile.

## Opções
- **Phaser + TS (2D):** reaproveita a stack do autor, teste instantâneo no navegador, maior autonomia do assistente para rodar e testar.
- **Babylon.js/Three.js (3D):** visual dos anúncios do gênero, mas curva de 3D, assets caros e desempenho em WebView.
- **Godot 4:** nativo e leve, mas linguagem e editor novos e menos autonomia do assistente.
- **Cocos Creator / Unity:** comunidade menor ou peso excessivo para o escopo.

## Decisão
Phaser + TypeScript + Vite, 2D com visão de cima, tela em retrato.

## Consequências
Sem 3D real (é possível usar sprites pré-renderizados de modelos 3D). Regras em TS puro permitem migrar de engine no futuro.
