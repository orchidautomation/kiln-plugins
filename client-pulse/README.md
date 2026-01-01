# Client Pulse Plugin

A Claude Code plugin that aggregates data from multiple sources to provide comprehensive client pulse checks.

## What It Does

Pulls data from **6 sources** and generates an actionable report:

| Source | What It Extracts |
|--------|------------------|
| **Slack** (external channels) | Client questions, unanswered items, commitments, sentiment |
| **Slack** (internal channels) | Team discussions, blockers, context |
| **Monday.com** | Active tasks, subtasks, overdue items |
| **Fathom** | Meeting transcripts, summaries, action items |
| **Google Calendar** | Upcoming meetings, days since last touchpoint |
| **Gmail** | Client email threads |

### Key Features

- **Thorough thread analysis**: Expands ALL threads within the lookback period
- **Resolution tracking**: Distinguishes truly open items from resolved conversations
- **Parallel execution**: Runs 3 subagents simultaneously for "all clients" mode
- **Smart filtering**: Separates external calls (by domain) from internal syncs (by keyword)
- **Permalinks**: Every actionable item includes a direct Slack link
- **Auto-loaded API keys**: SessionStart hook loads environment variables automatically

## Installation

### Option 1: Add marketplace (recommended)

```bash
# Add The Kiln marketplace
/plugin marketplace add [github-username]/kiln-plugins

# Install client-pulse plugin
/plugin install client-pulse@kiln-plugins
```

### Option 2: Manual installation

```bash
# Copy to your Claude Code config
cp -r client-pulse ~/.claude/plugins/

# Or symlink
ln -s /path/to/kiln-plugins/client-pulse ~/.claude/plugins/client-pulse
```

## Setup

### 1. Configure environment variables

```bash
cd client-pulse
cp .env.example .env
```

Edit `.env`:
```
FATHOM_API_KEY=your_fathom_api_key_here
```

Get your Fathom API key from: https://fathom.video/settings/api

### 2. Configure your clients

Edit `config.yaml` with your:
- Client names, domains, and keywords
- Slack channel IDs (find via Slack's "Copy link" or API)
- Monday.com board IDs
- Team member Slack IDs
- Contact details

### 3. Set up required MCP servers

```bash
# Monday.com MCP (via Gumloop or direct)
claude mcp add monday npx -y @mondaydotcomorg/monday-mcp-server

# OR via Gumloop (if you have a Gumloop account)
claude mcp add monday npx mcp-remote@0.1.12 https://mcp.gumloop.com/monday/YOUR_CONFIG

# Rube MCP (Composio) - for Slack, Gmail, Calendar
claude mcp add rube-kiln [your-rube-config]
```

### 4. Verify setup

```bash
claude mcp list  # Should show monday and rube-kiln as connected
```

## Usage

```bash
# All clients (3 parallel subagents)
/client-pulse

# Specific client
/client-pulse sendoso
/client-pulse profound
/client-pulse windsurf

# Custom timeframe (days)
/client-pulse sendoso 14

# With context notes
/client-pulse all 7 "prep for weekly sync"
```

## Output

The report includes:

- **Health status**: 🟢/🟡/🔴 per client
- **Unanswered items**: With permalinks and age
- **Commitments tracking**: What we promised, status
- **Monday tasks**: Active, overdue, stuck
- **Recent calls**: Summaries and action items
- **Calendar**: Next meeting, days since last
- **Recommended actions**: Prioritized next steps

## Configuration Reference

### config.yaml

```yaml
clients:
  your_client:
    display_name: "Client Name"
    emoji: "📦"
    domains: ["client.com"]           # For Fathom/email filtering
    keywords: ["Client", "Contact"]   # For internal sync filtering
    contacts:
      - name: "Main Contact"
        slack_id: "U12345"
        role: "Primary POC"
    slack:
      external: {id: "C123", name: "ext-client"}
      internal: {id: "C456", name: "int-client"}
    monday:
      board_id: 12345
      board_name: "Client Board"

team:
  members:
    - id: "U12345"
      name: "Your Name"
      email: "you@company.com"

behavior:
  default_lookback_days: 7
  expand_all_threads_in_range: true
  urgent_thresholds:
    unanswered_hours: 24
    overdue_task_days: 0
```

### settings.json

Includes:
- **Permissions**: Auto-allow for curl, jq, date, MCP tools
- **Hooks**: SessionStart loads .env automatically

## How the Hook Works

On session start, `hooks/load-env.sh`:
1. Loads `.env` file
2. Exports `FATHOM_API_KEY` to the session
3. Persists to `$CLAUDE_ENV_FILE` for subsequent commands

You'll see `"Environment loaded (FATHOM_API_KEY set)"` in session output.

## File Structure

```
client-pulse/
├── .claude-plugin/
│   └── plugin.json       # Plugin manifest (ONLY this goes here)
├── commands/
│   └── client-pulse.md   # Slash command
├── agents/
│   └── client-pulse.md   # Agent system prompt
├── hooks/
│   └── hooks.json        # Hook configuration
├── scripts/
│   ├── load-env.js       # Cross-platform env loader (Node.js)
│   ├── load-env.sh       # Mac/Linux fallback
│   ├── load-env.ps1      # Windows PowerShell fallback
│   └── load-env.cmd      # Windows CMD fallback
├── config.yaml           # Client & behavior config
├── .env.example          # Environment template
├── .env                  # Your actual keys (gitignored)
└── README.md
```

**Important:** Only `plugin.json` goes in `.claude-plugin/`. All other directories (`commands/`, `agents/`, `hooks/`) go at the plugin root level.

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "FATHOM_API_KEY not set" | Check `.env` exists and has valid key |
| "Slack: MCP connection unavailable" | Run `claude mcp list`, verify rube-kiln connected |
| "Monday: MCP connection unavailable" | Run `claude mcp add monday ...` |
| Hook not loading | Check `chmod +x hooks/load-env.sh` |
| Wrong channel data | Verify channel IDs in config.yaml match Slack |

## Related Commands

These commands work well with client-pulse but are separate plugins:

- `/prep [client]` - Quick call prep before meetings
- `/fathom [client]` - Direct Fathom lookup
- `/slack-check [channel]` - Quick single-channel scan
- `/tasks` - Monday.com task recommendations

---

Built by The Kiln - GTM Engineering
