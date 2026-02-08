# The Dirty Little Secret of GEO: It's All Built on SEO

*January 27, 2026*

I've been seeing a lot of funding announcements for "Generative Engine Optimization" startups. They claim to optimize your visibility in AI-generated responses. After running some experiments on how AI agents actually retrieve content, I think the entire category is built on a misunderstanding of the architecture.

**tl;dr: Agents don't have direct navigation. They're routed through search indexes. "Optimizing for AI" is just SEO with a different output format.**

## The Experiment

I wanted to understand how AI agents actually reach web content. So I built a simple handshake protocol:

```
1. Agent fetches /.well-known/agent.json
2. Agent extracts a context token from the response
3. Agent includes token in subsequent requests (proves it read step 1)
```

The hypothesis: if agents can navigate directly, they should be able to complete a multi-step HTTP transaction.

**Result: They can't.**

When I asked ChatGPT to complete this handshake, it explained its own architecture:

> "I do not behave like a browser or crawler. I behave like a retrieval-mediated agent. Search indexes are currently acting as the de facto DNS layer for agents."

## The Actual Agent Architecture

Most people assume this:

```
┌─────────┐     HTTP      ┌─────────────┐
│  Agent  │ ───────────── │  Website    │
└─────────┘               └─────────────┘
```

The reality is closer to this:

```
┌─────────┐
│  Agent  │
└────┬────┘
     │ query
     ▼
┌─────────────────────┐
│  Retrieval Provider │  (Bing, Google, internal corpus)
│  - Search index     │
│  - Allowlist        │
│  - Rate limiting    │
└──────────┬──────────┘
           │ URLs from search results
           ▼
┌─────────────────────┐
│  Fetch Layer        │  (proxied, sanitized)
│  - robots.txt check │
│  - Content parsing  │
│  - Token limits     │
└──────────┬──────────┘
           │ parsed content
           ▼
┌─────────────────────┐
│  Agent Context      │
└─────────────────────┘
```

The agent never "visits" your site. It queries a search index, gets URLs, and a separate system fetches and parses those URLs.

## Why This Matters for GEO

If the path to your content is:

```
Agent → Search Index → Your Content
```

Then "optimizing for agents" means optimizing for search indexes. Which is literally what SEO is.

### What GEO vendors claim to measure:

| GEO Metric | What It Actually Measures |
|------------|---------------------------|
| "AI mentions" | Presence in search index + authority signals |
| "Citation frequency" | Backlink profile + content relevance |
| "Brand visibility in AI" | SERP ranking (repackaged) |
| "AI sentiment" | Content structure + entity recognition |

### The retrieval path for each:

```python
def how_agent_finds_you():
    # Step 1: Query goes to search index
    results = search_index.query(user_intent)

    # Step 2: URLs are extracted from search results
    urls = [r.url for r in results if r.relevance > threshold]

    # Step 3: Content is fetched (if allowed)
    content = []
    for url in urls:
        if check_robots_txt(url) and url in allowlist:
            content.append(fetch_and_parse(url))

    # Step 4: Agent synthesizes response from content
    return llm.generate(context=content, query=user_intent)
```

At no point does the agent:
- Navigate to your site directly
- Discover your `llms.txt` or `agent.json` files autonomously
- Complete any handshake protocol
- Verify your identity or authority independently

It relies entirely on the search index for discovery and the fetch layer for access.

## The Technical Proof

Try this experiment yourself:

1. Create a page at `/agent-test.html` with unique content
2. Don't submit it to search engines
3. Don't link to it from anywhere indexed
4. Ask an AI agent to "go to yoursite.com/agent-test.html and tell me what's there"

**What you'll find:** Most agents either can't access it at all, or will search for your site and return information from *indexed* pages instead.

The agent cannot navigate to arbitrary URLs. It can only access what the retrieval layer allows.

## What Would Real Agent Optimization Look Like?

For agents to optimize differently than search engines, they would need:

### 1. Direct Navigation
```
Agent → URL → Content
```
No search intermediary. The agent decides where to go.

**Status:** Not implemented in major AI assistants.

### 2. Discovery Protocol
```
GET /.well-known/agent.json HTTP/1.1
Host: example.com
User-Agent: Claude/1.0

{
  "name": "Example Corp",
  "capabilities": ["api", "docs", "demo"],
  "auth_required": false,
  "context_url": "/context.txt"
}
```
A way for agents to discover capabilities before interacting.

**Status:** No standard. I'm experimenting with this.

### 3. Trust/Identity Layer
```
Agent verifies:
- Is this the canonical endpoint for "Example Corp"?
- Is this content signed by a known authority?
- What permissions does this endpoint grant?
```

**Status:** Doesn't exist. Agents trust whatever the search index returns.

## The Implications

### For GEO vendors:
You're building dashboards on top of SEO signals. That's fine, but call it what it is. "AI citation monitoring" is a feature, not a new optimization paradigm.

### For companies buying GEO:
You're paying for a view into how your SEO affects AI outputs. The optimization levers are the same ones you've always had:
- Content quality and relevance
- Backlink authority
- Technical SEO (crawlability, structure)
- Entity/brand recognition

### For the ecosystem:
The interesting work isn't monitoring the current system—it's building the infrastructure for agents to operate *without* search intermediaries. That's where actual differentiation will emerge.

## What I'm Building Instead

Rather than monitoring search-mediated AI access, I'm experimenting with:

1. **agent.json** - A discovery manifest for agent capabilities
2. **Context handshake** - Multi-step verification that an agent actually read your context
3. **Structured context files** - Machine-readable content optimized for agent consumption

These are forward bets. Right now, search indexes are the DNS layer for agents. But that's an architectural constraint, not a permanent law. When agents get direct navigation, the sites with handshake infrastructure will have an advantage.

## Conclusion

GEO as currently sold is SEO analytics with a different frontend. The optimization target is the same (search indexes), the signals are the same (authority, relevance, structure), and the levers are the same (content, links, technical SEO).

If you want to monitor how your SEO affects AI citations, these tools can help. But if you think you're optimizing for a "different engine," you're not. There's only one engine right now, and it's the search index.

The real opportunity is building for what comes after search-mediated access. That's where things get interesting.

---

*Code and experiments: [github.com/dev-exp-ai](https://github.com/dev-exp-ai)*

*Discuss on [Hacker News](#)*
