---
description: Get a comprehensive pulse check across all clients
argument-hint: [client|all] [days:7] [notes]
---

Launch the `client-pulse` subagent to generate comprehensive client pulse reports.

**Arguments:** $ARGUMENTS
- First arg: Client filter (client key from config.yaml, or `all`) - default: all
- Second arg: Days to look back (1-365) - default: 7
- Third arg (optional): Notes - freeform context (e.g., "call prep", "look for blockers")

---

## Step 1: Read Configuration (Silently)

**The config is pre-loaded via SessionStart hook - look for `<client-pulse-config>` tags in the conversation context.**

**DO NOT narrate config loading. DO NOT list what you found. Just parse silently and proceed.**

If pre-loaded config exists in context:
- Parse the YAML content from `<client-pulse-config>` tags
- Extract client keys, display names, emojis, default lookback days
- Proceed directly to Step 2

If NO pre-loaded config (fallback only):
- Glob for `**/client-pulse/config.yaml`, Read it, parse YAML
- Still don't narrate - just proceed to validation

---

## Step 2: Validate Arguments (Silently)

**Parse and validate silently - only speak if there's an error.**

Parse from $ARGUMENTS:
- args[0] = client filter (default: "all")
- args[1] = days (default from config, usually 7)
- args[2] = notes (optional)

**If valid:** Proceed silently to Step 3. Don't list what you validated.

**If invalid client:** Show error and stop:
```
Unknown client '[name]'. Available: [list from config]
```

---

## Step 3: Invocation Strategy

### If client is `all` (or not specified) → Launch N PARALLEL subagents

**CRITICAL: Dynamically launch one subagent per client in config.yaml.**

The number of subagents depends on how many clients are in the user's config.

**Example: User has 3 clients (sendoso, profound, windsurf)**
```
Task tool #1:
  subagent_type: "client-pulse:main"
  description: "sendoso pulse check"
  prompt: |
    Generate a client pulse report for **sendoso only**.
    Days: [days from args]
    Notes: [if provided]

    Config: Read config.yaml from plugin directory.
    Focus ONLY on data sources for client "sendoso".

Task tool #2:
  subagent_type: "client-pulse:main"
  description: "profound pulse check"
  prompt: |
    Generate a client pulse report for **profound only**.
    Days: [days from args]
    Notes: [if provided]

    Config: Read config.yaml from plugin directory.
    Focus ONLY on data sources for client "profound".

Task tool #3:
  subagent_type: "client-pulse:main"
  description: "windsurf pulse check"
  prompt: |
    Generate a client pulse report for **windsurf only**.
    Days: [days from args]
    Notes: [if provided]

    Config: Read config.yaml from plugin directory.
    Focus ONLY on data sources for client "windsurf".
```

**Example: User has 5 clients → Launch 5 parallel subagents**
**Example: User has 1 client → Launch 1 subagent**

The command adapts to whatever clients are in the user's `config.yaml`.

**Template for each client:**
```
Task tool:
  subagent_type: "client-pulse:main"
  description: "[client_key] pulse check"
  prompt: |
    Generate a client pulse report for **[client_key] only**.
    Days: [days from args]
    Notes: [if provided]

    Config: Read config.yaml from plugin directory.
    Focus ONLY on data sources for client "[client_key]".
```

**IMPORTANT: Use a SINGLE message with ALL Task tool calls to run them in parallel.**

---

### If specific client → Launch 1 subagent

```
Task tool:
  subagent_type: "client-pulse:main"
  description: "[client_key] pulse check"
  prompt: |
    Generate a client pulse report for **[client_key] only**.
    Days: [days from args]
    Notes: [if provided]

    Config: Read config.yaml from plugin directory.
    Focus ONLY on [client_key] data sources.
```

---

## Step 4: Aggregation (After Subagent(s) Return)

### For single client:
Present the subagent's report directly with no modifications.

### For "all" clients:
Combine reports into a unified summary. **Use data from config.yaml for client names and emojis.**

```markdown
# Client Pulse - All Clients
**Generated:** [timestamp] | **Period:** Last [N] days

---

## Quick Status

| Client | Health | Urgent | Top Priority |
|--------|--------|--------|--------------|
| [emoji] [display_name] | [🟢/🟡/🔴] | [count] | [one-liner from report] |
| ... (one row per client from config) |

**Health Legend:**
- 🟢 No urgent items, client happy
- 🟡 Items need attention within 48h
- 🔴 Urgent items, potential client frustration

---

## All Urgent Items (Sorted by Age - Oldest First)

| Client | Item | Asked By | Age | Link |
|--------|------|----------|-----|------|
| [emoji] [name] | [item description] | [client name] | [N days] | [permalink] |

---

## By Client

### [emoji] [display_name]

**Health:** [🟢/🟡/🔴] [one-line summary]

**Key Points:**
- [Unanswered items count]
- [Open commitments count]
- [Active Monday tasks]
- [Days since last touchpoint]

**Top Actions:**
1. [From report]
2. [From report]

---

(Repeat for each client)

---

## Team Workload Matrix

| Person | [Client 1] | [Client 2] | [Client 3] | Total |
|--------|------------|------------|------------|-------|
| [Team member 1] | [task count] | [task count] | [task count] | [sum] |
| [Team member 2] | [task count] | [task count] | [task count] | [sum] |

*Note: Team members from config.team, task counts from Monday.com data*

---

## Recommended Next Actions (Cross-Client Priority)

Sorted by urgency across all clients:

1. **[Client]:** [Most urgent item] - [permalink]
2. **[Client]:** [Second priority] - [permalink]
3. **[Client]:** [Third priority] - [permalink]

---

## Quick Copy for Internal Slack

**Ready to paste summary (only for clients with open items):**

```
Team update from pulse check:

[emoji] **[Client 1]:**
• [Open item 1] - needs response by [date]
• [Open item 2] - [context]

[emoji] **[Client 2]:**
• All clear

[emoji] **[Client 3]:**
• [Open item] - [age] days waiting

**Top 3 Actions:**
1. [Action 1]
2. [Action 2]
3. [Action 3]
```
```

---

## Why This Approach?

### Dynamic Client Discovery
- Reads `config.yaml` to find all clients
- No hardcoded client list - adapts to each team member's config
- New clients automatically included when added to config

### Parallel Subagents
- All clients fetched simultaneously
- Each subagent has isolated context window
- Thoroughness: Each agent can expand all threads without running out of context
- MCP access: Subagents inherit all Rube tools

### Aggregation Benefits
- Unified view across all clients
- Cross-client priority ranking
- Team workload visibility
- Ready-to-paste Slack updates

---

## Error Handling

### If config.yaml not found:
```
Config file not found. Please create one:

  cd ~/kiln-plugins/client-pulse
  cp config.example.yaml config.yaml

Then edit config.yaml to add your clients.
```

### If a subagent fails:
- Report partial results from successful subagents
- Note which client failed in the summary
- Still generate cross-client aggregation from available data

### If all subagents fail:
- Report the error clearly
- Suggest checking MCP connection: `claude mcp list`
- Suggest reconnecting apps in Rube dashboard
