# WhatsApp Business — Architecture & Functional Flow

PearlsCRM WhatsApp Business module: end-to-end architecture from frontend UI through Express API to Meta WhatsApp Cloud API.

> **Last updated:** Reflects dynamic Campaign Builder (sections 2–4), unified main-sidebar navigation, `campaignBuilderService`, and **fully dynamic Analytics dashboard** via `analyticsService`.

---

## 1. High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         REACT FRONTEND (Vite)                           │
│                                                                         │
│  Main Sidebar (single)           WhatsApp Pages                         │
│  ┌──────────────────────┐       ┌──────────────────────────────────┐   │
│  │ MAIN                 │       │ Campaign Builder │ Templates      │   │
│  │  Dashboard, Leads…   │       │ Broadcast │ Live Queue            │   │
│  │                      │       │ Analytics │ API Keys              │   │
│  │ WHATSAPP BUSINESS    │       └──────────────────────────────────┘   │
│  │  ├─ Campaign         │                    │                         │
│  │  ├─ Templates        │                    ▼                         │
│  │  ├─ Broadcast        │          useWhatsApp.js (Hook)               │
│  │  ├─ Live Queue       │                    │                         │
│  │  ├─ Analytics        │                    │ fetch()                 │
│  │  └─ API Keys         │                    │                         │
│  │                      │       WhatsAppLayout.jsx                      │
│  │ MANAGE               │       (connection status bar only)            │
│  └──────────────────────┘                                               │
└────────────────────────────────────────────────┼────────────────────────┘
                                                 ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                      EXPRESS BACKEND (Node.js)                          │
│                                                                         │
│  /api/whatsapp/campaigns    /api/whatsapp/templates                      │
│  /api/whatsapp/broadcasts   /api/whatsapp/queue                         │
│  /api/whatsapp/analytics    /api/whatsapp/connection                    │
│  /api/whatsapp/webhook                                                  │
│                          │                                              │
│              ┌───────────┼───────────┬──────────────┐                   │
│              ▼           ▼           ▼              ▼                   │
│         MongoDB     campaignBuilder  Background   Meta Graph API        │
│         (Mongoose)  Service          Jobs          (WhatsApp Cloud)     │
│              │           │           │              │                   │
│         Leads        buildAudience  sendCampaign   Send messages        │
│         Campaigns    getBuilderConfig syncTemplate Sync templates       │
│         Templates    resolveMessage analyticsJob  Webhook events        │
│         MessageLogs                    workers                          │
│         Broadcasts                                                      │
│         Queue                                                           │
│         Analytics                                                       │
└─────────────────────────────────────────────────────────────────────────┘
                                                 │
                                                 ▼
                              ┌──────────────────────────────────┐
                              │   Meta WhatsApp Cloud API        │
                              │   graph.facebook.com/v21.0         │
                              │                                  │
                              │   • Send template/text messages  │
                              │   • List message templates       │
                              │   • Push delivery/read webhooks  │
                              └──────────────────────────────────┘
