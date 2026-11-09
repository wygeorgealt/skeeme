# Skeeme Backend (`skeeme-go`) 🚀

The primary backend service for the Skeeme study platform, engineered in **Go** for high throughput, minimal memory footprint, and low latency. It provides a robust RESTful API, atomic daily AI quotas, multi-provider AI routing, automated background scheduling, and seamless Laravel Sanctum token compatibility.

> [!NOTE]
> **Live Production Server**: Hosted on Brimble at [`https://skeeme.brimble.app`](https://skeeme.brimble.app)  
> **Live Health Endpoint**: [`https://skeeme.brimble.app/health`](https://skeeme.brimble.app/health)  
> **API Root**: [`https://skeeme.brimble.app/api/v2/student/`](https://skeeme.brimble.app/api/v2/student/)  
> **Admin Switchboard**: [`https://skeeme.brimble.app/admin/ai-switch`](https://skeeme.brimble.app/admin/ai-switch)

---

## 🏛️ Directory Structure

```plaintext
skeeme-go/
├── bin/                        # Compiled binary artifacts
├── cmd/
│   ├── api/                    # Main API server entrypoint (cmd/api/main.go)
│   ├── cli/                    # CLI tool for maintenance utilities
│   ├── grant-credits/          # Standalone utility to manually dispense user credits
│   └── scheduler/              # Standalone scheduler runner
├── internal/
│   ├── ai/                     # AI Engine (Anthropic, DeepSeek, Google Cloud Vision, prompts)
│   ├── auth/                   # Sanctum-compatible token verification (SHA-256)
│   ├── cache/                  # Redis client wrapper & caching utilities
│   ├── credits/                # Legacy credit engine retained for compatibility
│   ├── usage/                  # Server-authoritative daily AI quotas/reservations
│   ├── db/                     # PostgreSQL connection pool using sqlx
│   ├── handlers/               # HTTP route handlers (Auth, AI, Quizzes, Flashcards, Billing, etc.)
│   ├── jobs/                   # Background tasks (R2 backup, streak reset, DB cleanup, AI health)
│   ├── logger/                 # Structured application logging
│   ├── middleware/             # Chi middleware (Firewall, Auth, Logging, Internal Auth)
│   ├── models/                 # Data structs (User, Token, Quiz, Flashcard, Streak, Transaction)
│   └── services/               # External services (e.g. Resend Email)
├── migrations/
│   ├── 001_schema.sql          # Reference PostgreSQL database schema
│   ├── 002_daily_ai_usage.sql  # Free/Pro daily AI quota tables
│   └── migrate.go              # Embedded, startup migration runner
├── Dockerfile                  # Production container definition
├── go.mod                      # Go module dependencies (Go 1.25+)
├── go.sum                      # Dependency checksums
└── railway.toml                # Railway deployment configuration
```

---

The API applies numbered SQL migrations automatically at startup, before serving
requests or starting background jobs. Applied migrations are tracked in
`skeeme_schema_migrations`; a PostgreSQL advisory lock prevents concurrent
instances from applying the same migration. `001_schema.sql` is reference-only
and is deliberately excluded. New forward-only migrations should use the next
numbered filename and be committed with the backend release.

## ⚙️ Configuration & Environment Variables

Copy or create a `.env` file in `skeeme-go/` (or repository root):

```env
# ── Server ──────────────────────────────────────────────────
PORT=8080
APP_ENV=local                       # local | staging | production

# ── Database (PostgreSQL) ───────────────────────────────────
DATABASE_URL=postgres://user:password@localhost:5432/skeeme?sslmode=disable
# Alternatively:
# PGHOST=localhost
# PGPORT=5432
# PGUSER=postgres
# PGPASSWORD=secret
# PGDATABASE=skeeme

# ── Cache (Redis) ───────────────────────────────────────────
REDIS_URL=redis://localhost:6379

# ── AI Providers ────────────────────────────────────────────
ANTHROPIC_API_KEY=sk-ant-...
ANTHROPIC_MODEL=claude-3-5-sonnet-20241022
DEEPSEEK_API_KEY=sk-...
DEEPSEEK_MODEL=deepseek-chat
GOOGLE_CLOUD_VISION_API_KEY=AIzaSy...
RAPIDAPI_API_KEY=your_rapidapi_key
REPLICATE_API_TOKEN=your_replicate_api_token
OCR_PROVIDER=rapidapi                 # rapidapi | google_vision | replicate
DEFAULT_AI_PROVIDER=deepseek         # deepseek | anthropic

# ── Administrative & Internal Secrets ────────────────────────
ADMIN_PASSWORD=your_admin_password
ADMIN_AI_PASSWORD=your_ai_admin_password
INTERNAL_API_SECRET=your_internal_service_secret
CRON_SECRET=your_cron_secret
REQUIRE_CRON_AUTH=true

# ── Third-Party Integrations ────────────────────────────────
RESEND_API_KEY=re_...
PAYSTACK_SECRET_KEY=sk_test_...

# ── Backups (Cloudflare R2 / S3 compatible) ─────────────────
AWS_ACCESS_KEY_ID=your_r2_access_key
AWS_SECRET_ACCESS_KEY=your_r2_secret_key
AWS_BUCKET=skeeme-backups
AWS_ENDPOINT=https://<account_id>.r2.cloudflarestorage.com
AWS_DEFAULT_REGION=auto
BACKUP_R2_PREFIX=backups/
BACKUP_CRON_SCHEDULE="0 * * * *"    # Hourly at minute 0 UTC
DISABLE_INTERNAL_CRON=false
```

`OCR_PROVIDER` selects the OCR service for scan solving and scanned documents.
The default is `rapidapi` when `RAPIDAPI_API_KEY` is configured, then Replicate
when `REPLICATE_API_TOKEN` is configured, then Google Cloud Vision. Set
`OCR_PROVIDER=google_vision` to switch back to Google Vision, or
`OCR_PROVIDER=replicate` to select the existing Replicate integration. The
RapidAPI client calls the `best-ocr-api.p.rapidapi.com/parse/image` endpoint
using multipart form data. Keep all provider keys in server-side deployment
secrets, never in the mobile app or a committed environment file. RapidAPI's
free plan currently lists 50 requests per day; plan limits can change, and
images/documents are sent to the selected provider for processing.

---

## 🔑 Key Subsystems

### 1. Sanctum Authentication Compatibility
The service seamlessly validates legacy Laravel Sanctum personal access tokens:
- Extracts token `id|plaintext_token`.
- Calculates `SHA-256(plaintext_token)` and looks up record in `personal_access_tokens`.
- Asynchronously updates `last_used_at` without adding latency to the request.

### 2. Transactional Credit Engine
Located in `internal/credits/engine.go`:
- **Pessimistic Row Locking**: Uses `SELECT credits, subscription_tier FROM users WHERE id = $1 FOR UPDATE` to avoid race conditions.
- **Idempotency**: Protects against double-charging via `request_id` tracking in the `transactions` table.
- **Pro Daily Allowance**: Automatically dispenses daily 500-credit allowances for `pro` users when their balance hits 0.

### 3. Dual-Provider AI Engine & Dynamic Switchboard
Located in `internal/ai/service.go`:
- **Routing**: DeepSeek (cost-effective default) and Anthropic Claude 3.5 Sonnet (complex reasoning).
- **Vision Pre-processing**: Extracts questions from handwritten or printed images using Google Cloud Vision OCR when needed.
- **Live Switchboard**: Provides a web UI (`/admin/ai-switch`) allowing administrators to dynamically switch the active system default provider with Redis cache key `system:ai_default_provider` without restarting the service.

### 4. In-Process Scheduler & CLI Mode
The binary doubles as a web server and a maintenance CLI:
- When executed with arguments (`./api <command>`), it runs the task and terminates:
  - `./api backup`: Executes `pg_dump` and streams gzipped SQL to Cloudflare R2.
  - `./api streaks`: Evaluates user activity and resets broken streaks at midnight.
  - `./api cleanup`: Purges unverified, abandoned pending registrations.
  - `./api health`: Tests AI provider endpoint health.
  - `./api all`: Runs streaks, cleanup, backup, and health sequentially.

---

## 📡 API Route Reference

### Health & Monitoring
| Method | Route | Description |
| :--- | :--- | :--- |
| `GET` / `HEAD` | `/` | Root health status |
| `GET` / `HEAD` | `/health`, `/api/health` | Deep health check (checks DB & Redis connections) |

### Public Authentication & Onboarding
| Method | Route | Description |
| :--- | :--- | :--- |
| `POST` | `/api/v2/student/login` | Email/password login |
| `POST` | `/api/v2/student/register` | New student registration |
| `POST` | `/api/v2/student/oauth/{provider}` | Social OAuth exchange (Google, etc.) |
| `POST` | `/api/v2/student/otp/send` | Send verification OTP via email |
| `POST` | `/api/v2/student/otp/verify` | Verify OTP |
| `POST` | `/api/v2/student/otp/resend` | Resend OTP |
| `POST` | `/api/v2/student/auth/verify-account` | Activate student account |
| `POST` | `/api/v2/student/auth/reset-password` | Set new password with OTP |
| `POST` | `/api/v2/student/public/contact` | Public support form submission |

### Protected Student Routes (`Authorization: Bearer <token>`)
| Method | Route | Description |
| :--- | :--- | :--- |
| `GET` | `/api/v2/student/me` | Fetch authenticated user profile & balance |
| `PATCH` | `/api/v2/student/profile` | Update profile information |
| `POST` | `/api/v2/student/preferences` | Update AI learning preferences (tone, style, field) |
| `POST` | `/api/v2/student/me/onboarding` | Complete onboarding flow |
| `POST` | `/api/v2/student/logout` | Revoke active access token |
| `DELETE` | `/api/v2/student/profile` | Account deletion |

### AI Generation & Problem Solving
| Method | Route | Description |
| :--- | :--- | :--- |
| `POST` | `/api/scan/solve` *(or `/api/v2/student/scan/solve`)* | Solve homework question with OCR and step-by-step math reasoning |
| `POST` | `/api/scan/chat` *(or `/api/v2/student/scan/chat`)* | Interactive follow-up tutor chat |
| `POST` | `/api/quizzes/generate` | Generate multiple-choice quiz questions on a topic/material |
| `POST` | `/api/flashcards/generate` | Generate flashcard deck |
| `POST` | `/api/summaries/generate` | Generate structured markdown summary of study content |
| `POST` | `/api/v2/student/files/extract` | Extract text from uploaded document/PDF |
| `POST` | `/api/v2/student/quizzes/grade-theory` | AI grading of student free-text responses |

### Quizzes, Flashcards & Streaks
| Method | Route | Description |
| :--- | :--- | :--- |
| `GET` / `POST` | `/api/v2/student/quizzes/history` | List quiz history / Record new completed quiz session |
| `GET` / `DELETE`| `/api/v2/student/quizzes/history/{id}` | Retrieve or delete specific quiz session |
| `GET` / `POST` | `/api/v2/student/flashcards/decks` | List study decks / Create new deck |
| `GET` / `DELETE`| `/api/v2/student/flashcards/decks/{id}` | Get deck details / Delete deck |
| `POST` | `/api/v2/student/flashcards/decks/{id}/cards` | Save or append cards to a deck |
| `GET` | `/api/v2/student/streaks/heatmap` | Retrieve student study activity heatmap |
| `GET` | `/api/v2/student/streaks/freezes` | Get available streak freeze count |
| `POST` | `/api/v2/student/streaks/claim-reward` | Claim streak milestone credit reward |

### Credits & Billing
| Method | Route | Description |
| :--- | :--- | :--- |
| `GET` | `/api/v2/student/credits/summary` | Get current balance and transaction breakdown |
| `POST` | `/api/v2/student/credits/checkout` | Initialize credit purchase session |
| `GET` | `/api/v2/student/billing/history` | View historical payments and invoices |
| `GET` | `/api/v2/student/referral/my-code` | Retrieve student referral link and statistics |

### Webhooks & Background Tasks
| Method | Route | Description |
| :--- | :--- | :--- |
| `POST` | `/api/webhooks/paystack` | Paystack payment success webhook |
| `POST` | `/api/webhooks/revenuecat` | RevenueCat subscription status updates |
| `GET` / `POST` | `/api/cron/backup` | Trigger manual DB backup to Cloudflare R2 |
| `GET` / `POST` | `/api/cron/streaks` | Trigger manual streak evaluation |
| `GET` / `POST` | `/api/cron/cleanup` | Trigger purge of abandoned accounts |

---

## 🧪 Testing & Development

Run all tests:
```bash
go test -v ./...
```

Run credit engine concurrency test:
```bash
go test -v ./internal/credits/...
```

Build the binary:
```bash
go build -o bin/api cmd/api/main.go
```
