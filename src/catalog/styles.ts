import type { ComponentDef, ConfigField, LinkKind, Machine } from "../engine/types";

function knob(
  key: string,
  label: string,
  bad: string,
  badLabel: string,
  good: string,
  goodLabel: string,
  hint: string,
): ConfigField {
  return {
    key,
    label,
    type: "enum",
    value: bad,
    options: [
      { label: badLabel, value: bad },
      { label: goodLabel, value: good },
    ],
    hint,
  };
}

function piece(
  id: string,
  name: string,
  blurb: string,
  machine: Machine,
  color: number,
  opts: {
    requiresStore?: boolean;
    tier?: number;
    accepts?: LinkKind[];
    config?: ConfigField[];
  } = {},
): ComponentDef {
  const store = machine === "store";
  return {
    id,
    name,
    blurb,
    category: store ? "data" : machine === "queue" ? "queue" : machine === "forward" ? "network" : "compute",
    role: store ? "store" : "compute",
    shape: store ? "cyl" : "box",
    placeable: true,
    requiresStore: opts.requiresStore ?? false,
    tier: opts.tier ?? (store ? 3 : machine === "forward" ? 1 : machine === "queue" ? 2.5 : 2),
    machine,
    cost: 14,
    color,
    maxRps: 4000,
    baseLatencyMs: store ? 10 : 8,
    queueSize: 400,
    maxConnections: 80,
    accepts: opts.accepts,
    config: opts.config ?? [],
  };
}

const talk: LinkKind[] = ["kafka", "amqp", "http"];

