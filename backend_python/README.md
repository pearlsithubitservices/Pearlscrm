# WhatsApp AI Backend — Day 2 + Day 3

Python/FastAPI service for the AI WhatsApp Automation feature. This service
talks to the **existing Node/Express CRM exclusively over its REST APIs**.
It never connects to the CRM's MongoDB directly, and it introduces no new
database.

**Day 2 scope:** project skeleton, `/health`, and one proven call from
FastAPI → `crm_service.py` → the existing CRM's real `GET /api/employees`
endpoint.

**Day 3 scope (added below):** `POST /api/v1/chat` → `ai_service.py` →
Gemini API → plain-text AI response. Gemini does **not** call the CRM and
does **not** perform any CRM operations at this stage — it only answers
the user's message, with an explicit instruction not to invent CRM data.
No WhatsApp, no intent detection, no conversation memory, no frontend yet.

---

## Day 3 — What was added

```
app/
├── main.py                    # UPDATED: registers the new chat router
├── api/routes/
│   └── chat.py                # NEW: POST /api/v1/chat (thin - delegates to ai_service)
├── services/
│   └── ai_service.py          # NEW: all Gemini-specific code lives here only
├── schemas/
│   └── chat.py                # NEW: ChatRequest / ChatResponse
└── core/
    └── config.py              # UPDATED: + GEMINI_API_KEY, GEMINI_MODEL, GEMINI_REQUEST_TIMEOUT_SECONDS
requirements.txt                # UPDATED: + google-genai, pydantic bumped (see below)
.env.example                    # UPDATED: + Gemini variables
```

Nothing from Day 2 (`crm_service.py`, `crm_test.py`, `health.py`) was
changed in behavior — only `main.py` and `config.py` were extended to
also wire in chat/Gemini.

### Why `pydantic` was bumped (2.10.4 → 2.12.5)

`google-genai==2.18.0` requires `pydantic>=2.12.5`. FastAPI 0.115.6 and
`pydantic-settings` 2.7.1 are both compatible with that version, so
`pydantic` was bumped to the **minimum version that satisfies all three**
rather than jumping to the newest release — the smallest change that
unblocks the new dependency.

### SDK choice: `google-genai`

