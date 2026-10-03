# 0002 — Mobile via Capacitor, Android primeiro

**Status:** aceito · 2026-10-03

## Contexto
O jogo é web (ADR 0001) e precisa ir para as lojas.

## Opções
Capacitor (WebView + plugins nativos) · Cordova (legado) · apenas PWA (sem loja nem anúncios nativos).

## Decisão
Capacitor; Android primeiro (publicação mais barata e rápida), iOS depois.

## Consequências
Recursos nativos (AdMob, Preferences) via plugins. Desempenho limitado pela WebView, o que exige pooling e limite de sprites.
