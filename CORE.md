# Skeeme Core Project Memory

Last compiled: 2026-11-18

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
- The onboarding account handoff supports Google and Apple provider sign-in,
  plus email signup and existing-account login; onboarding answers are persisted
  to the signed-in account before local onboarding data is cleared.
- The app uses the Go API by default:
  `https://skeeme.brimble.app/api/v2/student/`.

Important locations:

- `student-app/app/`: screens and Expo Router routes.
- `student-app/app/(onboarding)/`: auth selection and learning-preference onboarding.
- `student-app/app/(drawer)/(tabs)/`: Home, Library, and Profile are visible tabs;
  Create opens a separate action sheet, and Chat and retained History routes are
  hidden from app navigation.
- `student-app/components/`: reusable UI, quiz and flashcard views.
- `student-app/hooks/`: student and app hooks.
- `student-app/lib/api.ts`: API client and network behavior.
- `student-app/lib/aiStream.ts`: SSE streaming.
- `student-app/lib/monetization.tsx`: Superwall integration/provider.
- `student-app/lib/revenuecat.ts`: RevenueCat SDK initialization and purchase helpers.
- `student-app/lib/offlineSaved.ts`: local quiz/deck saves and validation.
- `student-app/store/authStore.ts`: authentication and user state.

### Navigation and visual direction

The mobile app uses Expo Router tabs and native stack headers. Home, Library,
and Profile sit in a floating, borderless pill with a BlurView confined to the
pill; its blur strengthens when the selected tab's content is scrolled. Create
is a separate blue circular action that opens the create sheet, with no
full-width rectangle behind the controls. Chat and History routes remain in
the code but are hidden from app navigation; quiz and flashcard history
persistence continues. Other screens remain stack routes.
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

The Learning Plan dashboard, bottom navigation, and Create sheet use Kubai
icons through `components/ui/KubaiNativeIcon.tsx`. Since `kubai-icons-react`
renders browser DOM, native screens use the static `kubai-icons` SVG data with
`react-native-svg`; onboarding, login, and welcome screens remain unchanged.
The detached Create Plus stays Lucide because no Kubai standalone match was a
good fit.

The auth selection screen holds the static blue `#0057B8` and yellow `#FFDF00`
theme shown in the user's simulator screenshot. Its bottom-aligned, narrower
"Get started" button is yellow with blue text, and the text-only "Already have
an account? Log in" link sits below it and opens `/login`. Allo Regular, Medium,
Bold, and Black replace Satoshi across app-owned text. iOS and Android use
bundled static OTF faces; web uses Allo's variable WOFF2 from `allo-font`.
Shared `Text` and `TextInput` wrappers map native weights and NativeWind
classes to static faces, and preserve variable weights on web. Explicit display
families and monospaced math remain supported. Above the CTA, “Turn pages into”
uses Allo Bold at 32/40 in yellow. “BRIGHT IDEAS” stays in Bungee Regular at
40, also in yellow; the headline and page no longer cycle colors or fonts. The
four added display fonts use the SIL Open Font License, with license files
alongside the assets. The headline group has a 36-point gap above the CTA. A
centered,
flexible hero stage above the headline hosts Lumi's looping enthusiastic
scribbling animation. It uses the Masko React Native player with HEVC on iOS
and stacked MP4 on Android, and shows its still frame when Reduce Motion is
enabled. The current auth-select JSX does not render a legal notice.
The “Get started” CTA opens a seven-step learning-preference flow: learning
goals, explanation preferences, study challenges, daily goal, a personalized
summary, and optional reminders, following the auth-selection welcome screen.
Answers persist while navigating backward, and the summary only includes
selected preferences. Registration follows onboarding through the existing
signup flow; registration and authenticated onboarding save answers under
`ai_preferences.onboarding_answers`. Reminder permission is requested only
after an explicit time selection and opt-in action. Users who skip or decline
reminders do not receive a permission prompt. The onboarding routes use shared
progress, question, and choice components with per-screen layouts. Question lists
and the personalized result reserve trailing scroll space so the final option or
content does not sit against the fixed lower action area or screen edge. The top
progress track is 75% of header content width (capped at 300 points) and is
centered independently of the Back button. The onboarding voice treats Skeemy
as a study companion, using first-person
questions where natural. Explanation preferences use the prompt “How would you
like me to explain things?” and four choices with supporting descriptions.
Previously saved step-by-step preferences remain readable in the personalized
summary. Selecting an answer on the first three question screens replaces
Skeemy's prompt with a choice-specific typed reply before advancing; daily-goal
selection advances to the summary from the explicit Continue button. Answers
remain selectable after returning with Back. Onboarding screens use native fades;
question prompts type once before their options softly reveal. Completed
entrances are remembered for the current app session, so returning to a step
does not replay the sequence. Reduced Motion skips typing and uses a brief fade.
The option list stays in layout while hidden to keep the mascot and question
stationary. Question screens use the animated mascot player and the native
platform-default stack transition rather than fading in. Platform-specific
mascot clips are bundled for the quietly writing onboarding animation, the
enthusiastic auth-selection animation, and the splash animation where Skeemy
peacefully opens his eyes. Choosing a daily study duration opens the
personalized study plan screen with the supplied lights-up animation. The
5.167-second clip is paused at 5.14 seconds, near its end. On screen entry, a
custom three-stage loader reads “Shedding light on your goals...”,
“Finding your brightest approach”, and “Setting your daily rhythm”; one
progress bar is visible at a time, without subtext. It fills in 4.2 seconds
(about 1.4 seconds per stage), reaching 100% before 4.5 seconds. The active
label uses primary text; inactive labels use readable secondary text. The
32/39 Allo Black heading and yellow progress/completion accents remain. The bar
stays full through the 860 ms final-pose hold. Skeemy then rises and shrinks as
the plan card slides into view on the same screen. The onboarding progress bar
and Continue button return after the card settles, while Back stays available
throughout; Back on the plan dismisses directly to the daily-goal picker.
Reduced Motion skips the loader and choreography and shows the
completed profile state. The latest timing and visual changes still need a
Simulator check. The startup splash uses the auth screen's blue (`#0057B8`) and stays visible for
5.2 seconds to give the animation time to
play. The revealed plan presents the user's learning goal, challenge,
explanation preference, and daily target as one concise conversational
summary selected from a local response bank. The bank is available immediately
and works offline; no live AI request is made during onboarding. The action
reads “Let’s do this!” with a right-arrow icon.
The daily-goal question asks “How long can we study for?” and uses a large,
vertically snapping carousel for 1–20 minutes, defaulting to 10 when there is no
supported saved value. The selected number and unit render inline to prevent
the unit wrapping below the number. A separate Continue action saves the
selected duration and opens the personalized plan. Summary copy handles one
minute as singular; saved legacy 30-minute and flexible answers remain
supported but are no longer offered in the picker. The carousel was reviewed
in the iPhone 17 Simulator; a final post-fix capture and gesture feel-check
remain open.

