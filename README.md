# PAGER

A browser game that teaches system design by making you assemble a system, then running traffic at it until something pages.

## Run

```bash
npm i
npm run dev
```

Open the local Vite URL (default `http://localhost:5173`).

## What L1 teaches

One laptop. Drag it onto the table and drag People onto it. Traffic is already running. Light load holds. A single computer is still a single point of failure.

## What L2 teaches

Split the app and the database. The app starts with N+1 queries and the database has no index. The coach says so as soon as you place them. Fix both, then hold the promise through the signup spike.

## Controls

- Drag a piece from the tray onto the table
- Drag a piece to move it
- Drag one piece onto another to connect, or again to unplug
- `Space` pause · `1` / `4` speed · `Z` undo · `Delete` remove
