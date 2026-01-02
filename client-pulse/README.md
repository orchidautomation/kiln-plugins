# Client Pulse Plugin

A **self-contained** Claude Code plugin that aggregates client intelligence from 6 data sources into actionable reports. Designed for GTM engineers managing multiple client accounts.

## What It Does

Pulls data from **6 sources** and generates a comprehensive pulse report:

| Source | What It Extracts |
|--------|------------------|
| **Slack** (ext-* channels) | Client questions, unanswered items, commitments, sentiment |
| **Slack** (int-* channels) | Team discussions, blockers, context |
| **Monday.com** | Active tasks, subtasks, overdue items, assignments |
| **Fathom** | Meeting transcripts, summaries, action items |
| **Google Calendar** | Upcoming meetings, days since last touchpoint |
| **Gmail** | Client email threads (rarely used) |

### Key Features

- **Self-contained**: All MCPs bundled - no global setup needed
- **Thorough thread analysis**: Expands ALL threads within the lookback period
- **Resolution tracking**: Distinguishes truly open items from resolved conversations
- **Parallel execution**: Runs multiple subagents simultaneously for "all clients" mode
- **Smart Fathom filtering**: External calls by domain, internal syncs by keyword
- **Permalinks**: Every actionable item includes a direct Slack link

---

## Prerequisites

Before installing, you need:

1. **Claude Code** installed (`npm install -g @anthropic-ai/claude-code` or via installer)
2. **Fathom account** with API access enabled
3. **Slack workspace** with The Kiln connected
4. **Monday.com** workspace (optional but recommended)

---

## Installation

### Step 1: Clone the Repository

```bash
git clone https://github.com/orchidautomation/kiln-plugins.git
cd kiln-plugins/client-pulse
```

Or if you already have the repo:
```bash
cd ~/path/to/kiln-plugins/client-pulse
```

### Step 2: Create Your Environment File

```bash
cp .env.example .env
```

Edit `.env` and add your Fathom API key:
```bash
# Get from: https://fathom.video/settings/api
FATHOM_API_KEY=your_fathom_api_key_here
```

### Step 3: Create Your Configuration

**Option A: Interactive Setup (Recommended)**
```bash
/setup
```
The setup wizard will:
- Fetch your Slack channels and Monday boards automatically
- Guide you through adding each client
- Generate your `config.yaml`

