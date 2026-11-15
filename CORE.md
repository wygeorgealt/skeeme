# Skeeme Core Project Memory

Last compiled: 2026-11-15

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
- AI tutor chat code remains in the app, but its screen is currently hidden from
  navigation.
- Generate quizzes and flashcards from topics or study materials.
- Study flashcards with review tracking and spaced repetition.
- Summarize documents and export study materials.
- Track streaks, rewards, exams, and study progress.
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
- `student-app/app/(onboarding)/`: auth selection and learning-preference onboarding.
- `student-app/app/(drawer)/(tabs)/`: Home is the only visible tab; Chat and
  retained History routes are hidden from app navigation.
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
Home is the only visible primary tab. Chat and History routes remain in the code
but are hidden from app navigation; quiz and flashcard history persistence
continues. Other screens remain stack routes.
Route-group names are not URL segments, so validate deep links and redirects
after route-file moves.

`expo-glass-effect` is a direct dependency. `components/ui/Glass.tsx` centralizes
Liquid Glass availability checks and solid fallbacks. Glass is intended for
appropriate control-layer surfaces, not content cards or forms. The design
direction is native-first, accessible, and restrained; do not simulate glass with
decorative blur/rims where the OS control is appropriate. The app has an iOS-first
SF Symbols mapping through `components/ui/Icon.tsx`, with Lucide fallback for
non-iOS and unmapped icons. Symbol coverage and device-level visual validation are
not complete.

The auth selection screen holds the static blue `#0057B8` and yellow `#FFDF00`
theme shown in the user's simulator screenshot. Its bottom-aligned, narrower
"Get started" button is yellow with blue text, and the text-only "Already have
an account? Log in" link sits below it and opens `/login`. Satoshi Regular,
Medium, Bold, and Black are loaded by the root font loader and applied across
app-owned React Native text through shared `Text` and `TextInput` wrappers. The
wrappers map React Native weights and NativeWind weight classes to the
corresponding static Satoshi face, then remove generic weight styling so the
selected face controls its own weight. Explicit non-Satoshi families and
monospaced math remain supported. Above the CTA, “Turn pages into” uses Satoshi
Bold at 32/40 in yellow. “BRIGHT IDEAS” stays in Bungee Regular at 40, also in
yellow; the headline and page no longer cycle colors or fonts. The four added
display fonts use the SIL Open Font License, with license files alongside the
assets. The headline group has a 36-point gap above the CTA. A centered,
flexible hero stage above the headline hosts the looping, muted “Idle → Wakes”
test mascot. It uses the Masko React Native player with HEVC on iOS and stacked
MP4 on Android, pauses when offscreen or backgrounded, and shows its still frame
when Reduce Motion is enabled. The current auth-select JSX does not render a
legal notice.
The “Get started” CTA opens a seven-step learning-preference flow: learning
goals, explanation preferences, study challenges, daily goal, a personalized
summary, and optional reminders, following the auth-selection welcome screen.
Answers persist while navigating backward, and the summary only includes
selected preferences. Registration follows onboarding through the existing
signup flow; registration and authenticated onboarding save answers under
`ai_preferences.onboarding_answers`. Reminder permission is requested only
after an explicit time selection and opt-in action. Users who skip or decline
reminders do not receive a permission prompt. The shared onboarding shell keeps
progress at the top and anchors the mascot, question, bordered text-only choices,
and fixed Continue action toward the bottom. Unselected borders are gray;
selected borders and checkmarks are blue, with the enabled action in yellow.

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

