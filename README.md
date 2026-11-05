# Skeeme 🎓🤖

> **Next-generation AI-powered academic companion and study ecosystem for students.**

Skeeme combines a high-performance Go backend with an intuitive React Native (Expo) mobile application to empower students with intelligent scan-and-solve problem explanations, personalized AI tutoring, automated quiz and flashcard generation, spaced repetition, study streak tracking, and interactive document summarization.

---

## ⚡ Core Features

- 📸 **Scan & Solve**: Capture or upload homework questions. Extract text with Google Cloud Vision OCR, followed by structured, step-by-step problem breakdown rendered with KaTeX LaTeX.
- 💬 **Interactive AI Tutor**: Real-time context-aware conversational tutoring streaming responses via Server-Sent Events (SSE), tailored to student grade level, subject field, learning style, and tone.
- 📝 **AI Quiz & Flashcard Generation**: Generate multiple-choice quizzes and flashcard decks on any topic or uploaded PDF/document. Includes spaced repetition study tracking and theory grading.
- 📄 **Document Summarization & Extraction**: Upload PDFs and documents for bulleted summaries, key takeaways, and flashcard creation.
- 🎯 **Streaks & Gamification**: Daily activity logging, study heatmaps, streak freezes, and reward milestones.
- 💳 **Credit & Subscription Economy**: Row-locked database transactions for atomic credit deductions, daily refills for Pro tier members, Paystack checkout integration, and RevenueCat/Superwall paywalls.
- 🔀 **Admin AI Switchboard**: Live runtime model routing between Anthropic Claude and DeepSeek without service restarts.
