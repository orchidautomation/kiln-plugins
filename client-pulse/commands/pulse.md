---
description: Get a comprehensive pulse check across all clients
argument-hint: [client|all] [days:7] [notes]
---

**IMMEDIATELY launch subagent(s). No narration. No intermediate output.**

Arguments: $ARGUMENTS
- args[0] = client (default: "all")
- args[1] = days (default: 7)
- args[2] = notes (optional)

---

## Single Client → One Subagent

If a specific client is provided (not "all"), launch ONE subagent immediately:

```
Task:
  subagent_type: "client-pulse:main"
  description: "[client] pulse"
  prompt: |
    Client: [client]
    Days: [days]
    Notes: [notes or "none"]

    Generate pulse report. Read config.yaml for client details.
```

---

## All Clients → Parallel Subagents

If "all" or no client specified:

1. Silently read config.yaml to get client list
2. Launch ONE Task per client in a SINGLE message (parallel execution)

```
Task #1: subagent_type: "client-pulse:main", description: "[client1] pulse"
Task #2: subagent_type: "client-pulse:main", description: "[client2] pulse"
Task #3: subagent_type: "client-pulse:main", description: "[client3] pulse"
```

3. After all return, combine into summary report

---

## Rules

- DO NOT narrate what you're doing
- DO NOT show config parsing, argument validation, etc.
- DO NOT explain the process
- JUST launch the Task(s) and present results
