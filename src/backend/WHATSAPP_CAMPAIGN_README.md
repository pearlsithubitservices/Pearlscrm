# WhatsApp Business Module — PearlsCRM

Dynamic WhatsApp campaign module for PearlsCRM with frontend UI and backend API.

> **Full architecture doc:** [WHATSAPP_BUSINESS_ARCHITECTURE.md](./WHATSAPP_BUSINESS_ARCHITECTURE.md) — includes dynamic Campaign Builder sections, `campaignBuilderService`, and updated flows.

## Architecture

```
React Frontend (Vite + Tailwind)
    │
    ├── useWhatsApp hook ──► Express API (/api/whatsapp/*)
    │                              │
    │                              ├── MongoDB (campaigns, templates, logs)
    │                              ├── Meta WhatsApp Cloud API (message delivery)
    │                              └── Redis (optional, for queue scaling)
    │
    └── Lead/Client phone numbers as campaign audience
```

## Pages (matching MedFlow ERP reference UI)

| Route | Page |
|-------|------|
| `/whatsapp/campaign` | Campaign Builder — audience filters, message composer, live preview |
| `/whatsapp/templates` | Template library — sync from Meta, create local templates |
| `/whatsapp/broadcast` | Broadcast list — scheduled/recurring campaigns |
| `/whatsapp/queue` | Live Queue — real-time sending dashboard |
| `/whatsapp/analytics` | Campaign Analytics — delivery/read/click metrics |
| `/whatsapp/api-keys` | API configuration & connection status |

## Third-Party API Required

**Yes — WhatsApp Business messaging requires an official API provider.**

### Recommended: Meta WhatsApp Cloud API (Official)

- **Free tier**: 1,000 service conversations/month
- **Docs**: https://developers.facebook.com/docs/whatsapp/cloud-api
- **Setup**:
  1. Create a Meta Developer account
  2. Create a WhatsApp Business App
  3. Add a phone number
  4. Generate a permanent access token
  5. Configure webhook URL: `https://your-domain.com/api/whatsapp/webhook`

### Alternative Providers (optional)

| Provider | Package | Notes |
|----------|---------|-------|
| Twilio | `twilio` | Easier onboarding, higher cost |
| Gupshup | REST API | Popular in India |
| 360dialog | REST API | Meta BSP partner |
| MessageBird | `messagebird` | European focus |

## NPM Packages Used

### Backend (`src/backend`)
| Package | Purpose |
|---------|---------|
| `axios` | HTTP calls to Meta Graph API |
| `joi` | Request validation |
| `ioredis` | Redis connection (optional queue scaling) |
| `mongoose` | MongoDB models (already installed) |
| `express` | REST API (already installed) |

### Frontend (`src/`)
| Package | Purpose |
|---------|---------|
| `axios` / `fetch` | API calls via `useWhatsApp` hook |
| `recharts` | Analytics charts (already installed) |
| `react-hot-toast` | Notifications (already installed) |
| `lucide-react` | Icons (already installed) |

## Environment Variables

Add to `src/backend/.env`:

```env
# Meta WhatsApp Cloud API
WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id
WHATSAPP_BUSINESS_ACCOUNT_ID=your_waba_id
WHATSAPP_ACCESS_TOKEN=your_permanent_access_token
WHATSAPP_WEBHOOK_VERIFY_TOKEN=your_custom_verify_token
WHATSAPP_APP_SECRET=your_app_secret
WHATSAPP_API_VERSION=v21.0

# Optional — Redis for queue scaling
REDIS_URL=redis://127.0.0.1:6379
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/whatsapp/campaigns/builder-config` | Dynamic Campaign Builder config (filters, tags, sending) |
| GET | `/api/whatsapp/campaigns` | List campaigns |
| POST | `/api/whatsapp/campaigns` | Create campaign |
| POST | `/api/whatsapp/campaigns/:id/queue` | Queue campaign for sending |
| POST | `/api/whatsapp/campaigns/audience-preview` | Preview audience count + sample contacts |
| GET | `/api/whatsapp/templates` | List templates |
| POST | `/api/whatsapp/templates/sync` | Sync from Meta |
| GET | `/api/whatsapp/broadcasts` | List broadcasts |
| GET | `/api/whatsapp/queue/live` | Live queue stats |
| GET | `/api/whatsapp/analytics/dashboard` | Analytics dashboard |
| GET | `/api/whatsapp/connection/status` | Connection status |
| GET/POST | `/api/whatsapp/webhook` | Meta webhook handler |

## Development

```bash
# Backend
cd src/backend
npm install
npm start

# Frontend
npm run dev
```

Without Meta API credentials, campaigns run in **simulation mode** — messages are logged but not sent externally.

## Webhook Events Handled

- `sent` — Message accepted by WhatsApp
- `delivered` — Message delivered to device
- `read` — Message read by recipient
- `failed` — Delivery failure (triggers retry queue)
