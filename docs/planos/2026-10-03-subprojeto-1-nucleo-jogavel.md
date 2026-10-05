# Subprojeto 1 — Núcleo jogável: Plano de Implementação

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Um corredor infinito jogável no navegador (desktop e celular via rede local), com formas geométricas, implementando todas as regras do spec do subprojeto 1.

**Architecture:** Regras em TypeScript puro em `src/core/` (TDD com Vitest), sem Phaser nem APIs de browser. `src/game/` (Phaser 4) move objetos, detecta colisões e delega todo efeito de regra ao core; só `src/game/views/` sabe desenhar. `src/platform/` isola o armazenamento atrás de uma interface.

**Tech Stack:** Phaser 4.2.x (Arcade Physics), TypeScript, Vite 8, Vitest 5, Playwright 1.63, ESLint 10 + typescript-eslint, GitHub Actions. Node 24.

**Spec:** `docs/specs/2026-10-03-subprojeto-1-nucleo-jogavel.md` (leia junto com este plano). Visão: `docs/visao/GDD.md`. Regras do projeto: `CLAUDE.md`.

## Global Constraints

- `src/core/**` não importa `phaser` nem usa `window`, `document`, `localStorage` (verificado por regra ESLint `no-restricted-imports`/`no-restricted-globals` no Task 1).
- Todo número de balanceamento vive em `src/core/balance.ts`; nenhum número mágico de regra em outros arquivos.
- Código e identificadores em inglês; textos exibidos ao jogador e docs em português.
- Resolução lógica 720×1280, `Phaser.Scale.FIT`, `autoCenter: CENTER_BOTH`, retrato.
- `count` de heróis é inteiro ≥ 0; divisões arredondam para baixo.
- Cada doc em `docs/aprendendo/NN-titulo.md` tem exatamente estas seções: **O que é**, **Por que existe**, **Analogia com o mundo web**, **Onde está no código** (caminhos de arquivo), **Mexa e veja** (1–3 experimentos concretos). Português claro, sem jargão não explicado.
- Commits pequenos, no formato do spec de padrões §10 (Conventional Commits; tipos e escopos permitidos lá), validados por commitlint via lefthook a partir do Task 1. Nunca usar `--no-verify`.
- Comandos de verificação: `npm test` (Vitest), `npm run typecheck`, `npm run lint`, `npm run format:check`, `npm run test:e2e` (Playwright). `npm run check` roda os quatro primeiros e deve passar antes de cada commit.
- **Todo código segue `docs/specs/2026-10-03-padroes-de-codigo.md`** (limites verificados por ESLint desde o Task 1) e as regras de tipagem e reaproveitamento do ADR 0017. Quando um arquivo deste plano chegar perto dos limites, divida-o por responsabilidade em vez de pedir exceção.

## Review Focus

1. **Tropas gigantes** (cadeias de `x3` → milhões de heróis): o desenho não pode criar milhares de sprites; o poder de fogo total precisa continuar igual ao total. → teste `renderUnits` no Task 4.
2. **Volta de aba/app após minutos** (delta enorme no primeiro frame): objetos não podem "teleportar" através de colisões. → teste `clampDelta` no Task 4 e uso obrigatório no Task 9.
3. **Tropa exatamente na divisa entre as faixas** ao cruzar uma fileira de portões: aplica exatamente um portão. → teste `laneAt` no Task 3 e `resolveRowCrossing` no Task 12.
4. **Toques rápidos repetidos na tela de fim de jogo:** não podem iniciar duas partidas. → guarda de 500 ms no Task 14, coberto pelo smoke test.
5. **Pool de projéteis/inimigos esgotado** em hordas densas: o jogo pula o disparo/spawn em silêncio, nunca lança erro. → passo explícito nos Tasks 10 e 11; smoke test com tropa gigante via `window.__horde.setTroop` no Task 15.

---

### Task 1: Scaffolding do projeto, CI e ADR do Phaser 4

**Files:**
- Create: `package.json`, `tsconfig.json`, `vite.config.ts`, `vitest.config.ts`, `playwright.config.ts`, `eslint.config.js`, `.prettierrc.json`, `.prettierignore`, `commitlint.config.js`, `lefthook.yml`, `.gitignore`, `.gitattributes`, `index.html`, `src/main.ts`, `src/game/scenes/BootScene.ts`, `tests/core/sanity.test.ts`, `.github/workflows/ci.yml`, `docs/decisoes/0016-phaser-4.md`, `README.md`

**Interfaces:**
- Produces: scripts npm `dev` (`vite --host`), `build`, `preview`, `test` (`vitest run`), `test:watch`, `typecheck` (`tsc --noEmit`), `lint` (`eslint .`), `format` (`prettier --write .`), `format:check` (`prettier --check .`), `check` (`npm run lint && npm run format:check && npm run typecheck && npm test`), `test:e2e` (`playwright test`), `prepare` (`lefthook install`). `src/main.ts` cria `new Phaser.Game(config)` com config exportada como `gameConfig` de `src/game/config.ts`.

- [ ] **Step 1:** `npm init -y`; instalar `phaser@^4.2.1` e dev deps `vite vitest typescript @playwright/test eslint typescript-eslint @eslint/js @eslint-community/eslint-plugin-eslint-comments prettier eslint-config-prettier @commitlint/cli @commitlint/config-conventional lefthook`. Se `typescript-eslint` recusar a versão mais recente do TypeScript por peer dependency, fixe o TypeScript na maior versão que ele suporta e registre isso no README.
- [ ] **Step 2:** `tsconfig.json` com `strict: true`, `noUncheckedIndexedAccess: true`, `module/moduleResolution: "bundler"`, `target: "ES2022"`, `include: ["src", "tests"]`.
- [ ] **Step 3:** `eslint.config.js` com `@eslint/js` recommended + `typescript-eslint` recommended + `eslint-config-prettier`, aplicando **todas as regras da tabela §2 do spec de padrões de código** com os limites exatos de lá (`max-lines` 200 em `src/**` e 300 em `tests/**` com `skipBlankLines`/`skipComments`; `max-lines-per-function` 40 só em `src/**`; `complexity` 10; `max-depth` 3; `max-params` 3; `no-explicit-any`; `explicit-module-boundary-types`; `consistent-type-imports`; `no-unused-vars`; `no-console` em `src/**`; `eslint-comments/require-description`). Bloco para `src/core/**`: `no-restricted-imports` bloqueando `phaser` e os padrões `**/game/**` e `**/platform/**`, e `no-restricted-globals` para `window`, `document` e `localStorage`. Bloco para `src/platform/**`: `no-restricted-imports` bloqueando `**/game/**`. `.prettierrc.json`: `{ "singleQuote": true, "printWidth": 100 }`; `.prettierignore` com `dist`, `test-results`, `playwright-report`.
- [ ] **Step 3b:** `commitlint.config.js`: estende `@commitlint/config-conventional`; `type-enum` e `scope-enum` com as listas exatas do spec de padrões §10; `header-max-length: 100`; `body-max-line-length: 100`; manter o `subject-case` padrão do preset (recusa sentence/start/pascal/upper-case, permitindo siglas como "RNG" no meio). `lefthook.yml`: `commit-msg` → `npx commitlint --edit {1}`; `pre-commit` (paralelo) → `npx eslint {staged_files}` (glob `*.{ts,js}`), `npx prettier --check {staged_files}`, `npm run typecheck`; `pre-push` → `npm test`. Rodar `npm run prepare` para instalar os hooks.
- [ ] **Step 4:** `src/game/config.ts` exporta `gameConfig: Phaser.Types.Core.GameConfig` (720×1280, `Scale.FIT`, `CENTER_BOTH`, `backgroundColor: '#2b2d42'`, Arcade Physics sem gravidade, cenas `[BootScene]`). `BootScene` (key `'Boot'`) escreve "Horde Runner" no centro. Verifique a forma de import correta do Phaser 4 com Vite (ver template oficial `@phaserjs/template-vite-ts`).
- [ ] **Step 5:** `tests/core/sanity.test.ts` com `expect(1 + 1).toBe(2)`; `vitest.config.ts` com `include: ['tests/core/**/*.test.ts']`.
- [ ] **Step 6:** `playwright.config.ts`: `testDir: 'tests/e2e'`, `webServer: { command: 'npm run dev -- --port 5173 --strictPort', url: 'http://localhost:5173' }`, projeto único Chromium com viewport 390×844.
- [ ] **Step 7:** `.gitattributes` com `* text=auto eol=lf`; `.gitignore` com `node_modules`, `dist`, `test-results`, `playwright-report`.
- [ ] **Step 8:** `.github/workflows/ci.yml`: em push/PR, Node 24, `npm ci` (checkout com `fetch-depth: 0`), em PRs `npx commitlint --from ${{ github.event.pull_request.base.sha }} --to ${{ github.event.pull_request.head.sha }}`, `lint`, `format:check`, `typecheck`, `test`, `npx playwright install --with-deps chromium`, `test:e2e`.
- [ ] **Step 9:** `docs/decisoes/0016-phaser-4.md` (formato dos ADRs existentes): Phaser 4.2.1 é a versão `latest` no npm em 2026-10-03; escolhida por ser a estável atual; consequência: exemplos antigos da internet podem ser de Phaser 3 — conferir a documentação do 4.
- [ ] **Step 10:** `README.md` curto: o que é, `npm install`, `npm run dev` (abrir no celular pelo IP mostrado), scripts, link para `docs/`.
- [ ] **Step 11: Verificar.** `npm run check` → sem erros e 1 teste passando; criar temporariamente em `src/core/` um arquivo com `import Phaser from 'phaser'` e uma função de 41 linhas → `npm run lint` deve acusar os dois erros; apagar o arquivo. `npm run dev` abre e mostra "Horde Runner". Hooks: `git commit --allow-empty -m "Commit errado."` deve ser **recusado** pelo commitlint; `git commit --allow-empty -m "chore: valida hooks"` deve passar (depois desfazer com `git reset --soft HEAD~1`).
- [ ] **Step 12: Commit** — `chore: configura vite, phaser 4, vitest, playwright, lint, hooks e ci`