```

---

## 2. Directory Structure

### Frontend (`src/`)

```
src/
├── Hooks/
│   └── useWhatsApp.js              # Central API hook for all WhatsApp pages
├── utils/
│   └── whatsappTags.js             # Extract {{tag}} variables from template text
├── components/
│   ├── sidebar.jsx                 # WhatsApp Business nav group (main sidebar)
│   └── Layout.jsx                  # App shell — sticky sidebar, scrollable main
├── pages/WhatsApp/
│   ├── WhatsAppLayout.jsx          # Connection status header + <Outlet /> only
│   ├── CampaignBuilder.jsx         # Dynamic 4-section campaign builder
│   ├── Templates.jsx               # Template library
│   ├── Broadcast.jsx               # Broadcast list
│   ├── LiveQueue.jsx               # Real-time sending dashboard
│   ├── CampaignAnalytics.jsx       # Metrics & charts
│   ├── ApiKeys.jsx                 # Connection config guide
│   └── components/
│       └── StatusBadge.jsx         # Shared status pill component
└── App.jsx                         # Routes under /whatsapp/*
```

### Backend (`src/backend/`)

```
src/backend/
├── config/
│   ├── whatsapp.js                 # Meta Graph API client (axios)
│   └── redis.js                    # Redis connection (optional scaling)
├── services/
│   ├── campaignBuilderService.js   # Audience building, builder config, message resolution
│   └── analyticsService.js         # Live analytics aggregation from MessageLog
├── models/WhatsAppCampaign/
│   ├── Campaign.js                 # Campaign definition + stats
│   ├── Template.js                 # Message templates
│   ├── Broadcast.js                # Broadcast schedule records
│   ├── MessageLog.js               # Per-recipient message status
│   ├── Queue.js                    # Live queue progress
│   ├── Analytics.js                # Daily aggregated metrics
│   └── WhatsAppConnection.js       # Connection metadata
├── routes/WhatsAppCampaign/
│   ├── campaignRoutes.js
│   ├── templateRoutes.js
│   ├── broadcastRoutes.js
│   ├── queueRoutes.js
│   ├── analyticsRoutes.js
│   ├── connectionRoutes.js
│   └── webhookRoutes.js
├── jobs/
│   ├── sendCampaignJob.js          # Bulk message sender (uses campaignBuilderService)
│   ├── syncTemplateJob.js          # Pull templates from Meta
│   ├── analyticsJob.js             # Aggregate stats + webhook handler
│   ├── retryFailedJob.js           # Retry failed messages
│   └── workers.js                  # In-process campaign queue
├── middlewares/
│   ├── webhook.js                  # Meta webhook verify + signature check
│   └── validateRequest.js          # Joi validation middleware
├── validators/                     # Joi schemas per resource
└── server.js                       # Route mounting at /api/whatsapp/*
```

---

## 3. Frontend Pages

| Route | Page | Purpose |
|-------|------|---------|
| `/whatsapp/campaign` | Campaign Builder | 4-section dynamic builder — see [Section 3.1](#31-campaign-builder--dynamic-sections) |
| `/whatsapp/templates` | Templates | View Meta-approved message templates; create local templates; sync library from Meta |
| `/whatsapp/broadcast` | Broadcast | List all scheduled, active, and completed broadcasts with audience size and status badges |
| `/whatsapp/queue` | Live Queue | Real-time dashboard — messages sent, delivery/fail rates, queue progress bars, live logs (polls every 5 seconds) |
| `/whatsapp/analytics` | Campaign Analytics | **Dynamic** — live metrics from MessageLog; period filter; trend comparison; CSV export |
| `/whatsapp/api-keys` | API Keys | Shows connection status, webhook URL, and required environment variables for Meta API setup |

### Navigation

WhatsApp pages are grouped under a **WhatsApp Business** heading in the main sidebar (`sidebar.jsx`), using the same pattern as the **Manage** section — indented sub-links, no secondary sidebar.

| Sidebar Item | Route |
|--------------|-------|
| Campaign | `/whatsapp/campaign` |
| Templates | `/whatsapp/templates` |
| Broadcast | `/whatsapp/broadcast` (badge = active/scheduled count) |
| Live Queue | `/whatsapp/queue` |
| Analytics | `/whatsapp/analytics` |
| API Keys | `/whatsapp/api-keys` |

`WhatsAppLayout.jsx` renders only a **connection status bar** (Connected / Not Connected + phone number) above the page content.

#### Sidebar layout fix

The sidebar uses `h-screen sticky top-0` with a scrollable inner nav (`flex-1 overflow-y-auto`) and a profile card pinned at the bottom on the same `#0b2b57` background. This prevents white gaps when scrolling long nav lists.

### Shared Hook: `useWhatsApp.js`

All pages communicate with the backend through a single React hook:

