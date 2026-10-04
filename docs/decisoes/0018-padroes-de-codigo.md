# 0018 — Padrões de código com limites verificados por ferramenta

**Status:** aceito · 2026-10-03

## Contexto
O autor exige código limpo, legível e bem organizado: nada de arquivos gigantes nem código bagunçado. Padrões que dependem só de boa vontade se degradam com o tempo.

## Opções
Guia apenas escrito · guia + revisão manual · **guia + limites mensuráveis verificados por ESLint/Prettier no CI**.

## Decisão
Os padrões ficam no spec `docs/specs/2026-10-03-padroes-de-codigo.md`. Tudo o que é mensurável (tamanho de arquivo e de função, complexidade, `any`, direção dos imports, formatação) é verificado por ESLint e Prettier localmente e no CI. O que não é mensurável entra num checklist de revisão.

## Consequências
Código fora do padrão não passa no CI. Exceções exigem `eslint-disable` com justificativa escrita na mesma linha.
