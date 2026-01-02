# Client Pulse Plugin Instructions

## Overview

This plugin aggregates client intelligence from multiple sources (Slack, Monday.com, Fathom, Gmail, Calendar) into actionable reports.

## Quick Reference

**Command:** `/client-pulse [client] [days]`

**Examples:**
- `/client-pulse` - All clients (from config.yaml)
- `/client-pulse sendoso` - Sendoso only
- `/client-pulse profound 14` - Profound, last 14 days

---

## Configuration

All client data is in `config.yaml`:
- Client names, domains, keywords
- Slack channel IDs (external + internal)
- Monday.com board IDs
- Team member Slack IDs
- Contact information
- Resolution signal customization

**Always read `config.yaml` first** before running any client operations.

---

## Data Sources & Priority

| Priority | Source | Purpose | Limit Reference |
|----------|--------|---------|-----------------|
| 1 | Slack `ext-*` | Client questions, requests, commitments | `config.data_sources.slack.external_channel_limit` |
| 2 | Monday.com | Active tasks, subtasks, assignments | `config.data_sources.monday.task_limit` |
| 3 | Fathom | Meeting summaries, action items | All in date range |
| 4 | Calendar | Upcoming meetings, touchpoint tracking | `config.data_sources.calendar.lookahead_days` |
| 5 | Slack `int-*` | Internal blockers, context | `config.data_sources.slack.internal_channel_limit` |
| 6 | Gmail | Client email threads | `config.data_sources.gmail.max_results` |

---

## RUBE MCP Session Management

**CRITICAL: Always establish a session before tool calls.**

```
1. RUBE_SEARCH_TOOLS({
     queries: [{use_case: "fetch slack conversation history and thread replies"}],
     session: {generate_id: true}
   })
   → Extract session_id from response

2. Pass session_id to ALL subsequent RUBE_MULTI_EXECUTE_TOOL calls

3. Never call RUBE tools without a valid session_id
```

---

## Tool Schemas (Rube MCP)

### Slack Tools

#### SLACK_FETCH_CONVERSATION_HISTORY
```json
{
  "channel": "C12345678",      // Required: Channel ID
  "limit": 200,                // Optional: Max messages (default: 100, max: 1000)
  "oldest": "1234567890.123",  // Optional: Start of time range (Unix timestamp)
  "latest": "1234567890.123"   // Optional: End of time range
}
```

#### SLACK_FETCH_CONVERSATION_REPLIES
```json
{
  "channel": "C12345678",      // Required: Channel ID
  "ts": "1234567890.123456"    // Required: Thread parent timestamp (thread_ts)
}
```

#### SLACK_RETRIEVE_MESSAGE_PERMALINK_URL
```json
{
  "channel": "C12345678",      // Required: Channel ID
  "message_ts": "1234567890.123456"  // Required: Message timestamp
}
```

#### SLACK_SEND_MESSAGE
```json
{
  "channel": "C12345678",      // Required: Channel ID (int-* only!)
  "text": "Message content"    // Required: Message text (markdown supported)
}
```

### Monday.com Tools

#### MONDAY_LIST_BOARD_ITEMS
```json
{
  "board_id": "1234567890",    // Required: Board ID (number as string)
  "limit": 100,                // Optional: Max items (default: 25)
  "group_id": "Active"         // Optional: Filter by group
}
```

#### MONDAY_LIST_ITEMS
```json
{
  "item_id": "1234567890"      // Required: Item ID (for fetching subitems)
}
```

#### MONDAY_CREATE_ITEM
```json
{
  "board_id": "1234567890",    // Required: Board ID
  "item_name": "Task title",   // Required: Item name
  "group_id": "Active",        // Optional: Target group
  "column_values": {}          // Optional: Column values as JSON
}
```

#### MONDAY_CREATE_UPDATE
```json
{
  "item_id": "1234567890",     // Required: Item ID
  "body": "Comment text"       // Required: Update/comment content
}
```

### Gmail Tools

