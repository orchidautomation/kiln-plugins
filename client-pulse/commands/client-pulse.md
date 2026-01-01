---
description: Get a comprehensive pulse check across all clients
argument-hint: [client|all] [days:7] [notes]
---

Launch the `client-pulse` subagent to generate comprehensive client pulse reports.

**Arguments:** $ARGUMENTS
- First arg: Client filter (`sendoso`, `profound`, `windsurf`, or `all`) - default: all
- Second arg: Days to look back - default: 7
- Third arg (optional): Notes - freeform context (e.g., "call prep", "look for blockers")

---

## Invocation Strategy

### If client is `all` (or not specified) → Launch 3 PARALLEL subagents

**CRITICAL: Use a SINGLE message with 3 Task tool calls to run them in parallel.**

```
Task tool #1:
  subagent_type: "client-pulse"
  description: "Sendoso pulse check"
  prompt: |
    Generate a client pulse report for **Sendoso only**.
    Days: [number from args, default 7]
    Notes: [if provided]

    Read config.yaml first. Be thorough - expand all threads in the date range.
    Focus ONLY on Sendoso data sources.

Task tool #2:
  subagent_type: "client-pulse"
  description: "Profound pulse check"
  prompt: |
    Generate a client pulse report for **Profound only**.
    Days: [number from args, default 7]
    Notes: [if provided]

    Read config.yaml first. Be thorough - expand all threads in the date range.
    Focus ONLY on Profound data sources.

Task tool #3:
  subagent_type: "client-pulse"
  description: "Windsurf pulse check"
  prompt: |
    Generate a client pulse report for **Windsurf only**.
    Days: [number from args, default 7]
    Notes: [if provided]

    Read config.yaml first. Be thorough - expand all threads in the date range.
    Focus ONLY on Windsurf data sources.
```

### If specific client → Launch 1 subagent

```
Task tool:
  subagent_type: "client-pulse"
  description: "[Client] pulse check"
  prompt: |
    Generate a client pulse report for **[Client] only**.
    Days: [number from args, default 7]
    Notes: [if provided]

    Read config.yaml first. Be thorough - expand all threads in the date range.
    Focus ONLY on [Client] data sources.
```

---

## After Subagent(s) Return

### For single client:
Present the subagent's report directly.

### For "all" clients:
Combine the 3 reports into a unified summary:

```markdown
# Client Pulse - All Clients
**Generated:** [timestamp] | **Period:** Last [N] days

## Quick Status

| Client | Health | Urgent | Summary |
|--------|--------|--------|---------|
| 📦 Sendoso | 🟢/🟡/🔴 | [count] | [one-liner] |
| 🔮 Profound | 🟢/🟡/🔴 | [count] | [one-liner] |
| 🌊 Windsurf | 🟢/🟡/🔴 | [count] | [one-liner] |

---

## All Urgent Items

[Aggregated list sorted by age - oldest first]

| Client | Item | Asked By | Age | Link |
|--------|------|----------|-----|------|

---

## By Client

### 📦 Sendoso
[Key points from report]

### 🔮 Profound
[Key points from report]

### 🌊 Windsurf
[Key points from report]

---

## Team Workload

| Person | Sendoso | Profound | Windsurf | Total |
|--------|---------|----------|----------|-------|

## Recommended Next Actions

1. [Top priority]
2. [Second]
3. [Third]
```

---

## Why Subagents?

- **Parallel execution**: All 3 clients fetched simultaneously
- **Isolated context**: Each subagent focuses on one client
- **Thoroughness**: Each agent can take whatever time needed
- **MCP access**: Subagents inherit ALL tools
