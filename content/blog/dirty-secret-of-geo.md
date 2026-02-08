# The Dirty Little Secret of GEO: It's All Built on SEO

*January 27, 2026*

I've been watching the "Generative Engine Optimization" space with increasing skepticism. These startups claim to optimize your visibility in AI-generated responses — a fundamentally different discipline than SEO. After running experiments on how AI agents actually retrieve content, I'm convinced the entire category is built on a misunderstanding of the underlying architecture.

The short version: agents don't have direct navigation capabilities. They're routed through search indexes. "Optimizing for AI" is SEO with a different output format.

## Background: How I Got Here

I've been building MCP (Model Context Protocol) servers — tools that let AI agents interact with external systems. In the process, I needed to understand how agents actually discover and access web content.

The conventional wisdom is that you need to "optimize for AI" differently than you optimize for search engines. The GEO vendors claim there's a new discipline: structure your content for LLMs, get mentioned in AI responses, track your "AI visibility."

I wanted to test whether agents actually behave differently than search crawlers when accessing content.

## The Experiment

I built a simple handshake protocol to test whether agents can navigate directly to URLs and complete multi-step interactions:

```
Protocol:
1. Agent fetches /.well-known/agent.json
2. Response contains a context token (e.g., "ctx-2026Q1-7f3a9b")
3. Agent must include this token in subsequent requests
4. Token proves agent completed step 1 before requesting step 2
```

This is trivial for a browser or crawler — fetch URL, parse JSON, extract token, include in next request. Four HTTP operations.

I implemented this on my site and asked ChatGPT to complete the handshake.

Result: it couldn't do it.

Not because the protocol was complex, but because ChatGPT doesn't make arbitrary HTTP requests. When I asked it to explain why, it gave me a remarkably clear description of its own architecture:

> "I do not behave like a browser or crawler. I behave like a retrieval-mediated agent. Meaning: search index → allowed fetch → parse. NOT: navigate → execute JS → explore. Search indexes are currently acting as the de facto DNS layer for agents."

This is the key insight that undermines the entire GEO premise.

## The Agent Retrieval Architecture

When you ask ChatGPT, Perplexity, or Claude a question that requires web content, here's what actually happens:

```
User query: "What's the best database for time-series data?"

Step 1: Query interpretation
- LLM parses intent
- Generates search queries (e.g., "time series database comparison 2026")

Step 2: Search index lookup
- Queries sent to Bing/Google API
- Returns ranked URLs based on standard search signals
- Authority, relevance, freshness, backlinks — normal SEO factors

Step 3: Fetch layer
- System fetches URLs from search results
- Checks robots.txt
- Parses HTML, extracts text
- Truncates to token limits

Step 4: Synthesis
- LLM receives parsed content as context
- Generates response citing sources
```

The agent never "visits" your site in any meaningful sense. It doesn't:

- Navigate to your homepage and explore
- Look for /.well-known/llms.txt or agent.json
- Execute JavaScript
- Follow internal links
- Complete multi-step interactions

It queries a search index, gets URLs, and a separate fetch system retrieves and parses those URLs. The search index is the discovery layer. The fetch system is the access layer. The agent only sees the final parsed content.

## Why This Matters for GEO

If the discovery mechanism is the search index, then the optimization target is... the search index.

Here's what GEO vendors claim to measure and what those metrics actually depend on:

**"AI mentions"** — whether ChatGPT/Perplexity mention your brand in responses. This depends on: (1) being in the search index for relevant queries, (2) having high enough authority signals to rank in top results, (3) having content that clearly states what you do. These are SEO factors.

**"Citation frequency"** — how often your URLs appear as sources. This depends on: (1) ranking well enough to be fetched, (2) having content that answers the query well enough to cite. Again, SEO + content quality.

**"AI sentiment"** — whether AI describes you positively. This depends on: (1) what content the search index returns about you, (2) how that content is written. This is reputation management and content strategy, not a new discipline.

**"Visibility score"** — aggregate metric of above. It's measuring your SEO performance through a different lens.

The GEO vendors have built dashboards that monitor how your SEO affects AI outputs. That's useful! But they're positioning it as a new optimization discipline when the optimization levers are identical to what you've always had:

- Content relevance and quality
- Backlink authority
- Technical SEO (crawlability, structure, speed)
- Entity recognition and brand mentions
- Freshness signals

