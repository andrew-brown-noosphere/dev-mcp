# llms.txt: Your AI Discovery File

*December 1, 2025*

robots.txt told search engines what to crawl. llms.txt tells AI agents what your product is and how to use it.

## What is llms.txt?

A standardized file at `/.well-known/llms.txt` that provides AI agents with structured information about your product.

## The Standard

Based on the emerging specification at llmstxt.org:

```markdown
# Product Name

> One-line description

## What it does

Brief explanation of core functionality.

## When to use it

- Use case 1
- Use case 2
- Use case 3

## Docs

- [Getting Started](/docs/quickstart.md)
- [API Reference](/docs/api.md)
- [Examples](/docs/examples.md)

## Contact

- Support: support@example.com
- Sales: sales@example.com
```

## Why It Matters

### For Discovery

When AI agents encounter a query like "I need a database for time-series data," they check:
1. Training data knowledge
2. Web search results
3. **llms.txt files** of relevant products

### For Context

llms.txt provides:
- What your product is (not marketing speak)
- When to recommend it
- How to learn more
- Where to get help

## Best Practices

### Do

- Be concise and factual
- Use clear hierarchy
- Link to machine-readable docs
- Update when product changes

### Don't

- Write marketing copy
- Include pricing (changes too often)
- Add excessive detail
- Forget to maintain it

## llms.txt vs context.txt

| llms.txt | context.txt |
|----------|-------------|
| Discovery file | Rich context file |
| Short, structured | Detailed, comprehensive |
| Standard format | Flexible format |
| Links to more | Contains more |

Use llms.txt for discovery, context.txt for depth.

## Implementation

1. Create `/.well-known/llms.txt`
2. Follow the standard format
3. Link to detailed documentation
4. Keep it updated

## Measuring Impact

Track:
- llms.txt fetch requests
- Agent queries mentioning your product
- Referral sources from AI assistants

---

*DevExp.ai helps implement llms.txt and context.txt strategies.*