Before the first learning question, a name screen types “Hey, I'm Skeemy.
What's your name?” and waits for a non-empty first name. Continue saves it in
local onboarding data, replays the bundled name-wave animation while typing
“Nice to meet you, [name]!”, then advances to the first question. The clip is
restarted with an explicit Masko reset/play when the greeting begins, then
paused after 1.8 seconds rather than looping. The first name is sent with email
signup and social account creation.

After reminders, the completed plan is kept locally while the user creates or
signs into an account on the “Save your study plan” screen. Google uses the
existing native sign-in helper and browser Google Identity Services; Apple
identity tokens are verified by the Go API against Apple's signing keys. The
signed-in onboarding payload is saved before local answers are cleared. The
screen uses the supplied “Study Glow” Masko canvas; set
`EXPO_PUBLIC_MASKO_STUDY_GLOW_URL` in local or build environment configuration.
The key-bearing delivery URL is intentionally not kept in tracked source.
The first live pose clip (or pose event fallback) sets `behavior::focus`
instantly to interrupt the Idle loop and start the existing Idle-to-Reading
transition; the Reading self-edge keeps it looping. The auth choices are
full-width Apple, Google, and email buttons with distinct visual hierarchy.
Apple Sign-In requires an iOS native build with the Apple authentication module
and Sign in with Apple capability enabled. A development-only shortcut below
“Get started” on auth selection opens this screen with a preview parameter; its
Back action returns to auth selection. Normal startup routing is unchanged.

The user explicitly prefers:

- Native iOS controls and navigation where practical.
- Liquid Glass only for controls/floating control surfaces, with Android and
  accessibility fallbacks.
- Spacious, sufficiently large navigation targets.
- Preserving app behavior and Android behavior during iOS-specific work.

### Dashboard architecture and design philosophy

#### 1. Design philosophy
The dashboard functions as the student's personal study workspace, guided by three core principles:
- **Clarity:** Students immediately understand where to go and what to do without cognitive overload.
- **Continuity:** Students resume exactly where they left off across notes, summaries, flashcards, or quizzes.
- **Companionship:** Skeemy brings warmth and life to the workspace without competing with the actual study material.

Visual identity and palette:
- **Primary:** `#0755B5` (deep workspace blue reserved for important actions and primary focus)
- **Accent:** `#FFD500` (yellow highlight used sparingly for focal moments)
- **Surface:** `#F7F9FC` (calm, light grey/white workspace backgrounds; distinct from onboarding, which is allowed to be visually bold, whereas the dashboard is calmer and sustainable over hundreds of visits)
- **Text:** `#202B3C` (high-contrast dark slate text)
- Home labels and supporting copy use the dark text color rather than grey.

#### 2. Four-tab permanent navigation structure
The application's permanent primary navigation structure consists of four bottom tabs:
1. **Home:** Personal dashboard, recent activity, study overview, and learning rhythm.
2. **Library:** Comprehensive repository of all student notes, uploads, summaries, flashcards, and quizzes.
3. **Create:** Central action trigger that opens a native bottom sheet rather than navigating to a separate screen:
   - *New notes* (Start writing ideas)
   - *Upload material* (Bring in study documents)
   - *Generate summary* (Understand material faster)
   - *Create flashcards* (Build revision decks)
   - *Create a quiz* (Challenge understanding)
4. **Profile:** Account management, study preferences, daily goals, and application settings.

*Study Planner placement:* Not a standalone 5th tab. Upcoming scheduled study sessions are previewed directly on the Home dashboard with a direct link to the full planner, and study goals/scheduling remain accessible via Profile.

#### 3. Dashboard layout & section breakdown
The Home screen follows this hierarchy:
1. **Learning Plan header:** Screen title and an ellipsis options icon that
   currently opens Profile.
2. **Three direct destinations:** My Notes opens the notes filter, My Quizzes
   opens the quiz filter, and My Streaks opens the streak detail. Each card
   shows one Kubai icon and its title, without a subtitle or extra arrow; taps
   use a 120ms scale response, disabled when Reduce Motion is enabled.
3. **Weekly progress:** Active study days out of seven, derived only from
   available account activity data; do not invent percentages or counts.
4. **Learning activity:** A seven-day chart based on the account's activity
   points, with an explicit empty state when data is unavailable.
The screen uses the Skeeme blue, yellow, and surface palette, with dark ink for
all labels and supporting text.

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
7. **Visual migration:** smoke-test the pill-shaped BlurView (including its
   scroll state), Learning Plan home layout, separate Create action, native
   headers, route redirects, flashcard back behavior, streak modal presentation,
   and accessibility settings on a simulator/device.
   The auth selection's bottom CTA/account link, onboarding header spacing,
   mascot, and static blue/yellow auth theme were checked on the current iPhone
   17 simulator after a native dev-client rebuild. Metro's nested encoded font
   path caused the iOS dev-client `ENOENT`; the new asset plugin rewrites local
   TTFs to direct asset paths. The current Learning Plan and its empty-data
   states rendered in the iPhone 17 simulator with the Kubai icons visible;
   Simulator I/O errors prevented opening the Create sheet or verifying
   Notes/Quizzes navigation. The latest card-motion update initially hit an
   unsupported Reanimated timing string, now corrected to `ease-out`; a
   subsequent screenshot showed the final card layout. Simulator tap calls
   still return I/O errors, so press feedback and navigation remain unverified.
   Remaining migration checks are open.