---

### Task 2: RNG com seed

**Files:**
- Create: `src/core/rng.ts`, `tests/core/rng.test.ts`, `docs/aprendendo/07-rng-com-seed.md`

**Interfaces:**
- Produces:
  ```ts
  export interface Rng {
    next(): number;                         // [0, 1)
    int(min: number, max: number): number;  // inteiro em [min, max] inclusivo
    pick<T>(items: readonly T[]): T;
    weighted<K extends string>(weights: Record<K, number>): K; // pesos ≤ 0 nunca escolhidos
  }
  export function createRng(seed: number): Rng;
  ```

- [ ] **Step 1: Testes que falham** em `tests/core/rng.test.ts`:
  - `same seed gives same sequence`: duas `createRng(42)` → 100 `next()` iguais.
  - `different seeds differ`: `createRng(1).next() !== createRng(2).next()`.
  - `next is in [0,1)`: 10.000 amostras.
  - `int is inclusive`: `int(1,3)` em 10.000 amostras produz exatamente o conjunto `{1,2,3}`.
  - `weighted never picks zero weight`: `weighted({a: 1, b: 0})` 1.000× → só `'a'`.
  - `weighted respects proportions`: `{a: 3, b: 1}` em 40.000 amostras → frequência de `a` entre 0,72 e 0,78.
  - `weighted throws when all weights are zero`.
- [ ] **Step 2:** `npx vitest run tests/core/rng.test.ts` → FAIL (módulo inexistente).
- [ ] **Step 3:** Implementar com o algoritmo mulberry32 (estado de 32 bits, `seed >>> 0`).
- [ ] **Step 4:** Rodar os testes → PASS.
- [ ] **Step 5:** Escrever `docs/aprendendo/07-rng-com-seed.md` (por que `Math.random()` não basta: reproduzir bugs e partidas com `?seed=`; analogia: snapshot de teste/fixture determinística).
- [ ] **Step 6: Commit** — `feat(core): adiciona rng com seed (mulberry32)`

---

### Task 3: Balanceamento, arma, portões e faixas

**Files:**
- Create: `src/core/balance.ts`, `src/core/weapons.ts`, `src/core/gates.ts`, `src/core/lanes.ts`, `tests/core/weapons.test.ts`, `tests/core/gates.test.ts`, `tests/core/lanes.test.ts`

**Interfaces:**
- Produces (`balance.ts` — valores do spec §4, use exatamente estes nomes):
  ```ts
  HERO_TIERS = [{ name: 'Recruta', value: 1 }, { name: 'Cavaleiro', value: 50 }, { name: 'Campeão', value: 250 }, { name: 'Lenda', value: 1000 }] as const
  TIER_DAMAGE_BONUS = 0.15
  WEAPON_LEVELS = [ {name:'Estilingue',damage:1,shotsPerSecond:1}, {name:'Arco',damage:1.5,shotsPerSecond:2}, {name:'Besta',damage:2.25,shotsPerSecond:3}, {name:'Cajado',damage:3.4,shotsPerSecond:3}, {name:'Canhão',damage:5,shotsPerSecond:3} ] as const
  WEAPON_EXTRA_LEVEL_MULTIPLIER = 1.5
  KNIGHT_GATE_VALUE = 50
  GATE_HIT_INCREMENT = 1
  WEAPON_CRATE_HP = 20          // em acertos
  MULTIPLY_VALUES = [2, 3] as const
  DIVIDE_VALUE = 2
  addGateRange(chunkIndex) => [5, 5 + chunkIndex]
  subtractGateRange(chunkIndex) => [3, 3 + chunkIndex]
  LANE_SPLIT_X = 360
  ```
  (Os demais valores de balanceamento são adicionados a este arquivo pelos tasks que os usam.)
- Produces (`weapons.ts`): `export interface WeaponStats { name: string; damage: number; shotsPerSecond: number }`; `export function weaponStats(level: number): WeaponStats` (nível ≥ 1).
- Produces (`gates.ts`):
  ```ts
  export type Gate =
    | { kind: 'sum'; value: number }        // +N ou -N (com sinal)
    | { kind: 'multiply'; value: number }
    | { kind: 'divide'; value: number }
    | { kind: 'weapon' }
    | { kind: 'knight' };
  export function isGoodGate(gate: Gate): boolean;   // sum>0, multiply, weapon, knight
  export function isShootable(gate: Gate): boolean;  // só 'sum'
  export function hitGate(gate: Gate): Gate;         // sum → value + GATE_HIT_INCREMENT; demais inalterados
  export function gateLabel(gate: Gate): string;     // '+5' | '-8' | '+0' | 'x2' | '÷2' | 'Arma +1' | '+1 Cavaleiro'
  ```
- Produces (`lanes.ts`): `export type Lane = 'left' | 'right'`; `export function laneAt(x: number): Lane` (`x < LANE_SPLIT_X` → left).

- [ ] **Step 1: Testes que falham:**
  - weapons: `weaponStats(1)` = `{name:'Estilingue', damage:1, shotsPerSecond:1}`; `weaponStats(2).shotsPerSecond === 2`; `weaponStats(5).damage === 5`; `weaponStats(6)` = `{name:'Canhão +1', damage:7.5, shotsPerSecond:3}`; `weaponStats(7).damage === 11.25`.
  - gates: `hitGate({kind:'sum',value:-8})` 10× → `value === 2`; `hitGate` de multiply retorna igual; `isShootable` só para sum; `isGoodGate({kind:'sum',value:0}) === false`; `isGoodGate({kind:'divide',value:2}) === false`; labels: `'-8'`, `'+5'`, `'x3'`, `'÷2'`, `'Arma +1'`, `'+1 Cavaleiro'`.
  - lanes: `laneAt(0)` left, `laneAt(359.9)` left, `laneAt(360)` right, `laneAt(720)` right.
- [ ] **Step 2:** Rodar → FAIL.
- [ ] **Step 3:** Implementar os quatro arquivos com as assinaturas acima.
- [ ] **Step 4:** Rodar → PASS.
- [ ] **Step 5: Commit** — `feat(core): adiciona balanceamento, armas, portões e faixas`

---

### Task 4: Tropa (estado, portões, dano, composição, formação) e utilitário de tempo

**Files:**
- Create: `src/core/troop.ts`, `src/core/formation.ts`, `src/core/time.ts`, `tests/core/troop.test.ts`, `tests/core/formation.test.ts`, `tests/core/time.test.ts`
- Modify: `src/core/balance.ts` (adicionar `MAX_RENDERED_UNITS = 120`, `FORMATION_SPACING = 22`, `MAX_FRAME_DELTA_MS = 50`)

**Interfaces:**
- Consumes: `Gate`, `HERO_TIERS`, `TIER_DAMAGE_BONUS`, `KNIGHT_GATE_VALUE`, `weaponStats` (Task 3).
- Produces (`troop.ts`):
  ```ts
  export interface TroopState { count: number; weaponLevel: number }
  export const initialTroop: TroopState;                         // { count: 1, weaponLevel: 1 }
  export function applyGate(s: TroopState, g: Gate): TroopState;
  export function takeHit(s: TroopState, heroesLost: number): TroopState;
  export function upgradeWeapon(s: TroopState): TroopState;
  export function isDefeated(s: TroopState): boolean;           // count <= 0
  export interface RenderUnit { tierIndex: number; weight: number } // weight = quantos heróis-desse-nível a unidade representa
  export function renderUnits(count: number, cap?: number): RenderUnit[]; // cap padrão MAX_RENDERED_UNITS; maior nível primeiro
  export function unitShotDamage(weaponLevel: number, unit: RenderUnit): number;
  ```
- Produces (`formation.ts`): `export function formationOffsets(units: readonly RenderUnit[], spacing?: number): { x: number; y: number }[]` — mesma ordem e tamanho de `units`.
- Produces (`time.ts`): `export function clampDelta(ms: number): number` — limita a `[0, MAX_FRAME_DELTA_MS]`.

- [ ] **Step 1: Testes que falham** (`troop.test.ts`):
  - `applyGate` sum +5 em 1 → 6; sum -8 em 5 → 0 (nunca negativo); multiply 3 em 7 → 21; divide 2 em 7 → 3; divide 2 em 1 → 0 e `isDefeated` true; weapon → `weaponLevel` +1 e count igual; knight em 3 → 53.
  - `takeHit` 5 em count 3 → 0.
  - `renderUnits(237)` → `[ {tierIndex:1,weight:1} ×4, {tierIndex:0,weight:1} ×37 ]` (Cavaleiros primeiro).
  - `renderUnits(0)` → `[]`.
  - **Tropa gigante:** `renderUnits(2_000_000)` → `length <= 120` e `Σ HERO_TIERS[u.tierIndex].value × u.weight === 2_000_000`.
  - Propriedade: para todo `n` em `[0, 5000]`, a soma ponderada de `renderUnits(n)` é `n`.
  - `unitShotDamage(1, {tierIndex:0, weight:1})` = 1; `unitShotDamage(1, {tierIndex:1, weight:1})` = 50 × 1,15 = 57,5; `unitShotDamage(2, {tierIndex:1, weight:2})` = 1,5 × 50 × 1,15 × 2.
- [ ] **Step 2:** `formation.test.ts`: tamanho igual a `units`; primeiro offset é `{0,0}`; nenhuma dupla de offsets a menos de `spacing × 0,9`; raio máximo de 49 unidades < `spacing × 8`.
- [ ] **Step 3:** `time.test.ts`: `clampDelta(16)` = 16; `clampDelta(120000)` = 50; `clampDelta(-5)` = 0.
- [ ] **Step 4:** Rodar → FAIL.
- [ ] **Step 5: Implementar.** `renderUnits`: decomposição gulosa do maior nível para o menor, uma unidade por herói-do-nível; se o total exceder `cap`, os excedentes viram `weight` extra nas unidades do maior nível existente (distribuídos da primeira para a última, nunca criando unidades além do `cap`). `formationOffsets`: espiral de girassol — unidade `k` em raio `spacing × √k`, ângulo `k × 137,508°`.
- [ ] **Step 6:** Rodar → PASS.
- [ ] **Step 7: Commit** — `feat(core): adiciona tropa, níveis de herói, formação e clampDelta`

