# 06 — Object pooling

## O que é

**Object pooling** é reaproveitar objetos em vez de criar e destruir o tempo todo. Um projétil que sai da tela não é apagado: ele é **desativado** (fica invisível, sem física) e volta para o **pool**. No próximo tiro, o jogo pega um projétil desativado, reposiciona e liga de novo.

```ts
const projectile = pool.acquire();     // pega um livre (ou cria, se ainda couber)
projectile?.fire(x, y, damage);        // reativa na posição certa
// ... saiu da tela:
projectile.kill();                     // desativa e devolve ao pool
```

O pool tem um **tamanho máximo** (400 projéteis). Se todos estiverem em uso, `acquire()` devolve `null` e aquele tiro simplesmente não acontece, em silêncio, sem erro.

## Por que existe

Uma tropa grande dispara centenas de tiros por segundo. Criar e destruir objetos nesse ritmo tem dois custos:

1. **Criar é caro:** cada objeto do Phaser monta estruturas internas e um corpo de física.
2. **Coletor de lixo:** objetos destruídos viram "lixo" que o JavaScript limpa de tempos em tempos. Essa limpeza **pausa o jogo** por alguns milissegundos, e o jogador sente como engasgos (*stutter*).

Com o pool, depois que os objetos são criados, a memória fica estável e o coletor de lixo quase não trabalha. O limite máximo também protege o celular: mesmo com 2 milhões de heróis, nunca existem mais de 400 projéteis.

## Analogia com o mundo web

É o **pool de conexões do banco de dados** (como o do `pg`, do Prisma ou do Knex). Abrir uma conexão nova é caro, então o servidor mantém algumas abertas e as empresta e devolve. Se todas estiverem ocupadas, a requisição espera. No jogo, em vez de esperar, o tiro é descartado, porque esperar faria o jogo travar.

## Onde está no código

- `src/game/systems/ObjectPool.ts`: o pool **genérico** `ObjectPool<T>`, usado por projéteis e, a partir do Task 11, por inimigos
- `src/game/entities/Projectile.ts`: `fire()` (reativa) e `kill()` (desativa e desliga a física)
- `src/game/systems/FiringSystem.ts`: pede projéteis ao pool e recicla os que saem pelo topo da tela
- `src/core/balance.ts`: `PROJECTILE_POOL_SIZE = 400`

## Mexa e veja

1. Em `balance.ts`, troque `PROJECTILE_POOL_SIZE` para `5`. Com tropa grande, os tiros saem em "rajadas" com buracos: o pool esgota e os tiros extras são descartados.
2. Em `src/core/troop.ts`, troque temporariamente o `initialTroop` para `{ count: 2_000_000, weaponLevel: 6 }` e jogue. É o pior caso possível: 120 Lendas atirando, e o jogo segue sem erros. Desfaça.
3. Abra o DevTools → aba **Memory** → "Allocation instrumentation on timeline" enquanto joga. Com o pool, a linha de memória fica estável em vez de virar um serrote de criar e limpar.