**Option B: Manual Setup**
```bash
cp config.example.yaml config.yaml
```
Edit `config.yaml` with your information. See [Configuration Guide](#configuration-guide) below.

### Step 4: First Run - OAuth Setup

Start Claude Code from the plugin directory:
```bash
cd ~/path/to/kiln-plugins/client-pulse
claude
```

On first run, you'll be prompted to authenticate:
1. **Rube (Composio)** - Click the OAuth link to connect Slack, Gmail, and Calendar
2. **Monday.com** - Already configured via Gumloop URL

Check MCP status:
```
/mcp
```

You should see:
```
plugin:client-pulse:rube-kiln     ✓ connected
plugin:client-pulse:gumloop-monday ✓ connected
```

### Step 5: Test the Plugin

```bash
/pulse sendoso 7
```

---

## Configuration Guide

### Finding Slack Channel IDs

1. **Right-click** the channel in Slack
2. Select **"View channel details"** or **"Copy link"**
3. The ID is in the URL: `slack.com/archives/C12345678` → `C12345678`

Or use Slack API:
```bash
# If you have Slack CLI
slack channels list
```

### Finding Slack User IDs

1. Click on a user's profile
2. Click **"More"** (three dots)
3. Select **"Copy member ID"**

### Finding Monday.com Board IDs

1. Open the board in Monday.com
2. Look at the URL: `monday.com/boards/8185023177` → `8185023177`

### config.yaml Structure

```yaml
# Your info
me:
  name: "Your Name"
  role: "GTM Engineer"
  email: "you@thekiln.com"
  slack_id: "U12345678"

# Team members (for attribution)
team:
  members:
    - id: "U12345678"
      name: "Your Name"
      email: "you@thekiln.com"
    - id: "U87654321"
      name: "Teammate"
      email: "teammate@thekiln.com"

# Client configuration
clients:
  client_key:                    # Use lowercase, no spaces
    display_name: "Client Name"
    emoji: "📦"
    description: "What they do"

    domains:                     # For Fathom external call filtering
      - "client.com"

    keywords:                    # For Fathom internal sync filtering
      - "Client"
      - "Contact Name"
      - "Product Name"

    contacts:
      - name: "Main Contact"
        slack_id: "U07US7CNNGJ"  # Optional but helpful
        role: "Primary POC"

    slack:
      external:
        id: "C080HCLK129"        # ext-* channel ID
        name: "ext-client"
      internal:
        id: "C08KQP7UT7E"        # int-* channel ID
        name: "int-client"

    monday:
      board_id: 8185023177
      board_name: "Client // Projects"

# Data source limits
data_sources:
  slack:
    external_channel_limit: 200  # Messages to fetch
    internal_channel_limit: 100
  monday:
    task_limit: 100
  calendar:
    lookahead_days: 14

# Behavior settings
behavior:
  default_lookback_days: 7
  expand_all_threads_in_range: true
  urgent_thresholds:
    unanswered_hours: 24
    overdue_task_days: 0
```

---

## Usage

### Basic Commands

```bash
# All clients (parallel subagents)
/pulse

# Specific client
/pulse sendoso
/pulse profound

# Custom timeframe
/pulse sendoso 14    # Last 14 days

# With context notes
/pulse all 7 "prep for weekly sync"
```

### Command Syntax

```
/pulse [client] [days] [notes]
```

| Argument | Default | Description |
|----------|---------|-------------|
| `client` | `all` | Client key from config.yaml, or `all` |
| `days` | `7` | Lookback period (1-365) |
| `notes` | none | Context for the report (e.g., "call prep") |

---

## Output Format

The report includes:

```markdown
# Client Pulse: Sendoso 📦
**Generated:** 2025-01-02 10:30 AM | **Period:** Last 7 days

## Health: 🟢 Stable - No urgent items

## Client Communication Analysis
**Channel:** #ext-thekiln-sendoso | **Messages:** 45

### Unanswered Client Items [2]
| Item | Asked By | Date | Link | Age |
|------|----------|------|------|-----|
| Question about API limits | Hannah | Dec 28 | [link] | 5 days |

### Commitments We Made [3]
| Promise | Who | When | Status |
|---------|-----|------|--------|
| Send updated docs | Brandon | Dec 27 | Pending |

## Monday.com Tasks
**Active:** 8 | **Overdue:** 1 | **Stuck:** 0

## Recent Calls (Fathom)
### Client Sync - Dec 29
**Summary:** Discussed Q1 roadmap...
**Action Items:**
- [ ] Send proposal by Friday - Brandon

## Recommended Actions
1. Respond to Hannah's API question
2. Complete overdue Monday task
3. Schedule Q1 planning call
```

---

## FAQ

### How does authentication work?

The plugin uses **OAuth** via Rube (Composio) for Slack, Gmail, and Calendar. On first run:
1. You'll see a link in the terminal
2. Click it to open browser
3. Authorize the requested permissions
4. Return to terminal - it's now connected

Monday.com uses a pre-configured Gumloop URL that handles auth automatically.

### Do I need to set up global MCPs?

**No.** The plugin is self-contained. All MCPs are defined in `.mcp.json` and scoped to the plugin. You don't need to run `claude mcp add` for anything.

### Can multiple team members use this?

**Yes.** Each person:
1. Clones the repo
2. Creates their own `.env` (with their Fathom API key)
3. Creates their own `config.yaml` (with their clients)
4. Authenticates via OAuth on first run

The `.env` and `config.yaml` are gitignored, so each person has their own config.

### How does Fathom filtering work?

Fathom meetings are filtered in two ways:

| Meeting Type | How It's Detected | Filtering Method |
|--------------|-------------------|------------------|
| **External calls** | `calendar_invitees_domains_type: "one_or_more_external"` | Matches attendee email domains against `clients.[client].domains` |
| **Internal syncs** | `calendar_invitees_domains_type: "only_internal"` | Searches transcript for `clients.[client].keywords` |

### Why does the agent use bash scripts for Fathom?

Claude Code runs in zsh, which has issues parsing date commands like `$(date -v-7d ...)`. The bash script approach:
1. Writes a script to `/tmp/fathom_fetch.sh`
2. Executes it with `/bin/bash`
3. Ensures proper date calculation

### Can I add more clients?

Yes! Just add them to `config.yaml`:

```yaml
clients:
  existing_client:
    # ...

  new_client:
    display_name: "New Client"
    emoji: "🚀"
    domains: ["newclient.com"]
    # ... rest of config
```

Then run `/pulse new_client` to test.

### What if a data source fails?

The plugin is designed for **graceful degradation**:

| Source | If It Fails |
|--------|-------------|
| Slack ext-* | **Critical** - Report fails |
| Monday.com | Continue, note "Monday unavailable" |
| Fathom | Continue, note "Fathom unavailable" |
| Calendar | Skip calendar section |
| Slack int-* | Skip internal section |
| Gmail | Skip email section |

**Minimum viable report:** Slack ext-* alone can generate unanswered items + commitments.

### How do I update the plugin?

```bash
cd ~/path/to/kiln-plugins
git pull origin main
```

Your `.env` and `config.yaml` won't be affected (they're gitignored).

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "FATHOM_API_KEY not set" | Check `.env` exists and has valid key |
| "rube-kiln needs authentication" | Click the OAuth link shown in terminal |
| "No active connection for toolkit=slack" | Re-authenticate Rube via OAuth |
| "plugin:client-pulse:gumloop-monday not connected" | Check internet connection, try `/mcp` to refresh |
| "Unknown client 'xyz'" | Add client to `config.yaml` or check spelling |
| Wrong channel data | Verify channel IDs match Slack (right-click → Copy link) |
| Fathom returns empty | Check date range, verify API key at fathom.video/settings |
| Slow performance | Reduce `external_channel_limit` or `days` parameter |
| "Permission denied" for bash | Run `chmod +x scripts/*.sh` |