---

### Task 5: Inimigos, chefão, pontuação, vida e geometria

**Files:**
- Create: `src/core/enemies.ts`, `src/core/scoring.ts`, `src/core/health.ts`, `src/core/geometry.ts`, `tests/core/enemies.test.ts`, `tests/core/scoring.test.ts`, `tests/core/health.test.ts`, `tests/core/geometry.test.ts`
- Modify: `src/core/balance.ts` (adicionar `ENEMIES`, `BOSS`, `ENEMY_BASE_WALK_SPEED = 80` (px/s), `PX_PER_METER = 100`)

**Interfaces:**
- Produces (`enemies.ts`): `export interface EnemyDef { hp: number; speed: number; heroesLost: number; points: number; cost: number; radius: number }`; `export type EnemyKind = keyof typeof ENEMIES` (derivado da tabela, ADR 0017); `export function enemyDef(kind: EnemyKind): EnemyDef`; `export function bossHp(bossNumber: number): number` (`400 × 1,6^bossNumber`); `export function bossPoints(bossNumber: number): number` (`500 × bossNumber`).
- Produces (`balance.ts`): `ENEMIES = { common: { hp: 3, speed: 1.0, heroesLost: 1, points: 10, cost: 1, radius: 18 }, strong: { hp: 40, speed: 0.6, heroesLost: 5, points: 50, cost: 8, radius: 32 } } as const satisfies Record<string, EnemyDef>` (`import type { EnemyDef }` de `enemies.ts`); `BOSS = { baseHp: 400, hpGrowth: 1.6, speed: 0.35, pointsPerBoss: 500, radius: 70 }`.
- Produces (`health.ts`) — usado por inimigo, chefão e caixa de arma:
  ```ts
  export interface Health { readonly hp: number; readonly maxHp: number }
  export function createHealth(maxHp: number): Health;
  export function applyDamage(h: Health, amount: number): Health; // hp nunca abaixo de 0
  export function isDepleted(h: Health): boolean;
  export function healthRatio(h: Health): number;                  // hp / maxHp, em [0, 1]
  ```
- Produces (`geometry.ts`) — usado por toda colisão por distância:
  ```ts
  export interface Circle { readonly x: number; readonly y: number; readonly radius: number }
  export function circlesOverlap(a: Circle, b: Circle): boolean; // distância entre centros < soma dos raios
  ```
- Produces (`scoring.ts`):
  ```ts
  export interface ScoreState { pixelsTravelled: number; monsterPoints: number; bossBonus: number }
  export const initialScore: ScoreState;
  export function addDistance(s: ScoreState, px: number): ScoreState;
  export function addKill(s: ScoreState, kind: EnemyKind): ScoreState;
  export function addBossKill(s: ScoreState, bossNumber: number): ScoreState;
  export function totalScore(s: ScoreState): number; // floor(px / PX_PER_METER) + monsterPoints + bossBonus
  ```

- [ ] **Step 1: Testes que falham:** `bossHp(1)` = 640; `bossHp(2)` = 1024; `bossPoints(3)` = 1500; score: 250 px + 1 comum + 1 forte + chefão 1 → `2 + 10 + 50 + 500 = 562`; `addDistance` acumula frações (`0,5 px × 300` → 150 px → 1 metro); `enemyDef('strong').heroesLost === 5`. Health: `applyDamage(createHealth(3), 5)` → `hp 0` e `isDepleted`; `healthRatio` de 10/40 = 0,25; `applyDamage` não altera o objeto original. Geometry: círculos de raio 10 com centros a 19 → `true`; a 20 → `false` (encostar exatamente não conta); mesmo centro → `true`.
- [ ] **Step 2:** Rodar → FAIL. **Step 3:** Implementar. **Step 4:** Rodar → PASS.
- [ ] **Step 5: Commit** — `feat(core): adiciona inimigos, chefão, pontuação, vida e geometria`

---

### Task 6: Curva de dificuldade

**Files:**
- Create: `src/core/difficulty.ts`, `tests/core/difficulty.test.ts`
- Modify: `src/core/balance.ts` (adicionar `BOSS_EVERY = 8`, `STRONG_ENEMY_MIN_CHUNK = 5`, `BASE_SCROLL_SPEED = 120` (px/s), `SPEED_GROWTH_PER_CHUNK = 0.01`, `MAX_SPEED_BONUS = 0.5`, `WEIGHT_RAMP_CHUNKS = 30`, `TEMPLATE_WEIGHTS` com os pares início→fim da tabela do spec §4.6, `threatBudget(i) = 8 + 3i`, `minExpectedTroop(i) = max(1, 2i)`)

**Interfaces:**
- Produces:
  ```ts
  export type TemplateKind = 'classicPair' | 'lesserEvil' | 'bestOfGood' | 'loneGate' | 'obstacleCorridor' | 'weaponCrate' | 'hordeOnly';
  export const PUNITIVE_TEMPLATES: readonly TemplateKind[]; // ['lesserEvil', 'obstacleCorridor']
  export function isBossChunk(chunkIndex: number): boolean;  // índice começa em 1; múltiplos de BOSS_EVERY
  export function bossNumberAt(chunkIndex: number): number;  // chunkIndex / BOSS_EVERY
  export function templateWeights(chunkIndex: number): Record<TemplateKind, number>; // interpolação linear, clamp após WEIGHT_RAMP_CHUNKS
  export function scrollSpeed(chunkIndex: number): number;  // BASE × (1 + min(0.01 × (i-1), 0.5))
  ```
  (`TemplateKind` mora em `difficulty.ts`; `chunks.ts` importa daqui.)

- [ ] **Step 1: Testes que falham:** `isBossChunk(8)` true, `(7)` false, `(16)` true; `templateWeights(1).lesserEvil === 0`; `templateWeights(30).classicPair === 15`; `templateWeights(100)` igual a `templateWeights(30)`; `templateWeights(16).classicPair` estritamente entre 15 e 30; `scrollSpeed(1) === 120`; `scrollSpeed(1000) === 180`; `threatBudget` não decrescente de 1 a 500.
- [ ] **Step 2:** Rodar → FAIL. **Step 3:** Implementar. **Step 4:** Rodar → PASS.
- [ ] **Step 5: Commit** — `feat(core): adiciona curva de dificuldade`

---

### Task 7: Gerador de trechos com travas de justiça

**Files:**
- Create: `src/core/chunks.ts`, `tests/core/chunks.test.ts`, `tests/core/chunks.property.test.ts`, `docs/aprendendo/08-geracao-procedural.md`

**Interfaces:**
- Consumes: `Rng` (Task 2), `Gate`, `isGoodGate`, `Lane`, ranges de portão (Task 3), `applyGate` (Task 4), `EnemyKind`, `ENEMIES` (Task 5), funções de `difficulty.ts` (Task 6).
- Produces:
  ```ts
  export const GATE_ROWS = 4; // fileiras de portões por trecho: 0 (topo) a 3
  export interface GatePlacement { lane: Lane; row: number; gate: Gate }
  export interface EnemySpawn { kind: EnemyKind; x: number; offset: number } // x ∈ [0.1, 0.9] da largura; offset ∈ [0, 1) do comprimento do trecho
  export interface Chunk {
    index: number;
    template: TemplateKind | 'boss';
    gates: GatePlacement[];
    crate: { x: number; offset: number } | null;
    enemies: EnemySpawn[];
    bossNumber: number | null;
  }
  export function bestPathResult(chunk: Chunk, startCount: number): number;
  export function violatedGuardrails(history: readonly Chunk[], candidate: Chunk): number[]; // números das travas (1–5) violadas; [] se ok
  export class ChunkGenerator { constructor(rng: Rng); next(): Chunk } // índices 1, 2, 3...
  ```

- [ ] **Step 1: Testes unitários que falham** (`chunks.test.ts`), montando `Chunk`s à mão:
  - `bestPathResult`: fileira 0 com `-4` à esquerda e nada à direita, start 2 → 2; fileira 0 com `-4` (L) e `÷2` (R), start 2 → 1; duas fileiras `+5`/`x2` depois `-3`/`-10`, start 1 → `max(6,2)=6` depois `max(3,0)=3`.
  - Trava 1: trecho no índice 10 cujas duas faixas zeram `minExpectedTroop(10)=20` → `[1]`.
  - Trava 2: `lesserEvil` com `÷2` e `÷2` → contém 2.
  - Trava 3: histórico terminando em dois trechos punitivos + candidato `obstacleCorridor` → contém 3.
  - Trava 4: candidato no índice 7 com template `hordeOnly` → contém 4; com `weaponCrate` → não contém.
  - Trava 5: candidato no índice 3 com `lesserEvil` → contém 5; `loneGate` com `-5` no índice 3 → contém 5.