8. **SwiftUI:** SwiftUI migration was discussed only. The current mobile app is
   Expo/React Native; no SwiftUI rewrite was started or approved.
9. **Auth mascot:** replace the current “Idle → Wakes” test clip with the final
   mascot asset/direction when the user provides it.
10. **Onboarding verification:** verify selected states, name-entry/greeting
    back-navigation and one-shot wave, choice-specific reply timing, summary,
    reminder paths, the three-stage personalized-plan loader, Save your study
    plan mascot playback, Google/Apple auth, and post-auth answer persistence on
    an iPhone 17 Simulator. The save screen groups the mascot and copy above a
    bottom-aligned provider section; the first live pose clip sets
    `behavior::focus` instantly to start the Idle-to-Reading edge. The supplied
    graph already loops Reading without another trigger. TypeScript, focused
    ESLint, and iOS export pass. The Simulator accessibility tree exposes Apple,
    but its screenshot did not show the updated button styling or mascot
    animation; refresh the native bundle and recheck when the Simulator is not
    in active use. Native provider flows remain untested. The centered,
    shortened progress track was checked on the current iPhone 17 Simulator.
    A development-only button below “Get started” on auth selection now opens
    Save Your Study Plan directly; verify it in the current Metro session. The
    Settings screen's Study Reminders switch remains local-only.
11. **Apple OAuth deployment:** verify the deployed Go API has outbound access
    to Apple's signing-key endpoint and configure `APPLE_CLIENT_IDS` if Apple
    identity tokens use client IDs beyond the app bundle identifier.

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

### 2026-11-18 — Simplify dashboard quick actions and add press feedback

- Removed the redundant action arrows and all subtitles from the Notes, Quizzes,
  and Streaks cards; reduced their minimum height and removed the unused streak
  subtitle input.
- Added a reduced-motion-aware 120ms, 3% Reanimated press scale using the
  supported `ease-out` timing function; removed the now-unused arrow icon.
- Validation: TypeScript, `git diff --check`, and the iOS Expo export passed.
  Targeted ESLint had no errors and 13 Kubai wildcard-module
  `import/no-duplicates` warnings. The Simulator exposed the unsupported curve
  before it was corrected. A later screenshot verified the cards render without
  subtitles or extra arrows; Simulator tap calls returned I/O errors, so press
  feedback and destination navigation remain unverified.

### 2026-11-18 — Change Home profile icon to options

- Replaced the Learning Plan header's profile glyph with an ellipsis options
  icon while keeping its existing Profile destination.
- Validation: `npx tsc --noEmit`, targeted ESLint, and `git diff --check`
  passed; the updated Home header was visually checked in the iPhone 17
  Simulator.

### 2026-11-18 — Replace dashboard action icons with Kubai

- Installed `kubai-icons-react` and its static `kubai-icons` data dependency;
  added `KubaiNativeIcon` to render Kubai SVGs natively with `react-native-svg`.
- Replaced the tab icons (Home, Library, Profile), Learning Plan options,
  Notes, Quizzes, Streaks and progress/action icons, and Create-sheet action
  icons. Kept the standalone Create Plus as Lucide because Kubai had no good
  match; onboarding, login, and welcome icons were not changed.
- Validation: `npx tsc --noEmit` and `git diff --check` passed; targeted ESLint
  had no errors and 14 `import/no-duplicates` warnings caused by Kubai's
  wildcard icon-module type declaration. `npx expo export --platform ios
  --output-dir /tmp/skeeme-kubai-export` succeeded. The iPhone 17 Simulator
  displayed the dashboard icons; repeated Simulator I/O errors prevented
  testing the Create sheet and navigation taps.

### 2026-11-18 — Keep tab blur inside the floating pill

- Kept Home, Library, and Profile inside a pill-shaped BlurView, removing the
  full-width rectangle behind it. The pill blur strengthens when the active tab
  is scrolled; Create remains a separate blue circular button.
- Added extra scroll clearance beneath the floating controls and updated the
  navigation notes.
- Validation: mobile TypeScript check and `git diff --check` passed; targeted
  ESLint had no errors and one existing unused `BookMarked` warning in
  `profile.tsx`. A final Simulator refresh was blocked by active user input, so
  visual verification of the revised pill remains open.

### 2026-11-18 — Rework Home as a Learning Plan overview

- Replaced the Home greeting, sample resume item, and feature grid with Notes,
  Quizzes, and Streaks destinations, honest weekly-activity summaries, and a
  seven-day chart using account data only.
- Used the requested blue, yellow, surface, and dark-ink palette; routed Notes
  and Quizzes to their matching Library filters.
- Validation: `npx tsc --noEmit`, targeted ESLint, and `git diff --check`
  passed. The iPhone 17 Simulator displayed the Home screen and empty-data
  states; a Notes destination tap returned an unverified Computer Use error,
  so that navigation smoke test remains open.

### 2026-11-18 — Route directly to dashboard on launch for design iteration

- Updated `app/_layout.tsx` so unauthenticated app launches open directly into `/(drawer)/(tabs)` (Dashboard), bypassing the welcome/auth-selection and onboarding flows.
- Ensured all 4 tabs (Home, Library, Create, Profile) operate seamlessly on mock/fallback data without requiring live backend APIs or active tokens.
- Validation: `npx tsc --noEmit` passed with 0 errors; `git diff --check` passed clean.

### 2026-11-18 — Implement new 4-tab navigation and calm workspace dashboard

