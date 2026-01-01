# The Kiln Plugins - Claude Code Instructions

## What This Repo Is

This is the **plugin marketplace** for The Kiln's GTM engineering team. It contains Claude Code plugins that aggregate client intelligence and automate workflows.

## Company Context

**The Kiln** (thekiln.com) is a certified Clay Elite Studio - GTM engineers who build automated revenue systems for clients.

**What GTM Engineers Do:**
- Build automated GTM systems (workflows connecting marketing, sales, RevOps)
- Custom AI agent development (enrichment pipelines, research agents, personalization)
- Systems integration (Salesforce, HubSpot, Clay, intent signal providers)
- Rapid prototyping & experimentation (ship fast, measure results)

## Available Plugins

### `/client-pulse [client] [days]`

Aggregates data from 6 sources into an actionable client report:

| Source | What It Pulls |
|--------|---------------|
| Slack `ext-*` | Client questions, requests, commitments |
| Monday.com | Active tasks, subtasks, assignments |
| Fathom | Meeting summaries, action items |
| Gmail | Client email threads |
| Calendar | Upcoming meetings, touchpoint tracking |
| Slack `int-*` | Internal blockers, context |

**Usage:**
```
/client-pulse              # All clients
/client-pulse sendoso      # Specific client
/client-pulse profound 14  # Last 14 days
```

## Configuration

**All client-specific data lives in `config.yaml`** (gitignored, personal to each user).

```yaml
# Your info
me:
  name: "Your Name"
  role: "GTM Engineer"
  slack_id: "U12345678"

# Your clients
clients:
  client_key:
    slack:
      external: {id: "C...", name: "ext-..."}
      internal: {id: "C...", name: "int-..."}
    monday:
      board_id: 123456789
    domains: ["client.com"]
    keywords: ["Client", "Contact Name"]
    contacts:
      - name: "Jane Doe"
        slack_id: "U..."
        role: "Primary POC"
```

**To customize:** Copy `config.example.yaml` → `config.yaml` and fill in your data.

## MCP Setup

This repo uses **one MCP** for everything:

```bash
claude mcp add rube-kiln --type http --url https://rube.app/mcp
```

Rube (Composio) provides:
- Slack tools (fetch messages, threads, send to internal channels)
- Monday.com tools (list boards, items, create tasks, update status)
- Gmail tools (fetch emails, create drafts)
- Google Calendar tools (list events, create meetings)

**Fathom** uses direct API calls with `$FATHOM_API_KEY` (in `.env`).

## Tool Permissions Philosophy

| Action | Enabled | Reasoning |
|--------|---------|-----------|
| Read | ✅ | Can't break anything |
| Create | ✅ | New items, doesn't touch existing |
| Update | ⚠️ Selective | Only status, comments, assignments |
| Delete | ❌ | Permanent data loss |
| Send email directly | ❌ | Use drafts with human review |

See `TEAM-SETUP.md` for the full tool permission checklist.

## Safety Rules for Agents

1. **Slack:** Only post to `int-*` channels, NEVER `ext-*` client channels
2. **Email:** Create DRAFTS only, never send directly
3. **Calendar:** Confirm before creating invites with external attendees
4. **Monday:** Show changes before updating items

## File Structure

```
kiln-plugins/
├── CLAUDE.md              # This file (repo-level context)
├── TEAM-SETUP.md          # Team onboarding + tool permissions
├── .mcp.json              # Rube MCP config
├── .gitignore             # Protects .env and config.yaml
│
└── client-pulse/
    ├── CLAUDE.md          # Plugin-specific agent instructions
    ├── config.yaml        # YOUR clients (gitignored)
    ├── config.example.yaml # Template
    ├── .env               # YOUR API keys (gitignored)
    ├── .env.example       # Template
    ├── commands/
    │   └── client-pulse.md
    ├── agents/
    │   └── client-pulse.md
    └── hooks/
        └── hooks.json
```

## How to Find IDs

| ID Type | How to Find |
|---------|-------------|
| Slack channel | Right-click channel → Copy link → extract `C12345678` |
| Slack user | View profile → More → Copy member ID |
| Monday board | From URL: `monday.com/boards/[THIS_NUMBER]` |

## Quick Commands

```bash
# List MCP connections
claude mcp list

# Run with plugin
claude --plugin-dir ~/kiln-plugins/client-pulse

# Test client pulse
/client-pulse
```

## Troubleshooting

| Issue | Fix |
|-------|-----|
| "No active connection for toolkit=slack" | Reconnect in Rube dashboard |
| "FATHOM_API_KEY not set" | Check `.env` file |
| Wrong channel data | Verify IDs in `config.yaml` |
| MCP not found | Run `claude mcp add rube-kiln ...` |