- [ ] **Step 2: Teste de propriedade que falha** (`chunks.property.test.ts`): para seeds 1..10.000, gerar 60 trechos com `ChunkGenerator`; para cada trecho `violatedGuardrails(historicoAnterior, trecho)` deve ser `[]`; trechos com índice múltiplo de 8 têm `template === 'boss'` e `bossNumber === índice/8`; custo total de inimigos de trechos não-chefão é `≤ threatBudget(índice)` e nenhum `strong` antes do índice 5. (Use `{ timeout: 60_000 }` se preciso.)
- [ ] **Step 3:** Rodar → FAIL.
- [ ] **Step 4: Implementar.** Regras não determinadas pelas assinaturas:
  - `bestPathResult`: percorre fileiras 0→3; em cada fileira, `count = max` entre aplicar cada portão daquela fileira e, se alguma faixa estiver vazia nessa fileira, manter o count. Fileiras sem portões não mudam nada. (Correto porque todo efeito de portão é monotônico em `count`.)
  - `next()`: se `isBossChunk(i)` → trecho `'boss'` sem portões, com horda leve de comuns custando `floor(threatBudget(i) / 4)`. Se `i % BOSS_EVERY === BOSS_EVERY - 1` → sorteia só entre `bestOfGood` e `weaponCrate`. Se `i ≤ 4` → sorteia só entre `classicPair`, `loneGate` (forçado a portão bom) e `hordeOnly`. Senão `rng.weighted(templateWeights(i))`. Preenche o molde; se `violatedGuardrails` ≠ `[]`, re-sorteia até 20 vezes; depois cai para `hordeOnly`.
  - Preenchimento: portões bons sorteados entre `+N` (range de soma), `xN` (`MULTIPLY_VALUES`), `weapon`, `knight` (só a partir do índice 8, para o `+50` não trivializar o começo — ponto de balanceamento); ruins entre `-N` (range de subtração) e `÷2`. `classicPair`: fileira 1, um bom e um ruim em faixas sorteadas. `lesserEvil`: fileira 1, dois ruins com ao menos um `sum` negativo. `bestOfGood`: fileira 1, dois bons. `loneGate`: fileira 1, uma faixa sorteada. `obstacleCorridor`: 2–4 ruins solitários em fileiras consecutivas a partir da 0, alternando faixa. `weaponCrate`: caixa em `x` 0,3–0,7, `offset` 0,5.
  - Horda: gasta `threatBudget(i)`; enquanto sobrar ≥ 1, se `i ≥ 5`, orçamento ≥ 8 e `rng.next() < 0.25` → `strong`, senão `common`; `x` em `[0.1, 0.9]`, `offset` em `[0, 1)`.
- [ ] **Step 5:** Rodar → PASS (unitários + propriedade).
- [ ] **Step 6:** Escrever `docs/aprendendo/08-geracao-procedural.md` (moldes, sorteio ponderado, travas, por que testar com 10.000 seeds; analogia: validação de schema + property-based testing tipo fast-check).
- [ ] **Step 7: Commit** — `feat(core): adiciona gerador de trechos com travas de justiça`

---

### Task 8: Cenas, escala, pausa, save do recorde e smoke test inicial

**Files:**
- Create: `src/platform/storage.ts`, `src/game/urlOptions.ts`, `src/game/scenes/StartScene.ts`, `src/game/scenes/RunScene.ts`, `src/game/scenes/GameOverScene.ts`, `src/game/pauseOnBlur.ts`, `tests/core/storage.test.ts`, `tests/core/urlOptions.test.ts`, `tests/e2e/smoke.spec.ts`, `docs/aprendendo/02-cenas.md`, `docs/aprendendo/03-coordenadas-e-escala.md`
- Modify: `src/game/config.ts` (cenas `[BootScene, StartScene, RunScene, GameOverScene]`), `src/game/scenes/BootScene.ts` (vai direto para `'Start'`), `vitest.config.ts` (incluir `tests/core/**` continua cobrindo os dois novos testes)

**Interfaces:**
- Produces (`storage.ts`):
  ```ts
  export interface SaveStore { loadHighScore(): number; saveHighScore(score: number): void }
  export type KeyValueStorage = Pick<Storage, 'getItem' | 'setItem'>;
  export class LocalStorageSaveStore implements SaveStore { constructor(storage: KeyValueStorage | null) }
  // chave 'horde-runner:save', JSON { version: 1, highScore: number }
  ```
- Produces (`urlOptions.ts`): `export interface UrlOptions { seed: number; debug: boolean }`; `export function parseUrlOptions(search: string, fallbackSeed: number): UrlOptions`.
- Produces (cenas): `'Start'` recebe nada; `'Run'` recebe `{ seed: number; debug: boolean }`; `'GameOver'` recebe `{ score: number; highScore: number; isNewRecord: boolean }`. Cada cena, no `create`, faz `document.body.dataset.scene = '<key>'` (usado pelo Playwright).
- Produces (`pauseOnBlur.ts`): `export function installPauseOnBlur(scene: Phaser.Scene): void` — em `visibilitychange` oculto, pausa a cena e mostra overlay "Toque para continuar"; ao tocar, retoma.

- [ ] **Step 1: Testes que falham:**
  - storage: com storage fake vazio → `loadHighScore() === 0`; salvar 120 e ler → 120; `getItem` que lança erro → 0 sem lançar; JSON inválido → 0; `version` diferente de 1 → 0; `storage` null → 0 e `saveHighScore` não lança; `setItem` que lança → não lança.
  - urlOptions: `('?seed=123&debug', 7)` → `{seed:123, debug:true}`; `('', 7)` → `{seed:7, debug:false}`; `('?seed=abc', 7)` → seed 7.
- [ ] **Step 2:** Rodar → FAIL. **Step 3:** Implementar storage e urlOptions. **Step 4:** Rodar → PASS.
- [ ] **Step 5: Cenas.** `StartScene`: título, "Recorde: N", "Toque para começar" → `scene.start('Run', parseUrlOptions(location.search, Date.now() % 2**31))`. `RunScene` (placeholder neste task): mostra "Correndo…" e termina após 3 s com score 0 (substituído nos Tasks 9–14). `GameOverScene`: "Fim de jogo", score, recorde, "Novo recorde!" quando aplicável, "Toque para jogar de novo" → `'Start'`. `RunScene` chama `installPauseOnBlur(this)`.
- [ ] **Step 6: Smoke test** `tests/e2e/smoke.spec.ts`: abre `/?seed=1`, coleta `console` de tipo error e `pageerror`; espera `body[data-scene="Start"]`; clica no canvas; espera `body[data-scene="Run"]`; aguarda 5 s; espera não haver erros; `page.screenshot({ path: 'test-results/smoke.png' })`.
- [ ] **Step 7:** `npm test`, `npm run test:e2e` → PASS.
- [ ] **Step 8:** Escrever `docs/aprendendo/02-cenas.md` (analogia: rotas do React Router, com `init/preload/create/update`) e `03-coordenadas-e-escala.md` (720×1280 lógico, `Scale.FIT`, origem no canto superior esquerdo, y cresce para baixo; analogia: `viewBox` de SVG).
- [ ] **Step 9: Commit** — `feat(game): adiciona cenas, escala, pausa, recorde e smoke test`

---

### Task 9: Tropa na tela: entidade, view e controle por arrasto

**Files:**
- Create: `src/game/entities/Squad.ts`, `src/game/views/SquadView.ts`, `src/game/views/palette.ts`, `src/game/systems/DragInput.ts`, `docs/aprendendo/01-game-loop-e-delta.md`, `docs/aprendendo/04-entrada-de-toque.md`, `docs/aprendendo/09-regras-vs-renderizacao.md`
- Modify: `src/game/scenes/RunScene.ts`, `src/core/balance.ts` (adicionar `SQUAD_Y = 1100`, `SQUAD_MIN_X = 80`, `SQUAD_MAX_X = 640`, `SQUAD_FOLLOW_SPEED = 2200` (px/s))

**Interfaces:**
- Consumes: `TroopState`, `initialTroop`, `renderUnits`, `formationOffsets`, `clampDelta`.
- Produces:
  ```ts
  // palette.ts — única fonte de cores das formas geométricas
  export const PALETTE: { hero: number[]; common: number; strong: number; boss: number; goodGate: number; badGate: number; crate: number; projectile: number; text: string };
  // SquadView.ts
  export class SquadView { constructor(scene: Phaser.Scene); render(x: number, units: readonly RenderUnit[]): void; get radius(): number; destroy(): void }
  // Squad.ts
  export class Squad {
    constructor(scene: Phaser.Scene);
    state: TroopState;
    x: number;                        // centro da tropa
    readonly y: number;               // SQUAD_Y
    units: RenderUnit[];              // cache de renderUnits(state.count)
    setState(next: TroopState): void; // atualiza units e redesenha
    update(deltaMs: number, targetX: number): void; // move em direção a targetX limitado por SQUAD_FOLLOW_SPEED e [MIN_X, MAX_X]
    get radius(): number;             // raio que envolve a formação (para colisão)
  }
  // DragInput.ts
  export class DragInput { constructor(scene: Phaser.Scene, initialX: number); get targetX(): number } // segue o ponteiro enquanto pressionado, em qualquer lugar da tela
  ```
- [ ] **Step 1:** Implementar `palette.ts` (cores vivas: um tom por nível de herói, verde comum, roxo forte, vermelho chefão, verde/vermelho portões) e `SquadView` (círculos com raio crescente por nível: 10, 16, 22, 28; recria só quando `units` muda; reposiciona a cada frame).
- [ ] **Step 2:** Implementar `Squad` e `DragInput`. Em `RunScene.update(time, delta)`: `const dt = clampDelta(delta)` e `squad.update(dt, input.targetX)`. Remover o placeholder de 3 s; temporariamente, a tecla/toque não encerra a partida.
- [ ] **Step 3: Verificar manualmente:** `npm run dev`, abrir no desktop e no celular pelo IP; arrastar move a tropa suavemente e ela não sai dos limites. `npm run test:e2e` → PASS.
- [ ] **Step 4:** Escrever docs `01-game-loop-e-delta.md` (analogia: `requestAnimationFrame`; por que multiplicar por delta; por que `clampDelta`), `04-entrada-de-toque.md` (eventos de ponteiro unificam mouse e toque; analogia com Pointer Events do DOM) e `09-regras-vs-renderizacao.md` (core × entities × views; analogia: estado do Redux/reducer × componentes React).
- [ ] **Step 5: Commit** — `feat(game): exibe tropa com formação e controle por arrasto`

---

### Task 10: Pool genérico, projéteis e disparo

**Files:**
- Create: `src/game/systems/ObjectPool.ts`, `src/game/entities/Projectile.ts`, `src/game/systems/FiringSystem.ts`, `docs/aprendendo/06-object-pooling.md`, `docs/aprendendo/11-reaproveitamento-em-jogos.md`
- Modify: `src/game/scenes/RunScene.ts`, `src/core/balance.ts` (adicionar `PROJECTILE_SPEED = 900` (px/s), `PROJECTILE_POOL_SIZE = 400`, `OFFSCREEN_MARGIN_PX = 120`)