- Built the new permanent 4-tab navigation structure in `app/(drawer)/(tabs)/_layout.tsx`: Home (`index`), Library (`library.tsx`), Create action sheet trigger (`create.tsx`), and Profile (`profile.tsx`).
- Created `CreateBottomSheet.tsx` presenting the 5 core creation actions (New notes, Upload material, Generate summary, Create flashcards, Create a quiz) as a native modal with smooth backdrop.
- Redesigned the Home dashboard (`app/(drawer)/(tabs)/index.tsx`) using the new calm workspace philosophy:
  - `DashboardHeader.tsx`: Time-aware greeting (`Good morning! ☀️` / `Good afternoon!` / `Good evening! 🌙`), student name, formatted date, streak badge, and avatar.
  - `SkeemyCompanionCard.tsx`: Warm, friendly card with Skeemy avatar and dynamic contextual messages (`dashboardMascotDialogue.ts`).
  - `RecentActivitySection.tsx`: "Pick up where you left off" queue with measurable progress and direct "Continue →" CTA.
  - `LearningSpaceSection.tsx`: 2x2 functional feature discovery grid for My notes, Flashcards, Summaries, and Quizzes.
  - `LearningRhythmSection.tsx`: Consistency tracker with study time, streak, and M-T-W-T-F-S-S weekly activity points.
- Fixed SDK 57 Expo Router compatibility by replacing `@react-navigation/native`'s `useFocusEffect` with `expo-router`'s export in `create.tsx`.
- Validation: `npx tsc --noEmit` passed with 0 errors; `git diff --check` passed clean.

### 2026-11-18 — Document dashboard design philosophy, layout, and four-tab navigation

- Added `Dashboard architecture and design philosophy` section to `CORE.md`.
- Documented the three core principles (Clarity, Continuity, Companionship) and the calm workspace palette (Primary `#0755B5`, Accent `#FFD500`, Surface `#F7F9FC`, Text `#202B3C`).
- Documented the 4-tab navigation structure (Home, Library, Create bottom sheet, Profile) and Study Planner placement.
- Documented the full dashboard layout hierarchy: Welcome header with time-aware greetings and dynamic Skeemy dialogues, "Pick up where you left off" priority queue with measurable progress, "Your learning space" feature cards, and "Your learning rhythm" consistency metrics without toxic gamification.
- Validation: `git diff --check` passed clean.

### 2026-11-18 — Preload Study Glow mascot and show instant poster

- Created `preloadStudyGlow.ts` which background-downloads the Study Glow `.mov` clips into `FileSystem.cacheDirectory` and swaps runtime graph video URLs to local `file://` URIs, enabling instant playback like `AnimatedMascot`.
- Triggered background preloading early in `app/_layout.tsx` on launch and `app/(onboarding)/_layout.tsx` on onboarding start.
- In `StudyGlowMascot.tsx`, added a zero-latency still poster (`study-glow-idle.png`) on frame 0 until `onClip` / `onPose` fires, eliminating blank transparent gaps while video buffers.
- Synchronized the Idle -> Reading transition timer to start only after video playback begins (`videoReady`).
- Validation: `npx tsc --noEmit` passed with 0 errors; `git diff --check` passed clean.

### 2026-11-18 — Reset onboarding selections on app reload

- Changed onboarding data handling in `authStore.ts` so in-progress onboarding selections (`onboardingData` and `onboardingStep`) are purely in-memory during an active onboarding run and never persisted across app reloads.
- In `hydrate()`, explicitly deleted any residual `onboarding_data` and `onboarding_step` from `standardStorage` and initialized `onboardingData: {}` and `onboardingStep: 0`.
- Validation: `npx tsc --noEmit` passed with 0 errors; `git diff --check` passed clean.

### 2026-11-18 — Increase separation between mascot stage and headline

- Increased `marginBottom` on `mascotStage` in `save-study-plan.tsx` to 43px, lifting the grouped Skeemy and 3D scattered papers higher up and giving comfortable breathing room above "Save your study plan".
- Validation: `npx tsc --noEmit` passed with 0 errors; `git diff --check` passed clean.

### 2026-11-18 — Remove Continue with email from save study plan screen

- Removed the "Continue with email" yellow CTA button, the "or" divider, and unused `Mail` icon imports from `save-study-plan.tsx`. The screen now directly presents the native Apple and Google sign-in options under the study plan hero.
- Validation: `npx tsc --noEmit` passed with 0 errors; `git diff --check` passed clean.

### 2026-11-18 — Elevate Skeemy slightly above surrounding 3D papers

- Lifted Skeemy slightly (`translateY: -16`) and moved his contact ground shadow up (`bottom: 12 * scale`) so he sits cleanly elevated above the scattered floor papers, preventing the front notes from overlapping his blue base and hands.
- Adjusted front papers (sheet 6 and sticky note 7) downwards slightly (`bottom: -22 * scale` and `-20 * scale`) to frame his footing on the perspective floor plane.
- Validation: `npx tsc --noEmit` passed with 0 errors.

### 2026-11-18 — Fix Study Glow mascot: use delivery JSON instead of canvas URL

- Root cause: `url=` prop routes through `KeptRelease.swift` which downloads all files to disk before rendering — this stalls silently on device so Skeemy never appears. The `delivery=` prop streams `.mov` via `WebLoader`/AVPlayer (the same path `AnimatedMascot` uses with `clip=`).
- Fix: import `studyGlowDelivery.json` (verified 200-OK signed URLs) and pass `delivery={deliveryJson}` with `getDelivery` callback for link refresh. Removed `url=` prop entirely.
- Files: `components/StudyGlowMascot.tsx`, `components/studyGlowDelivery.json`.
- Validation: `npx tsc --noEmit` passed with 0 errors.

### 2026-11-18 — Render 3D perspective floor plane with flat scattered papers around Skeemy

- Transformed the scattered study papers in `save-study-plan.tsx` into a 3D ground plane surrounding Skeemy's base using `perspective: 450` and `rotateX: '68deg'–'70deg'`, making the sheets lie completely flat on the floor in perspective.
- Split papers into behind and front depth layers with an elliptical contact ground shadow, immersing Skeemy in the center of scattered notes, piles, and yellow sticky pads on the floor.
- Validation: `./student-app/node_modules/.bin/tsc --noEmit --project student-app/tsconfig.json` passed with 0 errors; `git diff --check` passed clean.

### 2026-11-18 — Add scattered study papers under Skeemy and optimize save screen layout