#### GMAIL_FETCH_EMAILS
```json
{
  "query": "from:@sendoso.com", // Required: Gmail search query
  "max_results": 50,            // Optional: Max emails
  "user_id": "me"               // Optional: Usually "me"
}
```

### Calendar Tools

#### GOOGLECALENDAR_FIND_EVENT
```json
{
  "query": "Sendoso",          // Optional: Search term
  "time_min": "2024-01-01T00:00:00Z",  // Optional: Start of range
  "time_max": "2024-01-31T23:59:59Z",  // Optional: End of range
  "max_results": 50            // Optional: Max events
}
```

---

## Pagination Guidance

### Slack: When >200 Messages Exist

If a channel has more messages than your configured limit:

1. **First fetch:** Use `limit` from config (e.g., 200)
2. **Check response:** Look for `has_more: true` and `response_metadata.next_cursor`
3. **Paginate if needed:**
   ```json
   {
     "channel": "C12345678",
     "limit": 200,
     "cursor": "dXNlcjpXMDdMR0NJNlM="  // From previous response
   }
   ```

**Recommendation:** For 7-day lookbacks, 200 messages is usually sufficient. For 14+ days, may need pagination.

### Monday.com: Large Boards

1. **First fetch:** Items with `limit: 100`
2. **If more items exist:** Use `cursor` from response metadata
3. **Subitems:** Fetch separately per item using `MONDAY_LIST_ITEMS`

### Fathom: No Pagination Needed

Fathom API returns all meetings in the date range. Filter client-side using:
- `calendar_invitees_domains_type` for meeting classification
- `calendar_invitees[].email_domain` for client matching

---

## Performance Notes

### Expected API Calls per Client

