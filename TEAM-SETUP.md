# Team Setup Guide

## 🚀 Quick Start (5 minutes)

```bash
# 1. Clone the repo
git clone https://github.com/orchidautomation/kiln-plugins ~/kiln-plugins
cd ~/kiln-plugins/client-pulse

# 2. Setup your personal config (before installing plugin)
cp .env.example .env                    # Add your FATHOM_API_KEY + RUBE_API_KEY
cp config.example.yaml config.yaml      # Add your clients

# 3. Install the plugin (run inside Claude Code)
/plugin marketplace add ~/kiln-plugins
/plugin install client-pulse@kiln-plugins

# 4. Connect apps at https://rube.app (Slack, Monday, Gmail, Calendar)

# 5. Test it
/client-pulse sendoso
```

---

## Overview

This plugin uses **one MCP** (Rube by Composio) for everything:
- Slack
- Monday.com
- Gmail
- Google Calendar

Plus **Fathom API** for meeting transcripts.

---

## Setup Steps (10 minutes)

### 1. Clone the repo

```bash
git clone https://github.com/orchidautomation/kiln-plugins ~/kiln-plugins
```

> **Note:** You only need **read access** to the repo. You can't accidentally break the shared plugin code - your personal config files (`config.yaml`, `.env`) stay local and are gitignored. When the plugin is updated, just run `git pull` to get the latest.

### 2. Install the plugin

**Option A: Via marketplace (recommended for teams)**

Add the kiln-plugins as a marketplace and install:

```bash
# Add the marketplace
/plugin marketplace add ~/kiln-plugins

# Install client-pulse
/plugin install client-pulse@kiln-plugins
```

Now `/client-pulse` works in any Claude session.

**Option B: Per-session (for testing/development)**

```bash
claude --plugin-dir ~/kiln-plugins/client-pulse
```

This only loads the plugin for that session.

### 3. Create a Rube account

1. Go to https://rube.app (or https://composio.dev)
2. Sign up / create an account
3. You'll use this to connect your apps

### 4. Connect your apps in Rube

In the Rube/Composio dashboard, connect these apps:

| App | What it's used for |
|-----|-------------------|
| **Slack** | Fetch channel messages, threads, permalinks |
| **Monday.com** | Fetch board items, tasks, subtasks |
| **Gmail** | Search client emails |
| **Google Calendar** | Find upcoming meetings |

Each app will prompt OAuth - authorize access to your accounts.

### 5. Add Rube MCP to Claude Code

```bash
claude mcp add rube-kiln --type http --url https://rube.app/mcp
```

This adds Rube to your global config (`~/.claude.json`) so it works everywhere.

### 6. Get your Fathom API key

1. Go to https://fathom.video/settings/api
2. Copy your API key

### 7. Create your personal config files

```bash
cd ~/kiln-plugins/client-pulse

# Copy templates
cp .env.example .env
cp config.example.yaml config.yaml
```

Edit `.env`:
```
FATHOM_API_KEY=paste_your_key_here
```

Edit `config.yaml`:
- Add your name, role, Slack ID under `me:`
- Add each client you work with under `clients:`
- Fill in Slack channel IDs, Monday board IDs, contacts

**How to find IDs:**
- Slack channel ID: Right-click channel → Copy link → extract `C12345678`
- Monday board ID: From URL `monday.com/boards/[THIS_NUMBER]`
- Slack user ID: View profile → More → Copy member ID

### 8. Test it

Start a new Claude session:

```bash
claude
```

You should see on startup:
```
✓ Config loaded from /path/to/client-pulse/config.yaml
Environment loaded from /path/to/client-pulse (FATHOM_API_KEY set)
```

If config.yaml is missing, you'll see:
```
⚠️  Missing config.yaml - copy the example to get started:
   cp /path/to/config.example.yaml /path/to/config.yaml
```

Then run:
```
/client-pulse sendoso
```

If it works, you'll see the agent fetch Slack messages, Monday tasks, and generate a report.

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

| Component | Shared (in repo) | Personal (gitignored) |
|-----------|------------------|----------------------|
| Plugin code | ✅ Read-only | |
| Agent prompts | ✅ Read-only | |
| `config.example.yaml` | ✅ Template | |
| `.mcp.json` | ✅ Uses env var | |
| `config.yaml` | | ✅ Your clients |
| `.env` file | | ✅ Your API keys (FATHOM + RUBE) |
| Rube account | | ✅ Your app connections |

