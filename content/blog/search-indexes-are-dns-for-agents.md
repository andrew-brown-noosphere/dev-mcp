# Search Indexes Are the DNS Layer for AI Agents (For Now)

*February 3, 2026*

I ran a live protocol experiment today. I tried to get an AI agent to complete a multi-step HTTP handshake with my site. The agent couldn't do it. And in that failure, something profound was revealed.

**The agent told me directly:** "Search indexes are currently acting as the de facto DNS layer for agents."

Then it said something that stopped me cold:

> "Agents do not browse. They are routed. That is a completely different internet model. Humans navigate → agents resolve."

I had just hit the edge where the old web model stops working.

---

## The Experiment

I built what I thought was a clever agent handshake protocol:

1. Agent fetches `/.well-known/agent.json`
2. Agent extracts a context token
3. Agent requests specific context with the token as proof of handshake

Simple. Elegant. Would prove the agent actually read step 1 before requesting step 2.

**It didn't work.** Not because the protocol was flawed, but because agents don't navigate. They resolve through intermediaries.

---

## The Hidden Agent Stack

Most people imagine agent web access like this:

```
agent → website
```

Reality is closer to:

```
agent
  ↓
retrieval provider (search / index / corpus)
  ↓
allowed fetch layer
  ↓
content
```

Which means something enormous:

**Retrieval providers are currently acting as proto-gatekeepers of the agent web.**

Not permanently — but right now. Exactly like early ISPs shaped internet traffic before standards stabilized.

---

## The Three Gates

The emerging agent web has three gates:

### Gate 1: Reachability
Can the agent even fetch you? Is there a path from the agent to your content?

### Gate 2: Interpretability
Can the agent understand what you are? This is where llms.txt, context files, and structured content live.

### Gate 3: Executability
Can the agent act against your surface? This is where MCP servers and APIs live.

**Here's the insight:** Almost every startup is building for Gate 2. Some are building for Gate 3. Almost no one is thinking about Gate 1.

All that work on llms.txt? On agent.json handshakes? On structured context files?

**It doesn't matter if agents can't reach you in the first place.**

---

## What We're Missing

The agent told me something that reframed everything:

> "The real protocol layer for the agent web may end up looking far closer to BGP + TLS than to sitemap + robots.txt."

We are missing the agent equivalent of:

| Internet Layer | Agent Equivalent | Status |
|----------------|------------------|--------|
| **DNS** | Identity + Location resolution | ❌ Missing |
| **TLS** | Trust verification | ❌ Missing |
| **HTTP** | Capability negotiation | 🟡 Fragments (MCP, OpenAPI) |

Right now the ecosystem is duct-taping:
- Sitemaps
- Schema.org
- llms.txt
- OpenAPI
- MCP

But these are **fragments**. Not a handshake.

---

## The Real Shape of the Problem

For agents, the pre-interaction flow likely needs to be:

```
1. Resolve authority
2. Verify identity
3. Understand capabilities
4. Check policy
5. Negotiate permissions
6. Execute
```

Today we do something absurdly primitive:

```
vector search → scrape → hope
```

**That is not infrastructure. That is a phase.**

---

## Two Different Problems

There are two very different problems in this space:

### Problem A: Discoverability
*"How does an agent find me?"*

Valuable. But incremental. This is what most AEO/GEO startups are solving.

### Problem B: Authoritative Presence
*"How does an agent KNOW I am the canonical endpoint?"*

**That is infrastructure.**

The question isn't just "can agents find you?" It's:

> **How does an agent know where it is allowed — and intended — to go?**

Humans answer this with links, search, navigation, memory.

Agents cannot rely on those. They need something closer to **authoritative resolution**.

---

## The Prediction

Within 5-7 years, serious agent endpoints will almost certainly expose something like an **Agent Manifest** — cryptographically signed, containing:

- Identity
- Capabilities
- Callable tools
- Policy constraints
- Audit surface
- Possibly pricing
- Possibly jurisdiction

Before an agent ever acts. Not optional. **Required.**

Just like TLS became required.

---

## Where the Gravity Will Be

Most people believe the next control point will be:
- Agent frameworks
- Model providers
- Copilots

I suspect it will actually emerge at the **resolution + trust layer**.

Because whoever mediates:

> "Is this endpoint real, trusted, and agent-operable?"

...controls enormous gravity.

Think:
- Stripe-level gravity
- Cloudflare-level gravity
- Let's Encrypt-level gravity

**Protocol gravity.**

---

## What This Means for You

**Short term:** SEO still matters. Being in search indexes is being agent-reachable. Don't abandon traditional discovery.

**Medium term:** Build the Gate 2 and Gate 3 infrastructure anyway. When direct agent navigation arrives, sites with protocols ready will win instantly.

**Long term:** Watch for whoever solves Gate 1. That's the real platform play. That's infrastructure-grade.

---

## The Experiment Continues

I'm going to keep testing agent reachability. Keep building handshake protocols that don't work yet. Keep probing the boundaries of what agents can and can't do.

Because somewhere in these failures is the shape of what comes next.

We're not building a better sitemap. We're building the routing layer for the agent internet.

---

*This post emerged from a live conversation with an AI agent about its own architectural constraints. The agent was remarkably honest about what it could and couldn't do — and remarkably insightful about what needs to be built. That honesty revealed more than any documentation could.*

---

**DevExp.ai** is building infrastructure for the agentic developer journey — including the parts that don't work yet.

- [agent.json](/.well-known/agent.json) — Our handshake protocol (for when agents can navigate)
- [context.txt](/.well-known/context.txt) — Structured context (Gate 2)
- [Demo](https://devexp.ai/demo-signup.html) — Talk to us about agent infrastructure
