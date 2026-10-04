# Horde Runner

Jogo mobile 2D infinito de hordas com portões multiplicadores, feito com Phaser 4 + TypeScript. Projeto de hobby e aprendizado: toda decisão e todo conceito ficam documentados em [`docs/`](docs/).

## Rodando

```bash
npm install      # instala dependências e os hooks de git (lefthook)
npm run dev      # abre em http://localhost:5173
```

**No celular:** com o celular na mesma rede Wi-Fi, abra o endereço `Network` que o `npm run dev` mostra no terminal (ex.: `http://192.168.0.10:5173`).

## Scripts

| Script                                  | O que faz                                                   |
| --------------------------------------- | ----------------------------------------------------------- |
| `npm run dev`                           | servidor de desenvolvimento com recarga automática          |
| `npm run build`                         | build de produção em `dist/`                                |
| `npm test`                              | testes das regras (Vitest)                                  |
| `npm run test:e2e`                      | teste do jogo no navegador (Playwright)                     |
| `npm run lint` / `format` / `typecheck` | qualidade de código                                         |
| `npm run check`                         | lint + formatação + tipos + testes (rode antes de commitar) |

## Documentação

- [`docs/visao/GDD.md`](docs/visao/GDD.md): visão do jogo
- [`docs/specs/`](docs/specs/): specs (incluindo os padrões de código)
- [`docs/decisoes/`](docs/decisoes/): decisões (ADRs)
- [`docs/planos/`](docs/planos/): planos de implementação
- [`docs/aprendendo/`](docs/aprendendo/): conceitos de game dev explicados

## Notas

- O TypeScript está na versão 6.x porque o `typescript-eslint` ainda não aceita a 7.x como peer dependency.
- Commits seguem Conventional Commits, validados automaticamente (veja `docs/specs/2026-10-03-padroes-de-codigo.md` §10).
