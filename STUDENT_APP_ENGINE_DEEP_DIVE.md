# 🎓 Skeeme Student App: Engineering Architecture & Deep Dive

Hey team! This document is our definitive guide to the Skeeme student application architecture. It's written for us—the engineers building and maintaining this platform. This isn't theoretical textbook architecture; this is the reality of building a highly resilient, production-grade educational platform for the Nigerian market. 

We are dealing with unique constraints: spotty networks, battery-conscious users, specific payment behaviors, and aggressive scaling needs. Here is the "why" and "how" behind our engine room.

---

## Part 1: Managing the Digital Reality

### 1.1 Network & Environmental Constraints
When building for our primary demographic, we have to assume:
- **Glo/Airtel 3G**: 50-200kbps with 5-15s latency spikes.
- **Power Outages**: Users will frequently drop offline or switch to power-saving modes.

**Our Engineering Response:**
- **Patience over aggression**: 5-minute API timeouts on the frontend. We don't abort a 30s request just because the network is slow; that costs the user money and frustration.
- **Cellular Generation Awareness**: We send `X-Network-Generation` headers. If a user is on 3G/Edge, we can dynamically simplify our payloads.

### 1.2 The Economic Engine 
- **Paystack Dominance**: We built heavily around Paystack because it handles 95% of our traffic. We also support USSD fallback for when bank apps are down.
- **Fail-Closed Economics**: Our credit system is our lifeblood. We must protect user wallets. If our AI provider goes down, or the user's connection drops, **we must not deduct credits**.

---

## Part 2: The Core Systems

### 2.1 The AI Orchestrator & Token Management
We operate a dual-provider strategy to balance output quality, cost, and API rate limits. 

#### 🧠 Claude 3.5 Haiku (Primary)
Claude is our undisputed primary engine for all tasks (Flashcards, Quizzes, Scan & Solve). 
- **Instruction Fidelity**: Claude strictly adheres to our complex JSON schemas and negative constraints ("do not explain, just return JSON"). This drastically reduces frontend parsing errors compared to other models.
- **Why Haiku?**: It strikes the perfect balance of intelligence and latency. When a user scans an exam paper, they expect an answer in seconds, not a minute. Haiku delivers blistering speed.

#### 🧠 DeepSeek V3 (Fallback)
We route to DeepSeek as a highly capable, cost-effective fallback for when Anthropic hits rate limits or experiences downtime.
- **The 8192 Token Limit**: During testing, we hit a major cliff where large generated batches caused 400 Bad Request errors on DeepSeek. Our dynamic `max_tokens` calculation was exceeding DeepSeek's hard capacity limit. **Fix:** We implemented a strict clamp `min(8192, calculated_tokens)` across the service layers to guarantee provider safety.
- **Token Optimization**: Because fallback scenarios mean we are managing unexpected load, we aggressively abbreviate prompts (e.g., "Multiple Choice Question" -> "MCQ") to shave off ~60% of input tokens.

### 2.2 The File Extraction Pipeline
Students upload terrible PDFs and weird DOCX files exported from obscure mobile apps. 

**The Pipeline Flow:**
1. **PDF Extraction**: Attempt text extraction. *Crucial Update:* We wrapped this in a robust `try-catch` block. If parsing throws an exception (due to corrupted PDFs), we immediately fail-over to the OCR pipeline instead of throwing a 500 error to the user.
2. **DOCX Fallback**: PHPWord notoriously chokes on XML namespaces when dealing with math formulas (`oMath`). To fix this, our pipeline attempts PHPWord first. If it fails, it gracefully falls back to a raw `ZipArchive` parser that strips out the nasty XML and salvages the text. Never let a quirky math symbol break a document upload!
3. **Storage**: Anything we can't process gets thrown into Cloudflare R2 for asynchronous OCR processing via Google Vision.

### 2.3 Scan & Solve Edge Optimization
Our Scan & Solve feature is heavily used during late-night study sessions. 

