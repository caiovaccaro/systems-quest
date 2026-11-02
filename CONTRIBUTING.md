# Contributing

```bash
npm install
npm run dev
```

`npm run build` typechecks the project and produces `dist/`. Run that before opening a pull request.

Lessons are data in `src/levels`. A new lesson needs a scene, a palette, cables, and a promise the simulation can actually pass or fail. The coach should name the mistake a player can see.

Keep the simulation deterministic. It is seeded per lesson and advances in fixed steps.

## How a visit moves

`src/game/Game.ts` owns the board: placed pieces, cables, undo, and the screen. Any change that matters (place, move, cable, config, delete) calls `commit()`, which copies the board into a new `Simulation` and starts the clock over. Editing a live board does not patch the running requests.

`src/engine/sim.ts` is the clock. While the lesson is live and the player has not won, the game calls `tick` in steps of 1/30 second. A loss sets `ended` and the clock stops, but the board stays up. A win pauses and writes the lesson id into `localStorage` under `systems_quest.cleared`.

People are the only source of visits. They emit HTTP at the lesson's queries per second, ramped in over the first few seconds, multiplied by any chaos event. A request is either `http` or `query`. The cable kind (`http`, `sql`, `grpc`, `redis`, `amqp`, `kafka`) is separate from that. Only the root HTTP visit, the one whose parent is null, is written into the promise metrics. A failed query fails that parent visit instead of opening a second one.

The promise is the lesson's availability and p99 latency. Error rate above the budget, or p99 over the latency SLO, heats a burn meter. At the end of `duration` the lesson passes when availability holds, p99 is within a small margin of the SLO, and the burn meter is not already spent. An early collapse (almost every visit failing, or the meter filling) fails sooner.

## Cables

A drop with no cable selected does not connect. The coach says to pick one.

Cables are directed. The lower tier sends toward the higher tier. People are tier 0. Forwards, queues, and the API gateway are tier 1. A facade, backend for frontend, and the other aggregators are tier 1.5. Leaf services are tier 2. Broadcast logs (Kafka, SNS, Kinesis) are tier 2.5, so a service cables toward the log. Stores are tier 3. When the tiers match, the piece the player dragged is the source.

Dragging an already linked pair with the same cable unplugs it. A different cable keeps the link and changes its kind.

Piece ids must not collide with cable ids. The Redis machine is `redisbox` and the Kafka machine is `kafkalog`. The cables stay `redis` and `kafka`.

## What the tray offers

`offeredPieces` in `src/catalog/wire.ts` lists the lesson palette first, then toolbox pieces whose `minLevel` is at most this lesson. It does not carry forward pieces that existed only on an earlier lesson's palette. A lesson piece that skips the palette check would let a player walk past later lessons.

`offeredCables` is the union of `cables` from every lesson up to the current one, plus cables unlocked by level number.

A lesson palette is the pieces the lesson is about. The toolbox is everything else the player is allowed to spend. Substituting a store from outside the palette is slow when that store is the wrong data family, or when it is missing a knob the lesson's own stores have.

## What a piece does when a request arrives

The behavior is `machine` on the component, plus a few flags.

A source completes the visit. A crashed piece fails it. A cable the piece does not `accept` fails it as a protocol error. A gate can drop for fairness. A queue fails when its wait line is past the limit. Past that, saturation spends tokens and connection slots.

`requiresStore` means the piece must query a database before it can answer. No SQL or Redis cable is a "no store" failure. `mustStores` on the lesson names the databases that cable has to reach.

Several databases on one service are asked together by default (`records: all`), in parallel. `chain` asks them one after another and adds the latencies. `primary` fails the visit once the lesson is past the early ones. Sharding is pick-one: `celebrity` always uses the first store, `even` uses the seeded random pick. N+1 is twelve serial queries to one store, and it sets the n+1 flag the coach and the diagnosis read.

An aggregator (`aggregates`) calls the services cabled behind it. `scatter` waits on the slowest. `chain` adds every hop. `first` fails the visit when two or more services are cabled and the lesson is late enough for that to be the mistake. `queue` does not answer the user. After the service calls return, only an aggregator goes on to query its own databases. A normal service that published to a log must not query again when the event comes back.

A broadcast log delivers to every other app that points at it. Delivery follows incoming cables, not cables leaving the log, because tier always orients a service toward the log. The publisher, other aggregators, and other logs are not subscribers. Rabbit and the other work queues are not broadcast: one consumer wakes.

An API gateway with `route: direct` spreads to every compute backend. If that set contains both an aggregator and a leaf, the visit fails. `route: facade` sends only to aggregators, and fails when none are cabled. The lesson load balancers do not use that pair. The strangler lane still delays only the `old` route.

`forgets` answers and keeps nothing. On a write-heavy lesson those writes are lost.

`owners` on a lesson is the database-per-service check. Each named service must query a distinct store on that visit. A shared database, a missing owner, or a facade that queries the books itself fails the root visit.

## The coach and the board

`src/game/coach.ts` reads the board, not the clock, for setting mistakes: a shared database, a gateway walking past a facade, N+1, a missing index, and the rest. It reads the simulation only for the live diagnosis once traffic has a sample.

`src/render/Board.ts` draws the island from the lesson scene. Water cells are not land, so a drop there does not place. The camera frames the land mask, not the full 12 by 8 grid, so a small island stays readable. Pipes are arched meshes. Their colors come from `src/catalog/cables.ts`.

Heading colors are generated from the scene in `honkStops`: a bright mix of accent and water for the face, a near-black cliff for the edge. The wordmark stays Nabla and is not recolored per lesson.