```js
const API_BASE = "https://pearlscrm.onrender.com/api/whatsapp";
// const API_BASE = "http://localhost:5000/api/whatsapp";  // local dev

// Exposed methods:
fetchCampaigns, createCampaign, updateCampaign, queueCampaign
previewAudience, fetchBuilderConfig
fetchTemplates, createTemplate, syncTemplates
fetchBroadcasts, createBroadcast
fetchAnalytics, refreshAnalytics
fetchLiveQueue, fetchConnection
```

### 3.1 Campaign Builder — Dynamic Sections

The Campaign Builder is split into four sections. Sections **2, 3, and 4 are fully dynamic** — data is loaded from the backend and updates in real time as the user interacts.

#### Section 1 — Campaign Details *(dynamic)*

| Field | Source |
|-------|--------|
| Campaign name | User input |
| Template dropdown | `GET /templates` — live list from MongoDB |
| Template status badge | Selected template's `status` field |

#### Section 2 — Audience / Lead Filters *(dynamic)*

| Element | Source | Behaviour |
|---------|--------|-----------|
| Status chips | `Lead.distinct("status")` via builder-config | Toggle → filters Leads collection |
| Priority chips | `Lead.distinct("priority")` | Toggle → filters by Hot/Cold/etc. |
| Source chips | `Lead.distinct("source")` | Toggle → filters by lead source |
| Assignee chips | `Lead.distinct("assignedTo")` + Employee names | Toggle → filters by assigned user |
| Follow-up Due | Cross-reference with `Followup` collection | Leads with pending follow-ups |
| Last Contact > 30 days | `Lead.updatedAt` cutoff | Leads not updated in 30+ days |
| Assigned to Me | Current Firebase `user.uid` | Filters leads assigned to logged-in user |
| Matched count | `POST /campaigns/audience-preview` | Re-fetches on every filter change |
| Progress bar | `audienceCount / totalWithPhone` | Percentage of total reachable leads |
| Sample contact | `audience-preview` response `sample[0]` | Shown below progress bar |

**Audience filter object** sent to the backend:

```json
{
  "status": ["New", "Hot"],
  "source": ["Website"],
  "priority": ["Hot"],
  "assignedTo": ["firebase-uid"],
  "followUpDue": true,
  "lastContactOlderThanDays": 30
}
```

#### Section 3 — Message Composer *(dynamic)*

| Element | Source | Behaviour |
|---------|--------|-----------|
| Tag buttons | `builder-config.messageTags` + template variables | CRM fields: `{{name}}`, `{{company}}`, `{{phone}}`, etc. |
| Extra tags | Selected template `body` / `variables` | Auto-extracted `{{...}}` placeholders appended |
| Message body | User input (pre-filled from template body on select) | Saved to campaign |
| Live preview | First matched lead's `variables` object | Real lead name/data substituted in preview panel |

**Per-recipient variables** built by `campaignBuilderService.buildLeadVariables()`:

```
name, company, phone, email, status, source, priority,
Hospital (org name), Patient Name, Doctor, Appointment Date, Token
```

#### Section 4 — Sending Options *(dynamic)*

| Element | Source | Behaviour |
|---------|--------|-----------|
| Delivery modes | `builder-config.sending.deliveryModes` | send_now, schedule, recurring, delay_failed |
| Schedule picker | Shown when mode = `schedule` | `datetime-local` → `campaign.scheduledAt` |
| Recurring options | Shown when mode = `recurring` | Frequency (daily/weekly/monthly) + end date |
| Priority selector | `builder-config.sending.priorities` | low / normal / high — affects send rate |
| Msgs/min | `60000 / WHATSAPP_RATE_LIMIT_MS` | Calculated server-side, displayed live |
| Est. completion | `audienceCount / messagesPerMinute` | Updates as audience count changes |

**Priority rate limiting** in `sendCampaignJob.js`:

| Priority | Delay between messages |
|----------|------------------------|
| `high` | 75% of base rate (faster) |
| `normal` | Base rate (`WHATSAPP_RATE_LIMIT_MS`, default 40ms) |
| `low` | 150% of base rate (slower) |

