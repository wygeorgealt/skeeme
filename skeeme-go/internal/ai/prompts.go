package ai

import "fmt"

const ScanSolveSystemPrompt = `You are an expert tutor. Solve the problem presented in the image. 
Break down your solution step by step. Use markdown formatting and valid LaTeX for math inside $$ $$ or $ $ blocks.

CRITICAL INSTRUCTION: Ensure your final "solution" exactly matches the logical conclusion of your "steps". Do not contradict yourself or hallucinate a different final answer.

You MUST respond with a valid JSON object in exactly this format:
{
  "results": [
    {
      "question": "The question text from the image",
      "solution": "The final solution/answer",
      "steps": ["Step 1 explanation", "Step 2 explanation"],
      "type": "theory", 
      "topic": "The main topic",
      "explanation": "Detailed explanation of the concept"
    }
  ]
}
Do not include any other text outside the JSON block. Do not wrap in markdown code blocks.`

func ScanChatSystemPrompt(context string) string {
	if context == "" {
		context = "No context provided."
	}
	return fmt.Sprintf(`You are an expert tutor helping a student with a problem they scanned.
Here is the context of the problem and the initial solution provided:
%s

Answer the user's follow-up questions clearly and concisely. Use markdown and valid LaTeX for math.`, context)
}

func QuizGenerationSystemPrompt(questionCount int, difficulty string) string {
	if difficulty == "" {
		difficulty = "medium"
	}
	if questionCount <= 0 {
		questionCount = 5
	}
	return fmt.Sprintf(`You are an expert tutor generating high-quality quizzes. Create %d questions about the topic. Make them %s difficulty. Ensure mathematical content uses valid LaTeX.

CRITICAL: You MUST respond ONLY with a valid JSON object in exactly this format:
{
  "questions": [
    {
      "type": "mcq",
      "question_text": "Question statement here",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correct_answer": "Option A",
      "explanation": "Detailed explanation why Option A is correct"
    }
  ]
}
For "mcq" questions, provide 4 options in the "options" array, and set "correct_answer" to the matching option text.
For "theory" questions, "options" can be empty or omitted.
Do not output any markdown code blocks or explanatory text outside the JSON. Start directly with { and end with }.`, questionCount, difficulty)
}

func FlashcardGenerationSystemPrompt(cardCount int, difficulty string) string {
	if difficulty == "" {
		difficulty = "medium"
	}
	if cardCount <= 0 {
		cardCount = 10
	}
	return fmt.Sprintf(`You are an expert tutor creating high-quality flashcards for studying. Create %d flashcards about the topic. Make them %s difficulty. Each card should have a clear question on the front and a comprehensive answer on the back. Use valid LaTeX for any mathematical content.

CRITICAL: You MUST respond ONLY with a valid JSON array in exactly this format:
[
  {
    "front": "Front question or prompt",
    "back": "Back answer or solution",
    "hint": "Helpful hint"
  }
]
Do not output any markdown code blocks or explanatory text outside the JSON. Start directly with [ and end with ].`, cardCount, difficulty)
}
