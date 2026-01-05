import './bootstrap';
import { puter } from '@heyputer/puter.js';

window.puter = puter;

document.addEventListener('alpine:init', () => {
    Alpine.data('aiGenerator', (wire) => ({
        isGeneratingPuter: false,
        puterProgress: 'Ready',

        async generateWithPuter() {
            // Ensure Puter is authenticated
            if (!puter.auth.isSignedIn()) {
                await puter.auth.signIn();
            }

            this.isGeneratingPuter = true;
            this.puterProgress = 'Connecting to AI...';

            try {
                // 1. Gather Data
                if (!wire) { throw new Error('Livewire component not linked.'); }

                const notes = await wire.get('notes');
                const uploaded = await wire.get('uploadedNotes');
                const count = await wire.get('numberOfQuestions');
                const difficulty = await wire.get('aiDifficulty');
                const types = await wire.get('aiQuestionTypes');
                const userPrompt = await wire.get('questionPrompt');

                let notesText = (notes || []).join('\n');
                if (notesText.length < 10) {
                    if (userPrompt && userPrompt.length > 5) {
                        notesText = userPrompt;
                    } else {
                        alert('Please provide some notes or a topic.');
                        this.isGeneratingPuter = false;
                        return;
                    }
                }

                this.puterProgress = 'Drafting with Claude 3.5 Sonnet...';

                // 2. Build Generation Prompt (Primary)
                const genPrompt = `
                    Generate EXACTLY ${count} exam questions based on this content:
                    '${notesText.substring(0, 5000)}' ... [truncated]

                    Difficulty: ${difficulty}
                    Types: ${types.join(', ')}
                    ${userPrompt ? 'Focus: ' + userPrompt : ''}

                    Return strict JSON array. No markdown.
                    format: [{ "question_text": "...", "question_type": "...", "options": [...], "correct_answer": "...", "explanation": "..." }]
                `;

                // 3. Generate with Claude
                if (typeof puter === 'undefined') throw new Error('Puter.js not loaded.');

                // Use GPT-4o as it is more reliable
                const genResponse = await puter.ai.chat(genPrompt, { model: 'gpt-4o' });
                let content = genResponse.message.content.replace(/```json/g, '').replace(/```/g, '').trim();

                let questions = [];
                try {
                    questions = JSON.parse(content);
                } catch (e) {
                    const match = content.match(/\[.*\]/s);
                    if (match) questions = JSON.parse(match[0]);
                    else throw new Error('Invalid JSON from Claude');
                }

                // 4. Verification Loop with GPT-4o (Batched for Speed)
                this.puterProgress = 'Verifying answers with GPT-4o...';

                // Helper to verify a single question
                const verifyQuestion = async (q, index) => {
                    if (!['multiple_choice', 'true_false', 'fill_blank'].includes(q.question_type)) return;

                    const verifyPrompt = `
                        Solve this exam question accurately:
                        Question: ${q.question_text}
                        ${q.options ? 'Options: ' + JSON.stringify(q.options) : ''}

                        1. Solve it step-by-step.
                        2. Compare your answer with the proposed answer: "${q.correct_answer}".
                        3. If the proposed answer is correct, return "CORRECT".
                        4. If incorrect, return the actual correct answer strictly.
                    `;

                    try {
                        const verifyResponse = await puter.ai.chat(verifyPrompt, { model: 'gpt-4o' });
                        const verification = verifyResponse.message.content;

                        if (!verification.includes('CORRECT')) {
                            q.explanation += ` [Verification Note: GPT-4o suggested: ${verification.substring(0, 100)}...]`;
                        } else {
                            q.explanation = (q.explanation || '') + " (Verified)";
                        }
                    } catch (err) {
                        console.error('Verification failed for Q' + index, err);
                    }
                };

                // Process in batches of 5
                const batchSize = 5;
                for (let i = 0; i < questions.length; i += batchSize) {
                    const batch = questions.slice(i, i + batchSize);
                    this.puterProgress = `Verifying batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(questions.length / batchSize)}...`;

                    await Promise.all(batch.map((q, idx) => verifyQuestion(q, i + idx)));
                }

                this.puterProgress = 'Finalizing...';
                await wire.handleAIResults(questions);

            } catch (err) {
                console.error(err);
                alert('AI Error: ' + err.message);
            } finally {
                this.isGeneratingPuter = false;
            }
        }
    }));

    Alpine.data('discovery', (featureKey, dependsOn = null) => ({
        show: false,
        coords: { top: '0px', left: '0px' },
        init() {
            this.checkVisibility();
            window.addEventListener('discovery-update', () => this.checkVisibility());

            window.addEventListener('scroll', () => this.updatePosition(), true);
            window.addEventListener('resize', () => this.updatePosition());
        },
        updatePosition() {
            if (!this.show) return;
            const anchor = document.getElementById(`anchor_${featureKey}`);
            if (anchor) {
                const rect = anchor.getBoundingClientRect();
                this.coords.top = (rect.bottom + 12) + 'px';
                this.coords.left = (rect.right - 256) + 'px';
            }
        },
        checkVisibility() {
            if (this.show) return;
            if (localStorage.getItem(`discovery_${featureKey}_completed`)) return;

            // If it depends on another feature, wait until that one is completed
            if (dependsOn && !localStorage.getItem(`discovery_${dependsOn}_completed`)) return;

            const snoozedUntil = localStorage.getItem(`discovery_${featureKey}_snoozed`);
            if (snoozedUntil && Date.now() < parseInt(snoozedUntil)) return;

            setTimeout(() => {
                this.updatePosition();
                this.show = true;
            }, 600);
        },
        dismiss() {
            this.show = false;
            localStorage.setItem(`discovery_${featureKey}_snoozed`, Date.now() + 24 * 60 * 60 * 1000);
        },
        complete() {
            this.show = false;
            localStorage.setItem(`discovery_${featureKey}_completed`, 'true');
            window.dispatchEvent(new CustomEvent('discovery-update'));
        }
    }));
});