export const STYLE_PIECES: ComponentDef[] = [
  piece("pageui", "Page", "The screen. A slow query here stalls the person waiting on it.", "forward", 0x5b8fd6, {
    config: [knob("stack", "Call path", "skip", "Page calls the database", "layered", "Page calls the domain", "The page should not speak SQL. The domain service owns the query.")],
  }),
  piece("domain", "Domain service", "The only layer that should run SQL for this request.", "app", 0x3d6b8a, { requiresStore: true }),
  piece("layerdb", "Database", "System of record for the domain service.", "store", 0x3d4a66),

  piece("modulith", "Process", "One deployable. Two domains live here. They either share tables or talk through one interface.", "app", 0xc46a45, {
    requiresStore: true,
    config: [knob("modules", "Boundaries", "tangled", "Shared tables", "bounded", "Module interface", "A call out to a second process is a different architecture. Keep the boundary inside this one.")],
  }),
  piece("moduledb", "Database", "Tables for the modules in the process.", "store", 0x8d6246),

  piece("pipe", "Pipeline", "One request, one direction: validate, then price, then save.", "forward", 0xe0a15a, {
    config: [knob("pipe", "Filters", "clump", "One filter does all three", "filters", "One job per filter", "A backward call tangles the pipe. Extra filters spend the latency budget on hops.")],
  }),
  piece("filter", "Filter", "One step. It does not call back up the pipe.", "box", 0xf0c14a),

  piece("kernel", "Core", "The stable part. Volatile features stay out of it until a request actually needs them.", "box", 0x6e5a78, {
    config: [knob("plugins", "Plug-ins", "core", "Features inside the core", "contract", "Plug-ins behind a contract", "A plug-in on every request puts the slow feature on the hot path.")],
  }),
  piece("plugin", "Plug-in", "A volatile feature behind the core's contract.", "box", 0x8d74b8),

  piece("coarseapi", "API", "The front door for a load that is too big for one service and too small for a service per function.", "forward", 0x2a6a78, {
    config: [knob("cut", "Service cut", "fine", "A service per function", "coarse", "A few domain services", "These services may share a database. One of them handles the request.")],
  }),
  piece("coarsesvc", "Domain service", "A coarse service. It owns a business area, not a single function.", "app", 0x3e7a6a, { requiresStore: true }),
  piece("shareddb", "Database", "Shared by the coarse domain services.", "store", 0x6a8f62),

  piece("edgecut", "Edge", "Every user request currently needs both services, including a shared transaction.", "forward", 0xc4894f, {
    config: [knob("split", "Dependency", "chatty", "Both services, every request", "bounded", "One service per request", "The hop is pure latency until the cut follows a real boundary.")],
  }),
  piece("leafsvc", "Domain service", "Answers its own request. A call to the other service is the exception.", "app", 0x8d6246, { requiresStore: true }),
  piece("leafdb", "Database", "Owned by the domain service that answers this request.", "store", 0x5c6b73),

  piece("intake", "Publisher", "Accepts the write. Downstream work should not run inside this request.", "app", 0xe07a5f, {
    requiresStore: true,
    config: [knob("busmode", "Delivery", "inline", "Consumers run in the request", "log", "Log, then respond", "A mediator on the same request is still the request. A log that wakes only one consumer drops the other.")],
  }),
  piece("eventlog", "Log", "Keeps the event and delivers it to every consumer cabled to it.", "queue", 0xc46a45, { accepts: talk }),
  piece("consumer", "Consumer", "Sees the event after the user response has already been sent.", "box", 0xd64545),
  piece("intakedb", "Database", "The publisher's store. The consumers are not on this query.", "store", 0x3d342b),

  piece("workflow", "Request path", "The user request. The three-step workflow finishes behind it, or the page waits for the sum.", "box", 0x5b8fd6, {
    config: [knob("workflow", "Workflow", "sync", "Orchestrator on the request", "durable", "Durable log, or off the path", "Choreography with no durable log drops a step. A synchronous orchestrator makes the page as slow as the sum.")],
  }),
  piece("worklog", "Log", "The steps consume from here. The user request does not wait for them.", "queue", 0x3a6ea5, { accepts: talk }),
  piece("step", "Step", "One step of the workflow. It runs because the log kept the event.", "box", 0x6ea4b8),

  piece("command", "Command service", "Writes. Reads that are not this write's own row belong on the read model.", "app", 0x3d6b4f, {
    requiresStore: true,
    config: [knob("model", "Model", "shared", "One store for reads and writes", "cqrs", "Command store and read model", "A replica of the same schema still serves the wrong shape.")],
  }),
  piece("writedb", "Command store", "The write path. A read of the row just written uses this store.", "store", 0x3d6b4f),
  piece("readdb", "Read model", "Updated from the writes. Shaped for the queries, not for the command schema.", "store", 0x6a8f62),

  piece("gridunit", "Processing unit", "Serves the spike from memory. The database is too slow to sit on this path.", "box", 0xf0a05a, {
    config: [knob("data", "Data path", "database", "Database on the request", "grid", "In-memory grid, pump after", "Without the pump the grid and the database diverge, and later reads fail.")],
  }),
  piece("pumpdb", "Database", "The data pump writes here after the response.", "store", 0xc47a4a),

  piece("soadomain", "Domain service", "Owns the flow. The full service taxonomy does not fit on the request.", "box", 0x6e5a78, {
    config: [knob("taxonomy", "Taxonomy", "full", "Business, enterprise, application, infrastructure", "collapsed", "Domain owns the flow", "The orchestration engine in the middle is a single point of failure, and the latency is the sum.")],
  }),
  piece("soaenter", "Enterprise service", "Shared. It does not belong on every user request.", "box", 0x8d97b0),
  piece("soainfra", "Infrastructure service", "Shared. Keep it off the request path.", "box", 0x5c6b73),

  piece("orderspub", "Orders publisher", "One domain. Its burst must not stall the other domain's consumers.", "box", 0xe07a3c, {
    config: [knob("brokers", "Brokers", "shared", "One broker for both domains", "split", "One broker per domain", "A poison message has the same shape as a noisy neighbor.")],
  }),
  piece("billingpub", "Billing publisher", "The other domain. It publishes to its own broker.", "box", 0xc46a45),
  piece("ordersbus", "Orders broker", "Carries orders only.", "queue", 0xe0a15a, { accepts: talk }),
  piece("billingbus", "Billing broker", "Carries billing only.", "queue", 0xf2c14e, { accepts: talk }),

  piece("opssvc", "Domain service", "Serves traffic. Metrics, logs, and policy are not part of this process.", "box", 0x4aa3c7, {
    config: [knob("ops", "Operations", "inside", "Ops inside the process", "sidecar", "Sidecar beside the service", "A sidecar on the request path makes every call wait for it.")],
  }),
  piece("opside", "Sidecar", "Metrics, logging, and policy. It can restart while the domain keeps serving.", "box", 0x8aa0b4),
];