**Recent Architecture Shifts:**
- **Full Image Capture**: We previously cropped images using a visual viewfinder. We realized this was causing alignment issues and breaking math blocks for students trying to align perfectly on mobile. We scrapped the crop! We now capture the *full maximum resolution* image and let the cloud vision AI figure out where the questions are.
- **Zero-Click Generation**: We removed the "Solve Everything" manual trigger. As soon as the shutter snaps, the base64 payload is over the wire. Less friction = higher engagement.

### 2.4 Product Analytics (PostHog)
We can't improve what we don't measure, but analytics SDKs can't block the main thread.
- **The Provider**: We integrated `PostHogProvider` at the root layout level, binding it to our Expo router `segments`. This gives us automated screen tracking instantly.
- **Identify Flow**: Hooked directly into our `authStore.ts` hydration cycle. 
- **Targeted Funnels**: We track high-value conversion events asynchronously (e.g., `flashcards_generated`, `scan_solved`, `upgrade_checkout_started`). By putting these inside `try-catch` blocks, if PostHog's ingestion servers go down, our app doesn't crash.

---

## Part 3: State Management & Offline-First Design

### 3.1 Zustand Dual-Storage Pattern (`authStore.ts`)
We use Zustand, but backed by a resilient dual-storage hydration technique:
- **`secureStorage`**: Holds the sensitive JWT tokens.
- **`standardStorage`**: Holds the bulky user profile, themes, and feature flags.

**The "Instant UI" Hydration Flow:**
1. App launches -> Synchronously blast the cached state to the UI. The user sees their profile instantly.
2. Background -> Fire off an asynchronous `/me` request to validate the token.
3. If token is dead -> Silently log them out (save their email for pre-fill).
4. If token is alive -> Silently update standard storage.

### 3.2 Network Resilience in `api.ts`
- **Idempotency**: Every generation endpoint (quizzes, flashcards, scans) expects an `Idempotency-Key` (a UUID generated on the client). If the client retries a timeout, the backend catches the UUID and returns the already-processing or finished result instead of charging the user twice.
- **Exponential Backoff**: We only retry idempotent `GET` requests automatically, backing off exponentially to let congested networks breathe.

---

## Part 4: The Economic Safety Net

### 4.1 "Fail-Closed" Credit Transactions
Here is the sacred flow for any credit operation:
1. **Validate**: Check user balance upfront.
2. **Lock**: `DB::table('users')->where('id')->lockForUpdate()`. Nobody touches this row until we're done.
3. **Dispatch**: Hit the AI endpoint. 
4. **Deduct ONLY on Success**: If Claude returns a 500, or the user aborts, the transaction rolls back. The lock is released. 
*Why?* Because user trust is incredibly fragile. One accidental deduction for a failed quiz generation, and they churn.

### 4.2 Dynamic Pricing Formulas
We don't charge flat rates. We charge based on compute cost:
- **Scan**: Base cost (OCR) + (Number of detected questions × Multiplier).
- **Generation**: (Word Count ÷ 500) factor + Question count.
This protects our margins regardless of how wildly students push the inputs.

---

## Part 5: Backend Architecture & Infrastructure

The frontend is only as resilient as the API supporting it. Our backend is built on Laravel, heavily optimized for the specific workloads of AI orchestration and file processing.

### 5.1 Request Lifecycle & Middleware
A request hitting `api/v1/student` goes through a strict gauntlet before it reaches a controller:
1. **Authentication (Sanctum/Passport)**: Stateless token validation ensures zero database overhead for simple reads.
2. **Rate Limiting**: Aggressive throttling on AI endpoints (e.g., max 5 generations per minute) to prevent abuse scripts.
3. **Credit Verification (`CheckSufficientCredits`)**: As mentioned in the economic net, we intercept requests *before* the controller if a user can't afford the operation.