## The Technical Proof

You can verify this yourself:

**Experiment 1: Unindexed content**

Create a page at /agent-test.html with unique content. Don't submit it to search engines, don't link to it from anywhere. Ask ChatGPT: "Go to [yoursite.com/agent-test.html] and tell me what's on that page."

What happens: The agent either can't access it at all, or it searches for your site and returns information from indexed pages instead. It cannot navigate to arbitrary URLs that aren't in search results.

**Experiment 2: Handshake protocol**

Implement a multi-step protocol where step 2 requires information from step 1. Ask an agent to complete it.

What happens: The agent can fetch step 1 (if it's in search results or you provide the URL directly). But it can't take information from that response and use it in a subsequent request in the same session. The fetch layer doesn't maintain state between requests.

**Experiment 3: robots.txt blocking**

Block the AI fetch user-agents in robots.txt (GPTBot, anthropic-ai, etc.). Check if you still appear in AI responses.

What happens: You'll still appear if you're in the search index, but citations will be based on cached/indexed content rather than fresh fetches. The search index is the primary source, not live fetching.

## What Would Actually Be Different

For "AI optimization" to be a genuinely different discipline, agents would need capabilities they don't currently have:

**Direct navigation**: Agent decides to visit a URL without going through search. Currently not implemented in any major AI assistant.

**Discovery protocol**: Agent checks /.well-known/agent.json or similar before interacting, discovers capabilities, negotiates context. No standard exists, and agents don't look for these files autonomously.

**Stateful sessions**: Agent maintains context across multiple requests, can complete multi-step interactions. Current architecture is stateless fetch.

**Trust verification**: Agent verifies site identity and authority independently of search index. Currently agents trust whatever the search index returns.

When these capabilities exist, there will be genuinely new optimization surface. You'll want:

- Agent discovery files (llms.txt, agent.json) that describe your capabilities
- Machine-readable context optimized for agent consumption
- API endpoints designed for agent interaction
- Trust signals that agents can verify directly

I'm building some of this infrastructure now, experimenting with handshake protocols and capability discovery. But it's forward-looking work. The current agent architecture doesn't support any of it.

## The Honest Framing

If GEO vendors said: "We help you monitor how your SEO performance translates to AI citations, and we provide analytics specifically focused on AI assistant outputs" — that would be accurate and valuable.

But "Generative Engine Optimization" implies there's a different engine to optimize for. The name suggests a parallel to SEO: different algorithms, different signals, different techniques.

There isn't. The retrieval engine is the search index. The optimization techniques are SEO techniques. The main difference is the output format: instead of a ranked list of links, you get a synthesized response with citations.

## What To Do

**Keep doing SEO.** It's the reachability layer for agents. If you're not in the search index with good authority signals, agents won't find you.

**Structure your content clearly.** When agents fetch your pages, clear structure helps them extract relevant information. This is also good for SEO.

**Build for the future.** Implement llms.txt, agent.json, structured context files. When agents gain direct navigation, you'll be ready. Right now it doesn't matter, but the infrastructure is cheap to build.

**Don't pay premium prices for rebranded SEO dashboards.** The GEO tools might be useful for monitoring AI-specific outputs, but the optimization work is the same work you're already doing (or should be doing) for search.

**Watch for real architectural changes.** When Anthropic, OpenAI, or Google ship agents with direct navigation capabilities, the game changes. Until then, search indexes are the DNS layer.

## Conclusion

GEO as currently sold is SEO analytics with a different frontend. The optimization target is the search index. The signals are authority, relevance, and structure. The levers are content, links, and technical SEO.

The vendors aren't lying — their tools do measure AI visibility. But they're measuring an output that's determined by inputs they don't control and can't change. The search index decides what agents can see. Optimizing for agents means optimizing for the search index.

The real opportunity isn't monitoring the current system. It's building infrastructure for what comes after search-mediated access. When agents can navigate directly, discover capabilities, and verify trust independently — that's when genuinely new optimization disciplines emerge.

Until then, GEO is SEO. The output format changed. The input signals didn't.

---

Code and experiments at github.com/dev-exp-ai. I'm building MCP servers and experimenting with agent discovery protocols. If you're working on similar problems, I'd like to hear from you.