The Go API applies numbered SQL migrations automatically at startup using the
embedded runner in `skeeme-go/migrations/migrate.go`; it tracks applied versions
in `skeeme_schema_migrations` and takes a PostgreSQL advisory lock. The
`001_schema.sql` file is reference-only and is deliberately skipped. This runner
was added after production logs confirmed `002_daily_ai_usage.sql` had not run;
the first restart after deployment applies its idempotent quota-table DDL before
the API accepts requests. Student-facing credit screens/routes and signup/reward
credit grants have been removed, while legacy database fields and admin credit
tooling remain for compatibility. Request idempotency records older than 30
days are pruned by the backend scheduler/cleanup command; daily usage totals are
retained.

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
   simulator/device. Home simplification, single-Home-tab navigation, onboarding
   header spacing, the auth selection's bottom CTA/account link, and the mascot
   were checked on the current iPhone 17 simulator after a native dev-client
   rebuild. The iPhone 17 also showed the auth page holding the static
   blue/yellow theme after the latest change. Metro's nested encoded font path
   caused the iOS dev-client `ENOENT`; the new asset plugin rewrites local TTFs
   to direct asset paths. Remaining migration checks are open.
8. **SwiftUI:** SwiftUI migration was discussed only. The current mobile app is
   Expo/React Native; no SwiftUI rewrite was started or approved.
9. **Auth mascot:** replace the current “Idle → Wakes” test clip with the final
   mascot asset/direction when the user provides it.
10. **Onboarding verification:** the latest iPhone 17 simulator capture still
    shows borderless, vertically stacked choices and a text-only Continue
    control, although the current source has bordered rows and a full-width
    button. Reload the development client when the simulator is available, then
    verify selected states, back-navigation, summary, and reminder paths. The
    Settings screen's Study Reminders switch remains local-only.

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

### 2026-11-15 — Build learning-preference onboarding

- Replaced the blank onboarding entry with the learning-goals, explanation,
  study-challenges, daily-goal, personalized-summary, and optional-reminder
  screens. Connected answer persistence to signup and authenticated profiles,
  and gated notification registration on explicit reminder opt-in.
- Added a focused handler test covering authenticated onboarding profile
  persistence. Updated the mobile route documentation.
- Validation: student-app TypeScript check, Go handler tests, and iOS Expo
  export passed. `git diff --check` passed. Targeted ESLint on the onboarding
  routes and related files reported zero errors and 56 warnings; a broader
  targeted run still reports the existing `login.tsx` state-in-effect error.
  Simulator interaction was interrupted, so the onboarding screens remain
  visually unverified.

### 2026-11-15 — Refine onboarding selection layout

- Removed decorative option icons and tightened the choice rows into separate
  bordered cards. The question and choices now bottom-align below the top
  progress bar; selection uses a gray border by default and a blue border/check
  when selected. The enabled Continue action is a full-width yellow button with
  blue text.
- Validation: TypeScript, targeted ESLint, iOS Expo export, `git diff --check`,
  and the Impeccable layout detector passed. Expo export continues to show the
  existing expo-superwall resolution warning. A follow-up simulator capture
  still showed the previous choice and Continue styling; a reload attempt was
  blocked by the simulator's focus guard, so runtime visual confirmation is
  still open.

### 2026-11-15 — Hold auth selection on blue and yellow

- Removed the 800ms headline color/font loop and its focus, app-state, and
  reduced-motion scheduling. The auth screen now stays on the blue `#0057B8`
  and yellow `#FFDF00` Bungee theme from the supplied screenshot; the mascot
  animation remains.
- Validation: student-app TypeScript check and iOS Expo export passed; targeted
  ESLint had zero errors and three existing unused legal-link warnings.
  `git diff --check` passed, and no headline-cycle logic remains. The Expo export
  still reports the existing expo-superwall resolution warning. The iPhone 17
  simulator showed the static blue/yellow screen and mascot.

### 2026-11-15 — Replace onboarding flow with blank start

- Routed “Get started” to a blank, theme-aware onboarding start screen, removed
  the old multi-step routes and their now-unused shared components, and removed
  the obsolete settings replay entry. Updated the auth guard and mobile route
  documentation.