### 3.2 Campaign Analytics — Dynamic Dashboard

All analytics metrics are computed **live from `MessageLog` and `Campaign` collections** via `analyticsService.js`. No hardcoded fallback values.

#### Metric cards *(dynamic)*

| Metric | Formula | Data source |
|--------|---------|-------------|
| Delivery Rate | `delivered / sent × 100` | MessageLog statuses: sent → delivered/read/clicked |
| Read Rate | `read / delivered × 100` | MessageLog `status: "read"` |
| Click Rate | `clicked / delivered × 100` | MessageLog `status: "clicked"` |
| Conversion | `(read + clicked) / sent × 100` | Engagement rate across all sent messages |
| Responses | `read + clicked` count | MessageLog |
| Campaigns Paused | live count | `Campaign.countDocuments({ status: "paused" })` |

#### Trend indicators *(dynamic)*

Each trend badge compares the **selected period** against the **immediately preceding period** of equal length:

```
trend = ((current − previous) / previous) × 100
```

Example: 30-day view compares last 30 days vs the 30 days before that.

#### Period filter *(dynamic)*

| UI Option | API param | Range |
|-----------|-----------|-------|
| 7 Days | `?period=7` | Last 7 days |
| 30 Days | `?period=30` | Last 30 days (default) |
| 90 Days | `?period=90` | Last 90 days |
| All Time | `?period=all` | All MessageLog records |

#### Campaign comparison chart *(dynamic)*

Last 5 campaigns with `stats.sent > 0`, sorted by `completedAt` / `createdAt`. Bar chart shows sent, delivered, read, failed per campaign from `Campaign.stats`.

#### Export *(dynamic)*

**Export CSV** downloads the current dashboard data (metrics + campaign comparison table) as a client-generated CSV file.

#### Refresh

`POST /analytics/refresh` saves a daily snapshot to `WhatsAppAnalytics` collection and returns the latest live dashboard.

---

## 4. API Endpoints

Base URL: `/api/whatsapp`

### Campaigns

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/campaigns/builder-config` | **Dynamic builder data** — filter options, message tags, sending config |
| `GET` | `/campaigns` | List all campaigns |
| `GET` | `/campaigns/:id` | Get single campaign with template |
| `POST` | `/campaigns` | Create campaign (auto-builds audience from Leads) |
| `PUT` | `/campaigns/:id` | Update campaign |
| `DELETE` | `/campaigns/:id` | Delete campaign |
| `POST` | `/campaigns/:id/queue` | Queue or schedule campaign for sending |
| `POST` | `/campaigns/audience-preview` | Preview matched lead count + sample contacts |

#### `GET /campaigns/builder-config` response shape

```json
{
  "filters": {
    "statuses": ["New", "Hot", "Converted"],
    "sources": ["Website", "Referral"],
    "priorities": ["Hot", "Cold"],
    "assignees": [{ "id": "uid", "name": "Employee Name" }],
    "totalWithPhone": 1234
  },
  "messageTags": [
    { "tag": "{{name}}", "label": "Lead Name" },
    { "tag": "{{company}}", "label": "Company" }
  ],
  "sending": {
    "messagesPerMinute": 1500,
    "rateLimitMs": 40,
    "priorities": [{ "id": "high", "label": "High Priority" }],
    "deliveryModes": [{ "id": "send_now", "label": "Send Now" }],
    "recurringFrequencies": [{ "id": "weekly", "label": "Weekly" }]
  },
  "organizationName": "Pearls IT Hub"
}
```

#### `POST /campaigns/audience-preview` response shape

```json
{
  "count": 420,
  "sample": [
    {
      "name": "John Doe",
      "phone": "919876543210",
      "leadId": "abc123",
      "variables": {
        "name": "John Doe",
        "company": "Acme Corp",
        "Hospital": "Pearls IT Hub",
        "Token": "#ABC123"
      }
    }
  ]
}
```

### Templates

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/templates` | List all templates |
| `POST` | `/templates` | Create local template |
| `POST` | `/templates/sync` | Sync templates from Meta Graph API |
| `DELETE` | `/templates/:id` | Delete template |

