/** Vida de qualquer coisa que pode ser destruída: monstro, chefão, caixa de arma. */
export interface Health {
  readonly hp: number;
  readonly maxHp: number;
}

export function createHealth(maxHp: number): Health {
  return { hp: maxHp, maxHp };
}

/** Aplica dano; a vida nunca fica abaixo de 0. */
export function applyDamage(health: Health, amount: number): Health {
  return { ...health, hp: Math.max(0, health.hp - amount) };
}

export function isDepleted(health: Health): boolean {
  return health.hp <= 0;
}

/** Fração de vida restante, em [0, 1] (usada nas barras de progresso). */
export function healthRatio(health: Health): number {
  return health.hp / health.maxHp;
}