- Validation: student-app TypeScript check and iOS Expo export passed; targeted
  ESLint had zero errors and 34 existing warnings. Including settings exposed
  its pre-existing `react-hooks/set-state-in-effect` error at `settings.tsx:90`.
  `git diff --check` passed, and no references to the deleted routes or
  components remained in app source.

### 2026-11-14 — Fix Metro font asset requests

- Fixed the nested encoded font asset URL that caused the iOS dev-client
  `ENOENT` and left the app on its splash screen. A Metro asset plugin now
  rewrites only TTFs in `assets/fonts` to direct asset paths; other assets are
  unchanged.
- Validation: plugin assertions passed; a fresh iOS dev bundle used direct
  paths for all eight fonts and all eight asset requests returned HTTP 200;
  TypeScript, targeted ESLint, iOS Expo export, and `git diff --check` passed.
  The simulator later returned to auth-select; the headline-size visual check
  is recorded below.

### 2026-11-15 — Fit Pacifico auth headline

- Reduced only the Pacifico theme's headline size from 40 to 34 so its script
  lettering has more room inside the existing highlight.
- Validation: student-app TypeScript check passed; targeted ESLint had no errors
  (three existing unused legal-link warnings); `git diff --check` passed. The
  simulator was inspected on the Bodoni theme; Pacifico's green theme still
  needs a visual fit check.

### 2026-11-15 — Match auth page to headline colors

- Made the full auth-selection background follow the headline's color cycle and
  matched the intro, CTA, account prompt, and status-bar style to each theme for
  contrast.
- Validation: student-app TypeScript check passed; targeted ESLint had no errors
  (three existing unused legal-link warnings); `git diff --check` passed. The
  iPhone 17 screenshot showed the blue/yellow theme; other cycle states remain
  to be visually checked.

### 2026-11-14 — Cycle auth headline colors and fonts

- Added five high-contrast headline color/font themes that switch together every
  800ms. The cycle pauses when auth-select loses focus, the app backgrounds, or
  Reduce Motion is enabled. Added Bungee, Comic Neue, Bodoni Moda, and Pacifico
  font assets with their SIL Open Font License files.
- Validation: student-app TypeScript check passed; targeted ESLint had no errors
  (three existing unused legal-link warnings in auth-select and warnings in
  app/_layout.tsx); `git diff --check` passed for the changed UI files; the iOS
  Expo export succeeded and included all four new fonts; the generated Metro
  `unstable_path` requests for those assets returned HTTP 200; each color pair's
  contrast exceeds 5:1. The iPhone 17 Simulator remains at the dev-client
  launcher, so the animated screen still needs a visual review.

### 2026-11-14 — Add auth-selection mascot test animation

- Added the supplied “Idle → Wakes” clip above the auth headline using the
  maintained `@masko/player-react-native` Expo module. The player uses the
  transparent HEVC file on iOS and stacked MP4 on Android, mutes audio, respects
  Reduce Motion, and pauses when offscreen/backgrounded. The deprecated
  `expo-transparent-video` package was not added.
- Validation: student-app TypeScript check passed; targeted ESLint had no errors
  (three existing unused legal-link warnings); iOS and Android Expo autolinking
  resolved the Masko module; `git diff --check` passed. The iOS dev-client build
  succeeded, installed, and launched on iPhone 17; the auth screen showed the
  mascot and no unimplemented native-view error. Android was autolink-checked
  only; native build/device review remains open.

### 2026-11-14 — Migrate app typography to Satoshi

- Routed app-owned React Native `Text` and `TextInput` usage through shared
  Satoshi-aware wrappers across 48 files. The wrappers map weight styles to
  static Satoshi faces and remove generic font weights when a Satoshi face is
  selected, while preserving explicit families and monospaced text.
- Validation: `cd student-app && npx tsc --noEmit`, targeted ESLint for the
  shared font resolver and wrappers, and `git diff --check` passed. The iPhone 17
  screen was inspected, but a reload after the final weight-resolution change
  was blocked by the computer-use focus guard; fresh visual confirmation remains
  open.

