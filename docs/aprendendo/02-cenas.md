# 02 — Cenas no Phaser

## O que é

Uma **cena** (`Phaser.Scene`) é uma "tela" do jogo, com seus próprios objetos, lógica e entrada. O Horde Runner tem quatro:

| Cena | Papel |
|---|---|
| `Boot` | primeira a rodar; no futuro carrega imagens e sons, hoje só segue para o menu |
| `Start` | menu: título, recorde, "Toque para começar" |
| `Run` | a partida em si |
| `GameOver` | score, recorde e "Toque para jogar de novo" |

Cada cena tem um **ciclo de vida** com métodos que o Phaser chama na ordem certa:

- `init(data)`: recebe dados de quem a iniciou
- `preload()`: carrega arquivos (imagens, sons)
- `create(data)`: monta a tela uma vez
- `update(time, delta)`: roda a cada frame (veja o doc 01)

Trocar de cena é `this.scene.start('NomeDaCena', dados)`. A cena atual é desligada e a nova começa do zero.

## Por que existe

Separar o jogo em cenas mantém cada tela independente: o menu não precisa saber nada sobre monstros, e a partida não precisa saber desenhar o menu. Quando uma cena é desligada, tudo o que ela criou é limpo junto, o que evita "vazar" objetos de uma tela para outra.

## Analogia com o mundo web

Cenas são como **rotas do React Router**:

| Phaser | React |
|---|---|
| `this.scene.start('Run', { seed })` | `navigate('/run', { state: { seed } })` |
| `create(data)` | componente montando e lendo `location.state` |
| cena desligada e seus objetos destruídos | componente desmontado |
| evento `SHUTDOWN` | cleanup do `useEffect` |

Os dados que passam de uma cena para outra são tipados: `GameOverScene` declara a interface `GameOverData`, e a `RunScene` monta um objeto desse tipo.

## Pausar uma cena

`this.scene.pause()` congela a cena inteira: o `update` para de rodar, a física para e os timers param. Tudo volta de onde estava com `this.scene.resume()`. A partida pausa de dois jeitos: sozinha, quando a aba ou o app perde o foco, e pelo botão ⏸ no canto superior direito.

Um detalhe que pega muita gente: **uma cena pausada também para de receber toques do Phaser**. Se o "toque para continuar" fosse um botão do Phaser, ninguém conseguiria retomar. Por isso o toque que retoma é ouvido direto no `<canvas>`, com um `addEventListener('pointerdown', …, { once: true })` comum do DOM. É como um modal que trava a página: o botão de fechar precisa ficar fora da área bloqueada.

## Onde está no código

- `src/game/scenes/`: as quatro cenas
- `src/game/config.ts`: a lista de cenas (a primeira da lista é a que começa)
- `src/game/sceneMarker.ts`: escreve `data-scene` no `<body>` para os testes do Playwright saberem em que cena o jogo está
- `src/game/pause.ts`: pausa e retoma a partida; usa o evento `SHUTDOWN` da cena para remover o listener de `visibilitychange` (o mesmo papel do cleanup do `useEffect`)
- `src/game/views/PauseButton.ts`: o botão ⏸ do HUD

## Mexa e veja

1. Em `GameOverScene`, troque `this.scene.start('Start')` por `this.scene.start('Run', { seed: 1, debug: false })`. Agora "jogar de novo" pula o menu.
2. Em `StartScene`, adicione `console.log('menu montado')` no `create` e veja no console do navegador quantas vezes ele roda ao voltar do fim de jogo. Uma vez por visita, como um componente remontando.
3. Abra o jogo, aperte F12 e inspecione o `<body>`: o atributo `data-scene` muda conforme você navega.
4. Durante uma partida, toque no ⏸ e inspecione o `<body>`: aparece `data-paused="true"`. Toque de novo e ele vira `false`.
