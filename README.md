# Skeeme 🎓🤖

> **Next-generation AI-powered academic companion and study ecosystem for students.**

Skeeme combines a high-performance Go backend with an intuitive React Native (Expo) mobile application to empower students with intelligent scan-and-solve problem explanations, personalized AI tutoring, automated quiz and flashcard generation, spaced repetition, study streak tracking, and interactive document summarization.

---

## 📑 Repository Structure

```plaintext
skeeme/
├── skeeme-go/              # Core Go API backend (Chi, PostgreSQL, Redis, AI engines, Cron)
├── student-app/            # Cross-platform mobile client (React Native, Expo SDK 57, NativeWind)
├── ai-service/             # Node.js / TypeScript AI microservice (legacy / sidecar)
├── skeeme-logger/          # Centralized logging service
├── web/                    # Marketing web pages & Firebase hosting/functions
├── _dump/                  # Database migrations & legacy Laravel schema references
└── README.md               # Main project documentation (this file)
```

---

## 🌐 Live Environments & Deployments

- **Production API URL**: `https://skeeme.brimble.app`
- **Health Check**: `https://skeeme.brimble.app/health`
- **API Base**: `https://skeeme.brimble.app/api/v2/student/`
- **Admin Switchboard**: `https://skeeme.brimble.app/admin/ai-switch`

> [!NOTE]
> Because `skeeme-go` is already live on Brimble with healthy PostgreSQL and Redis connections, you can start developing and testing **`student-app`** on your machine immediately without having to run a local database, Redis, or Go server.

---

## 🏗️ System Architecture

```mermaid
graph TD
    User([Student on Mobile App]) -->|HTTPS / SSE| Client[student-app<br/>React Native + Expo SDK 57]
    Client -->|Sanctum Token Auth| API[skeeme-go API<br/>Go Chi Router]
    
    subgraph skeeme_backend ["skeeme-go Backend"]
        API --> Auth[Sanctum Auth & Firewall MW]
        API --> CreditEng[Credit Engine & Idempotency]
        API --> AISwitch[AI Switchboard<br/>Anthropic / DeepSeek]
        API --> Scheduler[In-Process Scheduler<br/>Streaks / Backups / Cleanup]
    end

    subgraph external_services ["External Services & Infrastructure"]
        DB[(PostgreSQL)]
        Cache[(Redis Cache & Rate Limiting)]
        R2[Cloudflare R2 Backups]
        Vision[Google Cloud Vision OCR]
        Claude[Anthropic Claude API]
        DeepSeek[DeepSeek V3 / R1 API]
        Paystack[Paystack Webhooks]
        RevCat[RevenueCat / Superwall]
    end

    API --> DB
    API --> Cache
    Scheduler --> R2
    AISwitch --> Vision
    AISwitch --> Claude
    AISwitch --> DeepSeek
    Client --> RevCat
    Paystack --> API
```

---

## ⚡ Core Features

- 📸 **Scan & Solve**: Capture or upload homework questions. Extract text with Google Cloud Vision OCR, followed by structured, step-by-step problem breakdown rendered with KaTeX LaTeX.
- 💬 **Interactive AI Tutor**: Real-time context-aware conversational tutoring streaming responses via Server-Sent Events (SSE), tailored to student grade level, subject field, learning style, and tone.
- 📝 **AI Quiz & Flashcard Generation**: Generate multiple-choice quizzes and flashcard decks on any topic or uploaded PDF/document. Includes spaced repetition study tracking and theory grading.
- 📄 **Document Summarization & Extraction**: Upload PDFs and documents for bulleted summaries, key takeaways, and flashcard creation.
- 🎯 **Streaks & Gamification**: Daily activity logging, study heatmaps, streak freezes, and reward milestones.
- 💳 **Credit & Subscription Economy**: Row-locked database transactions for atomic credit deductions, daily refills for Pro tier members, Paystack checkout integration, and RevenueCat/Superwall paywalls.
- 🔀 **Admin AI Switchboard**: Live runtime model routing between Anthropic Claude and DeepSeek without service restarts.

---

## 🚀 Quick Start Guide

### 1. Prerequisites