### 2026-11-14 — Remove onboarding header gap

- Hid the blank nested stack header on the auth selection screen only; the
  screen's safe-area padding and headers on other onboarding routes are
  unchanged.
- Validation: student-app TypeScript check passed; targeted ESLint reported no
  errors and four warnings in `auth-select.tsx`; layout detector returned no
  findings; `git diff --check` passed. The iPhone 17 simulator confirmed the
  white gap is gone.

### 2026-11-14 — Simplify auth selection screen

- Replaced the carousel, onboarding copy, and legal footer with a white screen
  containing uniformly styled Google, Apple (iOS only), and Email buttons.
  Buttons use `#007AFF` with a `#FFDF00` accent and retain their existing actions.
- Validation: student-app TypeScript check, targeted ESLint, layout detector,
  and `git diff --check` passed; the iPhone 17 simulator showed the three
  buttons on the white screen.

### 2026-11-14 — Replace auth choices with Get started

- Replaced the provider buttons with one "Get started" button that opens the
  existing `/signup` flow.
- Validation: student-app TypeScript check and targeted ESLint passed; layout
  detector returned no findings; `git diff --check` passed; iPhone 17 simulator
  confirmed the single CTA on white.

### 2026-11-14 — Move Get started to bottom

- Anchored the auth selection CTA to the bottom of its white screen while
  preserving safe-area spacing.
- Validation: student-app TypeScript check and targeted ESLint passed; layout
  detector returned no findings; `git diff --check` passed; iPhone 17 simulator
  confirmed the bottom placement.

### 2026-11-14 — Narrow CTA and add login link

- Narrowed the bottom CTA and added a text-only existing-account prompt linking
  to `/login`. Used the accessible blue text token for the link; kept yellow as
  the CTA's signature shadow accent rather than low-contrast text on white.
- Validation: student-app TypeScript check and targeted ESLint passed; layout
  detector returned no findings; `git diff --check` passed; iPhone 17 simulator
  confirmed the narrower button and text link.

### 2026-11-14 — Add auth legal notice

- Added the requested subdued Terms of Use and Privacy Notice links beneath the
  Get started and Log in actions; the bottom-anchored group raises the actions to
  make room.
- Validation: student-app TypeScript check and targeted ESLint passed; layout
  detector returned no findings; `git diff --check` passed. Simulator review of
  this latest legal notice remains open because computer-use access was not
  approved.

### 2026-11-14 — Fix auth legal wrapping and link targets

- Kept “Privacy Notice” together by separating the legal sentence from a row of
  links, and gave the Log in, Terms of Use, and Privacy Notice links at least
  44-point touch targets without adding visible button styling.
- Validation: student-app TypeScript check and targeted ESLint passed; layout
  detector returned no findings; `git diff --check` passed. Simulator review
  remains open because computer-use access was not approved.

### 2026-11-14 — Tighten auth legal spacing

- Aligned legal-link labels to the start of their 44-point touch targets so the
  Terms row sits closer to the disclosure text without shrinking hit areas.
- Validation: student-app TypeScript check and targeted ESLint passed; layout
  detector returned no findings; `git diff --check` passed. Simulator review
  remains open because computer-use access was not approved.

### 2026-11-14 — Apply Satoshi to auth selection

- Added Fontshare Satoshi Regular, Medium, and Bold TTF assets; preloaded them
  with the existing Expo font loader and applied them only to the auth-select
  screen.
- Validation: student-app TypeScript check passed; targeted ESLint reported no
  errors (34 warnings across the two targeted files); type detector returned no
  findings; iOS Expo export succeeded with an existing expo-superwall resolution
  warning; `git diff --check` passed. The user-provided simulator screenshot
  showed the font applied.

### 2026-11-14 — Bold Get started label