**Interfaces:**
- Consumes: `Squad` (Task 9), `weaponStats`, `unitShotDamage`, `formationOffsets`.
- Produces (pool **único e genérico**, reutilizado por projéteis e inimigos — ADR 0017):
  ```ts
  export interface Poolable { kill(): void } // desativa, esconde e desliga o corpo físico
  export class ObjectPool<T extends Phaser.GameObjects.GameObject & Poolable> {
    constructor(scene: Phaser.Scene, options: { classType: new (scene: Phaser.Scene) => T; maxSize: number });
    readonly group: Phaser.Physics.Arcade.Group;
    acquire(): T | null;                        // null quando cheio — quem chama ignora em silêncio
    forEachActive(fn: (item: T) => void): void;
  }
  export class Projectile extends Phaser.GameObjects.Arc implements Poolable { damage: number; fire(x: number, y: number, damage: number): void; kill(): void } // velocidade -PROJECTILE_SPEED em y
  export class FiringSystem { constructor(pool: ObjectPool<Projectile>); update(deltaMs: number, squad: Squad): void } // também mata projéteis com y < -OFFSCREEN_MARGIN_PX
  ```
- [ ] **Step 1:** Implementar `ObjectPool<T>` (`group` com `classType`, `maxSize`, `runChildUpdate: false`; `acquire` usa `group.get()` e devolve `null` quando cheio) e `Projectile`.
- [ ] **Step 2:** Implementar `FiringSystem` (`pool.acquire()?.fire(...)`): um acumulador de tempo por índice de unidade; cada unidade dispara a cada `1000 / shotsPerSecond` ms, a partir de `squad.x + offset.x`, `squad.y + offset.y`, com `unitShotDamage(level, unit)`. Ao mudar `units`, reiniciar os acumuladores com fase aleatória (para os tiros não saírem todos juntos).
- [ ] **Step 3: Verificar:** com `?debug` desligado, a tropa de 1 herói dispara 1 tiro/s; trocando localmente `initialTroop` para `count: 300` (sem commitar) aparecem 6 Cavaleiros atirando sem queda visível de FPS. `npm run test:e2e` → PASS.
- [ ] **Step 4:** Escrever `06-object-pooling.md` (analogia: pool de conexões do banco; o que acontece com o garbage collector sem pool) e `11-reaproveitamento-em-jogos.md` (tabela React ↔ game dev do ADR 0017: entidade guiada por dados × componente com props, módulo puro de comportamento × hook, view reutilizável × biblioteca de UI, composição × herança, regra de três; exemplos reais do código: `ObjectPool<T>`, `health.ts`, `geometry.ts`, `ProgressBar`; prévia dos padrões de assets: atlas, tint, 9-slice, animação esquelética).
- [ ] **Step 5: Commit** — `feat(game): adiciona pool genérico e disparo automático`

---

### Task 11: Inimigos, rolagem do mundo e colisões básicas

**Files:**
- Create: `src/game/entities/Enemy.ts`, `src/game/views/EnemyView.ts`, `src/game/systems/EnemySystem.ts`, `src/game/systems/Collisions.ts`, `docs/aprendendo/05-fisica-arcade-e-colisoes.md`
- Modify: `src/game/scenes/RunScene.ts`, `src/game/entities/Squad.ts` (adicionar `get circle(): Circle`), `src/core/balance.ts` (adicionar `ENEMY_POOL_SIZE = 300`)

**Interfaces:**
- Consumes: `ObjectPool<T>`, `Projectile` (Task 10), `enemyDef`, `EnemyKind`, `Health`/`createHealth`/`applyDamage`/`isDepleted`, `Circle`/`circlesOverlap` (Task 5), `takeHit`, `addKill`, `Squad`.
- Produces:
  ```ts
  // Uma classe para todos os monstros; o que muda vem de enemyDef(kind) (entidade guiada por dados)
  export class Enemy extends Phaser.GameObjects.Container implements Poolable { kind: EnemyKind; health: Health; spawn(kind: EnemyKind, x: number, y: number): void; damage(amount: number): boolean /* true se morreu */; get circle(): Circle; kill(): void }
  export class EnemySystem { constructor(scene: Phaser.Scene); readonly pool: ObjectPool<Enemy>; spawn(kind: EnemyKind, x: number, y: number): Enemy | null; update(deltaMs: number, scrollSpeed: number): void } // move para baixo a scrollSpeed + ENEMY_BASE_WALK_SPEED × def.speed; mata com y > 1280 + OFFSCREEN_MARGIN_PX
  export interface CollisionEvents { onEnemyKilled(kind: EnemyKind): void; onSquadHit(heroesLost: number): void }
  export function registerCollisions(scene: Phaser.Scene, deps: { projectiles: ObjectPool<Projectile>; enemies: EnemySystem; squad: Squad; events: CollisionEvents }): void;
  ```
- [ ] **Step 1:** Implementar `EnemyView` (círculo com olhinhos simples e contorno grosso, cor por tipo, raio `def.radius`), `Enemy` (vida via `health.ts`) e `EnemySystem` usando `ObjectPool<Enemy>`; `spawn` retorna `null` quando o pool está cheio.
- [ ] **Step 2:** Implementar `registerCollisions`: overlap projétil×inimigo → `damage`, mata o projétil; se morreu → `onEnemyKilled`. Tropa×inimigo: a cada frame, inimigo ativo com `circlesOverlap(squad.circle, enemy.circle)` → `onSquadHit(def.heroesLost)` e o inimigo some.
- [ ] **Step 3:** Em `RunScene`, manter `troop`/`score` como estado do core: `onEnemyKilled` → `score = addKill(...)`; `onSquadHit` → `squad.setState(takeHit(...))`; se `isDefeated` → vai para `GameOver` (fluxo final no Task 14). Spawn temporário de teste: uma fileira de 5 comuns a cada 2 s (removido no Task 12). `score = addDistance(score, scrollSpeed × dt / 1000)`.
- [ ] **Step 4: Verificar:** monstros descem, morrem com tiros e removem heróis ao encostar; tropa zerada leva ao fim de jogo. `npm run test:e2e` → PASS.
- [ ] **Step 5:** Escrever `05-fisica-arcade-e-colisoes.md` (corpos, overlap × collide, colisão por distância entre círculos; analogia: `IntersectionObserver`).
- [ ] **Step 6: Commit** — `feat(game): adiciona inimigos, rolagem e colisões`

---

### Task 12: Trechos no mundo: portões, caixas de arma e hordas geradas

**Files:**
- Create: `src/game/entities/GateRow.ts`, `src/game/views/GateView.ts`, `src/game/entities/WeaponCrate.ts`, `src/game/views/CrateView.ts`, `src/game/views/ProgressBar.ts`, `src/game/systems/ChunkSpawner.ts`, `src/core/crossing.ts`, `tests/core/crossing.test.ts`
- Modify: `src/game/scenes/RunScene.ts`, `src/game/systems/Collisions.ts`, `src/core/balance.ts` (adicionar `CHUNK_LENGTH_PX = 1200`, `GATE_WIDTH = 330`, `GATE_HEIGHT = 70`, `CRATE_SIZE = 70`, `LANE_CENTER_X = { left: 180, right: 540 }`)

**Interfaces:**
- Consumes: `ChunkGenerator`, `Chunk`, `GatePlacement`, `Gate`, `hitGate`, `isShootable`, `gateLabel`, `applyGate`, `upgradeWeapon`, `laneAt`, `createRng`, `scrollSpeed`, `EnemySystem`, `Health`/`createHealth`/`applyDamage`/`healthRatio`, `circlesOverlap`.
- Produces (`crossing.ts`, puro e testado): `export function resolveRowCrossing(row: readonly GatePlacement[], squadX: number): GatePlacement | null` — devolve o portão da faixa `laneAt(squadX)`, ou `null` se essa faixa estiver vazia.
- Produces (game):
  ```ts
  export class GateRow { constructor(scene: Phaser.Scene, placements: GatePlacement[], y: number); y: number; consumed: boolean; gateAtLane(lane: Lane): { placement: GatePlacement; bounds: Phaser.Geom.Rectangle } | null; hit(lane: Lane): void /* aplica hitGate e redesenha o rótulo */; destroy(): void }
  // View reutilizável: barra da caixa de arma (aqui) e vida do chefão (Task 13)
  export class ProgressBar { constructor(scene: Phaser.Scene, options: { width: number; height: number; color: number }); setRatio(ratio: number): void; setPosition(x: number, y: number): void; destroy(): void }
  export class WeaponCrate { constructor(scene: Phaser.Scene, x: number, y: number); health: Health /* createHealth(WEAPON_CRATE_HP); cada acerto = applyDamage(1) */; consumed: boolean; hit(): boolean /* true ao esvaziar */; get circle(): Circle; destroy(): void }
  export class ChunkSpawner { constructor(scene: Phaser.Scene, rng: Rng, enemies: EnemySystem); update(deltaMs: number): void; get currentChunk(): Chunk; get scrollSpeed(): number; get isBossActive(): boolean; readonly gateRows: GateRow[]; readonly crates: WeaponCrate[]; onBossChunk?: (bossNumber: number, y: number) => void }
  ```