| Source | Typical Calls | Notes |
|--------|---------------|-------|
| Slack ext-* | 1 + N threads | 1 history fetch + 1 per threaded message |
| Slack int-* | 1 + N threads | Same pattern |
| Monday.com | 1 + N items | 1 board fetch + 1 per item for subitems |
| Fathom | 1 | Single API call for date range |
| Calendar | 1-2 | Find events + optionally get details |
| Gmail | 1 | Search query |
| Permalinks | N | 1 per open item (only for items you'll report) |

### Estimated Execution Time

| Scenario | Time Estimate |
|----------|---------------|
| Single client, 7 days | 30-60 seconds |
| Single client, 14 days | 45-90 seconds |
| 3 clients parallel | 45-90 seconds (parallel) |
| 5 clients parallel | 60-120 seconds |

**Bottlenecks:**
- Thread expansion is the biggest factor
- Channels with 50+ threads take longer
- Monday subitems add per-item calls

### Optimization Tips

1. **Parallel subagents:** Always use for multi-client reports
2. **Don't wait for slow sources:** Start with Slack ext-*, fetch others while processing
3. **Permalinks only for open items:** Don't fetch for resolved items
4. **Cache session_id:** Reuse within the same execution

---

## Fathom API Details

### Endpoint
```
GET https://api.fathom.ai/external/v1/meetings
```

### Parameters
| Param | Required | Description |
|-------|----------|-------------|
| `created_after` | Recommended | ISO8601 datetime |
| `include_transcript` | Optional | Include full transcript |
| `include_summary` | Optional | Include AI summary |
| `include_action_items` | Optional | Include extracted action items |

### Cross-Platform Date Calculation
```bash
DAYS=7
CREATED_AFTER=$(node -e "console.log(new Date(Date.now() - ${DAYS}*24*60*60*1000).toISOString())")

curl -s "https://api.fathom.ai/external/v1/meetings?include_transcript=true&include_summary=true&include_action_items=true&created_after=${CREATED_AFTER}" \
  -H "X-Api-Key: $FATHOM_API_KEY"
```

### Response Filtering (Two-Tier)

**External Calls:**
```python
if meeting['calendar_invitees_domains_type'] == 'one_or_more_external':
    attendee_domains = [inv['email_domain'] for inv in meeting['calendar_invitees'] if inv['is_external']]
    if any(d in config['fathom']['external_domains'] for d in attendee_domains):
        include_meeting()
```

**Internal Syncs:**
```python
if meeting['calendar_invitees_domains_type'] == 'only_internal':
    transcript = meeting.get('transcript', '') + meeting.get('summary', '')
    if any(kw.lower() in transcript.lower() for kw in config['fathom']['internal_keywords']):
        include_meeting()
```

---

## Safety Rules

1. **Slack:** Only post to `int-*` channels, NEVER `ext-*` client channels
2. **Email:** Create DRAFTS only, never send directly
3. **Calendar:** Confirm before creating invites with external attendees
4. **Monday:** Show changes before updating items

---

## Thread Analysis

**Expand ALL threads within the lookback period.** Don't skip to save time.

For each thread:
1. Check if parent message is within date range
2. Fetch ALL replies using `SLACK_FETCH_CONVERSATION_REPLIES`
3. Analyze full context for resolution status

**Resolution signals (mark as RESOLVED):**
- Check `config.behavior.resolution_signals.completion`
- Check `config.behavior.resolution_signals.acknowledgment`

**Open signals (report as OPEN):**
- Question with no response
- Promise without confirmation (check `config.behavior.open_signals.promise_without_followup`)
- Thread ended with a question
- Waiting signals (check `config.behavior.open_signals.waiting`)

---

## Report Format

```markdown
# Client Pulse: [Client] [emoji]
**Generated:** [timestamp] | **Period:** Last [N] days

## Health: [🟢/🟡/🔴] [One-line summary]

## 🔴 Client Communication Analysis
**Channel:** #[slack.external.name] | **Messages Analyzed:** [count]
**Client Sentiment:** [Positive/Neutral/Concerned/Frustrated]

### Unanswered Client Items [count]
| Item | Asked By | Date | Link | Age |

### Client Requests & Asks
| Request | From | Date | Status |

### Commitments We Made [count]
| What We Promised | Who Said It | When | Status |

### Client Waiting On Us
- [Item] - Since: [Date] - Days Waiting: [N]

### Frustration Signals
- [Any repeated follow-ups, escalation language]

---

## Internal Team Discussion
**Channel:** #[slack.internal.name]
[Summary of internal conversations, blockers]

---

## Monday.com Tasks
**Board:** [monday.board_name]
**Active:** X | **Overdue:** X | **Stuck:** X

[Task list with owners, due dates, subtask progress]

---

## Recent Calls (Fathom)
### [Meeting Title] - [Date]
**Attendees:** [Names]
**Summary:** [1-2 sentences]
**Action Items:**
- [ ] [Item 1] - Assigned: [Name] - Status: [Done/Open]

---

## Calendar
**Next Meeting:** [date] with [attendees]
**Days Since Last Call:** [N]

---

## Recommended Actions
1. [Most urgent]
2. [Second priority]
3. [Third priority]

---

## Quick Copy for Slack
**For #[slack.internal.name]:**
```
Team update from pulse check:
[emoji] **[display_name]:**
• [Open item 1] - needs response by [date]
• [Open item 2] - [context]
**Action needed:** [top priority]
```
```

---

## Error Handling

| Source | Severity | Action |
|--------|----------|--------|
| Slack ext-* | Critical | Retry once, then report failure |
| Monday | Non-critical | Note "Monday unavailable", continue |
| Fathom | Non-critical | Note "Fathom unavailable", continue |
| Calendar | Non-critical | Skip section |
| Slack int-* | Non-critical | Skip section |
| Gmail | Non-critical | Skip section |

**Minimum viable report:** Slack ext-* only → Still generate unanswered items + commitments

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "No active connection for toolkit=slack" | Reconnect Slack in Rube dashboard |
| "FATHOM_API_KEY not set" | Check `.env` file exists with key |
| "Config file not found" | Run `cp config.example.yaml config.yaml` |
| Session errors | Always call `RUBE_SEARCH_TOOLS` first with `generate_id: true` |
| Slow performance | Check thread count; consider shorter lookback |
| Missing client in "all" mode | Add client to `config.yaml`, not command file |