- Added `ScatteredStudyPapers` surrounding Skeemy's base in `save-study-plan.tsx`, depicting scattered note sheets, lined exam pages, dog-eared cards, and yellow sticky pads underneath him to illustrate physical notes becoming organized on the phone.
- Pinned the top back arrow further up at `insets.top + 4` (matching other onboarding screens) and anchored the entire content block downwards via `justifyContent: 'flex-end'` and balanced padding to eliminate excess bottom space.
- Validation: `./student-app/node_modules/.bin/tsc --noEmit --project student-app/tsconfig.json` passed with 0 errors; `git diff --check` passed clean.

### 2026-11-18 — Provide direct release delivery for Study Glow mascot and tighten screen layout

- Bundled the `Study Glow` canvas delivery schema directly in `studyGlowDelivery.ts` and passed `delivery={STUDY_GLOW_DELIVERY}` with `getDelivery` into `MaskoView`. This bypasses the native iOS player's `KeptRelease` disk-download requirement for `url`, streaming the alpha HEVC video directly via `WebLoader` upon mount.
- Reduced excessive vertical spacing above the "Continue with email" button in `save-study-plan.tsx` by removing `flexGrow: 1` from `hero`, centering the content block, and setting a compact 16px bottom margin on the subtitle.
- Validation: `./student-app/node_modules/.bin/tsc --noEmit --project student-app/tsconfig.json` passed with 0 errors; `git diff --check` passed clean.

### 2026-11-18 — Unify Save Study Plan headline typography in Allo font

- Unified "Save your study plan" headline into a single cohesive title in `save-study-plan.tsx`, removing the split multi-box layout and the `Bungee-Regular` font in favor of `Allo-Bold` with an `Allo-Black` emphasis for "study plan" in `#FFDF00` yellow.
- Validation: `./student-app/node_modules/.bin/tsc --noEmit --project student-app/tsconfig.json` passed with 0 errors; `git diff --check` passed clean.

### 2026-11-18 — Match Save Study Plan to Blue & Yellow brand theme and fix Masko playback

- Aligned `save-study-plan.tsx` with the brand theme established on `auth-select.tsx`: vibrant `#0057B8` background, `#FFDF00` yellow header typography (`Bungee-Regular` for "STUDY PLAN"), bright yellow capsule primary button for email sign-up, clean white cards for Apple and Google, and light status bar.
- Fixed `StudyGlowMascot`: stripped all artificial React Native `<Image>` overlay wrappers that were sitting on top of `MaskoView` and blocking animation frames. `MaskoView` now renders directly with autoPlay, and triggers `behavior::focus = true` after 1.5s to smoothly transition from Idle into Reading.
- Validation: `./student-app/node_modules/.bin/tsc --noEmit --project student-app/tsconfig.json` passed with 0 errors; `git diff --check` passed clean.

### 2026-11-18 — Refine Save Study Plan with Blue & Yellow theme and persistent mascot loading

- Fixed mascot disappearing in `StudyGlowMascot`: eliminated premature fallback timer so the still poster image persists seamlessly over the view until live video playback actually starts (`onClip`/`onPose`), preventing any flash of empty space. Scheduled the Idle-to-Reading transition 1.8s after live frames begin.
- Redesigned `save-study-plan.tsx` around the core Skeeme Blue (`#007AFF`) and Yellow (`#FFDF00`) palette: added a glowing ambient yellow halo behind Lumi, a `✨ PLAN GENERATED` golden badge, and promoted "Continue with email" to the primary solid blue CTA button with vibrant elevated shadow.
- Removed the "Already have an account? Log in" section entirely as requested.
- Validation: `./student-app/node_modules/.bin/tsc --noEmit --project student-app/tsconfig.json` passed with 0 errors; `git diff --check` passed clean.

### 2026-11-18 — Fix buttons and mascot Idle-to-Reading animation in Save Study Plan

- Replaced `Pressable` functional styles in `GoogleSignInButton`, `AppleSignInButton`, and `save-study-plan.tsx` with `TouchableOpacity` + `activeOpacity` to prevent NativeWind v4 from stripping button box layout and styling. Styled all auth choices as solid elevated cards with proper shadows, 56px height, and rounded corners (18px).
- Fixed `StudyGlowMascot`: supplied the updated canvas delivery URL key as the default, prevented the static poster image overlay from permanently covering the live player, and scheduled `behavior::focus = true` after initial idle playback so the graph triggers the `Idle -> Reading` transition clip and loops reading state.
- Validation: `./student-app/node_modules/.bin/tsc --noEmit --project student-app/tsconfig.json` passed with 0 errors; `git diff --check` passed clean.

### 2026-11-18 — Add the Save Your Study Plan handoff

- Added the post-onboarding account screen and kept answers local until the
  signed-in account accepts them. Reused the native Google sign-in helper,
  added Apple identity-token verification, and integrated the supplied Study
  Glow mascot canvas.
- Validation: student-app TypeScript, focused ESLint (0 errors; existing
  warnings), iOS Expo export, `cd skeeme-go && go test ./...`, and
  `git diff --check` passed. The iPhone 17 Simulator loaded the auth-selection
  screen, but UI taps failed as unverified; the save screen and native provider
  flows still need Simulator verification and an Apple-enabled native rebuild.

### 2026-11-18 — Polish the Save Your Study Plan screen

- Rebalanced the iOS layout around the animated mascot and grouped the Apple,
  Google, and email choices with existing-account/legal links below. The player
  sets `behavior::focus` on its first pose so the existing Idle-to-Reading
  transition can run; the supplied Reading pose is already a looping edge.
- Validation: student-app TypeScript, focused ESLint, iOS Expo export, and
  `git diff --check` passed. Simulator visual confirmation remains open.

### 2026-11-18 — Refine auth choices and trigger Reading animation

- Made email a full-width secondary button, strengthened the Google outline,
  and set the Masko focus input on the first live pose clip so Idle transitions
  into the existing Reading loop immediately.
- Validation: student-app TypeScript, focused ESLint, iOS Expo export, and
  `git diff --check` passed. The iOS export completed with the existing
  expo-superwall resolution warning. The iPhone 17 Simulator exposed Apple in
  its accessibility tree, but its screenshot did not reflect the updated
  styles or animation; repeat after a safe native bundle refresh.

### 2026-11-18 — Add a development shortcut to Save Your Study Plan

