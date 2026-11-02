import type { LinkKind } from "../engine/types";

export interface CableDef {
  id: LinkKind;
  name: string;
  short: string;
  blurb: string;
  hint: string;
  color: number;
}

export const CABLES: CableDef[] = [
  {
    id: "http",
    name: "HTTP cable",
    short: "HTTP",
    blurb: "How a client talks to a service.",
    hint: "Pick this, then drag Users onto a service.",
    color: 0xe07a5f,
  },
  {
    id: "sql",
    name: "SQL cable",
    short: "SQL",
    blurb: "How a service queries a database. Clients do not speak it.",
    hint: "Pick this, then drag the service onto a database.",
    color: 0x8d74b8,
  },
  {
    id: "grpc",
    name: "gRPC cable",
    short: "gRPC",
    blurb: "How services talk to services. Browsers do not speak it.",
    hint: "Drag one service onto another. Users still need HTTP.",
    color: 0x3d9a6a,
  },
  {
    id: "redis",
    name: "Redis cable",
    short: "Redis",
    blurb: "How an app reads a cache. A cache is not a relational database.",
    hint: "Drag the service onto Redis, Memcached, or a cache.",
    color: 0xd64545,
  },
  {
    id: "amqp",
    name: "AMQP cable",
    short: "AMQP",
    blurb: "How a worker takes a message off a queue.",
    hint: "Drag a queue onto the worker that should receive the message.",
    color: 0xf08a3c,
  },
  {
    id: "kafka",
    name: "Kafka cable",
    short: "Kafka",
    blurb: "How services publish onto a log. Not a query, and not a browser click.",
    hint: "Drag a service onto Kafka, or Kafka onto a consumer.",
    color: 0x2f2a28,
  },
];

const byId = new Map(CABLES.map((c) => [c.id, c]));

export function getCable(id: string): CableDef | null {
  return byId.get(id as LinkKind) ?? null;
}

export function isCable(id: string): id is LinkKind {
  return byId.has(id as LinkKind);
}
