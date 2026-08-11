# 🎓 Skeeme

> **"The lazy way to study. The smart way to learn."**

Skeeme is an AI-native study platform that turns passive reading into active cognitive mastery. Upload documents, generate quizzes and flashcards, and track study streaks — all powered by AI.

---

## 🏗 Architecture

Skeeme is a 3-service system:

| Service | Tech | Location | Purpose |
|---------|------|----------|---------|
| **API Server** | Go (Chi) | `skeeme-go/` | Core REST API — auth, credits, quizzes, flashcards, streaks |
| **Mobile App** | Expo SDK 52 (React Native) | `student-app/` | iOS & Android student app |
| **AI Service** | Node.js (TypeScript) | `ai-service/` | AI generation microservice (quiz/flashcard/scan) |

```
skeeme/
├── skeeme-go/          # Go backend API
├── student-app/        # Expo/React Native mobile app
├── ai-service/         # Node.js AI generation service
├── _dump/              # Legacy Laravel code (preserved for audit)
└── landing/            # Landing page (coming soon)
```

---

## 🚀 Getting Started

### Prerequisites

- **Go** 1.24+
- **Node.js** 18+
- **PostgreSQL** 14+
- **Redis** 6+

### 1. Go Backend

```bash
cd skeeme-go
cp ../.env.example .env  # Edit with your DB/Redis credentials
go run cmd/api/main.go
```

The API starts on `http://localhost:8080`.

### 2. Mobile App

```bash
cd student-app
npm install
npx expo start
```

### 3. AI Service

```bash
cd ai-service
npm install
npm start
```

---

## 📡 API Overview

Base URL: `/api/v1/student`

### Auth (Public)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/login` | Email + password login |
| POST | `/register` | Create new account |
| POST | `/oauth/{provider}` | Social login (Google/Apple) |
| POST | `/otp/send` | Send 6-digit OTP |
| POST | `/otp/verify` | Verify OTP |

### Protected (Bearer Token)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/me` | Current user profile |
| PATCH | `/profile` | Update profile |
| POST | `/preferences` | Update AI preferences |
| GET | `/credits/summary` | Credit balance |
| GET | `/sync` | Full data sync |
| GET | `/quizzes/history` | Quiz session history |
| GET | `/flashcards/decks` | Flashcard decks |
| GET | `/streaks/heatmap` | 28-day study heatmap |

### System (Public)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/system/pricing` | Current pricing config |
| GET | `/system/app-version` | Min app version |
| GET | `/api/health` | Health check |

---

## 🗄 Database

PostgreSQL schema is defined in [`skeeme-go/migrations/001_schema.sql`](skeeme-go/migrations/001_schema.sql).

Core tables: `users`, `personal_access_tokens`, `transactions`, `quiz_sessions`, `flashcard_decks`, `flashcards`, `study_streaks`, `referrals`, `system_settings`.

---

## 💎 Credit Economy

All AI operations are metered via credits:

| Feature | Cost |
|---------|------|
| Quiz Question | 1 credit/question + 5 credits/500 words |
| Flashcard | Card count × difficulty multiplier |
| Smart Scan | 2 credits (OCR) + 4 credits/question solved |

---

## 🔑 Environment Variables

See [`.env.example`](.env.example) for all required variables.

Key vars: `DATABASE_URL`, `REDIS_URL`, `INTERNAL_API_SECRET`, `RESEND_API_KEY`, `PAYSTACK_SECRET_KEY`.

---

## 📂 Legacy Code

All original Laravel code (controllers, models, views, migrations, Filament admin) is preserved in `_dump/` for reference and audit. This code is no longer active.

---

© 2026 Skeeme AI. All Rights Reserved.