- Added a `__DEV__` button below “Get started” that opens the save screen
  without completing onboarding; its preview Back action returns to auth
  selection. Removed the attempted root startup redirect.
- Validation: student-app TypeScript, focused ESLint (0 errors; existing
  warnings), Impeccable detector (no findings), and `git diff --check` passed.
  No rebuild or Simulator interaction was performed.

### 2026-11-18 — Center the onboarding progress track

- Shortened the shared top progress track and centered it independently of the
  Back button, keeping the bar responsive with a 300-point maximum width.
- Validation: student-app TypeScript, focused ESLint, layout detector,
  `git diff --check`, and visual inspection in the iPhone 17 Simulator.

### 2026-11-18 — Return plan Back to the duration picker

- Made the personalized-plan Back button dismiss directly to the existing
  daily-goal route, avoiding intermediate onboarding pages.
- Validation: student-app TypeScript, focused ESLint, and `git diff --check`
  passed.

### 2026-11-18 — Add a name greeting before onboarding

- Added a name step before the first question, with typed Skeemy prompts,
  trimmed input, a personalized typed greeting, and automatic advance. Bundled
  the supplied one-shot wave clips for iOS and Android and routed onboarding
  entry points through the new screen. Updated the `OnboardingQuestion`
  component, `OnboardingData`, and the onboarding route guards.
- Validation: student-app TypeScript; targeted ESLint (no errors, existing
  warnings); iOS and Android Expo exports; `git diff --check`; Impeccable
  detector. Simulator visual verification remains open. Linting the login file
  also surfaced an unrelated existing set-state-in-effect error.

### 2026-11-18 — Replay Skeemy for the name greeting

- Fixed the personalized greeting handoff to explicitly reset and play the
  already-mounted Masko clip when the dialogue phase changes, rather than relying
  on remount autoplay.
- Validation: student-app TypeScript, focused ESLint, iOS Expo export, and
  `git diff --check` passed. Simulator playback confirmation remains open.

### 2026-11-17 — Design the sequential plan loader

- Replaced the “Powering up...” caption with a reference-inspired four-step
  loader: completed steps check off, one active progress bar fills at a time,
  and the last reaches 100% with Skeemy's 5.14-second playback stop. Kept the
  860 ms pose hold and plan reveal, moved Skeemy to the lower stage, used the
  brand's yellow sparkle accent, and avoided unsupported user-count claims.
- Added a playback-start callback to the shared mascot so the loader clock
  starts from Masko's pose/clip event. Updated the onboarding handoff notes.
- Validation: student-app TypeScript, targeted ESLint, iOS Expo export, and
  `git diff --check` passed. The iPhone 17 Simulator returned to auth during
  export; a final capture of the redesigned loader remains open.

### 2026-11-17 — Refine personalized plan loader

- Replaced the four loader labels with the user's three requested stages,
  removed their subtexts, and used Skeeme yellow on the progress fill and
  completed-stage badges.
- Validation: student-app TypeScript, targeted ESLint, and `git diff --check`
  passed. The final loader still needs a Simulator visual check.

### 2026-11-17 — Tighten plan-loader timing

- Started the progress clock on screen entry so all three stages complete in
  4.2 seconds, ahead of the 4.5-second target. Kept the mascot's 5.14-second
  stop and final-pose hold, dimmed inactive labels, and enlarged the heading.
- Added a clip-ready fallback for the mascot playback-start event so the stop
  timer works even if the native event is delayed.
- Validation: student-app TypeScript, targeted ESLint, and `git diff --check`
  passed. The latest loader still needs a Simulator visual check.

### 2026-11-17 — Replace Satoshi with Allo typography

- Installed `allo-font`; switched app-owned text styles and shared text
  wrappers to Allo while preserving the existing weight roles and separate
  display faces. Native platforms bundle the licensed OTF weights; web loads
  the variable WOFF2 through a web-only font map.
- Validation: TypeScript, targeted ESLint (0 errors; 34 existing warnings),
  iOS/Android/web Expo exports, `git diff --check`, and the Impeccable type
  detector passed. Web export exited successfully despite the existing
  Expo Superwall static-render error log. Simulator visual verification
  remains open; restart Metro after the WOFF2 asset configuration change.

### 2026-11-17 — Turn daily-goal choices into a wheel picker

- Replaced the duration cards with a centered, snapping 1–20-minute wheel,
  kept the unit to the selected number's right, reduced the space above
  Skeemy's question, and added a separate Continue action. Updated the local
  summary bank to generate singular/plural duration copy while preserving
  support for saved legacy values.
- Validation: student-app TypeScript check, targeted ESLint, iOS Expo export,
  and `git diff --check` passed. The iPhone 17 Simulator showed the new wheel;
  its unit-label alignment was corrected in source, but a final post-fix
  screenshot and gesture feel-check remain open.

### 2026-11-17 — Keep the duration unit on one line

- Changed the selected duration to one inline text run and removed its fixed
  width constraint, preventing “minutes” from wrapping under the number.
- Validation: student-app TypeScript check, targeted ESLint, iOS Expo export,
  and `git diff --check` passed. A post-fix Simulator capture remains open.

### 2026-11-17 — Set auth and splash mascot animations

- Bundled the supplied enthusiastic and resting clips for iOS and Android,
  added selectable variants to the shared Masko player, used the enthusiastic
  animation on auth selection and the resting animation on the startup splash.
- Validation: student-app TypeScript check, targeted ESLint (0 errors; existing
  warnings remain), iOS and Android Expo exports, and `git diff --check` passed.
  Expo exports reported the existing non-blocking `expo-superwall` resolution
  warning. Device visual verification remains open.

### 2026-11-17 — Allow time for the resting splash animation

- Extended the custom splash duration to 4.5 seconds so the resting animation
  has more time to play before the app continues.
- Validation: student-app TypeScript check, targeted ESLint, and
  `git diff --check` passed. Device visual verification remains open.

### 2026-11-17 — Match splash duration and color to request

- Set the startup splash to the welcome screen's blue (`#0057B8`) and extended
  its duration to 5 seconds.
- Validation: student-app TypeScript check, targeted ESLint, and
  `git diff --check` passed. Device visual verification remains open.