### Broadcasts

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/broadcasts` | List broadcasts with campaign data |
| `GET` | `/broadcasts/count` | Count active/scheduled broadcasts (sidebar badge) |
| `POST` | `/broadcasts` | Create broadcast record |
| `PATCH` | `/broadcasts/:id/status` | Update broadcast status |

### Queue

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/queue/live` | Live sending stats (sent, delivered, failed, workers) |
| `GET` | `/queue/logs/:campaignId` | Message logs for a campaign |
| `POST` | `/queue/audience-preview` | Preview audience count |

### Analytics

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/analytics/dashboard?period=30` | Live metrics from MessageLog — period: `7`, `30`, `90`, or `all` |
| `POST` | `/analytics/refresh?period=30` | Save daily snapshot + return refreshed dashboard |

#### `GET /analytics/dashboard` response shape

```json
{
  "periodDays": 30,
  "deliveryRate": 96.4,
  "readRate": 78.2,
  "clickRate": 12.5,
  "conversionRate": 65.1,
  "totalResponses": 142,
  "totalSent": 500,
  "totalDelivered": 482,
  "totalRead": 377,
  "totalClicked": 15,
  "totalFailed": 18,
  "campaignsPaused": 0,
  "hasData": true,
  "lastUpdated": "2026-08-13T17:30:00.000Z",
  "trends": {
    "deliveryRate": 2.1,
    "readRate": -0.8,
    "clickRate": 1.4,
    "conversionRate": 3.2,
    "responses": 5.6
  },
  "campaignComparisons": [
    {
      "campaignId": "...",
      "name": "July Follow-up",
      "sent": 200,
      "delivered": 195,
      "read": 160,
      "failed": 5,
      "clicked": 8,
      "status": "completed",
      "date": "2026-08-10T09:00:00.000Z"
    }
  ]
}
```

When `hasData` is `false`, all rates show `0` — no static placeholder values are returned.

### Connection

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/connection/status` | WhatsApp connection state + phone number |
| `GET` | `/connection/config` | Masked config summary (no secrets exposed) |

### Webhook (Meta → PearlsCRM)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/webhook` | Meta webhook verification handshake |
| `POST` | `/webhook` | Receive delivery/read/failed status updates |

---

## 5. Backend Service Layer

### `campaignBuilderService.js`

Central service used by campaign routes, queue routes, and the send job.

| Function | Purpose |
|----------|---------|
| `getBuilderConfig()` | Aggregates distinct lead filter values, message tags, and sending config for the Campaign Builder UI |
| `buildAudienceQuery(filters)` | Builds MongoDB query against Leads (+ Followup cross-reference for follow-up due) |
| `buildAudience(filters)` | Returns recipient array with per-lead `variables` for message personalization |
| `buildLeadVariables(lead)` | Maps a Lead document to `{{tag}}` substitution values |
| `resolveMessageBody(template, variables)` | Replaces all `{{key}}` placeholders in message text |
| `extractTagsFromText(text)` | Parses `{{...}}` patterns from template body |

### `analyticsService.js`

Live analytics engine — all dashboard metrics are computed on demand from MessageLog.

| Function | Purpose |
|----------|---------|
| `getDashboard(periodDays)` | Full dashboard: rates, trends, campaign comparisons for a time period |
| `aggregateLogs(start, end)` | Count sent/delivered/read/clicked/failed and compute rates for a date range |
| `getCampaignComparisons(limit)` | Last N campaigns with real `stats` for the bar chart |
| `saveDailySnapshot()` | Persist today's metrics + trends to `WhatsAppAnalytics` collection |
| `pctChange(current, previous)` | Calculate period-over-period trend percentage |

