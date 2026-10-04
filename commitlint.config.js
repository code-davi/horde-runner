// Regras de commit: docs/specs/2026-10-03-padroes-de-codigo.md §10 (ADR 0019).
export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat',
        'fix',
        'refactor',
        'perf',
        'test',
        'docs',
        'style',
        'build',
        'ci',
        'chore',
        'revert',
      ],
    ],
    'scope-enum': [
      2,
      'always',
      [
        'core',
        'game',
        'platform',
        'e2e',
        'deps',
        'ci',
        'spec',
        'plano',
        'adr',
        'aprendendo',
        'playtest',
      ],
    ],
    'header-max-length': [2, 'always', 100],
    'body-max-line-length': [2, 'always', 100],
  },
};