### 2026-11-17 — Set the onboarding mascot animation

- Bundled the supplied quietly writing clip for iOS and Android and use it on
  onboarding question and personalized-plan screens.
- Validation: student-app TypeScript check, targeted ESLint, iOS and Android
  Expo exports, and `git diff --check` passed. Exports reported the existing
  non-blocking `expo-superwall` resolution warning. Device visual verification
  remains open.

### 2026-11-17 — Add profile preparation mascot transition

- After a daily-goal choice, show the supplied lights-up animation for six
  seconds before the personalized plan; bundle the platform clips, retain
  onboarding progress/back navigation, and skip the wait with Reduced Motion.
- Validation: student-app TypeScript check, targeted ESLint, iOS and Android
  Expo exports, and `git diff --check` passed. Exports reported the existing
  non-blocking `expo-superwall` resolution warning. Device visual verification
  remains open.

### 2026-11-17 — Hold the profile-ready mascot pose

- Stop the Masko clip near its 5.167-second end, hold the thumbs-up pose for
  860 ms, then continue to the personalized plan instead of showing the clip's
  automatic loop.
- Validation: student-app TypeScript check, targeted ESLint, and
  `git diff --check` passed. Device visual verification remains open.

### 2026-11-17 — Clarify profile preparation state

- Added “Powering up...” under the mascot and hid the progress bar on the
  profile transition while keeping Back navigation.
- Validation: student-app TypeScript check, targeted ESLint, and
  `git diff --check` passed. Device visual verification remains open.

### 2026-11-17 — Reveal the study profile in place

- Replaced the separate profile-loading route with a same-screen reveal:
  Skeemy holds the final pose, rises and shrinks as the plan card enters, then
  the progress bar and Continue button return. Back remains available and
  Reduced Motion skips the choreography.
- Validation: student-app TypeScript check, targeted ESLint, and
  `git diff --check` passed. Device visual verification remains open.

### 2026-11-17 — Clarify personalized study plan

- Reworded the plan intro in Skeemy's companion voice, replaced the stage
  badge with labeled focus/style/daily-goal summaries, and changed the CTA to
  “Let's do this!” with an arrow icon.
- Validation: student-app TypeScript check, targeted ESLint, and
  `git diff --check` passed. Device visual verification remains open.

### 2026-11-17 — Add offline personalized learning summaries

- Replaced the individual answer recap with a concise local summary bank
  composed from the selected learning goal, study challenge, explanation
  preference, and daily target. This keeps the response ready during Skeemy's
  lights-up animation without a network request.
- Validation: student-app TypeScript check, targeted ESLint, `git diff
  --check`, and a Node check covering 1,080 current and legacy combinations
  passed. Device visual verification remains open.

### 2026-11-17 — Replace splash mascot animation

- Replaced the splash's resting clip with Skeemy's new eye-opening animation,
  bundled from the supplied iOS and Android assets. Kept the blue background
  and existing 5.2-second splash duration.
- Validation: student-app TypeScript check, targeted ESLint, and
  `git diff --check` passed. Device visual verification remains open.

### 2026-11-16 — Add interactive onboarding replies

- Added choice-specific Skeemy responses to the first three question screens,
  removed “Knowing where to start” from visible study challenges, and kept
  daily-goal choices moving directly to the personalized summary.
- Validation: student-app TypeScript check, targeted ESLint, and
  `git diff --check` passed. Device visual verification remains open.

### 2026-11-16 — Set companion voice across onboarding questions

- Updated the explanation prompt and all four preference labels/descriptions,
  changed the study-challenge and reminder questions to Skeemy's first-person
  companion voice, and documented the voice rule for future onboarding copy.
- Validation: student-app TypeScript check, targeted ESLint, and
  `git diff --check` passed.

### 2026-11-16 — Simplify daily learning goal choices

- Removed the 30-minute choice, changed the prompt to “How long can we study
  for?”, and kept previously saved 30-minute answers readable in the summary.
- Validation: student-app TypeScript check, targeted ESLint, and
  `git diff --check` passed.

### 2026-11-16 — Load onboarding mascot from bundled clips

- Bundled the iOS HEVC and Android stacked clips and load them through Expo
  Assets on the welcome screen. Later screens reuse the local file instead of
  waiting for a network request; a logged remote fallback remains for asset
  extraction failures.
- Validation: student-app TypeScript check, targeted ESLint, iOS and Android
  Expo exports, and `git diff --check` passed. Expo export reports the existing
  non-blocking `expo-superwall` resolution warning. Device visual verification
  is still outstanding.

### 2026-11-16 — Restore animated mascot and native screen entry

- Restored the animated mascot on onboarding question screens and changed the
  stack from a fade to the platform-default transition so it moves in with the
  page's normal navigation gesture.
- Validation: student-app TypeScript check, targeted ESLint, iOS Expo export,
  and `git diff --check` passed. Device visual verification is still outstanding.

### 2026-11-15 — Show onboarding mascot immediately

- Replaced the question screen's streamed mascot with a bundled transparent still
  extracted from the existing Skeeme animation, so it is present immediately
  instead of waiting for remote media.
- Validation: student-app TypeScript check, targeted ESLint, iOS Expo export,
  and `git diff --check` passed.

### 2026-11-15 — Delay choice reveal until typing completes

- Added a short pause after the final typed character before revealing options
  and set hidden option opacity from the initial render to prevent a flash.
  Restored normal in-place mascot playback so it appears while the question is
  written, without an entrance effect.
- Validation: student-app TypeScript check, targeted ESLint, iOS Expo export,
  and `git diff --check` passed. The result still needs a device visual check.

### 2026-11-15 — Keep onboarding question layout steady

- Reserved the option list's layout space before reveal so the question and
  mascot stay in their final positions. Options reveal without causing layout
  movement.
- Validation: student-app TypeScript check, targeted ESLint, iOS Expo export,
  and `git diff --check` passed. The result still needs a device visual check.

### 2026-11-15 — Sequence onboarding question reveals

- Changed onboarding page navigation to native fades. Question prompts type in
  before their options fade up as a group; completed sequences are remembered
  for the app session and reset when a new flow starts from auth selection.
  Reduced Motion skips typing and retains a short opacity fade.
