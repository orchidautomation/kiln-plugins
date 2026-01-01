# Client Pulse Plugin Instructions

## Overview

This plugin aggregates client intelligence from multiple sources (Slack, Monday.com, Fathom, Gmail, Calendar) into actionable reports.

## Quick Reference

**Command:** `/client-pulse [client] [days]`

**Examples:**
- `/client-pulse` - All clients
- `/client-pulse sendoso` - Sendoso only
- `/client-pulse profound 14` - Profound, last 14 days

## Configuration

All client data is in `config.yaml`:
- Client names, domains, keywords
- Slack channel IDs (external + internal)
- Monday.com board IDs
- Team member Slack IDs
- Contact information

**Always read `config.yaml` first** before running any client operations.

## Data Sources & Priority

| Priority | Source | Purpose |
|----------|--------|---------|
| 1 | Slack `ext-*` | Client questions, requests, commitments |
| 2 | Monday.com | Active tasks, subtasks, assignments |
| 3 | Fathom | Meeting summaries, action items |
| 4 | Calendar | Upcoming meetings, touchpoint tracking |
| 5 | Slack `int-*` | Internal blockers, context |
| 6 | Gmail | Client email threads |

## MCP Tools Available

All tools via **Rube MCP** (single MCP for Slack, Monday, Gmail, Calendar):

```
RUBE_SEARCH_TOOLS → Get session_id first (REQUIRED)
RUBE_MULTI_EXECUTE_TOOL → Execute tools (pass session_id)
```

### Slack Tools
- `SLACK_FETCH_CONVERSATION_HISTORY` - Channel messages
- `SLACK_FETCH_MESSAGE_THREAD_FROM_A_CONVERSATION` - Thread replies
- `SLACK_RETRIEVE_MESSAGE_PERMALINK_URL` - Permalinks
- `SLACK_SEND_MESSAGE` - Post to internal channels only

### Monday.com Tools
- `MONDAY_LIST_BOARDS` / `MONDAY_BOARDS` - List boards
- `MONDAY_LIST_BOARD_ITEMS` - List items
- `MONDAY_LIST_ITEMS` - Get subitems
- `MONDAY_CREATE_ITEM` - Create tasks
- `MONDAY_CREATE_UPDATE` - Add comments

### Gmail Tools
- `GMAIL_FETCH_EMAILS` - Search emails
- `GMAIL_CREATE_EMAIL_DRAFT` - Create drafts (human reviews before send)

### Calendar Tools
- `GOOGLECALENDAR_EVENTS_LIST` - List events
- `GOOGLECALENDAR_FIND_EVENT` - Search events
- `GOOGLECALENDAR_CREATE_EVENT` - Schedule meetings

## Fathom API

Fathom uses direct API calls (not MCP):

```bash
DAYS=7
CREATED_AFTER=$(node -e "console.log(new Date(Date.now() - ${DAYS}*24*60*60*1000).toISOString())")

curl -s "https://api.fathom.ai/external/v1/meetings?include_transcript=true&include_summary=true&include_action_items=true&created_after=${CREATED_AFTER}" \
  -H "X-Api-Key: $FATHOM_API_KEY"
```

**Filtering:**
- External calls: Match `calendar_invitees[].email_domain` to client domains
- Internal syncs: Search transcript for client keywords

## Safety Rules

1. **Slack:** Only post to `int-*` channels, NEVER `ext-*` client channels
2. **Email:** Create DRAFTS only, never send directly
3. **Calendar:** Confirm before creating invites with external attendees
4. **Monday:** Show changes before updating items

## Thread Analysis

**Expand ALL threads within the lookback period.** Don't skip to save time.

For each thread:
1. Check if parent message is within date range
2. Fetch ALL replies
3. Analyze full context for resolution status

**Resolution signals (mark as RESOLVED):**
- "Done", "Sent", "Shipped", "Live"
- "Thanks!", "Perfect", "Looks good", "Approved"
- Thumbs up reactions

**Open signals (report as OPEN):**
- Question with no response
- Promise without confirmation ("Will do" → no follow-up)
- Thread ended with a question

## Report Format

```markdown
# Client Pulse: [Client] [emoji]
**Generated:** [timestamp] | **Period:** Last [N] days

## Health: [🟢/🟡/🔴] [One-line summary]

## Unanswered Client Items [count]
| Item | Asked By | Date | Link | Age |

## Commitments We Made [count]
| What | Who | When | Status |

## Monday Tasks
**Active:** X | **Overdue:** X | **Stuck:** X

## Recent Calls (Fathom)
[Meeting summaries + action items]

## Calendar
**Next Meeting:** [date] | **Days Since Last:** [N]

## Recommended Actions
1. [Most urgent]
2. [Second priority]
3. [Third priority]
```

## Error Handling

| Source | If Fails | Action |
|--------|----------|--------|
| Slack ext-* | Critical | Retry once, then report failure |
| Monday | Non-critical | Note unavailable, continue |
| Fathom | Non-critical | Note unavailable, continue |
| Others | Non-critical | Skip section |

**Minimum viable report:** Slack ext-* only → Still generate unanswered items + commitments
