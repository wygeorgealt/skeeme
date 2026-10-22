package credits

import "testing"

func TestQuizCost(t *testing.T) {
	cases := map[int]int{0: 0, 1: 20, 5: 20, 10: 20, 11: 40, 15: 40, 20: 40, 21: 60, 30: 60}
	for n, want := range cases {
		if got := QuizCost(n); got != want {
			t.Errorf("QuizCost(%d) = %d, want %d", n, got, want)
		}
	}
}

func TestFlashcardCost(t *testing.T) {
	cases := map[int]int{0: 0, 1: 20, 5: 20, 6: 40, 10: 40, 15: 60, 20: 80, 26: 120, 30: 120}
	for n, want := range cases {
		if got := FlashcardCost(n); got != want {
			t.Errorf("FlashcardCost(%d) = %d, want %d", n, got, want)
		}
	}
}
