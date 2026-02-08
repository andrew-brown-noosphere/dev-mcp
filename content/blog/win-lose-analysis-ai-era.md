# Win/Loss Analysis in the AI Era

*January 28, 2026*

Traditional win/loss analysis interviewed humans. In the agentic era, you need to understand why AI agents did or didn't recommend you.

## The Old Model

Traditional win/loss:
1. Sales loses a deal
2. Interview the buyer
3. Ask "why did you choose X over us?"
4. Compile qualitative feedback
5. Adjust messaging/product

**Problem:** You're interviewing the human, but an AI agent influenced the decision.

## The New Reality

Modern evaluation flow:
1. Developer asks AI: "What database should I use for X?"
2. Agent evaluates options (MCP, training data, web search)
3. Agent recommends Product A over Product B
4. Developer follows recommendation (or validates it)
5. You lose before your sales team knows there was a deal

## Agentic Win/Loss Analysis

### What to Track

**Agent Discovery:**
- Was your product in the agent's consideration set?
- Did the agent have accurate information about you?
- Were you MCP accessible for evaluation?

**Agent Evaluation:**
- Did the agent test your product?
- What criteria did it use?
- How did you compare on benchmarks?

**Agent Recommendation:**
- Were you recommended? Why or why not?
- What was said about your product?
- What was said about competitors?

### How to Track

1. **DEO Telemetry:** Track MCP server interactions
2. **Agent Query Analysis:** What queries mention you?
3. **Competitive Monitoring:** Track competitor MCP activity
4. **User Interviews:** "How did you find us?"

## The New Questions

| Old Win/Loss | Agentic Win/Loss |
|--------------|------------------|
| "Why did you choose X?" | "What did the agent recommend?" |
| "What features mattered?" | "What did the agent evaluate?" |
| "Who else did you consider?" | "What did the agent compare?" |
| "What would change your mind?" | "What would change the agent's recommendation?" |

## Winning in Agentic Evaluation

### Be Discoverable
- llms.txt
- Training data presence
- Accurate positioning

### Be Evaluable
- MCP server
- Demo environments
- Benchmark data

### Be Recommendable
- Win on merit
- Clear use cases
- Technical accuracy

## The Feedback Loop

1. Track agent recommendations
2. Identify why you lost
3. Improve MCP/content/product
4. Measure recommendation changes
5. Repeat

---

*DevExp.ai provides agentic win/loss analysis through VoyantIO telemetry.*
