# The Kiln Plugins - Claude Code Instructions

## What This Repo Is

This is the **plugin marketplace** for The Kiln's GTM engineering team. It contains Claude Code plugins that aggregate client intelligence and automate workflows.

---

## Company & Role Context

### What is a GTM Engineer?

A **GTM Engineer** (Go-to-Market Engineer) designs, builds, and automates revenue-generating systems using AI and automation. We act as an internal product team for go-to-market organizations, focusing on scaling and automating systems that drive sales, marketing, and customer success.

**Core Responsibilities:**
- **Build automated GTM systems:** Create sophisticated workflows connecting marketing, sales, and RevOps, replacing manual processes with scalable automation
- **Rapid prototyping & experimentation:** Quickly identify problems, create specs, ship prototypes, and scale solutions based on measured results (meetings booked, hours saved, pipeline generated)
- **Custom AI agent development:** Build AI-powered enrichment pipelines, research agents, and personalization systems that find unique datapoints at scale
- **Systems integration:** Orchestrate data across CRM platforms (Salesforce, HubSpot), enrichment tools, intent signal providers, and the entire GTM tech stack
- **Data fluency & cleanliness:** Ensure data used in automations is clean, useful, and consistently available across teams
- **Template & scale workflows:** Build repeatable systems that can be rolled out org-wide, turning successful experiments into standardized processes

**Skills & Approach:**
- **Technical automation:** Expert in no-code/low-code tools (especially Clay), APIs, webhooks, and AI to build scalable workflows without traditional engineering resources
- **Systems thinking:** Understand how GTM systems interconnect and where bottlenecks slow down execution
- **Collapse traditional roles:** Automate work traditionally done by SDRs, BDRs, and sales ops—turning weeks of manual work into automated flows
- **10x efficiency mindset:** Enable teams to scale 10x by automating repeatable tasks, freeing them to focus on high-impact, creative, strategic work

**Impact on Revenue Teams:**
- Close the gap between ideas and execution—from quarters to days or hours
- Turn chaos into flow—generate and close pipeline opportunities more efficiently with fewer people
- Enable rapid experimentation with new data sources, signals, and outreach strategies

### About The Kiln

**The Kiln** (thekiln.com) is a certified Clay Elite Studio - a team of GTM experts, automation specialists, data scientists, and early Clay employees.

**Core Services:**
- **Sales/GTM:** Automated GTM co-pilots, TAM mapping, deep enrichment, personalized outbound at scale, lead qualification, mid-funnel automation
- **Marketing/Growth:** Inbound lead enrichment, account scoring, inbound-led outbound sequences, paid ads audience building, custom landing pages at scale, deep ICP research
- **RevOps:** CRM data cleaning, automated enrichment, data normalization, account/contact/lead research, automated campaign updates, CRM lead scoring

**Our Approach:**
- We invest deep time (GTM engineers work on only a few clients at a time)
- Highly technical execution - we ship real solutions, not just strategy
- Custom is our comfort zone - we specialize in complex, bespoke projects
- We help clients consolidate their GTM tech stack and move from manual work to scalable automation

**Notable Clients:** Azuga, Sendoso, OpenAI, Vanta, Verkada, Anthropic, Notion, Rippling, and others

### About Clay.com

**Clay** is the central platform we use for GTM engineering work. It's a data enrichment and GTM automation platform that serves as the foundation for modern go-to-market teams.

**Key Capabilities:**
- **150+ Data Providers:** Access premium data from providers like Apollo, ZoomInfo, Clearbit, People Data Labs, and more in one unified platform
- **AI Research Agents (Claygent):** Build AI agents that search public databases, navigate gated forms, scrape unstructured data, and find unique datapoints at scale
- **Intent Signals:** Monitor and act on job changes, website visits, company mentions, funding events, and other buying signals
- **Workflow Automation:** Build conditional logic, waterfall enrichment sequences, and complex GTM workflows without engineering resources
- **CRM Integration:** Sync millions of records, enrich them, and push updated data back to Salesforce, HubSpot, or any tool via HTTP API
- **Native Sequencer:** Launch personalized outbound campaigns directly from enriched data

**Why Clay Matters for GTM Engineering:**
- Consolidates 100+ data tools into one subscription (no contracts, renewals, or implementation hassle)
- Enables rapid experimentation - test new data sources and workflows in minutes, not months
- Combines enrichment, AI research, intent monitoring, and action orchestration in one place
- Supports complex custom workflows that would normally require dedicated engineering resources

---

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

---

## Client Intelligence Smart Routing

When encountering client-related questions, automatically recognize the pattern and use the right approach:

| User Says | Pattern | Action |
|-----------|---------|--------|
| "What did we discuss with [client]?" | Meeting/call inquiry | Quick Fathom API call |
| "Any updates in the [client] channel?" | Slack check | Quick Rube MCP call |
| "What's pending for [client]?" | Task check | Quick Monday MCP call |
| "Give me a full pulse on [client]" | Comprehensive | Run `/client-pulse` |
| "Catch me up on all clients" | Full report | Run `/client-pulse` |
| "Prep me for [client] call" | Call prep | Quick Fathom + Slack |

**When to use full client-pulse:**
- Cross-source analysis (correlating Fathom + Slack + Monday)
- Multi-client comparison or workload balance
- Finding open items, blockers, and patterns
- Generating exec summary with prioritized recommendations

