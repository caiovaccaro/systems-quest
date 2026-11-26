# systemsquest

A browser game that teaches system design. Each lesson is its own island. You place machines, cable them, and watch live traffic. A promise meter says whether the design held.

There are 39 lessons. The winning layouts are in the play, not in this file.

## Lessons

1. **Single server.** One machine serves a read-only page through a traffic spike.
2. **App and database.** Writes go through an application over HTTP and land in a database over SQL. A chatty query and a missing index show up as latency.
3. **Vertical scale.** The arrival rate passes the small server. A larger server is the same service with more capacity, and it is still one machine.
4. **Load balancing.** One app server saturates. A load balancer can spread the traffic. Sticky pins every request to the first backend.
5. **Read-your-writes.** Clients write to MySQL, then immediately read. A replica can serve that read. A stale one does not contain the write.
6. **Cache stampede.** A shared expiry drops every key at once, so every client misses together.
7. **CDN.** Clients want the same response. The origin is sized for misses, not for every client.
8. **Queue.** A burst can wait in a queue. The worker cannot hold it.
9. **Rate limit.** A spike more than triples the load. Refusing the excess keeps the accepted requests inside the SLO.
10. **Dual write.** The primary is the source of truth and a search index is a second copy. Updating both independently can miss one, and it is slow.
11. **Write order.** An upload is an object and a row that names it. Saving the object first leaves an orphan if the row never lands.
12. **Shared session.** Every request needs a yes. If that yes can only come from one auth service, that service is the system.
13. **Sharding.** A shard key chooses the partition. A hot key fills one shard and leaves the others idle.
14. **Local quorum.** A write can commit locally, or wait until the remote replica agrees. The latency SLO does not include that wait.
15. **One service.** The work can stay in one process, or one request can call a chain of services and still fail together.
16. **Circuit breaker.** The client calls a dependency it can skip. Waiting out a dead dependency spends the latency budget.
17. **Tracing.** Slow requests are retried because nothing records them. The average stays fine. p99 does not.
18. **Idempotent writes.** Clients retry when they are not sure the write landed. Writing every arrival as new multiplies the work.
19. **Schema migration.** The schema is changing. Locking the table blocks writes that do not touch the column being moved.
20. **Fan-out on read.** A new post can be pushed to every follower, or assembled when someone reads. Pushing multiplies one write by the audience.
21. **Cost.** A message bus costs more than this workload needs. The app server meets the SLO without it.
22. **Strangler.** The legacy service is still on the path. New requests can move to the replacement before the old service is deleted.
23. **One owner.** Two teams must approve every request. The wait is the org chart.
24. **Tenant isolation.** Two tenants share a table. One tenant's spike spends the connections and the latency budget.
25. **The SLO you can keep.** The service promises five nines, every region, and no loss. One machine and a small budget cannot pay for that.
26. **Database per service.** Profile and timeline each own a database. A page reads both. Neither service queries the other's store.
27. **Layers of isolation.** Page, domain service, and database. The page is cabled straight at the database, so a slow query stalls the screen.
28. **Modular monolith.** One deployable holds two domains that share tables. A spike in one saturates the other. A second network service is a different architecture.
29. **Pipeline.** One request runs validate, then price, then save. One filter doing all three saturates. Too many filters miss latency.
30. **Microkernel.** A small core plus two volatile features. With both features inside the core, the slow one is on every request.
31. **Service-based.** The load is too big for one service and too small for a microservice per function. A few coarse domain services sit behind one API and may share a database.
32. **Distributed monolith.** The split already happened. Both services still finish every user request together, including a shared transaction.
33. **Broker and mediator.** A write has to return quickly, and two downstream consumers each have to see the change. Doing that work inside the request misses latency.
34. **Orchestration and choreography.** A three-step workflow. Choreography with no durable log drops a step. A synchronous orchestrator on the user path makes the page as slow as the sum.
35. **CQRS.** Reads and writes differ in volume and shape. One store serving both lets the read spike block writes. A replica of the same schema still serves the wrong shape.
36. **Space-based.** Requests arrive faster than the database can answer on the path. The read is served from an in-memory grid, and a pump writes the database after the response.
37. **Orchestration-driven SOA.** Business, enterprise, application, and infrastructure services, plus a central engine. Every request crosses all of them.
38. **Broker per domain.** Two domains publish through one broker. A burst or a poison message in one domain stalls the other.
39. **Operational coupling.** Metrics, logging, and policy live inside the service process. An operational fault takes the domain down.

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

The wordmark uses [Nabla](https://fonts.google.com/specimen/Nabla) (copyright 2022 The Nabla Project Authors). Headings use [Honk](https://fonts.google.com/specimen/Honk) (copyright 2023 The Honk Project Authors). Phones paint those color glyphs as one flat fill, so the site ships outline cuts and draws the gradients in CSS. Body text uses [Source Sans 3](https://fonts.google.com/specimen/Source+Sans+3). All three are under the [SIL Open Font License](https://openfontlicense.org).

## License

[MIT](LICENSE).
