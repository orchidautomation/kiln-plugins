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

---

## Tool Permissions (Rube Dashboard)

The client-pulse agent only needs **READ access**. In your Rube dashboard, you can disable write tools to prevent accidental modifications.

### Slack Tools

**✅ ENABLE (Required):**
| Tool | Purpose |
|------|---------|
| `SLACK_FETCH_CONVERSATION_HISTORY` | Get channel messages |
| `SLACK_FETCH_MESSAGE_THREAD_FROM_A_CONVERSATION` | Get thread replies |
| `SLACK_RETRIEVE_MESSAGE_PERMALINK_URL` | Get permalinks for items |

**✅ ENABLE (Optional but recommended):**
| Tool | Purpose |
|------|---------|
| `SLACK_SEARCH_MESSAGES` | Search messages by keyword/date |
| `SLACK_LIST_ALL_CHANNELS` | List available channels |
| `SLACK_FIND_CHANNELS` | Find channels by name |
| `SLACK_LIST_CONVERSATIONS` | List DMs and channels |

**❌ DISABLE (Write operations - not needed):**
- `SLACK_SEND_MESSAGE` / `SLACK_POST_MESSAGE`
- `SLACK_CREATE_*` (channels, etc.)
- `SLACK_DELETE_*`
- `SLACK_UPDATE_*`
- `SLACK_SET_*`
- `SLACK_ADD_*` / `SLACK_REMOVE_*`

---

### Monday.com Tools

**✅ ENABLE (Required):**
| Tool | Purpose |
|------|---------|
| `MONDAY_LIST_BOARDS` | List all boards |
| `MONDAY_LIST_GROUPS` | List groups in a board |
| `MONDAY_LIST_BOARD_ITEMS` | List items in a board |
| `MONDAY_LIST_ITEMS` | Get item details (for subitems) |

**✅ ENABLE (Optional but recommended):**
| Tool | Purpose |
|------|---------|
| `MONDAY_GET_GROUP_DETAILS` | Get group info |
| `MONDAY_GET_ME` | Get current user |
| `MONDAY_GET_WORKSPACES` | List workspaces |

**❌ DISABLE (Write operations - not needed):**
- `MONDAY_CREATE_*` (items, boards, groups, etc.)
- `MONDAY_UPDATE_*`
- `MONDAY_DELETE_*`
- `MONDAY_ARCHIVE_*`
- `MONDAY_MOVE_*`
- `MONDAY_DUPLICATE_*`

---

### Gmail Tools

**✅ ENABLE (Required):**
| Tool | Purpose |
|------|---------|
| `GMAIL_FETCH_EMAILS` | Search and fetch emails |

**✅ ENABLE (Optional but recommended):**
| Tool | Purpose |
|------|---------|
| `GMAIL_FETCH_MESSAGE_BY_MESSAGE_ID` | Get specific message |
| `GMAIL_FETCH_MESSAGE_BY_THREAD_ID` | Get email thread |
| `GMAIL_LIST_THREADS` | List email threads |
| `GMAIL_LIST_LABELS` | List labels for filtering |
| `GMAIL_GET_ATTACHMENT` | Get attachments |

**❌ DISABLE (Write operations - not needed):**
- `GMAIL_SEND_EMAIL` / `GMAIL_SEND_*`
- `GMAIL_CREATE_*` (drafts, labels, etc.)
- `GMAIL_DELETE_*`
- `GMAIL_TRASH_*`
- `GMAIL_BATCH_MODIFY_MESSAGES`
- `GMAIL_MODIFY_*`

---

### Google Calendar Tools

**✅ ENABLE (Required):**
| Tool | Purpose |
|------|---------|
| `GOOGLECALENDAR_EVENTS_LIST` | List calendar events |
| `GOOGLECALENDAR_FIND_EVENT` | Search for events |
| `GOOGLECALENDAR_LIST_CALENDARS` | List available calendars |

**✅ ENABLE (Optional but recommended):**
| Tool | Purpose |
|------|---------|
| `GOOGLECALENDAR_GET_CALENDAR` | Get calendar details |
| `GOOGLECALENDAR_GET_CURRENT_DATE_TIME` | Get current time/timezone |
| `GOOGLECALENDAR_FIND_FREE_SLOTS` | Find free/busy slots |
| `GOOGLECALENDAR_SYNC_EVENTS` | Sync events |
| `GOOGLECALENDAR_EVENTS_INSTANCES` | Get recurring event instances |

**❌ DISABLE (Write operations - not needed):**
- `GOOGLECALENDAR_CREATE_*` (events, calendars, etc.)
- `GOOGLECALENDAR_UPDATE_*`
- `GOOGLECALENDAR_DELETE_*`
- `GOOGLECALENDAR_QUICK_ADD_*`
- `GOOGLECALENDAR_MOVE_*`
- `GOOGLECALENDAR_PATCH_*`

---

## Summary: Minimum Tools by App

| App | Required Tools | Count |
|-----|----------------|-------|
| **Slack** | `FETCH_CONVERSATION_HISTORY`, `FETCH_MESSAGE_THREAD_FROM_A_CONVERSATION`, `RETRIEVE_MESSAGE_PERMALINK_URL` | 3 |
| **Monday** | `LIST_BOARDS`, `LIST_GROUPS`, `LIST_BOARD_ITEMS`, `LIST_ITEMS` | 4 |
| **Gmail** | `FETCH_EMAILS` | 1 |
| **Calendar** | `EVENTS_LIST`, `FIND_EVENT`, `LIST_CALENDARS` | 3 |

**Total minimum: 11 tools** (out of ~300+ available across all apps)

This keeps the agent focused on READ-ONLY operations and prevents accidental writes to your Slack, Monday, Gmail, or Calendar.