---

## Configuration

**All client-specific data lives in `config.yaml`** (gitignored, personal to each user).

Each team member defines:
- Their name, role, Slack ID
- Which clients they work with
- Slack channel IDs for each client
- Monday.com board IDs
- Client contacts, domains, and keywords

**To customize:** Copy `config.example.yaml` → `config.yaml` and fill in your data.

### Example Client Config Structure

```yaml
clients:
  sendoso:
    display_name: "Sendoso"
    emoji: "📦"
    description: "AI-enhanced gifting and direct mail platform"
    domains: ["sendoso.com"]
    keywords: ["Sendoso", "Hannah", "gifting", "SmartSend"]
    contacts:
      - name: "Hannah Baldo"
        slack_id: "U07US7CNNGJ"
        role: "Primary POC"
    slack:
      external: {id: "C080HCLK129", name: "ext-thekiln-sendoso"}
      internal: {id: "C08KQP7UT7E", name: "int_sendoso"}
    monday:
      board_id: 8185023177
      board_name: "Sendoso // The Kiln Projects"
```

---

## MCP Setup

This repo uses **one MCP** (Rube by Composio) for everything:

```bash
claude mcp add rube-kiln --type http --url https://rube.app/mcp
```

Rube provides:
- **Slack:** Fetch messages, threads, permalinks, send to internal channels
- **Monday.com:** List boards/items, create tasks, update status, add comments
- **Gmail:** Fetch emails, create drafts (human reviews before send)
- **Google Calendar:** List events, find availability, create meetings

**Fathom** uses direct API calls with `$FATHOM_API_KEY` (stored in `.env`).

---

## Fathom API Integration

**Purpose:** Fetch recorded meeting transcripts, summaries, and action items.

**API Configuration:**
- Endpoint: `https://api.fathom.ai/external/v1/meetings`
- Auth: `X-Api-Key` header
- Environment Variable: `$FATHOM_API_KEY`

**Key Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `include_transcript` | boolean | Include full meeting transcript |
| `include_summary` | boolean | Include AI-generated summary |
| `include_action_items` | boolean | Include extracted action items |
| `created_after` | ISO 8601 | Filter meetings after this date |
| `created_before` | ISO 8601 | Filter meetings before this date |

**Usage Example:**
```bash
DAYS=7
CREATED_AFTER=$(node -e "console.log(new Date(Date.now() - ${DAYS}*24*60*60*1000).toISOString())")

curl -s "https://api.fathom.ai/external/v1/meetings?include_transcript=true&include_summary=true&include_action_items=true&created_after=${CREATED_AFTER}" \
  -H "X-Api-Key: $FATHOM_API_KEY"
```

**Filtering Logic:**
- **External calls:** Include if ANY `calendar_invitees[].email_domain` matches client domains
- **Internal syncs:** Include if transcript contains client keywords
- Use `calendar_invitees_domains_type` to distinguish: `"one_or_more_external"` vs `"only_internal"`

---

## Tool Permissions Philosophy

| Action | Enabled | Reasoning |
|--------|---------|-----------|
| **Read** | ✅ | Can't break anything |
| **Create** | ✅ | New items, doesn't touch existing |
| **Update** | ⚠️ Selective | Only status, comments, assignments |
| **Delete** | ❌ | Permanent data loss |
| **Send email directly** | ❌ | Use drafts with human review |

See `TEAM-SETUP.md` for the full tool permission checklist.

---

## Safety Rules for Agents

1. **Slack:** Only post to `int-*` channels, NEVER `ext-*` client channels
2. **Email:** Create DRAFTS only, never send directly
3. **Calendar:** Confirm before creating invites with external attendees
4. **Monday:** Show changes before updating items

---

## Slack Message Formatting (via Rube/Composio)

**Use `text` instead of `markdown_text` for natural line wrapping.**

- `markdown_text`: Creates section blocks that wrap at narrow widths (looks choppy)
- `text`: Plain text that flows naturally and wraps to full message width

**Example (correct):**
```python
SLACK_SEND_MESSAGE({
  "channel": "C123456",
  "text": "Hey - here's the update.\n\nParagraph two flows naturally without weird breaks."
})
```

---

## File Structure

```
kiln-plugins/
├── CLAUDE.md                 # This file (repo context)
├── TEAM-SETUP.md             # Onboarding + tool permissions
├── .mcp.json                 # Rube MCP config
├── .gitignore
│
└── client-pulse/
    ├── CLAUDE.md             # Agent instructions
    ├── config.yaml           # YOUR clients (gitignored)
    ├── config.example.yaml   # Template
    ├── .env                  # YOUR API keys (gitignored)
    ├── commands/
    ├── agents/
    ├── hooks/
    └── scripts/
```

---

## How to Find IDs

| ID Type | How to Find |
|---------|-------------|
| Slack channel | Right-click channel → Copy link → extract `C12345678` |
| Slack user | View profile → More → Copy member ID |
| Monday board | From URL: `monday.com/boards/[THIS_NUMBER]` |

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| "No active connection for toolkit=slack" | Reconnect in Rube dashboard |
| "FATHOM_API_KEY not set" | Check `.env` file |
| Wrong channel data | Verify IDs in `config.yaml` |
| MCP not found | Run `claude mcp add rube-kiln ...` |