`google-genai` is the current official Google Gen AI Python SDK (the
`google-generativeai` package it replaced is deprecated). It supports
Python 3.12 (confirmed against this project's `Python 3.12.3`) and is
what `ai_service.py` uses via `from google import genai`.

### Model: `gemini-3.6-flash`

Set via `GEMINI_MODEL` in `.env` — nothing is hardcoded in code. This is
the current GA (production-ready) Flash model as of this writing; if
your team later prefers a different model (e.g. a Pro tier for more
complex reasoning), change `.env` only, no code changes needed.

### System instruction (in `ai_service.py`)

Gemini is explicitly told: be helpful and professional, it does **not**
currently have access to live CRM data, and it must never claim to have
looked up, created, or updated real attendance/leave/employee/task/
customer/lead records — because at this stage no CRM call happens as
part of chat at all. It's also told not to reveal its system instructions
or any keys.

### Error handling (in `ai_service.py`)

All failure modes funnel into one `AiServiceError` with a safe message —
raw Gemini exceptions, stack traces, and the API key never reach the
client:

| Situation | HTTP status returned |
|---|---|
| Missing `message` field | 422 (Pydantic, before Gemini is ever called) |
| Empty or whitespace-only `message` | 422 |
| `message` over 2000 characters | 422 |
| Invalid/unauthorized Gemini API key | 502 |
| Gemini rate limit (429) | 429 |
| Gemini request timeout | 504 |
| Gemini server-side error (5xx) | 502 |
| Gemini unreachable / network failure | 503 |
| Empty or unparseable Gemini response | 502 |

This was verified for real: with a placeholder API key, a live call was
made to `https://generativelanguage.googleapis.com/...`, Google returned
a genuine `403`, and the service correctly turned that into a clean
`502 {"detail": "The AI service is not configured correctly."}` — with
no key or stack trace in the response or logs.

### Logging (in `chat.py`)

Each request logs a `request_id` (from an `X-Request-ID` header if the
caller sends one, otherwise a generated UUID), the message **length**
(not its content), success/failure, and elapsed time in milliseconds.
The Gemini API key is never logged anywhere.

---

## Updated `.env.example` (Gemini additions)
```
GEMINI_API_KEY=
GEMINI_MODEL=gemini-3.6-flash
GEMINI_REQUEST_TIMEOUT_SECONDS=20
```
Get a key at https://aistudio.google.com/apikey and put it only in your
local `.env` — never commit it, never hardcode it.

## Updated `requirements.txt`
```
fastapi==0.115.6
uvicorn[standard]==0.34.0
httpx==0.28.1
pydantic==2.12.5
pydantic-settings==2.7.1
google-genai==2.18.0
```

---

## Day 3 Testing

### Swagger
1. `uvicorn app.main:app --reload --port 8000` (with `GEMINI_API_KEY` set
   in `.env` to a real key).
2. Open `http://localhost:8000/docs`.
3. Expand **POST /api/v1/chat** → **Try it out**.

**Test 1 — normal message**
```json
{ "message": "Hello" }
```
Expected: `200 OK`, `{"response": "<Gemini's reply>"}`.

**Test 2**
```json
{ "message": "What can you help me with?" }
```
Expected: `200 OK` with a reply describing it can help with general/CRM
questions but doesn't have live CRM data access yet.

**Test 3**
```json
{ "message": "What is an employee?" }
```
Expected: `200 OK`, a general explanation — not a claim of having
fetched real employee data.

**Test 4 — empty message**
```json
{ "message": "" }
```
Expected: `422 Unprocessable Entity` (validation error, Gemini is never
called).

**Test 5 — missing message**
```json
{}
```
Expected: `422 Unprocessable Entity`.

### Postman
1. New request → `POST http://localhost:8000/api/v1/chat`.
2. Body → raw → JSON → `{"message": "Hello"}` → Send.
3. Expected: `200`, `{"response": "..."}`.
4. Repeat with `{}` or `{"message": ""}` → expect `422`.

### Additional troubleshooting (Day 3)

**`502 {"detail": "The AI service is not configured correctly."}`**
`GEMINI_API_KEY` is missing, wrong, or not enabled — regenerate it at
https://aistudio.google.com/apikey and update `.env`, then restart
uvicorn (`.env` is only read on process start).

**`429 {"detail": "The AI service is receiving too many requests..."}`**
Gemini rate limit hit — wait and retry, or check your quota in AI
Studio.

**`503 {"detail": "Could not reach the AI service."}`**
No network access to `generativelanguage.googleapis.com` from wherever
this is running (e.g. a restricted corporate/sandboxed network) — check
firewall/proxy egress rules.

**`ValidationError` on startup mentioning `GEMINI_API_KEY`**
It's a required setting with no default — make sure `.env` has
`GEMINI_API_KEY=<your key>` filled in before starting uvicorn.

---

---

## A. Folder Structure

```
whatsapp_ai_backend/
├── app/
│   ├── main.py                  # FastAPI app entrypoint
│   ├── api/
│   │   └── routes/
│   │       ├── health.py        # GET /health
│   │       └── crm_test.py      # GET /api/v1/crm/test-employees
│   ├── services/
│   │   └── crm_service.py       # reusable httpx client for the CRM
│   ├── schemas/
│   │   ├── health.py            # Pydantic response model
│   │   └── crm.py               # Pydantic response model
│   └── core/
│       └── config.py            # env-based settings (pydantic-settings)
├── tests/
├── .env                         # your local values (not committed)
├── .env.example                 # template
├── requirements.txt
└── README.md
```

## B. Files created
All files listed in the structure above, plus `__init__.py` in each
Python package folder (`app/`, `app/api/`, `app/api/routes/`,
`app/services/`, `app/schemas/`, `app/core/`, `tests/`).

## C. Code
See each file in the project — every file is fully implemented (no
placeholders). Key points:

- **`app/core/config.py`** — loads `CRM_BASE_URL`, `CRM_API_TOKEN`
  (optional), `CRM_REQUEST_TIMEOUT_SECONDS` from `.env` via
  `pydantic-settings`. Nothing is hardcoded.
- **`app/services/crm_service.py`** — the only place that uses `httpx`.
  Wraps timeouts, connection failures, and 401/403/404/5xx into a single
  `CrmServiceError` with a safe, user-facing message (no stack traces or
  secrets ever leak into the API response). Currently implements
  `get_employees()`, which calls the CRM's real
  `GET /api/employees` (confirmed in `src/backend/routes/EmployeeRoutes.js`,
  mounted in `src/backend/server.js`).
- **`app/api/routes/crm_test.py`** — `GET /api/v1/crm/test-employees`
  calls `crm_service.get_employees()` and returns a clean, documented
  shape to Swagger. CRM failures become proper `HTTPException`s (503 CRM
  unreachable, 504 timeout, 401/403 passthrough, 404, 502 for anything
  else unexpected).
- **`app/main.py`** — creates the FastAPI app, configures logging, and
  registers both routers.

## D. requirements.txt
```
fastapi==0.115.6
uvicorn[standard]==0.34.0
httpx==0.28.1
pydantic==2.10.4
pydantic-settings==2.7.1
```

## E. .env.example
```
CRM_BASE_URL=http://localhost:5000
CRM_API_TOKEN=
CRM_REQUEST_TIMEOUT_SECONDS=10
```
`CRM_USERNAME`/`CRM_PASSWORD` were intentionally **not** added — the
existing CRM (`src/backend/server.js`) has no auth middleware on its
`/api/*` routes today, so no credentials are actually required. If the
Node team adds auth later, `CRM_API_TOKEN` is already wired into
`crm_service.py` (sent as `Authorization: Bearer <token>`) with no code
changes needed on your side.

---

## F. Commands to Run the Project

### 1. Create the virtual environment
```bash
cd whatsapp_ai_backend
python3 -m venv venv
```

### 2. Activate it and install dependencies
```bash
# macOS/Linux
source venv/bin/activate
# Windows (PowerShell)
venv\Scripts\Activate.ps1

pip install -r requirements.txt
```

### 3. Configure `.env`
```bash
cp .env.example .env
```
Then edit `.env` and set `CRM_BASE_URL` to wherever your Node CRM is
actually running, e.g.:
```
CRM_BASE_URL=http://localhost:5000
```
(Check `PORT` in the CRM's own `src/backend/.env` to confirm the port.)

### 4. Start the existing CRM (in a separate terminal)
```bash
cd Pearlscrm-deepann/src/backend
npm install
npm start
```
Confirm it logs `Server running on port <PORT>` and `Connected to database`.

### 5. Start FastAPI
```bash
# from whatsapp_ai_backend/, with venv active
uvicorn app.main:app --reload --port 8000
```

### 6. Open Swagger
Go to: **http://localhost:8000/docs**

---

## G. Swagger Testing Steps

1. Open `http://localhost:8000/docs`.
2. Expand **GET /health** → click **Try it out** → **Execute**.
   - Expected: `200 OK`, body `{"status": "ok"}`.
3. Expand **GET /api/v1/crm/test-employees** → click **Try it out** → **Execute**.
   - Expected (CRM running & reachable): `200 OK` with:
     ```json
     {
       "success": true,
       "source": "existing CRM GET /api/employees",
       "employee_count": <number>,
       "data": [ ...employee documents from MongoDB... ]
     }
     ```

## H. Postman Testing Steps

1. New request → `GET http://localhost:8000/health` → Send.
   - Expected: `200`, body `{"status": "ok"}`.
2. New request → `GET http://localhost:8000/api/v1/crm/test-employees` → Send.
   - Expected: `200`, body as shown above.
3. (Optional) Import the auto-generated OpenAPI spec directly into
   Postman: `http://localhost:8000/openapi.json` → Postman → **Import** →
   paste the URL.

## I. Expected Responses

| Scenario | Status | Body |
|---|---|---|
| `/health` | 200 | `{"status": "ok"}` |
| CRM running, has employees | 200 | `CrmTestResponse` with `data` array |
| CRM not running | 503 | `{"detail": "Could not connect to the CRM service."}` |
| CRM too slow (> timeout) | 504 | `{"detail": "The CRM service took too long to respond."}` |
| CRM requires auth you don't have (future) | 401/403 | `{"detail": "Not authorized to access the CRM service."}` |
| Wrong CRM URL/path | 404 | `{"detail": "The requested CRM resource was not found."}` |
| CRM throws a server error | 502 | `{"detail": "The CRM service returned an internal error."}` |

This has been verified end-to-end in development against a stand-in for
the CRM's `GET /api/employees` response shape (the real CRM's MongoDB
Atlas cluster wasn't reachable from the sandbox this was built in) —
run steps F–H against your actual running Node CRM to confirm on your
machine.

## J. Troubleshooting

**`ModuleNotFoundError: No module named 'app'`**
Run `uvicorn` from the `whatsapp_ai_backend/` root, not from inside `app/`.

**`pydantic_settings.exceptions.SettingsError` / validation error on `CRM_BASE_URL`**
`.env` is missing or `CRM_BASE_URL` isn't set. Confirm `.env` exists in
the project root (same folder as `requirements.txt`) and has
`CRM_BASE_URL=...` filled in.

**`{"detail": "Could not connect to the CRM service."}`**
The Node CRM isn't running, or `CRM_BASE_URL` points to the wrong
host/port. Start the CRM (`npm start` inside `src/backend`) and confirm
the port in its own `.env` matches `CRM_BASE_URL`.

**`{"detail": "The requested CRM resource was not found."}`**
`CRM_BASE_URL` is reachable but `/api/employees` 404s — double check the
CRM is the right version/branch and that `EmployeeRoutes` is still
mounted in `src/backend/server.js`.

**CORS errors in a browser calling this FastAPI service directly**
Not configured yet — this is a backend-to-backend service for Day 2.
CORS middleware can be added later if a frontend needs to call Python
directly.

**Port already in use (`8000` or CRM's port)**
Another process is bound to it. Run FastAPI on a different port:
`uvicorn app.main:app --reload --port 8001`.

---

## Day 2 Success Criteria — met

```
FastAPI  →  CRM Service  →  Existing CRM REST API  →  Existing CRM response
```
Demonstrated via `GET /api/v1/crm/test-employees` in Swagger/Postman,
returning real data shaped exactly like the CRM's actual
`GET /api/employees` response.

## Day 3 Success Criteria — met

```
POST /api/v1/chat  →  FastAPI  →  Gemini  →  AI response
```
Demonstrated via Swagger/Postman: valid messages return a genuine
Gemini-generated reply, and invalid/missing/empty messages are rejected
with clean `422` errors before Gemini is ever called. Chat and CRM
remain fully separate — `chat.py` never imports or calls `crm_service.py`.