#### Metric calculation reference

```
successfulSent  = logs with status: sent | delivered | read | clicked
totalDelivered  = logs with status: delivered | read | clicked
deliveryRate    = totalDelivered / successfulSent × 100
readRate        = totalRead / totalDelivered × 100
clickRate       = totalClicked / totalDelivered × 100
conversionRate  = (totalRead + totalClicked) / successfulSent × 100
totalResponses  = totalRead + totalClicked
```

### Audience query logic (`campaignBuilderService`)

```
Base query:  phone exists and is not empty

Optional filters:
  status              → Lead.status IN [...]
  source              → Lead.source IN [...]
  priority            → Lead.priority IN [...]
  assignedTo          → Lead.assignedTo IN [...]
  lastContactOlderThanDays → Lead.updatedAt <= cutoff date
  followUpDue         → Lead.phone IN pending Followups OR followUpCount > 0
```

---

## 6. Database Models

| Model | Collection | Key Fields |
|-------|-----------|------------|
| `WhatsAppCampaign` | campaigns | name, templateId, messageBody, audienceFilters, recipients[], deliveryMode, scheduledAt, recurring, priority, status, stats |
| `WhatsAppTemplate` | templates | name, category, language, status, body, variables[], metaTemplateId |
| `WhatsAppBroadcast` | broadcasts | name, campaignId, audienceCount, scheduledAt, scheduleLabel, recurring, status |
| `WhatsAppMessageLog` | messagelogs | campaignId, recipientPhone, whatsappMessageId, status, sentAt, deliveredAt, readAt |
| `WhatsAppQueue` | queues | campaignId, totalMessages, processed, messagesPerMinute, activeWorkers, liveLogs[] |
| `WhatsAppAnalytics` | analytics | date, deliveryRate, readRate, clickRate, totalSent, trends{} |
| `WhatsAppConnection` | connections | phoneNumberId, displayPhoneNumber, verifiedName, status |

### `audienceFilters` schema (on Campaign)

```js
audienceFilters: {
  status: [String],
  source: [String],
  priority: [String],
  assignedTo: [String],
  followUpDue: Boolean,
  lastContactOlderThanDays: Number,
}
```

### Audience source collections

| Collection | Phone field | Used for |
|------------|-------------|----------|
| `Lead` | `phone` | Primary campaign audience + filter source |
| `Followup` | `phone` | Follow-up Due quick filter |
| `Employee` | — | Resolving assignee IDs to display names |

---

## 7. Functional Flows

### Flow 1 — Initial Setup

```
Admin opens API Keys page
    → GET /connection/status
    → Backend reads WHATSAPP_* env vars
    → Calls Meta: GET /{phone-number-id}
    → Returns: connected, phone number, verified name
    → WhatsAppLayout header shows "WhatsApp Connected +91 XXXXX"
```

### Flow 2 — Template Sync

```
Admin clicks "Sync from Meta" on Templates page
    → POST /templates/sync
    → syncTemplateJob.js calls Meta: GET /{waba-id}/message_templates
    → Upserts each template into MongoDB (name, category, status, body)
    → Templates available in Campaign Builder dropdown (Section 1)
```

### Flow 3 — Campaign Builder Load

```
Admin opens Campaign Builder
    → GET /campaigns/builder-config   (filter chips, tags, sending config)
    → GET /templates                  (template dropdown)
    → POST /campaigns/audience-preview {}  (initial "All Leads" count)

Admin toggles a filter chip (Section 2)
    → audienceFilters state updates
    → POST /campaigns/audience-preview { status: ["Hot"], ... }
    → count + sample[0] update in UI
    → progress bar recalculates
    → live preview (Section 3) uses sample contact variables

Admin selects template (Section 1)
    → messageBody pre-filled from template.body
    → template-specific {{tags}} appended to tag buttons (Section 3)

Admin changes priority / delivery mode (Section 4)
    → est. completion recalculates from live audienceCount
    → schedule datetime or recurring fields shown conditionally
```