- Added the same one-time soft reveal to the personalized result screen.
- Validation: student-app TypeScript check, targeted ESLint (0 errors; 3 existing
  unused legal-link warnings in `auth-select.tsx`), iOS Expo export, and
  `git diff --check` passed. The motion still needs a real-device feel check.

### 2026-11-15 — Simplify explanation preferences

- Removed the step-by-step choice and the secondary descriptions from the simple
  and detailed choices. Kept previously saved step-by-step answers readable in
  the personalized summary.
- Validation: student-app TypeScript check, targeted ESLint, and `git diff --check`
  passed.

### 2026-11-15 — Add breathing room below onboarding choices

- Increased the shared onboarding list's trailing scroll padding and matched the
  personalized result screen so the final option/content clears the bottom edge.
- Validation: student-app TypeScript check, targeted ESLint, and `git diff --check`
  passed. The updated spacing has not yet been visually rechecked in Simulator.

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

### 2026-11-15 — Realign onboarding flow to Fox App design reference

- Completely overhauled the onboarding screens (`start`, `explanation-preferences`,
  `study-challenges`, `daily-goal`, `personalized-plan`, `reminders`) to faithfully
  match the Fox App reference screens:
  - Unified onboarding styling architecture under [`onboardingStyles.ts`](file:///Users/gcg/skeeme/student-app/components/onboarding/onboardingStyles.ts)
    and [`OnboardingCard.tsx`](file:///Users/gcg/skeeme/student-app/components/onboarding/OnboardingCard.tsx).
  - Replaced `Pressable` functional styles with `TouchableOpacity` to eliminate NativeWind
    v4 style dropping issues (where `flexDirection: 'row'`, borders, and backgrounds
    were stripped).
  - Cards redesigned as solid white, elevated elements with no harsh borders (`borderWidth: 1`,
    `borderColor: 'rgba(0,0,0,0.03)'` / almost invisible), defined by soft ambient drop shadows
    (`shadowOffset: { width: 0, height: 4 }`, `shadowOpacity: 0.08`, `shadowRadius: 12`, `elevation: 3`),
    fatter and roomier proportions (`minHeight: 64`, `borderRadius: 18`, `paddingHorizontal: 20`,
    `paddingVertical: 16`), sitting against an off-white canvas (`#F8F9FA`).
  - Removed background strip and top border behind the Continue button in [`OnboardingFooter.tsx`](file:///Users/gcg/skeeme/student-app/components/onboarding/OnboardingFooter.tsx),
    allowing the blue pill button to float freely over the canvas.
  - Question card next to mascot redesigned as a compact, solid floating cloud (`maxWidth: 220`, `borderRadius: 22`,
    `shadowOffset: { width: 0, height: 6 }`, `shadowOpacity: 0.08`, `shadowRadius: 16`, `borderWidth: 0`),
    centralized into [`OnboardingQuestion.tsx`](file:///Users/gcg/skeeme/student-app/components/onboarding/OnboardingQuestion.tsx)
    featuring punchy Satoshi-Black typography (`fontSize: 20`, `lineHeight: 25`, `letterSpacing: -0.4`).
  - Increased mascot size from 86px to 130px for a prominent character presence matching the Fox reference.
  - Eliminated the pale disabled card style on the Continue button: button now stays solid blue (`ONBOARDING_BLUE` `#007AFF`) with white text, using `opacity: 0.45` when disabled so it never resembles a white background card.
  - Option card labels set in crisp `Satoshi-Bold` typography (`fontSize: 16`, `lineHeight: 21`) for clean readability without overpowering the question header.
  - Streamlined the initial goals list to 4 focused options (removed "Understand difficult topics" and "Turn my materials into clear notes"), fitting the viewport cleanly without scrolling.
  - Refactored onboarding interaction to single-selection tap-to-advance flow:
    - Removed Continue button from question screens 01 (`start`), 02 (`explanation-preferences`), 03 (`study-challenges`), and 04 (`daily-goal`).
    - Every question is single-select; selecting an option triggers haptic feedback and immediately advances to the next screen after an 180ms visual confirmation delay.
    - Preserved answers when navigating backwards via Expo Router stack and Zustand `onboardingData` state.
    - Updated question 06 to "When should Lumi remind you?" with one-tap selection or skip.
    - Screen 05 (`personalized-plan`) retains the primary Continue CTA to proceed to reminders.
    - Updated progress bar to reflect 6 total screens (`const STEPS = 6;`).
  - Tastefully integrated Skeeme's Primary Blue (`#007AFF`) and Secondary Yellow (`#FFDF00`):
    yellow milestone cap on the progress bar, yellow `STAGE 1 • FOUNDATION` pill badge and
    bullet dots on the celebratory plan card, and rich blue primary action button with ambient glow.
  - Subtitled cards on subsequent screens matching reference screen 2 ("Brand new", "Some words").
  - Personalized plan screen matching phone 4 with a centered celebratory mascot and
    deep blue "UNIT 1" plan card.
- Diagnosed and resolved the root cause of non-bold Satoshi text rendering:
  - Discovered that `student-app/assets/fonts/Satoshi-*.ttf` font binaries had corrupted
    `name` tables with PostScript names (`nameID=6`), full names (`nameID=4`), and family names
    (`nameID=1`) set to literal `'false'`.
  - On iOS CoreText / React Native, this caused custom font matching to silently fail and fall back
    to system default (San Francisco Regular).
  - Rebuilt all four font binaries (`Satoshi-Regular.ttf`, `Satoshi-Medium.ttf`, `Satoshi-Bold.ttf`,
    `Satoshi-Black.ttf`) with correct OpenType `name` table records, table directory offsets, and
    head table checksum adjustments.
  - Validation: verified TTF name tables for all 4 weights via binary inspection; ran
    `./student-app/node_modules/.bin/tsc --noEmit --project student-app/tsconfig.json` (0 errors);
    `git diff --check` passed clean.
- Validation: `npx tsc --noEmit` passed with 0 errors across `student-app`; targeted
  ESLint on onboarding components and routes passed with 0 errors; `git diff --check` passed.

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
