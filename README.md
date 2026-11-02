# systemsquest

A browser game that teaches system design. Each lesson is its own island. You place machines, cable them, and watch live traffic. A promise meter says whether the design held.

There are 26 lessons, from one laptop on a stoop to services that each keep their own book. The answers are in the play, not in this file.

## Play

The live game is at <https://caiovaccaro.github.io/systems-quest/>.

To run it locally:

```bash
npm install
npm run dev
```

Open the URL Vite prints. The default is `http://localhost:5173`. The dev server also listens on your network, so a phone on the same Wi-Fi can use the Network URL.

```bash
npm run build
npm run preview
```

`build` typechecks, then writes `dist/`. Progress is stored in the browser under `systems_quest.cleared`. Nothing is sent to a server.

## Controls

- Drag a piece from the tray onto the island. On a small screen, open Pieces, tap one, then tap a tile.
- Pick a cable, then drag one piece onto another to connect. Drag that pair again with the same cable to unplug.
- Drag a placed piece to move it. `Z` undoes. `Delete` removes the selected piece.
- `Space` pauses. `1` and `4` set the speed.

## Layout

Lessons live in `src/levels`. The traffic simulation is `src/engine`. Pieces and cables are `src/catalog`. The board is `src/render`. The screen around the board is `src/ui` and `src/game`.

## Fonts

The wordmark uses [Nabla](https://fonts.google.com/specimen/Nabla). Headings use [Honk](https://fonts.google.com/specimen/Honk). Body text uses [Source Sans 3](https://fonts.google.com/specimen/Source+Sans+3). All three are served by Google Fonts under the [SIL Open Font License](https://openfontlicense.org).

## License

[MIT](LICENSE).
