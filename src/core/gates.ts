import { GATE_HIT_INCREMENT } from './balance';

/** Um portão do caminho. `sum` cobre `+N` e `-N` (valor com sinal). */
export type Gate =
  | { readonly kind: 'sum'; readonly value: number }
  | { readonly kind: 'multiply'; readonly value: number }
  | { readonly kind: 'divide'; readonly value: number }
  | { readonly kind: 'weapon' }
  | { readonly kind: 'knight' };

/** Se passar pelo portão é vantajoso para o jogador. */
export function isGoodGate(gate: Gate): boolean {
  switch (gate.kind) {
    case 'sum':
      return gate.value > 0;
    case 'divide':
      return false;
    case 'multiply':
    case 'weapon':
    case 'knight':
      return true;
  }
}

/** Só portões de soma mudam de valor com tiros (ADR 0009). */
export function isShootable(gate: Gate): boolean {
  return gate.kind === 'sum';
}

/** Resultado de um projétil acertando o portão. */
export function hitGate(gate: Gate): Gate {
  if (gate.kind !== 'sum') return gate;
  return { kind: 'sum', value: gate.value + GATE_HIT_INCREMENT };
}

/** Texto exibido no portão. */
export function gateLabel(gate: Gate): string {
  switch (gate.kind) {
    case 'sum':
      return gate.value < 0 ? `${gate.value}` : `+${gate.value}`;
    case 'multiply':
      return `x${gate.value}`;
    case 'divide':
      return `÷${gate.value}`;
    case 'weapon':
      return 'Arma +1';
    case 'knight':
      return '+1 Cavaleiro';
  }
}
