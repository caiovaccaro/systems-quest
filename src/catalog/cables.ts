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
    blurb: "How a browser talks to a page. People send clicks over HTTP.",
    hint: "Pick this, then drag People onto the laptop or app.",
    color: 0xe07a5f,
  },
  {
    id: "sql",
    name: "SQL cable",
    short: "SQL",
    blurb: "How an app asks a database for rows. Not a thing people speak.",
    hint: "Pick this, then drag the app onto Postgres.",
    color: 0x8d74b8,
  },
];

const byId = new Map(CABLES.map((c) => [c.id, c]));

export function getCable(id: string): CableDef | null {
  return byId.get(id as LinkKind) ?? null;
}

export function isCable(id: string): id is LinkKind {
  return byId.has(id as LinkKind);
}
