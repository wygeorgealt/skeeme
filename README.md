student-app Refactoring Tasks
[x] 1. Update Core Design Tokens & Global CSS

Extract colors, rounded corners, and shadow definitions from stitch_skeeme/electric_ios_neo_material/DESIGN.md.
Update tailwind.config.js and global.css with the new Neo-Material tokens.
[x] 2. Onboarding Flow Refactor (Exempting Welcome Screen)

[x] 2.1 Refactor app/(onboarding)/name.tsx (from 02_let_s_get_to_know_you)
[x] 2.2 Refactor app/(onboarding)/education.tsx & field.tsx (from 03_what_do_you_study)
[x] 2.3 Refactor app/(onboarding)/goal.tsx (from 04_what_do_you_want_to_achieve)
[x] 2.4 Refactor app/(onboarding)/style.tsx (from 05_what_s_challenging_you)
[x] 2.5 Refactor app/(onboarding)/tone.tsx (from 06_how_should_i_teach_you)
[x] 2.6 Refactor app/(onboarding)/analogy.tsx (from 07_what_makes_things_click)
[x] 2.7 Refactor app/(onboarding)/exam-date.tsx (from 08_what_are_you_studying_for)
[x] 2.8 Refactor app/(onboarding)/notifications.tsx (from 09_build_your_study_routine)
[x] 2.9 Refactor app/(onboarding)/onboarding-loading.tsx (from 10_skeeme_is_ready)
[x] 3. Main Dashboard & Navigation

[x] 3.1 Implement Floating Pill Navbar Layout
[x] 3.2 Build New Home Dashboard (app/(drawer)/index.tsx)
[ ] 4. Core Study Features (Flashcards & Quizzes)

[ ] 4.1 Refactor Flashcards Creation & Study Views
[ ] 4.2 Refactor Quiz Creation & Question Views
[ ] 5. AI Camera Scan & Results

[ ] 5.1 Redesign Camera Viewfinder
[ ] 5.2 Style Scan Results & SummariesYes
[ ] 6. Chat, History & Settings

[ ] 6.1 Refactor AI Chat View
[ ] 6.2 Refactor Saved History
[ ] 6.3 Refactor Settings & Preferences UI



Comprehensive Refactoring Plan for @student-app
This plan outlines the complete refactoring of the @student-app (Expo/React Native) using the exported Stitch designs in c:\Users\kritex\Herd\skeeme\stitch_skeeme.

Background & Design System
We will be transitioning the app to the Electric iOS Neo-Material design language.

Primary Color: Electric Blue (#007aff) / Secondary: Indigo (#5856d6)
Typography: System fonts (SF Pro on iOS, Roboto on Android) — no custom fonts.
Geometry: Heavy use of squircles (24px - 32px radii), frosted translucent layered chromes (expo-blur), and Material 3-style tiered surface containers (#ffffff through #e3e2e7).
Styling Method: Using the existing NativeWind/Tailwind CSS configuration in the app.
Resolved Decisions
NOTE

Font: Sticking with system fonts (SF Pro / Roboto). No custom font installation.

NOTE

Welcome Screen: The current welcome/auth-select screen is exempt from refactoring — do not touch it.

NOTE

Interactions: Using Reanimated + Gesture Handler for smooth 2D animations. No 3D carousel changes.

Proposed Changes
1. Onboarding Flow Refactor ✅
Designs: 02_let_s_get_to_know_you through 10_skeeme_is_ready

⚠️ Welcome screen (auth-select.tsx) is EXEMPT — not changed.
All remaining onboarding screens refactored to match Stitch designs.
Neo-Material option cards for study levels, goals, challenges, and tone selection.
2. Main Dashboard & Navigation
Designs: home_dashboard_reference_redesign_1 & 2

Navigation: Replace standard tab bars with the floating 2-option pill navbar (Home, Scan, Chat).
Dashboard (app/(drawer)/index.tsx):
Implement top status bar with Profile Pill and Streak/Credits badges.
Add the "Daily Goal" progress card.
Implement the grid of action cards (Quiz, Flashcards, History).
Add the "Today's Tasks" list view.
3. Core Study Features (Flashcards & Quizzes)
Designs: create_flashcards, flashcards_study, flashcard_deck_mastery_summary, create_quiz, ai_quiz_question_answer

Overhaul app/(drawer)/flashcards/ and app/(drawer)/history/saved/quiz/.
Apply frosted glass modals for summary/mastery screens.
4. AI Camera Scan & Results
Designs: scan_camera_viewfinder, snap_result_refactored_skeeme, ai_summary_physics_motion_force

Redesign the camera UI to match the clean, edge-to-edge iOS viewfinder with floating controls.
Style the result snap/summary views using the new surface containers and typography.
5. Chat, History & Settings
Designs: chat_with_skeemy, saved_history, daily_study_goal, personalization, settings

Refactor the Chat view for the AI companion.
Redesign app/(drawer)/history/index.tsx, settings.tsx, and preferences.tsx.
Verification Plan
Automated Tests
TypeScript compilation checks (npx tsc / tsc --noEmit).
React Native Linting (npm run lint).