# Skeeme Core Project Memory

Last compiled: 2026-11-08

This is the project handoff document for future agents and contributors. It records
the main architecture, durable product/engineering decisions, completed work known
from the repository and session history, and items whose current status still needs
verification. Treat source code and live provider dashboards as authoritative when
they disagree with this document.

**Keep this file current:** at the end of each repository engineering task, update
the current-state and open-items sections and add a concise entry under
[Recent engineering history](#recent-engineering-history). Record files changed
and validation actually performed. Never record credentials, tokens, private keys,
or full environment-file contents.

## Product at a glance

Skeeme is an AI-powered study companion for students. The product brings study
materials, explanations, practice, revision, and progress into one workflow. The
main mobile features include:

- Scan or upload questions and request step-by-step AI explanations.
- Chat with an AI tutor using the student's learning preferences.
- Generate quizzes and flashcards from topics or study materials.
- Study flashcards with review tracking and spaced repetition.
- Summarize documents and export study materials.
- Track daily activities, streaks, rewards, exams, and study progress.
- Use a Free plan for core study tools and Pro for higher daily usage limits.

Product and marketing guardrails are in [PRODUCT.md](./PRODUCT.md): the service is
for users 13+, do not claim unverified academic outcomes or testimonials, and be
clear that submitted study material is sent to AI providers. The design system in
[DESIGN.md](./DESIGN.md) describes the public website; it is not a mandate to make
the mobile UI look like the website.

## Repository map

| Path | Role | Notes |
|---|---|---|
| [`student-app/`](./student-app/) | Student mobile app | Expo / React Native; primary client. Start with [`student-app/README.md`](./student-app/README.md). |
| [`skeeme-go/`](./skeeme-go/) | Primary API backend | Go service, deployed at `https://skeeme.brimble.app`; start with [`skeeme-go/README.md`](./skeeme-go/README.md). |
| [`ai-service/`](./ai-service/) | Separate Node/Express AI service | Contains scan, quiz, and flashcard routes. Its current production role relative to the Go API must be verified before changing routing. |
| [`web/`](./web/) | Public website | Static Firebase Hosting site with a Firebase Functions contact endpoint. |
| [`skeeme-logger/`](./skeeme-logger/) | Log dashboard/service | Socket.IO dashboard and in-memory recent-log ingest service; inspect before relying on it for durable logs. |
| [`_dump/`](./_dump/) | Legacy Laravel application snapshot | The Go service retains Laravel Sanctum token compatibility. Do not assume the dump is the production backend. |
| [`Skeeme Admin.xcworkspace`](./Skeeme%20Admin.xcworkspace/) | Xcode workspace | Purpose and current build/release status have not been fully reviewed. |
| [`PRODUCT.md`](./PRODUCT.md) | Product/marketing constraints | Website-focused product facts and messaging limits. |
| [`DESIGN.md`](./DESIGN.md) | Website design system | "Annotated Study Guide"; mobile may keep native platform styling. |

The root [README.md](./README.md) is a short product overview. This file is the
cross-repository handoff; component-specific setup remains in each subproject's
README.

## Mobile app

### Stack and structure

- Expo SDK 57, React Native 0.86, React 19, TypeScript.
- Expo Router file-based routes; NativeWind/Tailwind, Reanimated and Moti.
- Zustand auth/user state, TanStack Query for server state, Axios-based API client.
- KaTeX / markdown rendering for math and explanations.
- Native integrations include camera and image picker, notifications, secure
  storage, PDF export/sharing, RevenueCat, Superwall, PostHog, and Google sign-in.
- The app uses the Go API by default:
  `https://skeeme.brimble.app/api/v2/student/`.

Important locations:

- `student-app/app/`: screens and Expo Router routes.
- `student-app/app/(onboarding)/`: personalization/onboarding.
- `student-app/app/(drawer)/(tabs)/`: primary Home, History, and Chat tabs.
- `student-app/components/`: reusable UI, quiz and flashcard views.
- `student-app/hooks/`: student and app hooks.
- `student-app/lib/api.ts`: API client and network behavior.
- `student-app/lib/aiStream.ts`: SSE streaming.
- `student-app/lib/monetization.tsx`: Superwall integration/provider.
- `student-app/lib/revenuecat.ts`: RevenueCat SDK initialization and purchase helpers.
- `student-app/lib/offlineSaved.ts`: local quiz/deck saves and validation.
- `student-app/store/authStore.ts`: authentication and user state.

### Navigation and visual direction

The mobile app was moved toward Expo Router native tabs and native stack headers.
The primary tabs are Home, History, and Chat; Chat hides the tab bar. Other screens
remain stack routes. Route-group names are not URL segments, so validate deep links
and redirects after route-file moves.

`expo-glass-effect` is a direct dependency. `components/ui/Glass.tsx` centralizes
Liquid Glass availability checks and solid fallbacks. Glass is intended for
appropriate control-layer surfaces, not content cards or forms. The design
direction is native-first, accessible, and restrained; do not simulate glass with
decorative blur/rims where the OS control is appropriate. The app has an iOS-first
SF Symbols mapping through `components/ui/Icon.tsx`, with Lucide fallback for
non-iOS and unmapped icons. Symbol coverage and device-level visual validation are
not complete.

The user explicitly prefers:

- Native iOS controls and navigation where practical.
- Liquid Glass only for controls/floating control surfaces, with Android and
  accessibility fallbacks.
- Spacious, sufficiently large navigation targets.
- Preserving app behavior and Android behavior during iOS-specific work.

### Mobile functionality and service boundaries

- Auth includes email/password, OTP verification, Google OAuth, and account
  recovery. The Go backend accepts Laravel Sanctum-compatible tokens.
- AI scan/chat and generated study content are backend/provider features; don't
  put model-provider secrets in the mobile client.
- Offline saved quizzes/decks are local copies, distinct from server history.
  Saving should fail visibly if content cannot be fetched, validated, or written;
  never report an empty copy as successfully saved.
- Flashcard session recording is also used for study-streak and daily-goal state.
  The backend is the source of truth for the persisted streak.
- Product and subscription UI must agree with the store product's actual terms.
  A client-side trial switch cannot override App Store introductory-offer
  eligibility.
- AI feature access is authorized by server-side daily plan quotas; never rely
  on client-side checks to enforce Free or Pro limits.

## Go API backend

`skeeme-go/` is the primary backend. It is a Go 1.25 module using Chi HTTP
routing, PostgreSQL (`sqlx`/`lib/pq`), Redis, and structured internal packages.
Main areas include:

- `cmd/api/`: HTTP server and maintenance CLI entry point.
- `internal/handlers/`: auth, AI, quizzes, flashcards, streaks, billing, referrals,
  file extraction, and other HTTP handlers.
- `internal/ai/`: provider clients and AI routing.
- `internal/usage/`: server-side daily AI quotas and request reservations.
- `internal/credits/`: legacy credit accounting retained for compatibility/admin
  tooling; it is no longer the student-facing AI authorization model.
- `internal/db/`, `internal/cache/`: PostgreSQL and Redis.
- `internal/auth/`, `internal/middleware/`: token checks and request middleware.
- `internal/jobs/`: cleanup, backups, streak reset, and AI health checks.
- `migrations/`: reference database schema.

The API includes daily AI usage reservations, RevenueCat and Paystack webhooks,
an AI provider switchboard, and background scheduling. Backups use S3-compatible
Cloudflare R2 configuration. Production URLs and API route overview are in the Go
README; check the current handler/router code before relying on any individual
endpoint detail.

### AI/OCR provider behavior

- Main generation supports DeepSeek and Anthropic, with runtime provider selection
  documented in the Go README.
- OCR supports RapidAPI Best OCR, Replicate DeepSeek OCR, and Google Cloud Vision.
  `OCR_PROVIDER` explicitly selects the active provider; when unset, configuration
  prefers RapidAPI, then Replicate, then Google Cloud Vision.
- RapidAPI uses the `best-ocr-api.p.rapidapi.com/parse/image` multipart endpoint
  and `RAPIDAPI_API_KEY`, which must remain a backend-only secret. Google Cloud
  Vision remains selectable with `OCR_PROVIDER=google_vision`.
- The Replicate client uses the predictions API, handles immediate and polled
  results, and uploads larger files through the Replicate file API. Current source
  recognizes both `succeeded` and `successful` statuses and uses the `content`
  multipart field.
- Replicate is usage-priced, and images/documents sent for OCR are transferred to
  that provider. Keep its token server-side only.
- A Replicate token was previously exposed in chat. Whether it was revoked and a
  replacement configured in Brimble was not verified. Treat that token as
  compromised; never reuse, request, or write it into this repository.

`ai-service/` is a separate Express/TypeScript service with scan, quiz, and
flashcard routes. Its production traffic relationship to the Go service is not
confirmed. Check deployment and client URLs before editing either service.

## Web and auxiliary services

- `web/` hosts the public website through Firebase Hosting. Its `functions/`
  directory has the `send-contact` function. `PRODUCT.md` and `DESIGN.md` are
  website-facing guides.
- `skeeme-logger/` ingests logs at `/ingest`, broadcasts through Socket.IO, and
  keeps only the last 500 entries in process memory. Do not assume it is a
  production-grade or persistent observability platform.
- `_dump/` appears to be a Laravel-era snapshot. The active Go service's
  Sanctum-compatible authentication exists to support legacy tokens; determine
  data ownership/migration before changing database or auth behavior.

## Monetization and provider configuration

### Free-to-Pro daily usage policy

The approved product model removes student-facing credits and top-ups. The app
uses daily server-enforced quotas (UTC reset) shared by the Go AI handlers and
the separate Node AI service:

| Feature | Free per day | Pro per day |
|---|---:|---:|
| Tutor chat requests | 2 | 200 |
| Scan and solve | 1 | 30 |
| Quiz generations | 1 (up to 10 questions) | 30 |
| Flashcard-set generations | 1 (up to 10 cards) | 30 |
| Study summaries | 1 | 30 |

These are request/generation counts, not counts of individual quiz questions or
flashcards. The app shows a plan-limit modal for a `429` response with code
`daily_limit_reached`. Ads are deferred; do not add an ad SDK without a separate
product decision. Current subscription prices remain unchanged.

The additive migration [`skeeme-go/migrations/002_daily_ai_usage.sql`](./skeeme-go/migrations/002_daily_ai_usage.sql)
must be applied to PostgreSQL before deploying quota-enforcing backend code.
No automatic migration runner or production application of this migration has
been confirmed. Student-facing credit screens/routes and signup/reward credit
grants have been removed, while legacy database fields and admin credit tooling
remain for compatibility. Request idempotency records older than 30 days are
pruned by the backend scheduler/cleanup command; daily usage totals are retained.

### Product decisions

- iOS bundle ID / Android package: `com.skeeme.app`.
- Pro entitlement identifier used by app logic: `pro`.
- Apple monthly SKU: `com.skeeme.app.pro_monthly`, $6.99/month, 7-day introductory
  free trial (US base terms).
- Apple yearly SKU: `com.skeeme.app.pro_yearly`, $34.99/year, no introductory
  trial (US base terms).
- The intended subscription group is “Skeeme Plans.” Pricing varies by storefront.
- RevenueCat remains the purchase processor; Superwall is used for paywall
  presentation. Do not create a duplicate Pro entitlement or change the billing
  provider without the user's explicit direction.
- Android should remain unchanged during iOS campaign/product work unless asked.

### Superwall state and caution

Last verified dashboard state on 2026-11-08:

- Superwall project `24476`; iOS app `47457`; Android app `47458`.
- iOS upgrade placement `upgrade_trigger` routes to the iOS upgrade paywall
  (paywall `287634`).
- iOS onboarding placement `onboarding_trigger` routes to the iOS onboarding
  paywall (paywall `287635`).
- The upgrade paywall `287634` is published. Both `upgrade_trigger` and
  `onboarding_trigger` currently route to it.
- The iOS yearly discount paywall `290222` is published (version 5) and bound to
  `com.skeeme.app.pro_yearly`. Its Apple introductory offer is pay up front for
  one year: $17.49 in the US, then the existing $34.99 annual renewal. Apple
  equalizes the offer across the 175 territories where the product is available.
  The monthly 7-day intro offer is in the same subscription group; customers who
  used it cannot use the annual intro offer.
- Campaign `117415` uses `upgrade_discount_trigger`; its placement and no-active-Pro
  audience are enabled, with paywall `290222` as the 100% treatment. The app code
  samples 50% of genuine iOS upgrade-paywall dismissals into this placement, so
  the app build containing that code must ship before users can trigger it.
- App Store Connect currently reports both subscription products as
  `READY_TO_SUBMIT`. Verify their submission/review status before expecting the
  annual offer to be available for live purchases.

This is a historical snapshot; verify in the Superwall dashboard before changing
or diagnosing live behavior. `PlacementNotFound` had been reported from app
runtime even though dashboard routes appeared correct. A later simulator screenshot
showed the paywall itself displaying.

On 2026-11-08, the iOS simulator dev client loaded the Superwall native module,
but tapping Upgrade emitted `Trying to present paywall without the Superwall
config.` The local iOS public key was verified to match app `47457`. After the
user restarted Metro with `--dev-client --clear` and fully relaunched the
simulator app, they reported that both paywalls worked. The exact cause was not
confirmed. Metro's package `exports` fallback warning and RevenueCat's
`Purchases-LogHandlerEvent` warnings did not establish the cause.

The free-trial switch on paywall `287634` changes UI state only; it cannot change
Apple's subscription offer or a user's eligibility. Its editor changes were
published on 2026-11-08. The Android discount editor preview showed $9.74/year
(50% off $19.49), while the configured Play Store promotional yearly product is
$7.49/year; verify this price/copy mismatch before relying on the Android offer.
No Android paywall or product was changed during the iOS discount work.

## iOS build and TestFlight

Current mobile config at last inspection:

- App version `1.2.5`, iOS build number `6`.
- EAS profiles: `development`, `preview`, and `production`; production includes
  public app configuration for the backend, Superwall, and RevenueCat.
- Do not copy key values from `eas.json`, `.env`, or EAS output into docs/issues.
  Public SDK keys still should be kept out of unnecessary logs and documentation;
  server/private credentials must never be embedded in the app.
- There is no configured iOS `submit.production` profile in `eas.json`; first
  App Store Connect submission may prompt for upload configuration.

The first EAS iOS production build failed at CocoaPods installation because the
Swift pod `AppCheckCore` required module maps for `GoogleUtilities` and
`RecaptchaInterop`. `student-app/app.json` was amended via `expo-build-properties`
`ios.extraPods` to enable modular headers for both. Expo config resolution verified
the entries, but no successful EAS build or TestFlight upload was confirmed
afterward.

Usual commands:

```bash
cd student-app
npx expo start --dev-client
npx tsc --noEmit
npx eas-cli build --platform ios --profile production
npx eas-cli submit --platform ios --latest
```

Before another App Store upload, confirm the build number exceeds the last
uploaded build. EAS build, App Store Connect upload, processing, compliance, and
tester distribution are separate steps. No completed TestFlight release is
confirmed in this project memory.

## Significant engineering work known from prior tasks

This is a durable summary, not an exhaustive Git log. Use `git log` and the
relevant source/tests for exact diffs.

### Navigation, accessibility, and icon work

- Introduced the shared Liquid Glass wrapper and moved toward native tabs and stack
  headers while preserving route behavior.
- Fixed sizing/spacing issues in shared navigation controls and removed duplicate
  back-button rendering.
- Added Android/non-supported-iOS solid fallbacks and accessibility-aware glass
  behavior.
- Introduced iOS SF Symbols through the shared icon abstraction and adjusted
  selected onboarding/home/history/quiz/flashcard surfaces.
- Adjusted global retry/network handling after a modal could remain open due to
  stale reachability state.
- Full visual validation across every migrated screen has not been confirmed.

### Flashcards, streaks, and daily goal

- Added flashcard counts to the deck-list response after History showed zero cards.
- Corrected the flashcard-session payload to send `flashcard_deck_id`.
- Added transactional streak updates when recording a study session and exposed
  streak information to the client.
- Changed milestone celebration to wait for the persisted server result instead
  of predicting a streak on the client.
- Based daily flashcard task completion on recorded sessions rather than deck
  creation/update dates; fixed visible daily-goal progress fill.

### History, quiz reports, and study text

- Refined History cards and quiz-report controls/content, including bookmark
  affordances and simplified score/review presentation.
- Added shared topic title formatting: title-case words while preserving “of,”
  “and,” “or,” and “in” in lowercase and retaining all-caps acronyms.

### Reliable offline saves

- Strengthened offline quiz/deck saves with required-content validation, surfaced
  storage errors, write-then-read verification, and failure messages instead of
  success-shaped empty saves.
- Expanded saved question metadata and made the saved quiz reader recognize
  `question_type` when `type` is absent.
- Latest offline-save changes were not yet revalidated in the last recorded
  session; rerun TypeScript checks and test representative quiz/deck saves before
  treating the guarantee as fully verified.

### OCR and chat retry

- Added the Replicate OCR integration and tests; later corrected its community
  model API path/version, upload schema, and terminal-success handling.
- Earlier Go tests, race tests, and `go vet` passed on the integration at recorded
  checkpoints. The current backend source should be the authority for later fixes.
- Changed chat retry behavior to reuse the existing user turn/image instead of
  appending duplicate prompt content.

## Current follow-ups (verify before acting)

1. **Daily quotas rollout:** apply `skeeme-go/migrations/002_daily_ai_usage.sql`
   to the target database before deploying the Go API/AI service. Confirm the
   deployed Node AI service's `GO_API_URL` points to the Go API root, `/api`, or
   `/api/v2`; its client normalizes these to the `/api/v2/internal/ai` routes.
   Update Superwall paywall copy to describe the actual daily fair-use limits,
   since editor/dashboard copy is not part of this repository.
2. **TestFlight:** rerun the production iOS EAS build after the modular-header
   change. If it succeeds, submit and complete App Store Connect processing and
   tester setup. No successful build/upload is recorded.
3. **Superwall editor:** verify the switch/CTA edits were saved and published.
   Resolve the stale missing Play Store `primary` product on the iOS paywall and
   test the actual simulator purchase flow.
4. **Paywall runtime:** recheck whether `PlacementNotFound` still occurs; prior
   dashboard state and simulator state were not enough to establish a complete
   end-to-end fix.
5. **Replicate:** verify the exposed token was revoked and a replacement is set
   privately in Brimble; do not ask for it in chat. Confirm deployment and budget.
6. **Offline saves:** rerun `cd student-app && npx tsc --noEmit` and focused tests
   for full quiz/deck fetch, validation, persistence, offline reopen, and error
   handling after the latest code changes.
7. **Visual migration:** smoke-test native tabs/headers, route redirects, flashcard
   back behavior, streak modal presentation, and accessibility settings on a
   simulator/device. The last confirmed simulator was an iPhone 17 on iOS 26.3;
   that runtime may no longer be open.
8. **SwiftUI:** SwiftUI migration was discussed only. The current mobile app is
   Expo/React Native; no SwiftUI rewrite was started or approved.

## Development and validation

Mobile:

```bash
cd student-app
npm install
npx expo start --dev-client
npx tsc --noEmit
npx expo lint
```

Backend:

```bash
cd skeeme-go
go test ./...
go test -race ./internal/ai ./internal/handlers
go vet ./...
```

Go was installed for the developer's macOS environment during prior work; an
automation shell previously needed `/usr/local/go/bin` added to `PATH`. ESLint
has produced existing violations in large screens, so report whether a lint issue
is pre-existing rather than silently broadening scope.

## Working-tree and security rules

- The repository is often dirty. Inspect `git status` before edits and preserve
  user changes; don't reset, checkout, or clean unrelated files.
- Never commit `.env` files, API keys, OAuth secrets, signing credentials, Apple
  keys, RevenueCat secret keys, or the Replicate token. Don't print them in logs or
  documentation. Use platform secret stores for server credentials.
- Public SDK keys may be required in app configuration, but still must not be
  copied into this memory or exposed unnecessarily.
- Be explicit about provider costs and third-party transfer of student study
  content, especially for OCR/model changes.
- Keep account/dashboard actions scoped to the user's request; verify live state
  rather than trusting old IDs or historical notes.
- For any release or subscription change, distinguish local configuration,
  dashboard state, build success, App Store processing, and actual tester
  availability.

## Recent engineering history

Add one short dated entry after each engineering task. Include the user goal,
important files/areas changed, exact validation performed, and any remaining
action. Do not include unrelated personal information or secrets.

### 2026-11-08 — Add iOS yearly discount follow-up draft

- Duplicated Android discount paywall `234322` into iOS as draft `290222`,
  removed the Play Store bindings, and bound the iOS annual SKU
  `com.skeeme.app.pro_yearly`. Copy now uses the localized first-year offer price
  only for introductory-offer-eligible users and otherwise displays the regular
  annual plan and renewal price.
- The initial App Store offer was intended to be $17.49 for one year in the US.
  Later verification found that Apple's configured US price was $17.99; the
  correction is recorded in the activation entry below.
- Created campaign `117415` for `upgrade_discount_trigger`, with the draft paywall
  as its treatment. The campaign placement and audience are disabled pending
  publication and app rollout.
- Updated `student-app/app/paywall.tsx` to offer the follow-up to 50% of iOS
  upgrade-paywall dismissals (not onboarding, skips, or errors), and
  `student-app/lib/monetization.tsx` to distinguish genuine dismissals from
  placement skips/errors.
- Validation at that checkpoint: `cd student-app && ./node_modules/.bin/tsc
  --noEmit` passed; targeted ESLint completed with existing warnings and no
  errors; `git diff --check` passed. The paywall was still a draft and the
  campaign placement/audience were disabled. The editor preview had no store
  price values, so dynamic prices appeared blank.
- The app build was not created or shipped; see the activation entry for the
  current dashboard state and remaining rollout steps.

### 2026-11-08 — Correct and activate iOS yearly discount follow-up

- Verified the App Store offer was pay up front for one year, but its US price was
  $17.99 instead of the approved $17.49. Apple has a $17.49 price point. With user
  approval, removed the existing offer records and recreated offers for all 175
  available territories at the $17.49 US reference price, starting 2026-11-08.
  The regular $34.99 US annual renewal price was not changed.
- Published paywall `290222` as version 5 and enabled campaign `117415`'s
  `upgrade_discount_trigger` placement and no-active-Pro audience. The treatment
  points to the yearly discount paywall.
- The CLI's `asc offers create` documentation says overlapping offers are
  overwritten, but Apple rejected the attempted replacement with HTTP 409. This
  was reproduced on current CLI 2.5.1 and reported to Superwall (feedback request
  16). The rejected request did not change the offer; the existing offers were
  then replaced with the user's approval.
- Validation: App Store Connect returned 175 offers with no mode/duration/date
  mismatches and a US price of $17.49; `paywalls get` confirmed paywall version 5
  is active; `campaigns get` confirmed the placement and audience are enabled.
- Remaining: ship the app build containing the 50% genuine-dismissal routing and
  verify the App Store subscription submission/review state (`READY_TO_SUBMIT`
  at last check) before expecting eligible live customers to purchase the offer.

### 2026-11-08 — Diagnose Superwall configuration error in iOS dev client

- The user reported the homepage upgrade button failing with
  `Trying to present paywall without the Superwall config.` after restarting
  Metro with `--dev-client --clear`. The simulator logs show the Expo Superwall
  native module loading; the local iOS public key matches Superwall app `47457`.
- A temporary key-free diagnostic showed the JS store as configured while the
  native SDK reported `PENDING`; the instrumentation and temporary development
  config-manager debug logging were removed after the user confirmed both
  paywalls started working following a full app relaunch.
- Root cause was not confirmed. No provider, API-key, placement, or campaign
  changes were made to address this runtime issue.

### 2026-11-08 — Replace student credits with daily plan quotas

- Implemented Free/Pro daily quotas in Go for scan, tutor chat, quizzes,
  flashcards, and summaries; added atomic usage reservations and migration
  `skeeme-go/migrations/002_daily_ai_usage.sql`, plus 30-day request-record
  cleanup.
- Aligned the Node AI service authorization, completion, release, feature caps,
  and quota-error responses with the Go API; removed student-facing credit
  screens, rewards, referral-credit promises, and credit endpoints. Preserved
  legacy database/admin credit compatibility. Added plan-limit UI and updated
  Home upgrade copy.
- Validation: `cd skeeme-go && go test ./...`; `cd student-app && ./node_modules/.bin/tsc --noEmit`;
  `cd ai-service && ./node_modules/.bin/tsc --noEmit` all passed.
- Remaining: apply the migration and deploy the backend/service; update and
  verify the live Superwall paywall copy. No production deployment was performed.

### 2026-11-08 — Create project handoff documentation

- Added this cross-repository architecture/history guide and root `AGENTS.md`
  instructions to keep it updated after future engineering tasks.
- Linked the guide from the root `README.md`.
- Checked project READMEs, product/design docs, app/backend configuration, relevant
  source, and seven saved session checkpoints. No application code was changed.
- Verified the documented Expo Podfile modular-header settings resolve correctly
  in Expo config during prior build troubleshooting; this documentation-only task
  did not rerun builds or tests.
