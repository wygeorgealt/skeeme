# Skeeme Mobile Client (`student-app`) 📱

The student-facing mobile application for **Skeeme**, built with **React Native (0.86)**, **React 19**, and **Expo SDK 57**. It provides an engaging, fluid, and responsive learning experience with camera scanning, real-time streaming AI assistance, KaTeX math equation rendering, flashcard study decks, quiz engines, and streak heatmaps. AI usage is limited by daily Free/Pro quotas enforced by the backend; the mobile client does not use a credit balance.

---

## 🏛️ Directory Structure

```plaintext
student-app/
├── app/                        # Expo Router file-based navigation
│   ├── _layout.tsx             # Root layout, theme providers, auth guarding
│   ├── login.tsx               # Sign in screen
│   ├── signup.tsx              # Account registration
│   ├── otp.tsx                 # One-time passcode verification
│   ├── forgot-password.tsx     # Password recovery
│   ├── paywall.tsx             # Monetization & upgrade screen
│   ├── (onboarding)/           # Multi-step personalization onboarding flow
│   │   ├── name.tsx            # Student name input
│   │   ├── education.tsx       # Educational tier selection
│   │   ├── field.tsx           # Study subject & field
│   │   ├── goal.tsx            # Academic target / exam preparation
│   │   ├── style.tsx           # Learning style preferences
│   │   ├── tone.tsx            # AI persona & tutor tone
│   │   └── exam-date.tsx       # Exam countdown setup
│   └── (drawer)/               # Main application navigation drawer
│       ├── _layout.tsx         # Drawer layout & navigation menu
│       ├── index.tsx           # Home dashboard & daily study activity
│       ├── scan.tsx            # Camera / photo problem solver
│       ├── chat.tsx            # Interactive AI tutor chat (SSE streaming)
│       ├── generate.tsx        # Quiz & summary generation studio
│       ├── flashcards/         # Spaced repetition flashcard decks & review
│       ├── history/            # Quiz & problem-solving history
│       ├── exams.tsx           # Upcoming exams countdown tracker
│       ├── summary.tsx         # Lecture & document summary viewer
│       ├── referral.tsx        # Invite code sharing
│       └── settings.tsx        # User settings & profile
├── assets/                     # App icons, SVG illustrations, splash screens
├── components/                 # Reusable UI components (LatexRenderer, Modals, Buttons)
├── constants/                  # Color palettes, typography, theme definitions
├── hooks/                      # Custom React hooks (camera, network, audio/haptics)
├── lib/                        # Core utilities & service clients
│   ├── api.ts                  # Axios client with offline fallback & NetInfo caching
│   ├── aiStream.ts             # Server-Sent Events (SSE) AI streaming client
│   ├── monetization.tsx        # Superwall paywall integration
│   ├── revenuecat.ts           # RevenueCat in-app subscriptions wrapper
│   ├── scanner.ts              # Image cropping & OCR preprocessing
│   ├── pdfGenerator.ts         # PDF generation and print export
│   ├── posthog.ts              # PostHog product analytics & session replay
│   ├── storage.ts              # Expo SecureStore persistence
│   └── notifications.ts        # Push notification handler
├── store/
│   └── authStore.ts            # Global Zustand store for user, auth, and network state
├── app.json                    # Expo project configuration
├── eas.json                    # EAS Build & Submit profiles
├── babel.config.js             # Babel config with NativeWind & Reanimated plugins
├── tailwind.config.js          # Tailwind CSS styling configuration
└── tsconfig.json               # TypeScript compiler options
```

---

## Daily AI quotas

Free users receive 2 tutor chat requests, 1 scan/solve, 1 quiz of up to 10
questions, 1 flashcard set of up to 10 cards, and 1 summary per UTC day. Pro
includes 200 tutor chat requests and 30 of each other generation feature per UTC
day. The Go backend is authoritative; the app displays a plan-limit modal when a
quota is reached. Subscription prices are unchanged and ads remain deferred.

