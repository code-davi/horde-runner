# 07 — RNG com seed (aleatório reproduzível)

## O que é

Um **RNG** (*random number generator*) é uma função que devolve números "aleatórios". Um **RNG com seed** começa a partir de um número inicial, a *seed* (semente). A mesma seed gera **sempre a mesma sequência** de números.

```ts
const a = createRng(42);
const b = createRng(42);
a.next() === b.next(); // true, sempre
```

Os números não são aleatórios de verdade: são calculados por uma fórmula (aqui, o algoritmo *mulberry32*). Mas a sequência se comporta como aleatória o bastante para um jogo.

## Por que existe

O `Math.random()` não aceita seed: cada partida é diferente e **impossível de repetir**. No nosso jogo isso é um problema por três motivos:

1. **Reproduzir bugs.** "Na partida de ontem apareceram dois portões impossíveis" só dá para investigar se você conseguir gerar a mesma partida de novo. Com seed, basta abrir `?seed=12345`.
2. **Testar.** O teste do gerador de trechos (doc 08) roda 10.000 partidas com seeds de 1 a 10.000. Se um teste falhar, a seed que falhou reproduz o problema exatamente.
3. **Balancear.** Dá para comparar duas versões dos números de `balance.ts` jogando *a mesma* partida.

## Analogia com o mundo web

É como uma **fixture determinística** de teste, ou um *snapshot*. Você não quer que o teste dependa da hora atual ou de um `Math.random()`, porque aí ele fica "intermitente" (*flaky*). Com seed, o "aleatório" vira um dado de entrada controlado.

## Onde está no código

- `src/core/rng.ts`: `createRng(seed)` e a interface `Rng` (`next`, `int`, `pick`, `weighted`).
- `tests/core/rng.test.ts`: os testes que garantem o comportamento.
- `weighted({ a: 3, b: 1 })` é o "sorteio com pesos": `a` sai cerca de 75% das vezes. É ele que escolhe o tipo de cada trecho do caminho.

## Mexa e veja

1. No `tests/core/rng.test.ts`, troque `createRng(42)` de um dos dois lados por `createRng(43)` no primeiro teste e rode `npm test`. O teste quebra, porque seeds diferentes geram sequências diferentes.
2. Mude os pesos do teste de proporções para `{ a: 1, b: 1 }` e ajuste os limites para 0,48 e 0,52. Os dois passam a sair metade das vezes cada.
3. No terminal, rode `npx vitest` (modo watch) e faça os experimentos acima para ver os testes reagirem a cada salvamento.