### Checking MCP Status

```bash
/mcp
```

Expected output:
```
plugin:client-pulse:rube-kiln      ✓ connected
plugin:client-pulse:gumloop-monday ✓ connected
```

### Verifying Environment

```bash
# Check .env is loaded
cat .env | grep -v "^#" | grep "="

# Test Fathom API
curl -s "https://api.fathom.ai/external/v1/meetings?limit=1" \
  -H "X-Api-Key: YOUR_KEY" | jq '.items | length'
```

### Resetting OAuth

If Rube auth gets into a bad state:
1. Go to https://app.composio.dev/connections
2. Revoke the Slack/Gmail/Calendar connections
3. Run `/pulse` again to re-trigger OAuth

---

## File Structure

```
client-pulse/
├── .claude-plugin/
│   └── plugin.json           # Plugin manifest
├── .claude/
│   └── settings.json         # Permission auto-allows
├── agents/
│   └── main.md               # Main agent instructions
├── commands/
│   └── pulse.md              # /pulse command handler
├── hooks/
│   └── hooks.json            # SessionStart hook config
├── scripts/
│   └── load-env.js           # Cross-platform env loader
├── .mcp.json                  # Plugin MCP servers (rube-kiln, gumloop-monday)
├── .env.example              # Environment template
├── .env                      # Your API keys (gitignored)
├── config.example.yaml       # Configuration template
├── config.yaml               # Your config (gitignored)
├── CLAUDE.md                 # Agent reference docs
└── README.md                 # This file
```

---

## Security Notes

- `.env` and `config.yaml` are **gitignored** - your secrets stay local
- Fathom API key is stored locally, not in any cloud service
- OAuth tokens are managed by Rube/Composio
- The plugin only **reads** from Slack - it won't post to ext-* channels
- Monday.com writes are disabled by default (read-only)

---

## Contributing

1. Fork the repo
2. Create a feature branch
3. Test with your own config
4. Submit PR to `main`

---

Built by **The Kiln** - GTM Engineering Agency

https://thekiln.com
