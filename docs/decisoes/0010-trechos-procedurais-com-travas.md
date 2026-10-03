# 0010 — Trechos procedurais: moldes ponderados + travas de justiça

**Status:** aceito · 2026-10-03

## Contexto
Sempre vir um par bom/ruim seria repetitivo. O autor quer portões solitários, pares com dois ruins e sequências de ruins para desviar.

## Decisão
O caminho é gerado por um sorteador ponderado de moldes (par clássico, menos pior, melhor dos bons, solitário, corredor de obstáculos, caixa de arma, só horda). Os pesos variam com a dificuldade e travas garantem a justiça.

## Consequências
Lógica pura, testável por propriedades (milhares de seeds).
