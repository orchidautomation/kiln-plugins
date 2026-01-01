# Team Setup Guide

## Overview

This plugin uses **one MCP** (Rube by Composio) for everything:
- Slack
- Monday.com
- Gmail
- Google Calendar

Plus **Fathom API** for meeting transcripts.

---

## Setup Steps (10 minutes)

### 1. Create a Rube account

1. Go to https://rube.app (or https://composio.dev)
2. Sign up / create an account
3. You'll use this to connect your apps

### 2. Connect your apps in Rube

In the Rube/Composio dashboard, connect these apps:

| App | What it's used for |
|-----|-------------------|
| **Slack** | Fetch channel messages, threads, permalinks |
| **Monday.com** | Fetch board items, tasks, subtasks |
| **Gmail** | Search client emails |
| **Google Calendar** | Find upcoming meetings |

Each app will prompt OAuth - authorize access to your accounts.

### 3. Clone the repo

```bash
git clone https://github.com/thekiln/kiln-plugins ~/kiln-plugins
```

### 4. Add Rube MCP (one-time, global)

```bash
claude mcp add rube-kiln --type http --url https://rube.app/mcp
```

This adds Rube to your global config (`~/.claude.json`) so it works everywhere.

### 5. Get your Fathom API key

1. Go to https://fathom.video/settings/api
2. Copy your API key

### 6. Create your .env file

```bash
cd ~/kiln-plugins/client-pulse
cp .env.example .env
```

Edit `.env`:
```
FATHOM_API_KEY=paste_your_key_here
```

### 7. Test it

```bash
claude --plugin-dir ~/kiln-plugins/client-pulse
```

Then run:
```
/client-pulse sendoso
```

---

## Apps to Connect in Rube

| App | Required? | OAuth Scope Needed |
|-----|-----------|-------------------|
| Slack | ✅ Yes | Read channels, messages, threads |
| Monday.com | ✅ Yes | Read boards, items |
| Gmail | Optional | Read emails |
| Google Calendar | Optional | Read events |

**Tip:** Connect Slack and Monday first - those are the most critical. Gmail and Calendar are nice-to-have.

---

## What's Shared vs Personal

| Component | Shared (in repo) | Personal (per person) |
|-----------|------------------|----------------------|
| Plugin code | ✅ | |
| Agent prompts | ✅ | |
| `config.yaml` | ✅ | |
| `.env` file | | ✅ (gitignored) |
| Fathom API key | | ✅ |
| Rube account | | ✅ |
| Rube app connections | | ✅ |

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| "No active connection for toolkit=slack" | Go to Rube dashboard, connect Slack |
| "No active connection for toolkit=monday" | Go to Rube dashboard, connect Monday |
| "FATHOM_API_KEY not set" | Check `.env` file exists with your key |
| MCP not found | Run `claude mcp list` to verify rube-kiln is connected |
| OAuth expired | Reconnect the app in Rube dashboard |

---

## Quick Reference

**Commands:**
- `/client-pulse` - All clients
- `/client-pulse sendoso` - Sendoso only
- `/client-pulse profound 14` - Profound, last 14 days

**Verify MCP:**
```bash
claude mcp list
```

Should show:
```
rube-kiln: https://rube.app/mcp (HTTP) - ✓ Connected
```

**Rube Dashboard:** https://rube.app (manage app connections)