Before deploying quota changes, apply
[`skeeme-go/migrations/002_daily_ai_usage.sql`](../skeeme-go/migrations/002_daily_ai_usage.sql)
to the backend database.

## 🎨 Tech Stack & Libraries

- **Framework**: [Expo SDK 57](https://expo.dev/) (React Native 0.86, React 19.2)
- **Navigation**: [Expo Router v5](https://docs.expo.dev/router/introduction/) (File-based routing with Drawer & Stack layouts)
- **Styling**: [NativeWind v4](https://www.nativewind.dev/) (Tailwind CSS for React Native)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand) (`authStore.ts`)
- **Data Fetching**: [TanStack Query v5](https://tanstack.com/query/latest) (`@tanstack/react-query`)
- **Math Rendering**: [KaTeX](https://katex.org/) & `markdown-it-katex` (crisp mathematical and scientific notation rendering)
- **Animations**: `react-native-reanimated`, `moti`, `lottie-react-native`
- **Monetization**: [Superwall](https://superwall.com/) (`expo-superwall`) & [RevenueCat](https://www.revenuecat.com/) (`react-native-purchases`)
- **Analytics**: [PostHog React Native](https://posthog.com/docs/libraries/react-native)

---

## 🔧 Environment Configuration

Create a `.env` file in `student-app/`:

```env
# ── API Backend ─────────────────────────────────────────────
# Live Production Backend (default):
EXPO_PUBLIC_API_URL=https://skeeme....

# Local backend alternative:
# EXPO_PUBLIC_API_URL=http://localhost:8080/api/v2/student/

# ── Google Authentication ───────────────────────────────────
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=your_google_web_client_id.apps.googleusercontent.com

# ── Analytics (PostHog) ─────────────────────────────────────
EXPO_PUBLIC_POSTHOG_API_KEY=phc_...
EXPO_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com
EXPO_PUBLIC_POSTHOG_SESSION_REPLAY=false

# ── Subscriptions & In-App Purchases ────────────────────────
EXPO_PUBLIC_SUPERWALL_PUBLIC_KEY=pk_...
EXPO_PUBLIC_REVENUECAT_APPLE_KEY=appl_...
EXPO_PUBLIC_REVENUECAT_ANDROID_KEY=goog_...
```

---

## 🚀 Development Workflow

### 1. Install Dependencies
```bash
cd student-app
npm install
```

### 2. Start Development Server
```bash
npx expo start
```

- **iOS Simulator**: Press `i` (Requires Xcode on macOS).
- **Android Emulator**: Press `a` (Requires Android Studio & Android SDK).
- **Physical Device**: Scan the QR code displayed in the terminal using the **Expo Go** app (or a custom development build).

---

## 💡 Key Architectural Patterns

### 1. Fast Network Bridge Interception (`lib/api.ts`)
Instead of issuing bridge calls to `NetInfo.fetch()` on every single network request, `student-app` attaches a singleton event listener. Network type and quality headers (`X-Network-Type`, `X-Network-Generation`) are passed with zero bridge overhead, keeping AI generation and chat streaming completely smooth on the JavaScript thread.

### 2. Real-Time AI Streaming (`lib/aiStream.ts`)
Interactive tutor chat and problem explanations stream via Server-Sent Events (SSE). Chunks are appended to the active conversation state in real-time with automatic markdown and LaTeX rendering as tokens arrive.

### 3. Spaced Repetition Flashcards (`app/(drawer)/flashcards/`)
Flashcards support 3D animated flip transitions, answer confidence grading (Easy, Good, Hard), and automatic session persistence to the Go backend for spaced repetition scheduling.

### 4. PDF Document Generation (`lib/pdfGenerator.ts`)
Converts summaries and study notes into formatted PDF documents using `expo-print` and `expo-sharing`, allowing students to print or export their notes directly.

---

## 📦 Building with EAS

Profiles are configured in `eas.json`:

```bash
# Preview build (Android APK / iOS Simulator)
eas build --profile preview --platform android

# Production build
eas build --profile production --platform all
```