### Flow 4 — Create & Send Campaign

```
1. Admin clicks "Queue Campaign"
   → POST /campaigns  (or PUT /campaigns/:id)
   → buildAudience(audienceFilters) resolves full recipient list
   → Campaign saved with recipients[] + audienceCount

2. POST /campaigns/:id/queue
   → If deliveryMode = "schedule" and scheduledAt is in the future:
       Campaign status → "queued", Broadcast status → "scheduled"
       Returns scheduled time label (does not start job yet)
   → Otherwise:
       Campaign status → "queued", Broadcast status → "active"
       workers.js starts sendCampaignJob in background

3. sendCampaignJob.js processes each recipient:
   → resolveMessageBody(messageBody, recipient.variables)
   → Creates MessageLog (status: "queued")
   → Calls Meta API: POST /{phone-number-id}/messages
   → Updates MessageLog (status: "sent" or "failed")
   → Updates Campaign.stats + Queue progress
   → Rate limited by priority (see Section 3.1)

4. Campaign completes
   → Campaign status → "completed"
   → Broadcast status → "completed"
   → Queue status → "completed"
```

### Flow 5 — Live Monitoring

```
Live Queue page mounts
    → GET /queue/live  (immediate)
    → setInterval 5s → GET /queue/live  (polling)
    → Displays: sent count, delivery %, fail %, progress bars, live logs
```

### Flow 6 — Webhook Status Updates

```
Meta delivers message status change
    → POST /api/whatsapp/webhook
    → webhook.js verifies X-Hub-Signature-256
    → analyticsJob.handleWebhookPayload()
    → Finds MessageLog by whatsappMessageId
    → Updates status: delivered | read | failed
    → Increments Campaign.stats
    → Analytics dashboard reflects updated rates
```

### Flow 7 — Analytics (dynamic)

```
Analytics page loads
    → GET /analytics/dashboard?period=30
    → analyticsService.aggregateLogs() queries MessageLog for date range
    → analyticsService compares current vs previous period for trends
    → analyticsService.getCampaignComparisons() loads last 5 campaigns
    → Returns hasData: true/false (no static fallback values)
    → Renders metric cards, summary counts, Recharts bar chart

User switches period (7D / 30D / 90D / All)
    → GET /analytics/dashboard?period={n}
    → All metrics recalculated for new range

User clicks Refresh
    → POST /analytics/refresh?period={n}
    → saveDailySnapshot() persists to WhatsAppAnalytics
    → Returns refreshed live dashboard

User clicks Export CSV
    → Client-side CSV generated from current dashboard state
```

---

## 8. Meta WhatsApp Cloud API — Role

Meta is the **official and required** messaging provider. PearlsCRM does not send WhatsApp messages directly — all delivery goes through Meta's Graph API.

| PearlsCRM Action | Meta API Call |
|-----------------|---------------|
| Send template message | `POST /{phone-number-id}/messages` (type: template) |
| Send text message | `POST /{phone-number-id}/messages` (type: text) |
| Sync templates | `GET /{business-account-id}/message_templates` |
| Verify connection | `GET /{phone-number-id}?fields=display_phone_number,verified_name` |
| Receive delivery events | Webhook → `POST /api/whatsapp/webhook` |

### Webhook Events Handled

| Event | Action in PearlsCRM |
|-------|---------------------|
| `sent` | MessageLog.status → sent |
| `delivered` | MessageLog.status → delivered, Campaign.stats.delivered++ |
| `read` | MessageLog.status → read, Campaign.stats.read++ |
| `failed` | MessageLog.status → failed, retry queue eligible |

### Simulation Mode

When `WHATSAPP_ACCESS_TOKEN` or `WHATSAPP_PHONE_NUMBER_ID` are not set:

- Campaigns still run through the full pipeline
- Messages are logged in MongoDB with simulated IDs
- No external API calls are made
- Useful for development and UI testing

