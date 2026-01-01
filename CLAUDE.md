# The Kiln Plugins - Claude Code Instructions

## What This Repo Is

This is the **plugin marketplace** for The Kiln's GTM engineering team. It contains Claude Code plugins that aggregate client intelligence and automate workflows.

---

## GTM Engineering Context

### What is a GTM Engineer?

A **GTM Engineer** (Go-to-Market Engineer) is a technical specialist who designs, builds, and scales automated systems to execute go-to-market strategies. We bridge product, sales, marketing, and revenue operations—acting as an internal product team that turns manual processes into scalable automation.

**Core Responsibilities:**
- **Build automated GTM systems:** Create workflows connecting marketing, sales, and RevOps—replacing manual processes with scalable automation
- **Rapid prototyping:** Quickly identify problems, ship prototypes, and scale solutions based on measured results (meetings booked, hours saved, pipeline generated)
- **AI agent development:** Build AI-powered enrichment pipelines, research agents, and personalization systems that find unique datapoints at scale
- **Systems integration:** Orchestrate data across CRMs (Salesforce, HubSpot), enrichment tools, intent signal providers, and the entire GTM tech stack
- **Data fluency:** Ensure data used in automations is clean, useful, and consistently available across teams

**Skills & Approach:**
- **Technical automation:** Expert in no-code/low-code tools (especially Clay), APIs, webhooks, and AI
- **Systems thinking:** Understand how GTM systems interconnect and where bottlenecks slow execution
- **Collapse traditional roles:** Automate work traditionally done by SDRs, BDRs, and sales ops—turning weeks of manual work into automated flows
- **10x efficiency mindset:** Enable teams to scale by automating repeatable tasks, freeing them for high-impact, strategic work

**How GTM Engineers Differ from Traditional Ops:**
| Role | Focus |
|------|-------|
| **GTM Engineer** | End-to-end technical engineering of GTM systems with coding, AI automation, and custom builds for scalability |
| **Sales Ops** | Sales-specific processes, CRM hygiene, forecasting within sales team |
| **Marketing Ops** | Marketing tech stack, campaign tracking, lead management |

GTM Engineers build unified, automated "connective tissue" across all GTM functions—not siloed ops.

---

### About The Kiln

**The Kiln** (thekiln.com) is a Clay Elite Studio and GTM engineering agency that designs custom, AI-powered systems for inbound, outbound, marketing, and RevOps.

**Philosophy:** Customer-obsessed, high-touch service for a select few clients rather than high-volume systematization. We deliver excessive value through flexible service (48-hour turnarounds, custom ideas exceeding expectations).

**Core Services:**
- **Sales/GTM:** Automated account research, list building, pre-meeting prep, CRM updates, outbound personalization, hyper-personalized multi-channel campaigns
- **Marketing/Growth:** Custom Clay tables, AI-driven email generation, inbound strategy, waterfall enrichment with SOPs
- **RevOps:** Transform data and signals into high-intent pipeline, CRM intelligence, data cleaning

**Results:** $40M+ in pipeline generated for clients. Scaled manual campaigns to launch in hours.

**Notable Clients:** Windsurf, Browserbase, Sendoso, Loxo, Antimetal, NewStore, OpenAI, Vanta, Verkada, Anthropic, Notion, Rippling

---

### About Clay.com

**Clay** is the central platform for GTM engineering work—a data enrichment and automation platform that serves as the foundation for modern go-to-market teams.

**Key Capabilities:**
- **150+ Data Providers:** Apollo, ZoomInfo, Clearbit, People Data Labs, and more in one platform
- **AI Research Agents (Claygent):** Build AI agents that search databases, navigate gated forms, scrape unstructured data at scale
- **Intent Signals:** Monitor job changes, website visits, company mentions, funding events
- **Workflow Automation:** Conditional logic, waterfall enrichment, complex GTM workflows without engineering resources
- **CRM Integration:** Sync millions of records, enrich, push back to Salesforce/HubSpot

**Why Clay Matters:**
- Consolidates 100+ data tools into one subscription
- Enables rapid experimentation—test new workflows in minutes, not months
- Supports complex custom workflows that would normally require dedicated engineering

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

**When to use client-pulse:**
- Cross-source analysis (correlating Fathom + Slack + Monday)
- Multi-client comparison or workload balance
- Finding open items, blockers, and patterns
- Generating exec summary with prioritized recommendations

---

## Configuration

**All client-specific data lives in `config.yaml`** (gitignored, personal to each GTM engineer).

Each team member defines:
- Their name, email, Slack ID
- Which clients they work with
- Slack channel IDs for each client
- Monday.com board IDs
- Client contacts, domains, and keywords

**To customize:** Copy `config.example.yaml` → `config.yaml` and fill in your data.

### Example Client Config Structure

```yaml
me:
  name: "Your Name"
  role: "GTM Engineer"
  email: "you@thekiln.com"
  slack_id: "U12345678"

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