**You can't break shared code.** Personal files are gitignored - they never leave your machine.

**To get plugin updates:**
```bash
cd ~/kiln-plugins && git pull
```

**Each team member customizes:**
- Which clients they work with
- Their Slack channel IDs
- Their Monday.com board IDs
- Their contacts and keywords

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

### TL;DR Setup (copy-paste)

```bash
# 1. Clone
git clone https://github.com/orchidautomation/kiln-plugins ~/kiln-plugins

# 2. Configure first (before installing)
cd ~/kiln-plugins/client-pulse
cp .env.example .env
cp config.example.yaml config.yaml
# Edit .env with your Fathom API key
# Edit config.yaml with your clients

# 3. Add MCP (run from any directory)
claude mcp add rube-kiln --type http --url https://rube.app/mcp

# 4. Install plugin (run inside Claude Code)
/plugin marketplace add ~/kiln-plugins
/plugin install client-pulse@kiln-plugins
```

### Commands

- `/client-pulse` - All clients
- `/client-pulse sendoso` - Sendoso only
- `/client-pulse profound 14` - Profound, last 14 days

### Verify Setup

```bash
claude mcp list
```

Should show:
```
rube-kiln: https://rube.app/mcp (HTTP) - ✓ Connected
```

### Key Links

- **Rube Dashboard:** https://rube.app (manage app connections)
- **Fathom API Key:** https://fathom.video/settings/api

---

## Tool Permissions (Rube Dashboard)

These tools enable AI to help with your core GTM engineering work: reading client data, posting internal updates, managing tasks, drafting emails, and scheduling meetings.

### Slack Tools

**✅ READ (Required):**
| Tool | Purpose |
|------|---------|
| `SLACK_FETCH_CONVERSATION_HISTORY` | Get channel messages |
| `SLACK_FETCH_MESSAGE_THREAD_FROM_A_CONVERSATION` | Get thread replies |
| `SLACK_RETRIEVE_MESSAGE_PERMALINK_URL` | Get permalinks for items |
| `SLACK_SEARCH_MESSAGES` | Search messages by keyword/date |
| `SLACK_LIST_ALL_CHANNELS` | List available channels |
| `SLACK_FIND_CHANNELS` | Find channels by name |
| `SLACK_LIST_CONVERSATIONS` | List DMs and channels |
| `SLACK_RETRIEVE_CONVERSATION_INFORMATION` | Get channel details |

**✅ WRITE (Internal team updates):**
| Tool | Purpose |
|------|---------|
| `SLACK_SEND_MESSAGE` | Post updates to int-* channels |
| `SLACK_SCHEDULE_MESSAGE` | Schedule messages for later |
| `SLACK_FIND_USER_BY_EMAIL_ADDRESS` | Resolve user IDs for @mentions |

**❌ DISABLE (Dangerous):**
- `SLACK_DELETE_*` - Permanent message deletion
- `SLACK_CREATE_CHANNEL` - Don't auto-create channels
- `SLACK_ARCHIVE_*` - Don't archive channels
- `SLACK_INVITE_*` / `SLACK_KICK_*` - Member management
- `SLACK_SET_*` - Channel settings

---

### Monday.com Tools

**✅ READ (Required):**
| Tool | Purpose |
|------|---------|
| `MONDAY_BOARDS` / `MONDAY_LIST_BOARDS` | List all boards |
| `MONDAY_LIST_GROUPS` | List groups in a board |
| `MONDAY_LIST_BOARD_ITEMS` | List items in a board |
| `MONDAY_LIST_ITEMS` | Get item details (for subitems) |
| `MONDAY_LIST_COLUMNS` | Get column definitions |
| `MONDAY_GET_GROUP_DETAILS` | Get group info |
| `MONDAY_GET_ME` | Get current user |
| `MONDAY_GET_WORKSPACES` | List workspaces |

**✅ WRITE (Task management):**
| Tool | Purpose |
|------|---------|
| `MONDAY_CREATE_ITEM` | Create new tasks |
| `MONDAY_CREATE_UPDATE` | Add comments/notes to items |
| `MONDAY_CHANGE_SIMPLE_COLUMN_VALUE` | Update status, assign people |
| `MONDAY_UPDATE_ITEM` | Update complex column values |