- [ ] **Step 1: Teste que falha** (`crossing.test.ts`): fileira com portão só na esquerda → `squadX = 100` devolve o da esquerda; `squadX = 360` devolve `null`; fileira com os dois → `squadX = 359` esquerda, `360` direita; fileira vazia → `null`.
- [ ] **Step 2:** Rodar → FAIL. **Step 3:** Implementar `resolveRowCrossing`. **Step 4:** Rodar → PASS.
- [ ] **Step 5:** Implementar `GateView` (retângulo verde se `isGoodGate`, vermelho se não, rótulo `gateLabel` grande e legível; troca de cor quando um `-N` vira positivo) , `ProgressBar` e `CrateView` (quadrado com "ARMA" e um `ProgressBar` com `healthRatio`).
- [ ] **Step 6:** Implementar `ChunkSpawner`: gera o próximo trecho quando o topo do trecho atual entra na tela; mapeia `offset` → y dentro de `CHUNK_LENGTH_PX` e fileira `row` → `y = topoDoTrecho + (row + 1) × CHUNK_LENGTH_PX / (GATE_ROWS + 1)`; inimigos em `x × 720`; tudo rola para baixo a `scrollSpeed(índice)`; destrói o que passa de `y > 1280 + OFFSCREEN_MARGIN_PX`. Remover o spawn temporário do Task 11.
- [ ] **Step 7:** Colisões novas em `Collisions.ts`: projétil × portão `isShootable` (dentro de `bounds`) → `GateRow.hit(lane)`, mata o projétil; projéteis atravessam os demais portões. Projétil × caixa → `hit()`, mata o projétil; ao chegar a 0 → `upgradeWeapon`. Quando `GateRow.y` cruza `SQUAD_Y` e `!consumed` → `resolveRowCrossing` → `applyGate` (se houver) e `consumed = true`. Tropa × caixa (`circlesOverlap(squad.circle, crate.circle)`) → `upgradeWeapon`, `consumed = true`.
- [ ] **Step 8: Verificar** com `?seed=1`: os primeiros trechos só têm par clássico, solitário bom ou só horda; os portões mudam a contagem; atirar em `-N` aumenta o valor; a caixa sobe a arma. `npm test` e `npm run test:e2e` → PASS.
- [ ] **Step 9: Commit** — `feat(game): posiciona trechos procedurais com portões e caixas no mundo`

---

### Task 12b: Rebalanceamento adaptativo (playtest 2026-10-03)

> Acrescentado após o playtest de 2026-10-03. Spec §4.2, §4.3, §4.5, §4.6 revisados; ADRs 0020 e 0021.

**Files:**
- Modify: `src/core/balance.ts`, `src/core/gates.ts`, `src/core/difficulty.ts`, `src/core/chunks.ts`, `src/core/chunkTemplates.ts`, `src/core/guardrails.ts`, `src/game/systems/ChunkSpawner.ts`, `src/game/RunWorld.ts`, `src/game/entities/GateRow.ts` e os testes de `tests/core/` afetados

**Interfaces:**
- `balance.ts`: `WEAPON_LEVELS` com tiros/s 1, 1,5, 1,5, 2, 2; `PROJECTILE_SPEED = 700`; `ENEMIES` com hp 6 e 80; `BOSS.baseHp = 800`; `DIVIDE_VALUES = [2, 3]` (substitui `DIVIDE_VALUE`); `PRESSURE_THRESHOLDS = [50, 250, 1000]`; `STRONG_CHANCE_BY_PRESSURE = [0.25, 0.35, 0.45, 0.6]`; `PUNITIVE_MULTIPLIER_BY_PRESSURE = [1, 1.5, 2, 3]`; `HORDE_TROOP_SHARE = 0.1`; `NEGATIVE_GATE_TROOP_SHARE = [0.1, 0.4]`; `GATE_SHOT_CAP_MULTIPLIER = 2`; `GATE_SHOT_MIN_CAP = 10`; `HORDE_WAVES = [2, 3]`; `HORDE_WAVE_SPREAD = 0.12`. `minExpectedTroop` e `STRONG_ENEMY_CHANCE` removidos.
- `gates.ts`: soma vira `{ kind: 'sum'; value: number; max: number }`; `createSumGate(value: number): Gate` calcula `max = máx(2 × value, 10)`; `hitGate` respeita `max`.
- `difficulty.ts`: `type Pressure = 0 | 1 | 2 | 3`; `pressureLevel(troopCount): Pressure`; `templateWeights(chunkIndex, pressure)`; `hordeBudget(chunkIndex, troopCount)`; `strongEnemyChance(pressure)`.
- `chunks.ts`: `ChunkGenerator.next(troopCount: number): Chunk`.
- `guardrails.ts`: `violatedGuardrails(history, candidate, troopCount)`; trava 1 usa a tropa real.
- `ChunkSpawner`: recebe `troopCount: () => number`.

- [ ] **Step 1: Testes que falham** (atualizar os existentes e acrescentar):
  - weapons: `weaponStats(2).shotsPerSecond === 1.5`; `weaponStats(6).shotsPerSecond === 2`.
  - gates: `createSumGate(45).max === 90`; `createSumGate(-8).max === 10`; `-8` atingido 30× para em `+10`; `+45` atingido 100× para em `+90`.
  - enemies: comum hp 6; `bossHp(1) === 1280`.
  - difficulty: `pressureLevel(49) === 0`, `(50) === 1`, `(250) === 2`, `(1000) === 3`; `templateWeights(30, 3).lesserEvil === 36` e `.classicPair === 15`; `hordeBudget(1, 10) === 11`; `hordeBudget(1, 500) === 61`.
  - guardrails: trava 1 avaliada com a tropa passada (um trecho `-25`/`-30` viola com tropa 20 e passa com tropa 100).
  - templates: com tropa 500, todo `-N` gerado em trecho ≥ 5 tem N ≥ 50; existe `÷3` em 1000 trechos gerados; inimigos de um trecho ficam em no máximo 3 grupos (offsets dentro de `HORDE_WAVE_SPREAD` de um centro).
  - propriedade: 10.000 seeds × 60 trechos com tropas variando entre 1 e 5000 (sorteadas por seed), sem violar travas e com custo ≤ `hordeBudget`.
- [ ] **Step 2:** Rodar → FAIL. **Step 3:** Implementar. **Step 4:** Rodar → PASS + `npm run check` + smoke.
- [ ] **Step 5:** Atualizar `docs/aprendendo/08-geracao-procedural.md` (pressão pela tropa) e `docs/playtests/2026-10-03.md`.
- [ ] **Step 6: Commit** — `feat(core): dificuldade acompanha o tamanho da tropa`

---

### Task 13: Chefão

**Files:**
- Create: `src/game/entities/Boss.ts`, `src/game/views/BossView.ts`
- Modify: `src/game/systems/ChunkSpawner.ts`, `src/game/systems/Collisions.ts`, `src/game/scenes/RunScene.ts`

**Interfaces:**
- Consumes: `bossHp`, `addBossKill`, `BOSS`, `ENEMY_BASE_WALK_SPEED`, `ChunkSpawner.onBossChunk`, `Health`/`createHealth`/`applyDamage`/`healthRatio`, `Circle`/`circlesOverlap`, `ProgressBar` (Task 12).
- Produces: `export class Boss extends Phaser.GameObjects.Container { constructor(scene: Phaser.Scene, bossNumber: number, x: number, y: number); readonly bossNumber: number; health: Health; damage(amount: number): boolean; get circle(): Circle /* raio BOSS.radius */; update(deltaMs: number): void }` — desce a `ENEMY_BASE_WALK_SPEED × BOSS.speed`. `Boss` não herda de `Enemy`: compartilha `health.ts`, `geometry.ts` e `ProgressBar` por composição.
- [ ] **Step 1:** Implementar `BossView` (círculo grande + `ProgressBar` acima, atualizada com `healthRatio`) e `Boss`.
- [ ] **Step 2:** `ChunkSpawner`: quando o trecho do chefão chega à tela, chama `onBossChunk`, `isBossActive = true` e a rolagem vai a 0 (inimigos continuam caminhando); o próximo trecho só é gerado depois que o chefão morre.
- [ ] **Step 3:** Colisões: projétil × chefão → `damage`; ao morrer → `score = addBossKill(score, n)`, `isBossActive = false`, a rolagem volta. Tropa × chefão (`circlesOverlap(squad.circle, boss.circle)`) → fim de jogo imediato.
- [ ] **Step 4: Verificar** com `?seed=1&debug`: no trecho 8 aparece o chefão 1 com 640 de vida, o caminho para e volta a andar após derrotá-lo; deixar o chefão encostar encerra a partida. `npm run test:e2e` → PASS.
- [ ] **Step 5: Commit** — `feat(game): adiciona chefão a cada 8 trechos`

---

### Task 14: HUD, fim de jogo, recorde, feedback visual e modo debug

**Files:**
- Create: `src/game/views/Hud.ts`, `src/game/systems/DebugOverlay.ts`, `src/game/views/feedback.ts`, `docs/aprendendo/10-tweens-e-feedback.md`
- Modify: `src/game/scenes/RunScene.ts`, `src/game/scenes/GameOverScene.ts`, `src/game/scenes/StartScene.ts`

**Interfaces:**
- Consumes: `totalScore`, `weaponStats`, `SaveStore`/`LocalStorageSaveStore`, `UrlOptions`.
- Produces:
  ```ts
  export class Hud { constructor(scene: Phaser.Scene); update(view: { heroes: number; weaponName: string; weaponLevel: number; score: number }): void }
  export class DebugOverlay { constructor(scene: Phaser.Scene); update(info: { fps: number; heroes: number; weaponLevel: number; chunkIndex: number; template: string; seed: number }): void } // também liga `physics.world.drawDebug`
  // Só com debug ativo, RunScene expõe: window.__horde = { setTroop(count: number, weaponLevel: number): void } (usado pelo smoke test)
  export function popText(scene: Phaser.Scene, x: number, y: number, text: string, color: string): void; // número que sobe e some (tween)
  export function flash(target: Phaser.GameObjects.GameObject & { setAlpha(a: number): unknown }): void; // pisca ao tomar dano
  export function punch(target: Phaser.GameObjects.Components.Transform): void; // "squash" curto ao mudar de nível/portão
  ```
