namespace App\Http\Controllers\API\Student;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\FlashcardSession;
use App\Services\StreakService;

class FlashcardSessionController extends Controller
{
    /**
     * List all past flashcard sessions for the user
     */
    public function index(Request $request)
    {
        $sessions = FlashcardSession::where('user_id', $request->user()->id)
            ->with('deck:id,title')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json(['data' => $sessions]);
    }

    /**
     * Save a completed flashcard session
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'deck_id' => 'required|exists:flashcard_decks,id',
            'cards_count' => 'required|integer',
        ]);

        $session = FlashcardSession::create([
            'user_id' => $request->user()->id,
            'flashcard_deck_id' => $validated['deck_id'],
            'cards_count' => $validated['cards_count'],
            'completed_at' => now(),
        ]);

        // Update User Streak & get rewards
        $streakResult = app(StreakService::class)->logActivity($request->user()->id);

        return response()->json([
            'message' => 'Flashcard session saved successfully',
            'data' => $session,
            'streak' => $streakResult['streak'],
            'reward' => $streakResult['reward']
        ], 201);
    }
}