**❌ DISABLE (Dangerous):**
- `MONDAY_DELETE_*` - Permanent item deletion
- `MONDAY_ARCHIVE_BOARD` - Don't archive whole boards
- `MONDAY_CREATE_BOARD` - Don't auto-create boards
- `MONDAY_DUPLICATE_*` - Avoid accidental duplication

---

### Gmail Tools

**✅ READ (Required):**
| Tool | Purpose |
|------|---------|
| `GMAIL_FETCH_EMAILS` | Search and fetch emails |
| `GMAIL_FETCH_MESSAGE_BY_MESSAGE_ID` | Get specific message |
| `GMAIL_FETCH_MESSAGE_BY_THREAD_ID` | Get email thread |
| `GMAIL_LIST_THREADS` | List email threads |
| `GMAIL_LIST_LABELS` | List labels for filtering |
| `GMAIL_GET_ATTACHMENT` | Get attachments |
| `GMAIL_SEARCH_PEOPLE` | Find contacts by name |
| `GMAIL_GET_CONTACTS` | List contacts |

**✅ WRITE (Human-in-the-loop drafts):**
| Tool | Purpose |
|------|---------|
| `GMAIL_CREATE_EMAIL_DRAFT` | Create drafts for review |
| `GMAIL_LIST_DRAFTS` | List existing drafts |
| `GMAIL_SEND_DRAFT` | Send after human approval |
| `GMAIL_DELETE_DRAFT` | Clean up unused drafts |

**❌ DISABLE (Bypass human review):**
- `GMAIL_SEND_EMAIL` - Direct send without review
- `GMAIL_DELETE_*` (messages) - Permanent deletion
- `GMAIL_TRASH_*` - Moving to trash
- `GMAIL_BATCH_MODIFY_MESSAGES` - Bulk label changes

---

### Google Calendar Tools

**✅ READ (Required):**
| Tool | Purpose |
|------|---------|
| `GOOGLECALENDAR_LIST_CALENDARS` | List available calendars |
| `GOOGLECALENDAR_EVENTS_LIST` | List calendar events |
| `GOOGLECALENDAR_FIND_EVENT` | Search for events |
| `GOOGLECALENDAR_GET_CALENDAR` | Get calendar details |
| `GOOGLECALENDAR_GET_CURRENT_DATE_TIME` | Get current time/timezone |
| `GOOGLECALENDAR_FIND_FREE_SLOTS` | Find availability |
| `GOOGLECALENDAR_FREE_BUSY_QUERY` | Check busy times |
| `GOOGLECALENDAR_SYNC_EVENTS` | Sync events |
| `GOOGLECALENDAR_EVENTS_INSTANCES` | Get recurring instances |

**✅ WRITE (Scheduling):**
| Tool | Purpose |
|------|---------|
| `GOOGLECALENDAR_CREATE_EVENT` | Schedule meetings & invites |

**❌ DISABLE (Dangerous):**
- `GOOGLECALENDAR_DELETE_EVENT` - Cancel meetings
- `GOOGLECALENDAR_UPDATE_EVENT` - Modify existing meetings
- `GOOGLECALENDAR_MOVE_*` - Move events between calendars
- `GOOGLECALENDAR_PATCH_*` - Partial updates

---

## Summary: Recommended Tools by App

| App | Read | Write | Total |
|-----|------|-------|-------|
| **Slack** | 8 | 3 | 11 |
| **Monday** | 8 | 4 | 12 |
| **Gmail** | 8 | 4 | 12 |
| **Calendar** | 9 | 1 | 10 |

**Total: ~45 tools** (out of ~300+ available)

### Safety Philosophy

| Category | Approach |
|----------|----------|
| **Read** | ✅ Full access - can't break anything |
| **Create** | ✅ Safe - creates new things, doesn't modify existing |
| **Update** | ⚠️ Selective - only low-risk updates (status, comments) |
| **Delete** | ❌ Disabled - permanent data loss |
| **Send (direct)** | ❌ Disabled - use drafts with human review |

This lets AI handle 90% of your GTM work while keeping humans in the loop for irreversible actions.