- [ ] **Step 1:** `Hud`: no topo, heróis (grande), arma (nome + nível), score.
- [ ] **Step 2:** Feedback: portão aplicado → `popText` com o efeito (ex.: "x2") verde/vermelho e `punch` na tropa; tropa atingida → `popText` "-N" vermelho e `flash`; monstro derrotado → `popText` com os pontos.
- [ ] **Step 3:** Fim de jogo em `RunScene`: calcula `totalScore`, lê/grava o recorde por `LocalStorageSaveStore(window.localStorage ?? null)` (com try/catch na obtenção do `localStorage`), vai para `'GameOver'`. `StartScene` usa o mesmo store para exibir o recorde.
- [ ] **Step 4:** `GameOverScene` ignora toques por 500 ms após abrir e reage a um único toque (`once`), evitando partidas duplas.
- [ ] **Step 5:** `DebugOverlay` ativo só com `debug: true` (hitboxes, FPS, heróis, nível da arma, índice e molde do trecho, seed).
- [ ] **Step 6: Verificar:** partida completa até o fim → tela com score; recorde persiste após recarregar; `?debug` mostra o painel; toques rápidos na tela de fim iniciam só uma partida. `npm run test:e2e` → PASS.
- [ ] **Step 7:** Escrever `10-tweens-e-feedback.md` (o que é tween e easing; por que "juice" importa; analogia: transições CSS/Framer Motion).
- [ ] **Step 8: Commit** — `feat(game): adiciona hud, fim de jogo, recorde, feedback e modo debug`

---

### Task 15: Smoke test completo, playtest e fechamento do spec

**Files:**
- Modify: `tests/e2e/smoke.spec.ts`, `docs/specs/2026-10-03-subprojeto-1-nucleo-jogavel.md` (status), `README.md`
- Create: `docs/playtests/_modelo.md`

**Interfaces:**
- Consumes: tudo acima.

- [ ] **Step 1:** Ampliar o smoke test: (a) `/?seed=1` — Start → Run, 10 s sem erros de console/pageerror, screenshot; (b) `/?seed=1&debug` → após entrar em Run, `window.__horde.setTroop(5000, 6)` (120 unidades × 3 tiros/s esgotam o pool de 400 projéteis) e rodar 15 s sem erros (cobre pool cheio); (c) partida até o fim (sem tocar, a tropa de 1 herói perde rapidamente) → `body[data-scene="GameOver"]`; 5 cliques em 100 ms após 600 ms → exatamente uma transição para `Start`.
- [ ] **Step 2:** `npm run lint && npm run typecheck && npm test && npm run test:e2e` → tudo PASS.
- [ ] **Step 3:** Criar `docs/playtests/_modelo.md` com as perguntas: "Foi divertido? (1–5)", "Quanto durou a partida?", "Em que momento ficou chato?", "Algum momento injusto?", "Os portões foram escolhas interessantes?", "Atirar nos portões fez diferença?", "O chefão foi um clímax?", "Ideias".
- [ ] **Step 4:** Conferir os critérios de aceitação do spec §10 um a um; marcar os cumpridos. O primeiro playtest é do autor: deixar o item desmarcado e registrar no README como jogar no celular.
- [ ] **Step 5:** Atualizar o status do spec para `implementado (aguardando playtest)`.
- [ ] **Step 6: Commit** — `test(e2e): completa smoke test, modelo de playtest e status do spec`

---

### Task 15b: Ponte e contenção da escala (playtest 2026-10-04)

> Acrescentado após o playtest de 2026-10-04 (`docs/playtests/2026-10-04.md`). Spec §4.1–4.7 revisados e §4.9 criado; ADRs 0022 e 0023. Linear: DAV-17.

**Files:**
- Create: `src/core/bridge.ts`, `tests/core/bridge.test.ts`, `src/game/views/BridgeView.ts`
- Modify: `src/core/balance.ts`, `src/core/enemies.ts`, `src/core/chunks.ts`, `src/core/chunkTemplates.ts`, `src/core/difficulty.ts`, `src/game/systems/ChunkSpawner.ts`, `src/game/systems/EnemySystem.ts`, `src/game/entities/Enemy.ts`, `src/game/views/GateView.ts`, `src/game/RunWorld.ts`, os testes de `tests/core/` afetados e `docs/aprendendo/03-coordenadas-e-escala.md`

**Interfaces:**
- `balance.ts`: valores do autor no playtest (Cavaleiro 10, bônus 0,05, caixa 60, `-N` 20%–60%, faixas `+N`/`-N`, inimigos, chefão 1000, caminhada 50, fortes a partir do trecho 2, pesos) e mais: `GATE_HIT_INCREMENT = 1`; `WEAPON_EXTRA_LEVEL_MULTIPLIER = 1.2`; `KNIGHT_GATE_VALUE = HERO_TIERS[1].value`; `PROJECTILE_SPEED = 300`; `PROJECTILE_POOL_SIZE = 800`; `BASE_SCROLL_SPEED = 120`; `SPEED_GROWTH_PER_CHUNK = 0.02`; `HORDE_TROOP_SHARE = 0.25`; `ENEMY_HP_GROWTH_PER_CHUNK = 0.05`; `DOUBLE_ONLY_PRESSURE = 2`; `BRIDGE_LEFT_X = 120`; `BRIDGE_WIDTH = 480`; `LANE_CENTER_X = { left: 240, right: 480 }`; `GATE_WIDTH = 220`; `SQUAD_MIN_X = 150`; `SQUAD_MAX_X = 570`.
- `bridge.ts`: `export function bridgeX(fraction: number): number` — fração [0, 1] da ponte → x da tela.
- `enemies.ts`: `export function enemyHp(kind: EnemyKind, chunkIndex: number): number`.
- `chunks.ts`: `EnemySpawn` ganha `readonly hp: number` (`x` passa a ser fração da ponte).
- `difficulty.ts`: `export function multiplyGateWeight(pressure: Pressure): number`; `export function multiplyValues(pressure: Pressure): readonly number[]`.
- Game: `EnemySystem.spawn(at: { kind: EnemyKind; hp: number; x: number; y: number }): Enemy | null` e `Enemy.spawn(at)` com a mesma forma; `BridgeView` desenha as laterais; `GateView` reduz o rótulo até caber em `GATE_WIDTH`.

- [ ] **Step 1: Testes que falham** (atualizar os que fixam valores antigos e acrescentar):
  - troop: portão Cavaleiro soma 10; 237 heróis = 23 Cavaleiros + 7 Recrutas; Cavaleiro causa 10 × 1,05.
  - gates: `-8` atingido 10× vira `+2` (incremento 1).
  - weapons: nível 6 = 5 × 1,2; nível 7 = 5 × 1,44.
  - enemies: comum 10 de vida e remove 2; forte remove 20; `bossHp(1) === 1600`; chefão anda a 0,35 × 50; `enemyHp('common', 1) === 10`, `enemyHp('common', 11) === 15`, `enemyHp('strong', 21) === 200`.
  - difficulty: `hordeBudget(1, 500) === 136`; `scrollSpeed(1) === 120`, `scrollSpeed(1000) === 180`; `multiplyGateWeight(0..3)` = 1, 1/2, 1/3, 1/4; `multiplyValues(1)` = [2, 3], `multiplyValues(2)` = [2].
  - templates: `-N` com tropa minúscula segue `[5, 5 + índice]`; com 500 heróis todo `-N` ≤ −100; com 400 heróis nenhum `x3` e `xN` mais raro que com 10 heróis; spawns trazem `hp = enemyHp(kind, índice)`.
  - bridge: `bridgeX(0) === 120`, `bridgeX(0.5) === 360`, `bridgeX(1) === 600`.
- [ ] **Step 2:** Rodar → FAIL. **Step 3:** Implementar. **Step 4:** Rodar → PASS.
- [ ] **Step 5:** Game: spawns e caixa via `bridgeX`; vida do spawn chega ao `Enemy`; `BridgeView` (laterais em cor de água) criada antes dos demais objetos; `GateView` com rótulo que cabe.
- [ ] **Step 6: Verificar** com `?seed=1&debug`: ponte visível, monstros e portões só sobre ela, tropa não sai da ponte, "+1 Cavaleiro" cabe no portão. `npm run check` e `npm run test:e2e` → PASS.
- [ ] **Step 7:** Atualizar `docs/aprendendo/03-coordenadas-e-escala.md` (área jogável × tela; frações da ponte) e `docs/playtests/2026-10-04.md`.
- [ ] **Step 8: Commits** — `fix(core): ...`, `feat(core): ...`, `feat(game): ...` (um por bloco de comportamento).

---

> **Tasks 15c e 15d** — terceira rodada do playtest de 2026-10-04 (`docs/playtests/2026-10-04.md`): o jogo era de desviar, não de enfrentar. Spec §4.2, §4.5, §4.6, §4.9 e §4.10; ADRs 0024 e 0025. Linear: DAV-18 (15c) e DAV-19 (15d).
>
> **Review Focus (15c + 15d):**
>
> 1. Carga somada em frações (ex.: 40 × 1/40) precisa disparar o feixe mesmo com erro de ponto flutuante — teste no 15d.
> 2. O feixe nunca derrota o chefão, mesmo com o chefão quase morto — teste de `beamBossDamage` no 15d.
> 3. Monstros perseguindo a tropa na borda não saem da ponte: o alvo é `squad.x`, já preso em 180–540 — garantido pela construção; conferir no navegador.
> 4. Chefão desviado não trava mais a partida: alcançar `SQUAD_Y` encerra — teste de `bossReachedTroop` no 15c e verificação no navegador.
> 5. Feixe ativo quando a partida acaba (tropa zerada ou chefão) não gera erro — smoke test do 15d.

### Task 15c: Hordas densas, perseguição e chefão que alcança a tropa

**Files:**

- Modify: `src/core/balance.ts`, `src/core/enemies.ts`, `src/core/motion.ts`, `src/core/chunkTemplates.ts`, `src/game/entities/Enemy.ts`, `src/game/systems/EnemySystem.ts`, `src/game/entities/Boss.ts`, `src/game/systems/BossEncounter.ts`, `src/game/RunWorld.ts`
- Test: `tests/core/bridge.test.ts`, `tests/core/difficulty.test.ts`, `tests/core/enemies.test.ts`, `tests/core/motion.test.ts`, `tests/core/chunkTemplates.test.ts`
- Create: `docs/aprendendo/13-perseguicao.md`

**Interfaces:**