- Added the Satoshi Black weight and applied it to the Get started button label.
- Validation: student-app TypeScript check passed; targeted ESLint reported no
  errors (34 warnings across the two targeted files); type detector returned no
  findings; `git diff --check` passed; iOS Expo export succeeded with the
  expo-superwall resolution warning. A post-change simulator review was not
  performed.

### 2026-11-14 — Add auth-selection headline

- Added “Turn pages into” in Satoshi Bold and “BRIGHT iDEAS” in Satoshi Black
  above the CTA, with blue text on a yellow highlight for contrast. Kept the
  white area above open for the planned animated mascot.
- Validation: student-app TypeScript check passed; targeted ESLint reported no
  errors and three existing unused legal-link warnings; Impeccable type scan
  returned no findings; iPhone 17 Simulator confirmed the headline placement.

### 2026-11-14 — Refine auth headline weight and spacing

- Kept “BRIGHT IDEAS” blue on yellow, changed its face to Satoshi Bold, and
  increased the gap below the headline group to 36 points. Both headline lines
  remain enlarged.
- Validation: student-app TypeScript check passed; targeted ESLint reported no
  errors and three existing unused legal-link warnings; Impeccable type scan
  returned no findings; iPhone 17 Simulator showed the larger headline and
  increased spacing.

### 2026-11-14 — Strengthen auth headline weight

- Switched “BRIGHT IDEAS” to the heavier Satoshi Black face while retaining blue
  lettering on the yellow highlight, 40/48 sizing, and 36-point CTA spacing.
- Validation: student-app TypeScript check passed; targeted ESLint reported no
  errors and three existing unused legal-link warnings; Impeccable type scan
  returned no findings; iPhone 17 Simulator was reviewed; `git diff --check`
  passed.

### 2026-11-14 — Reduce Home to its header and prompt

- Removed the study-tool shortcuts from Home so only the greeting/streak header
  and "Need help studying today?" prompt remain. Hid Chat alongside History in
  the tab bar, leaving Home as the only visible tab; route and feature code is
  retained.
- Updated the student-app route/capability notes.
- Validation: student-app TypeScript check and targeted ESLint passed;
  `git diff --check` passed; the iPhone 17 simulator showed only the requested
  Home content and tab.

### 2026-11-13 — Remove Home tasks and hide History navigation

- Removed the Home daily-goal/task UI and generation/completion logic, including
  its service and unused API fetches. Kept quiz and flashcard history writes and
  the history screens in code, but hid History from the primary tabs and removed
  account shortcuts that would navigate to those hidden routes.
- Updated the student-app route/capability notes.
- Validation: student-app TypeScript check passed; targeted ESLint reported no
  errors and eight warnings in `account.tsx`; `git diff --check` passed and the
  Impeccable detector returned no findings. The simulator confirmed the Home
  task/goal UI and History tab are absent.

### 2026-11-12 — Remove Pro upsell from Home

- Removed the Skeeme Pro promotion from the Home dashboard and tightened the
  goal-to-tools layout. Reworked the three study actions as compact blue-backed
  shortcuts and made goal/streak taps scroll to the measured task section rather
  than a fixed offset.
- Validation: `cd student-app && ./node_modules/.bin/tsc --noEmit` passed;
  targeted ESLint reported no errors and two existing warnings (unused `width`
  and animation hook dependencies); `git diff --check` passed. The user's
  simulator screenshot was reviewed to add more space above Daily Goal.
- No app build or release was produced. Fresh device/simulator review remains
  open under Visual migration.

### 2026-11-12 — Restore Home content and space the goal card

- The user's simulator capture showed the dashboard content missing and the
  Daily Goal card too close to the headline. Removed the delayed opacity
  animation from the full content section, added explicit top spacing to the
  goal card, and retained generous hero bottom padding.
- Validation: `cd student-app && ./node_modules/.bin/tsc --noEmit` passed;
  targeted ESLint reported no errors and one existing unused-`width` warning;
  `git diff --check` passed. No fresh native simulator capture was completed.

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