- **macOS / Linux / Windows**
- **Go 1.22+** (recommended Go 1.25+)
- **Node.js 20+** (Node v24 supported) & **npm**
- **PostgreSQL 14+**
- **Redis 7+**
- **Expo CLI** (`npm install -g expo-cli` or via `npx expo`)

> [!TIP]
> If you are setting up on a new Mac, ensure Go is installed via Homebrew (`brew install go`) or the official [Go installer](https://go.dev/dl/).

---

### 2. Backend Setup (`skeeme-go`)

1. **Navigate to the backend directory**:
   ```bash
   cd skeeme-go
   ```

2. **Configure environment variables**:
   Create `.env` based on root `.env.example` or sample configuration:
   ```env
   PORT=8080
   APP_ENV=local
   DATABASE_URL=postgres://user:password@localhost:5432/skeeme?sslmode=disable
   REDIS_URL=redis://localhost:6379
   ANTHROPIC_API_KEY=your_anthropic_key
   DEEPSEEK_API_KEY=your_deepseek_key
   GOOGLE_CLOUD_VISION_API_KEY=your_vision_key
   INTERNAL_API_SECRET=your_secret
   ```

3. **Install dependencies & run**:
   ```bash
   go mod download
   go run cmd/api/main.go
   ```

4. **Verify Health**:
   ```bash
   curl http://localhost:8080/health
   # Returns: {"status":"ok","database":"connected","redis":"connected"}
   ```

For detailed Go documentation, see [skeeme-go/README.md](file:///Users/gcg/skeeme/skeeme-go/README.md).

---

### 3. Mobile App Setup (`student-app`)

1. **Navigate to the mobile app directory**:
   ```bash
   cd student-app
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure environment variables**:
   Create `.env` in `student-app/` (connects directly to the live Brimble backend or local API):
   ```env
   # Live Brimble Backend:
   EXPO_PUBLIC_API_URL=https://skeeme.brimble.app/api/v2/student/

   # Or for local Go backend:
   # EXPO_PUBLIC_API_URL=http://localhost:8080/api/v2/student/

   EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=your_google_client_id
   EXPO_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com
   EXPO_PUBLIC_SUPERWALL_PUBLIC_KEY=your_superwall_key
   EXPO_PUBLIC_REVENUECAT_ANDROID_KEY=your_revenuecat_key
   ```

4. **Start the Expo development server**:
   ```bash
   npx expo start
   ```

   - Press `i` to launch in the iOS Simulator.
   - Press `a` to launch in an Android Emulator / connected device.
   - Scan the QR code using Expo Go or a development build.

For detailed frontend documentation, see [student-app/README.md](file:///Users/gcg/skeeme/student-app/README.md).

---

## 🛠️ Module Breakdown

| Module | Description | Primary Tech Stack |
| :--- | :--- | :--- |
| [`skeeme-go`](file:///Users/gcg/skeeme/skeeme-go) | High-performance REST API, credit transactions, AI switchboard, jobs | Go, Chi, PostgreSQL, Redis, sqlx, robfig/cron |
| [`student-app`](file:///Users/gcg/skeeme/student-app) | Cross-platform student mobile application | React Native, Expo 57, NativeWind, Zustand, KaTeX |
| [`ai-service`](file:///Users/gcg/skeeme/ai-service) | Dedicated AI helper service | Node.js, TypeScript, Express |
| [`skeeme-logger`](file:///Users/gcg/skeeme/skeeme-logger) | Real-time logger and viewer | Node.js, Express, WebSocket |
| [`web`](file:///Users/gcg/skeeme/web) | Web portal and landing pages | Firebase Hosting & Functions |

---

## 🔐 Security & Idempotency

- **Row Locking**: Credit operations use PostgreSQL `SELECT ... FOR UPDATE` with isolated transactions to eliminate double-spend vulnerabilities.
- **Idempotency**: Critical credit actions enforce unique `request_id` keys in database transactions.
- **Sanctum Compatibility**: SHA-256 hashed token validation compatible with Laravel Sanctum tokens.
- **IP Firewall**: In-memory and Redis-backed rate limiting and banned IP filtering via Chi middleware.
