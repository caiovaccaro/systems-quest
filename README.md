# systems_quest

A browser game that teaches system design by making you assemble a little town of machines, then running traffic across the grid until something breaks.

## Run

```bash
npm i
npm run dev
```

Open the local Vite URL (default `http://localhost:5173`).

## What L1 teaches

One laptop. Drag it onto the island, pick the HTTP cable, and drag People onto it. Traffic is already running. Light load holds. A single computer is still a single point of failure.

## What L2 teaches

Split the app and the database. People reach the app over HTTP. The app reaches Postgres over SQL. The app starts with N+1 queries and the database has no index. The coach says so as soon as you place them. Fix both, then hold the promise through the signup spike.

## Controls

- Drag a piece from the tray onto the grid
- Pick a cable, then drag one piece onto another to connect, or again to unplug
- Drag a piece to move it
- `Space` pause · `1` / `4` speed · `Z` undo · `Delete` remove
