# 0021 — Teto no tiro em portões

**Status:** aceito · 2026-10-03 · substitui em parte o ADR 0009

## Contexto
Com o ADR 0009, cada projétil soma +1 a um portão `+N`/`-N` sem limite. No playtest de 2026-10-03, tropas grandes (dezenas de tiros por segundo) inflavam portões até `+500`/`+600`, tornando o crescimento trivial.

## Opções
- Sem teto (ADR 0009 original).
- **Teto por portão:** máx(2 × valor inicial, +10).
- Tiros só melhoram portões negativos até 0.

## Decisão
Teto de máx(2 × valor inicial, +10). Um `+45` para em `+90`; um `-8` ainda pode virar positivo, até `+10`. Portões negativos grandes (proporcionais à tropa, ADR 0020) exigem muitos tiros para melhorar. O projétil é consumido mesmo com o portão no teto.

## Consequências
Continua valendo o dilema "atirar nos monstros ou consertar o portão", mas sem crescimento ilimitado. O tipo `Gate` de soma passa a carregar o seu teto.
