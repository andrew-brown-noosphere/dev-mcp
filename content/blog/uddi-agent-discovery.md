# We've Been Here Before: UDDI, Web Services, and the Agent Discovery Problem

*January 20, 2026*

Everyone working on agent infrastructure should study the history of UDDI. We're solving the same problem they tried to solve in 2000, and we're about to make many of the same mistakes.

## The Problem Then

In the late 1990s and early 2000s, enterprises were building web services. SOAP let you call remote procedures over HTTP. WSDL described what operations a service offered. But there was a missing piece: how do you discover services in the first place?

Enter UDDI — Universal Description, Discovery, and Integration. The idea was simple and compelling:

1. Services register themselves in a universal directory
2. Clients query the directory to find services matching their needs
3. Clients retrieve WSDL, understand capabilities, and connect

UDDI was going to be DNS for web services. IBM, Microsoft, and SAP backed it. It was a W3C standard. Enterprise architects drew beautiful diagrams showing how it would all work.

It failed completely.

## Why UDDI Failed

The post-mortems are instructive:

**Nobody wanted a universal registry.** The value proposition assumed companies would publish their internal services to a shared directory. But enterprises didn't want competitors discovering their service capabilities. And they didn't trust a centralized registry controlled by IBM/Microsoft.

**Point-to-point was good enough.** In practice, if you needed to integrate with Salesforce, you went to Salesforce's developer docs, got their WSDL, and built your integration. You didn't need a universal directory to find Salesforce — you already knew you needed Salesforce.

**The metadata was too complex.** UDDI entries required extensive structured metadata: business entities, business services, binding templates, tModels. By the time you'd filled out all the UDDI registration forms, you could have just written documentation.

**REST won.** While the SOAP/WSDL/UDDI stack was being standardized, developers discovered that simple HTTP + JSON was good enough for most use cases. The entire elaborate web services stack got routed around.

## The Problem Now

Replace "web service" with "agent endpoint" and the parallels are uncomfortable:

- How does an agent discover services matching its needs?
- How does an agent understand what capabilities an endpoint offers?
- How does an agent know it can trust an endpoint?

We're proposing solutions that look a lot like the web services stack:

| 2002 | 2026 |
|------|------|
| WSDL (capability description) | llms.txt, agent.json, MCP manifests |
| UDDI (discovery registry) | ??? (currently: search indexes) |
| SOAP (protocol) | MCP, function calling |
| WS-Security (trust) | ??? (doesn't exist) |

The discovery layer is conspicuously missing. And just like in 2002, multiple parties are proposing incompatible solutions while the actual discovery mechanism (search indexes) is completely separate from the capability description mechanism (llms.txt, etc.).

## What Actually Worked

After UDDI failed, web services didn't disappear. But the discovery model changed:

**Developer portals replaced registries.** Instead of querying a universal directory, you went to Stripe's website, read their docs, and integrated. Human-readable documentation plus well-designed APIs beat machine-readable registries.

**API marketplaces emerged for aggregation.** RapidAPI, Mashape, and others created curated directories. But they were more like app stores than UDDI — human-curated, with reviews and pricing, not universal machine-queryable registries.

**Standards settled on the simple stuff.** REST/JSON won over SOAP/XML. OpenAPI (Swagger) won over WSDL because it was simpler and more practical. The elaborate type systems and formal verification of WS-* got ignored.

**Trust stayed bilateral.** OAuth and API keys handled authentication. There was no universal web services trust layer — each integration established trust directly with the provider.

## The Agent Discovery Question

So what does this mean for agent infrastructure?

**Will there be a universal agent registry?** History says probably not. UDDI failed despite IBM and Microsoft pushing it. A universal AI agent registry would face the same problems: who controls it, who trusts it, why would providers register.

**Will search indexes remain the discovery layer?** This is the UDDI-free world we actually got — Google as the de facto registry for web content. It's possible agents will just keep using search indexes forever, with no specialized agent discovery protocol.

**Will llms.txt matter?** Maybe. OpenAPI/Swagger succeeded where WSDL failed because it was simpler and tool-friendly. If llms.txt stays simple and tools adopt it, it could work. But the history suggests that formal capability descriptions tend to lose to good documentation.

**Will MCP become the standard?** Possibly. SOAP was complex; REST was simple and won. MCP is simpler than building custom integrations for each LLM, but it's not as simple as just having a good API and documentation. The winner will probably be whatever requires the least ceremony.

## Lessons for Agent Infrastructure

If I were betting on what will work, based on the UDDI history:

**Don't build universal registries.** They don't get adopted. Instead, expect aggregators and curated directories — more like Product Hunt for AI capabilities than DNS for agents.

**Keep capability descriptions simple.** llms.txt is on the right track by being a simple markdown file. The moment it becomes a complex schema with required fields and formal validation, it'll go the way of UDDI tModels.

**Assume discovery will be search.** Until there's a compelling alternative, agents will discover capabilities through search indexes. Build for that reality, not for a hypothetical agent registry.

**Trust will be graph-based, not centralized.** There won't be a universal certificate authority for agents. But pure point-to-point trust (API keys, OAuth) doesn't scale either. The likely winner: trust graphs anchored to domains. A `trust.json` that declares "I trust these endpoints" and lets trust propagate through networks. Think PGP web-of-trust, but for agent endpoints. Some early work on this at [noosphere.tech](https://noosphere.tech).

**Simple protocols win.** MCP is good because it's relatively simple. If a simpler alternative emerges, it'll probably win. Don't over-engineer.

## The Interesting Question

The UDDI failure doesn't mean agent discovery is unsolvable — it means the UDDI approach (universal registries, complex metadata, centralized trust) was wrong.

What might actually work:

**Federated discovery.** Instead of one registry, multiple competing registries that agents can query. More like DNS with multiple root servers than UDDI with a single directory.

**Capability fingerprinting.** Instead of formal descriptions, agents learn to recognize capabilities from behavior. "This endpoint responds to queries about weather" learned from interaction, not declared in metadata.

**Trust graphs.** Domain-anchored trust declarations (`trust.json`) that let trust propagate through networks. If I trust Stripe, and Stripe's trust.json says they trust Plaid, my agent can infer a trust path. Webs of trust rather than certificate hierarchies.

**Search-native discovery.** Instead of fighting search indexes, building on top of them. Structured data that search indexes understand, so agent discovery is just a specialized search query.

These approaches are messier than UDDI's clean architecture, but messier is often what works.

## Conclusion

The agent infrastructure community should read the UDDI post-mortems before building the next universal registry. The problems are the same: discovery, capability description, trust. The failed solutions are the same: centralized registries, complex metadata, universal trust layers.

What worked for web services was simpler: good documentation, simple protocols, bilateral trust, and search-based discovery. The same will probably be true for agents.

The winners won't be the most architecturally elegant solutions. They'll be the ones that are simple enough to actually get adopted.

---

Further reading:
- "Whatever Happened to UDDI?" — various post-mortems from the mid-2000s
- The WS-* specification graveyard
- How OpenAPI succeeded where WSDL failed