### 5.2 The Database Strategy (MySQL + Redis)
We don't just dump everything into MySQL. We split our data planes:
- **MySQL 8.0**: Handles persistent, relational data (Users, Decks, Subscriptions, Flashcards). We use persistent connections to reduce latency across the wire.
- **Redis (The Workhorse)**:
  - *Prompt Caching*: If two users scan the exact same exam paper within 24 hours, the second user gets a cached deep-dive answer. We hash the OCR text to serve as the Redis key. This bypasses the AI provider completely.
  - *Session & Rate Limiting*: Handled entirely in Redis for microsecond access.
  - *Locks*: Managing the atomic `lockForUpdate()` equivalents.

### 5.3 Asynchronous Processing (Jobs & Queues)
HTTP requests have a max timeout. We cannot keep a user waiting on an open connection for 3 minutes while we parse a 20-page PDF and generate 100 flashcards.
**The Queue Pipeline:**
- **Push & Respond**: For massive tasks, the frontend uploads a file, and the controller throws a `ProcessAIQuiz` job onto the queue, immediately returning a `202 Accepted` status with a `job_id`. 
- **Polling / Webhooks**: The frontend polls for status updates or listens for a push notification when the long-running job finishes.

### 5.4 Storage & CDN (Cloudflare R2)
We actively avoid traditional AWS S3 bandwidth costs by using Cloudflare R2.
- **Why R2?**: Egress bandwidth is functionally free. Since students download their generated PDFs repeatedly, this zero-egress model saves us thousands of dollars at scale compared to standard AWS pricing.

---

## Part 6: Task Scheduling & The Mailing System

Our infrastructure requires a proactive system to keep users engaged and maintain database hygiene without manual intervention. We rely heavily on Laravel's Task Scheduler and an asynchronous Mailer.

### 6.1 The Cron Scheduler (`app/Console/Kernel.php`)
We run a dedicated background worker constantly executing `php artisan schedule:run`. This triggers our cronjobs reliably without relying on complex external server-level crontab configurations.

**Critical Background Jobs:**
- **Streak Integrity Check (Daily at Midnight)**: Parses all user activity specifically to calculate streaks. If a student hasn't logged an action, their streak zeroes out (unless frozen via an Elite plan).
- **Storage Cleanup (Daily)**: Hits Cloudflare R2 and permanently deletes extracted PDFs and raw scanned images older than 30 days to keep our storage footprint zero-bloat.
- **Subscription Renewals (Hourly)**: Identifies standard and elite subscriptions due for renewal, interacting with Paystack via server-to-server calls to charge tokenized cards.
- **Engagement Push Notifications (Timezone-Aware)**: Pushes "Time to study!" notifications. We calculate the local hour of the user (`Carbon::now($tz)->hour`) to explicitly ensure we never buzz a student at 3 AM.

### 6.2 The Modular Mailing System
We offload all email processing to backgrounds queues to ensure API responses never hang while waiting for SMTP handshakes.

- **Queue-Driven Delivery**: Every welcome email, password reset, and billing receipt implements the `ShouldQueue` interface. When a user resets a password, calculating the logic and queuing the email returns a UI response in ~40ms; the horizon worker actually dispatches the email to the mail provider moments later.
- **Markdown Templates**: We exclusively use robust Blade markdown templates for styling consistency. It ensures our emails render perfectly across Gmail, Apple Mail, and outlook mobile apps without writing horrific raw HTML tables. 
- **Transactional Focus**: Our primary mailing structure is heavily transactional—receipts, warnings, security alerts. We consciously push engagement via Mobile Push Notifications first, since university students rarely check their email inboxes for casual study prompts.

---

## 🎯 Final Thoughts for the Team
Constraints breed phenomenal engineering. We aren't building a basic CRUD app for users on gigabit fiber. We are building a fault-tolerant engine that survives power cuts, bad edge networks, and broken XML math tags. 