---

## 9. Environment Variables

```env
# Required for live messaging
WHATSAPP_PHONE_NUMBER_ID=          # From Meta Developer Console
WHATSAPP_BUSINESS_ACCOUNT_ID=      # WhatsApp Business Account (WABA) ID
WHATSAPP_ACCESS_TOKEN=             # Permanent system user access token
WHATSAPP_WEBHOOK_VERIFY_TOKEN=     # Custom string you define for webhook handshake
WHATSAPP_APP_SECRET=               # App secret for webhook signature validation
WHATSAPP_API_VERSION=v21.0         # Graph API version (optional, defaults to v21.0)

# Campaign Builder / sending
WHATSAPP_RATE_LIMIT_MS=40          # Delay between messages in ms (default: 40 → ~1500/min)
ORG_NAME=Pearls IT Hub             # Substituted for {{Hospital}} tag in messages

# Optional
REDIS_URL=redis://127.0.0.1:6379  # For future BullMQ queue scaling
```

Webhook URL to register in Meta Developer Console:

```
https://pearlscrm.onrender.com/api/whatsapp/webhook
```

---

## 10. Dependencies

### Backend

| Package | Role |
|---------|------|
| `axios` | HTTP client for Meta Graph API |
| `joi` | Request body validation |
| `ioredis` | Redis client (optional queue scaling) |
| `mongoose` | MongoDB ODM |
| `express` | REST API server |

### Frontend

| Package | Role |
|---------|------|
| `fetch` (via `useWhatsApp`) | API communication |
| `recharts` | Analytics bar charts |
| `react-hot-toast` | Success/error notifications |
| `lucide-react` | Icons |
| `framer-motion` | Page animations |

---

## 11. Sequence Diagram — Full Campaign Lifecycle

```
Admin          Frontend              Backend                  Meta API      MongoDB
  │                │                     │                        │             │
  │──Open Builder──┤                     │                        │             │
  │                │──GET /builder-config►│──Lead.distinct()──────►│             │
  │                │◄─filters,tags,send──│◄─────────────────────────────────────│
  │                │──GET /templates─────►│                        │             │
  │                │◄─templates──────────│◄─────────────────────────────────────│
  │                │                     │                        │             │
  │──Toggle filter─┤                     │                        │             │
  │                │──POST /audience─────►│──buildAudience()──────►│             │
  │                │◄─count:420,sample───│◄─────────────────────────────────────│
  │                │  (preview updates)  │                        │             │
  │                │                     │                        │             │
  │──Queue Campaign┤                     │                        │             │
  │                │──POST /campaigns────►│──buildAudience()──────►│             │
  │                │──POST /queue────────►│──start sendCampaignJob │             │
  │                │◄─queued──────────────│                        │             │
  │                │                     │──for each recipient:   │             │
  │                │                     │  resolveMessageBody()  │             │
  │                │                     │──POST /messages───────►│             │
  │                │                     │◄─message_id────────────│             │
  │                │                     │──update MessageLog─────►│             │
  │                │                     │                        │             │
  │──Open Live Q───┤                     │                        │             │
  │                │──GET /queue/live────►│──read Queue/Stats──────►│             │
  │                │◄─live stats─────────│◄─────────────────────────────────────│
  │                │                     │                        │             │
  │                │                     │◄──webhook: delivered───│             │
  │                │                     │──update MessageLog─────►│             │
  │                │                     │──update Analytics──────►│             │
  │                │                     │                        │             │
  │──Open Analytics┤                     │                        │             │
  │                │──GET /analytics─────►│──aggregate─────────────►│             │
  │                │◄─dashboard──────────│◄─────────────────────────────────────│
```

---

## 12. Related Documentation

- Setup & quick start: [`WHATSAPP_CAMPAIGN_README.md`](./WHATSAPP_CAMPAIGN_README.md)
- Meta Cloud API docs: https://developers.facebook.com/docs/whatsapp/cloud-api