- `balance.ts`: `BRIDGE_WIDTH = 420`; `ENEMY_SPAWN_X_RANGE = [0.05, 0.95] as const`; `threatBudget(i) = 13 + 5 × i`; `PROJECTILE_SPEED = 450`; `ENEMIES.common.radius = 10`; nova coluna `steer` (px/s laterais): comum 30, forte 45; `BOSS.steer = 20`; `CHASE_DEADZONE_PX = 2`.
- `enemies.ts`: `EnemyDef` ganha `readonly steer: number`; `export function bossReachedTroop(bossY: number): boolean` (`bossY >= SQUAD_Y`).
- `motion.ts`: `export function chaseVelocityX(chaser: { x: number; y: number }, targetX: number, steer: number): number` — `0` se `y < 0`, `y >= SQUAD_Y` ou `|targetX − x| <= CHASE_DEADZONE_PX`; senão `sign(targetX − x) × steer`.
- Game: `Enemy.move(vx: number, vy: number): void` substitui `setFallSpeed`; `EnemySystem.update(scrollSpeed: number, targetX: number)`; `Boss.x` passa a mudar e `Boss.update(deltaMs, scrollSpeed, targetX)`; `BossEncounter` chama `onBossReachedSquad()` quando `bossReachedTroop(boss.y)`.

- [ ] **Step 1: Testes que falham**
  - bridge: `bridgeX(0) === 150`, `bridgeX(0.5) === 360`, `bridgeX(1) === 570`; `BRIDGE_LEFT_X === 150`, `BRIDGE_RIGHT_X === 570` (os invariantes de portões e tropa continuam valendo).
  - difficulty: `hordeBudget(1, 10) === 18`; `hordeBudget(1, 500) === 143`.
  - enemies: `enemyDef('common')` tem `radius: 10` e `steer: 30`; `enemyDef('strong').steer === 45`; `bossReachedTroop(1099) === false`, `bossReachedTroop(1100) === true`.
  - motion: `chaseVelocityX({ x: 200, y: 500 }, 300, 30) === 30`; `({ x: 300, y: 500 }, 200, 30) === -30`; `y = -10` → `0`; `y = 1100` → `0`; `({ x: 299, y: 500 }, 300, 30) === 0`.
  - chunkTemplates: em 200 hordas, todo `x` ∈ [0.05, 0.95] e existe algum `x < 0.1` e algum `x > 0.9`.
- [ ] **Step 2:** `npx vitest run tests/core` → FAIL (valores antigos; `chaseVelocityX` e `bossReachedTroop` não existem).
- [ ] **Step 3:** Implementar o core conforme as Interfaces. **Step 4:** `npx vitest run` → PASS.
- [ ] **Step 5:** Game: `EnemySystem.update` move cada monstro com `chaseVelocityX(enemy, targetX, enemyDef(kind).steer)` e a queda de hoje; `Boss` soma `chaseVelocityX(boss, targetX, BOSS.steer) × dt` ao `x`; `RunWorld` passa `squad.x`; `BossEncounter` encerra ao `bossReachedTroop`.
- [ ] **Step 6: Verificar** com `?seed=1&debug`: comuns pequenos, hordas densas, monstros convergindo para a tropa; no trecho 8, ficar na borda faz o chefão vir atrás e, se ele alcançar a linha, a partida acaba. `npm run check` e `npm run test:e2e` → PASS.
- [ ] **Step 7:** Escrever `13-perseguicao.md` (comportamento "seek" de steering; analogia: um elemento que persegue o cursor com velocidade limitada; onde está; mexa e veja: `steer`).
- [ ] **Step 8: Commits** — `feat(core): monstros perseguem a tropa e hordas ficam mais densas`; `fix(game): chefão que alcança a tropa encerra a partida`; `docs(aprendendo): perseguição`.

### Task 15d: Feixe carregado por abates

**Files:**

- Create: `src/core/beam.ts`, `tests/core/beam.test.ts`, `src/game/systems/BeamSystem.ts`, `src/game/views/BeamView.ts`, `docs/aprendendo/12-medidor-e-habilidade-especial.md`
- Modify: `src/core/balance.ts`, `src/core/chunks.ts`, `src/core/chunkTemplates.ts`, `src/game/entities/Enemy.ts`, `src/game/systems/Collisions.ts`, `src/game/systems/BossEncounter.ts`, `src/game/views/Hud.ts`, `src/game/views/palette.ts`, `src/game/RunWorld.ts`, `src/game/scenes/RunScene.ts`, `tests/core/chunkTemplates.test.ts`, `tests/e2e/smoke.spec.ts`

**Interfaces:**

- `balance.ts`: `BEAM = { hordesToCharge: 2, widthPx: 100, durationMs: 1500, bossDamageShare: 0.25 } as const`.
- `beam.ts`:
  ```ts
  export interface BeamState { readonly charge: number; readonly remainingMs: number; readonly bossHit: boolean }
  export const initialBeam: BeamState; // { charge: 0, remainingMs: 0, bossHit: false }
  export function killCharge(kind: EnemyKind, hordeBudget: number): number; // custo ÷ (orçamento × hordesToCharge)
  export function addCharge(state: BeamState, amount: number, bossPresent: boolean): BeamState; // ignora se ativo ou com chefão; ao chegar a 1 (tolerância 1e-9) dispara: { charge: 0, remainingMs: durationMs, bossHit: false }
  export function tickBeam(state: BeamState, deltaMs: number): BeamState; // remainingMs nunca negativo
  export function isBeamActive(state: BeamState): boolean;
  export function beamCovers(beamX: number, target: Circle): boolean; // |dx| < widthPx/2 + radius e target.y < SQUAD_Y
  export function beamBossDamage(health: Health): number; // min(maxHp × bossDamageShare, hp − 1), nunca negativo
  export function markBossHit(state: BeamState): BeamState;
  ```
- `chunks.ts`: `EnemySpawn` ganha `readonly charge: number`; `fillHorde` usa `killCharge(kind, hordeBudget(índice, tropa))`; `bossHorde` usa `charge: 0`.
- Game: `EnemySpawnAt` e `Enemy` ganham `charge`; `BossEncounter` expõe `get activeBoss(): Boss | null`;
  ```ts
  export class BeamSystem {
    constructor(scene: Phaser.Scene, deps: { enemies: EnemySystem; squad: Squad; boss: BossEncounter; events: CollisionEvents });
    get chargeRatio(): number;
    addKillCharge(amount: number): void; // bossPresent = boss.activeBoss !== null
    fill(): void; // debug: addCharge(estado, 1, false)
    update(deltaMs: number): void; // tick; ativo: BeamView em squad.x, mata (kill + onEnemyKilled) quem beamCovers, dano único no chefão
  }
  export class BeamView { constructor(scene: Phaser.Scene); show(x: number): void; hide(): void } // coluna de y 0 a SQUAD_Y, PALETTE.beam, alpha 0.6
  ```
  `CollisionSystem` recebe `beam` nas deps e chama `beam.addKillCharge(enemy.charge)` quando um projétil mata. `HudData` ganha `beamCharge: number` (barra `ProgressBar` no rodapé, cor `PALETTE.beam`). `RunWorld` expõe `readonly beam`; ordem de criação: inimigos → spawner → chefão → feixe → colisões. Debug: `__horde.fillBeam()`.

- [ ] **Step 1: Testes que falham** (`beam.test.ts`):
  - `killCharge('common', 20) === 1 / 40`; `killCharge('strong', 20) === 8 / 40`.
  - 40 × `addCharge(·, killCharge('common', 20), false)` a partir de `initialBeam` deixa o feixe ativo (tolerância de ponto flutuante).
  - `addCharge(initialBeam, 0.4, false)` → `charge 0.4`, inativo; `addCharge({ ...initialBeam, charge: 0.9 }, 0.2, false)` → ativo, `remainingMs 1500`, `charge 0`.
  - carga ignorada com feixe ativo e com `bossPresent = true`.
  - `tickBeam`: ativo após 1499 ms, inativo após 1500 ms, `remainingMs` nunca negativo.
  - `beamCovers(300, { x: 350, y: 500, radius: 10 }) === true`; `x: 361` → `false`; `y: 1100` → `false`.
  - `beamBossDamage({ hp: 1000, maxHp: 1000 }) === 250`; `({ hp: 100, maxHp: 1000 }) === 99`; `({ hp: 1, maxHp: 1000 }) === 0`.
  - `markBossHit` liga `bossHit`; um novo disparo volta `bossHit` para `false`.
  - chunkTemplates: spawns de `fillHorde` trazem `charge === killCharge(kind, hordeBudget(12, 300))`; `bossHorde` traz `charge 0`.
- [ ] **Step 2:** `npx vitest run tests/core` → FAIL (`beam.ts` não existe; spawns sem `charge`).
- [ ] **Step 3:** Implementar `beam.ts`, `BEAM` e a carga nos spawns. **Step 4:** `npx vitest run` → PASS.
- [ ] **Step 5:** Game: `BeamView`, `BeamSystem`, carga em `Collisions`, `activeBoss`, barra no `Hud`, `fillBeam` no debug. Smoke test novo: `?seed=1&debug`, `setTroop(30, 2)`, `fillBeam()`, 3 s sem erros; e `fillBeam()` seguido de `endRun()` sem erros.
- [ ] **Step 6: Verificar** com `?seed=1&debug`: abater monstros enche a barra; cheia, a coluna aparece por 1,5 s, segue a tropa e limpa a horda; no chefão, a barra não enche e um feixe tira 25% sem matar. `npm run check` e `npm run test:e2e` → PASS.
- [ ] **Step 7:** Escrever `12-medidor-e-habilidade-especial.md` (o que é um medidor de habilidade; por que medir em hordas; analogia: _token bucket_ de rate limiting; onde está; mexa e veja: `BEAM`).
- [ ] **Step 8: Commits** — `feat(core): carga e regras do feixe`; `feat(game): feixe que limpa uma coluna à frente da tropa`; `docs(aprendendo): medidor e habilidade especial`.
