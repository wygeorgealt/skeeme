# Skeeme: The Future of AI-Driven Adaptive Learning

Skeeme is an ecosystem designed to move students from passive content consumption to active mastery. We solve the "Search-to-Solve" friction while creating a high-retention "Study Loop" that naturally acquires new users through organic sharing.

---

## 1. Product Ecosystem: The "Study Loop"

Skeeme provides a continuous pedagogical cycle that replaces the need for a human tutor:

*   **Smart Scan (The Hook):** Real-time OCR-to-Reasoning pipeline. Auto-detects **Calculation vs. Theory** to provide either step-by-step mathematical solutions or structured theoretical explanations (with bullet points and "Key Takeaways").
*   **Practice Similar (The Engagement):** A one-tap bridge to master the scanned topic. Skeeme extracts the core concept and instantly generates an AI Quiz to test comprehension.
*   **Theory Grading:** Our proprietary AI engine "reads" and grades subjective essay answers, providing marks, feedback, and missing keywords based on a model answer.
*   **Flashcards (SRS):** Automated creation of Spaced Repetition decks from long-form academic documents (PDF/Docx).

---

## 2. Hyper-Personalized Adaptive Learning

Unlike generic LLM wrappers, Skeeme utilizes a **"Student Profile Vector"** to ensure every AI interaction is pedagogically aligned:

*   **The Persona Vector:** We store and process four key dimensions for every user:
    *   **Education Level:** High School, Undergraduate, Masters, or Professional.
    *   **Field of Study:** Contextualizes explanations (e.g., Engineering logic vs. Humanities narrative).
    *   **Learning Style:** Toggle between "Ultra-Simple & Analogies" (comprehension-first) vs. "Detailed Academic" (exam-first).
    *   **Tone:** Choose between "Warm & Encouraging" or "Strict & Concise."
*   **Contextual Injection:** This profile is dynamically injected into every AI reasoning pass. A High Schooler and a Masters student scanning the same question will receive fundamentally different explanations tailored to their cognitive level.

---

## 3. Monetization & Credit Economics

Skeeme operates on a high-margin, usage-based credit system. Every operation is computationally mapped to ensure unit profitability:

| Action | Credit Cost | Business Rationale |
| :--- | :--- | :--- |
| **Scan & Solve** | 2 (Base) + 4/Solution | High-fidelity OCR + multiple reasoning passes. |
| **Practice Quiz** | 1/Question + 5/500 words | Scales with document processing complexity. |
| **Flashcard Deck** | 0.5-1.5/Card + 5/500 words | Variable pricing based on AI cognitive difficulty. |

*   **Guardrails:** Hard word limits (40k words for Quizzes, 8k for Flashcards) prevent API runaway while satisfying 99% of use cases.
*   **Transaction Integrity:** Atomic DB locking handles all credit deductions to prevent race conditions.

---

## 4. AI & Technical Infrastructure

Our stack is built for speed, accuracy, and extreme cost-efficiency:

*   **Multi-Model Orchestration:**
    *   **Google Cloud Vision API:** For 99%+ accurate OCR of math, chemical formulas, and handwriting.
    *   **Deepseek-V3 (LLM):** For pedagogical reasoning and solution formatting.
*   **Backend:** PHP 8.3 / Laravel 11. Optimized for heavy AI workloads.
*   **Storage:** Cloudflare R2 (S3-compatible) for encrypted student document storage.
*   **Frontend:** React Native / Expo. Features a "Branded Export" engine that turns quizzes into high-quality PDFs for offline study.

---

## 5. The Growth Engine (Low-CAC Acquisition)

Skeeme is designed with a "Viral Loop" at its core:
1.  **Student Scans** a question.
2.  **Student Performs** an AI Quiz.
3.  **Student Exports** a branded PDF of their results to a class WhatsApp/Telegram group.
4.  **Network Effect:** Peers see the high-quality quiz report and the Skeeme download link in the footer.
5.  **Acquisition:** New high-intent users enter the platform with zero ad spend.

---

**Skeeme is not just an app; it is the ultimate student companion—a tutor that understands you, a test-prep center that builds you, and a network that grows with you.**
