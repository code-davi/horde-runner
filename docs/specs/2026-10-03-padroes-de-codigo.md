# Spec — Padrões de código

> **Status:** rascunho (aguardando revisão) · **Data:** 2026-10-03
> **Vale para:** todo o código do projeto, em todos os subprojetos. **Decisões:** ADR 0017 (tipagem e reaproveitamento), ADR 0018 (padrões verificados por ferramenta).

## 1. Princípios

1. **Legibilidade acima de esperteza.** Código é lido muito mais vezes do que escrito. Se precisa de esforço para entender, reescreva.
2. **Uma responsabilidade por arquivo e por função.** Se você não consegue descrever o arquivo numa frase sem "e", ele faz coisas demais.
3. **Nomes que explicam.** Um bom nome dispensa comentário.
4. **Sem duplicação, sem generalização precoce.** Use a regra de três (ADR 0017).
5. **Tipos como documentação.** O tipo deve dizer o que é válido; estados impossíveis não devem ser representáveis.

## 2. Limites verificados por ferramenta

Todos são **erro** no ESLint e quebram o CI.

| Regra | Limite | Regra ESLint |
|---|---|---|
| Linhas por arquivo (sem linhas em branco e comentários) | 200 em `src/`, 300 em `tests/` | `max-lines` |
| Linhas por função | 40 em `src/` (testes isentos) | `max-lines-per-function` |
| Complexidade ciclomática | 10 | `complexity` |
| Profundidade de aninhamento | 3 | `max-depth` |
| Parâmetros por função | 3 (acima disso, usar um objeto) | `max-params` |
| `any` | proibido | `@typescript-eslint/no-explicit-any` |
| Tipo de retorno em funções exportadas | obrigatório | `@typescript-eslint/explicit-module-boundary-types` |
| Import de tipos | `import type` | `@typescript-eslint/consistent-type-imports` |
| Variáveis e imports não usados | proibidos | `@typescript-eslint/no-unused-vars` |
| `console.*` em `src/` | proibido | `no-console` |
| `eslint-disable` sem justificativa | proibido | `@eslint-community/eslint-comments/require-description` |
| Formatação | Prettier, sem discussão | `prettier --check` no CI |
| Direção dos imports | `core/` não importa nada de `game/`, `platform/` nem `phaser`; `platform/` não importa `game/` | `no-restricted-imports` |

TypeScript em modo `strict` com `noUncheckedIndexedAccess`.

## 3. Organização

- Estrutura de pastas definida no spec de cada subprojeto (`core/`, `game/`, `platform/`).
- **Sem barrels** (`index.ts` que só reexporta): importe do arquivo dono. Isso evita ciclos e deixa claro de onde vem cada coisa.
- Nomes de arquivo: classes em `PascalCase.ts` (um export principal), módulos de funções em `camelCase.ts`.
- Testes espelham `src/` (`src/core/troop.ts` → `tests/core/troop.test.ts`).

## 4. Nomes

- Funções e métodos são verbos: `applyGate`, `renderUnits`.
- Booleanos começam com `is`/`has`/`can`/`should`: `isDefeated`, `isBossActive`.
- Classes são substantivos: `Squad`, `ObjectPool`.
- Constantes de balanceamento em `UPPER_SNAKE_CASE`, todas em `src/core/balance.ts`.
- Sem abreviações, exceto `x`, `y`, `dt` (delta time em ms, sempre `number`) e `rng`.
- Unidades no nome quando houver ambiguidade: `speedPxPerSecond`, `delayMs`.

## 5. Funções

- Prefira funções puras. Efeitos colaterais ficam em `game/` e `platform/`.
- Use early return no lugar de `if` aninhado.
- Não use parâmetro booleano para mudar o comportamento (`render(true)`). Crie duas funções ou passe um objeto com nome.
- Sem números mágicos: valores de regra ficam em `balance.ts`; valores visuais ficam em constantes nomeadas no topo da view.

## 6. Tipos

Ver ADR 0017: tipo junto do dono, union discriminada por `kind` com `switch` exaustivo (`never` no `default`), estado imutável (`readonly`), tabelas `as const satisfies` com tipos derivados. Evite `as`, exceto `as const`.

## 7. Comentários

- Explique o **porquê**, nunca o **o quê**.
- Funções exportadas de `core/` têm uma linha de TSDoc.
- Não deixe código comentado nem `TODO` sem issue associada.

## 8. Erros

- Não engula erros em silêncio. As exceções são as previstas em spec (ex.: storage indisponível → valor padrão), com comentário explicando.
- Situações esperadas do jogo (pool cheio, anúncio indisponível) são retornos tipados (`T | null`), não exceções.

## 9. Testes

- O nome descreve o comportamento: `'divide gate rounds down and can defeat the troop'`.
- Estrutura Arrange / Act / Assert, um comportamento por teste.
- Sem `if`/loops com asserções condicionais (testes de propriedade são a exceção, com o loop explícito).

## 10. Checklist de revisão (o que a ferramenta não pega)

- [ ] Cada arquivo novo tem uma responsabilidade descritível numa frase.
- [ ] Os nomes dispensam comentário.
- [ ] Não há duplicação com algo existente, e não há generalização sem três usos.
- [ ] Os tipos impedem estados inválidos.
- [ ] Os números de regra estão em `balance.ts`.
- [ ] O doc de aprendizado foi criado ou atualizado se entrou um conceito novo.
- [ ] `npm run check` passa (lint + format + typecheck + testes).
