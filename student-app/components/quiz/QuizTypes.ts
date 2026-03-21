import { 
    QuizMode, 
    Difficulty, 
    FormatType, 
    QuizQuestion as Question, 
    TheoryResult 
} from '@/types';

export { QuizMode, Difficulty, FormatType, Question, TheoryResult };

export const DIFF_COLORS: Record<string, string> = {
    easy: '#A1C4FD', medium: '#FCD34D', hard: '#ef4444',
};
