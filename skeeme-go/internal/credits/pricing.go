package credits

// Credit prices for each AI feature. This is the single source of truth:
// change a value here and every handler picks it up.
const (
	// ScanSolveCost is charged once per scan & solve (flat).
	ScanSolveCost = 25

	// QuizCostPerBlock is charged for every block of QuizBlockSize questions
	// (or part of one): 1-10 questions = 20, 11-20 = 40, 21-30 = 60.
	QuizCostPerBlock = 20
	QuizBlockSize    = 10

	// FlashcardCostPerBlock is charged for every block of FlashcardBlockSize cards
	// (or part of one): 1-5 cards = 20, 6-10 = 40 ... 26-30 = 120.
	FlashcardCostPerBlock = 20
	FlashcardBlockSize    = 5

	// SummaryCost is charged once per generated summary (flat).
	// PLACEHOLDER: tune this value once pricing is decided.
	SummaryCost = 15
)

// blockCost returns perBlock for every started block of blockSize items.
func blockCost(count, blockSize, perBlock int) int {
	if count <= 0 {
		return 0
	}
	blocks := (count + blockSize - 1) / blockSize
	return blocks * perBlock
}

// QuizCost returns the credit cost for generating questionCount quiz questions.
func QuizCost(questionCount int) int {
	return blockCost(questionCount, QuizBlockSize, QuizCostPerBlock)
}

// FlashcardCost returns the credit cost for generating cardCount flashcards.
func FlashcardCost(cardCount int) int {
	return blockCost(cardCount, FlashcardBlockSize, FlashcardCostPerBlock)
}
