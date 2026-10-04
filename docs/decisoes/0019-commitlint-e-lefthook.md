# 0019 — Commits padronizados com commitlint + lefthook

**Status:** aceito · 2026-10-03

## Contexto
O autor quer um padrão de commits obedecido sempre, não só por convenção. Um histórico padronizado também facilita gerar changelog e entender a evolução do projeto de estudo.

## Opções
- Só convenção escrita: depende de disciplina.
- **commitlint + lefthook:** hooks locais rápidos (binário único, configuração em YAML), com validação repetida no CI.
- commitlint + husky + lint-staged: equivalente, mas com mais pacotes e configuração espalhada.

## Decisão
- Conventional Commits validados pelo commitlint (`@commitlint/config-conventional` + regras do projeto).
- O lefthook roda os hooks:
  - `commit-msg`: commitlint
  - `pre-commit`: ESLint e Prettier nos arquivos staged, mais typecheck
  - `pre-push`: testes unitários
- O CI valida de novo as mensagens dos commits do PR, porque hooks locais podem ser pulados.
- Regras detalhadas no spec de padrões de código, §11.

## Consequências
Commit fora do padrão é recusado na hora, com a mensagem de erro do commitlint. `--no-verify` é proibido pelas regras do projeto, e mesmo que seja usado, o CI barra o PR.
