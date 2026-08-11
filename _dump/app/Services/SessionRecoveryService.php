<?php

namespace App\Services;

use App\Models\ExamSession;
use App\Models\ExamSessionRecovery;
use App\Models\User;
use App\Models\ExamAnswer;

class SessionRecoveryService
{
    /**
     * Create recovery entry when connection is lost
     */
    public function logConnectionLoss(ExamSession $examSession, User $student, int $lastQuestionIndex, array $autoSavedData = []): ExamSessionRecovery
    {
        return \Illuminate\Support\Facades\DB::transaction(function () use ($examSession, $student, $lastQuestionIndex, $autoSavedData) {
            $recovery = ExamSessionRecovery::where('exam_session_id', $examSession->id)
                ->where('student_id', $student->id)
                ->lockForUpdate()
                ->first();

            if (!$recovery) {
                try {
                    $recovery = ExamSessionRecovery::create([
                        'exam_session_id' => $examSession->id,
                        'student_id' => $student->id,
                        'last_question_index' => $lastQuestionIndex,
                        'auto_saved_data' => $autoSavedData,
                        'connection_lost_at' => now(),
                        'is_recovered' => false,
                    ]);
                    return $recovery;
                } catch (\Illuminate\Database\QueryException $e) {
                    $recovery = ExamSessionRecovery::where('exam_session_id', $examSession->id)
                        ->where('student_id', $student->id)
                        ->lockForUpdate()
                        ->first();
                }
            }

            $recovery->update([
                'last_question_index' => $lastQuestionIndex,
                'auto_saved_data' => $autoSavedData,
                'connection_lost_at' => now(),
                'is_recovered' => false,
            ]);

            return $recovery;
        });
    }

    /**
     * Get recovery data for a session
     */
    public function getRecoveryData(ExamSession $examSession, User $student): ?ExamSessionRecovery
    {
        return ExamSessionRecovery::where('exam_session_id', $examSession->id)
            ->where('student_id', $student->id)
            ->where('is_recovered', false)
            ->first();
    }

    /**
     * Recover session from auto-saved data
     */
    public function recoverSession(ExamSessionRecovery $recovery): ExamSessionRecovery
    {
        // Restore any auto-saved answers
        if ($recovery->auto_saved_data) {
            foreach ($recovery->auto_saved_data as $questionIndex => $answerData) {
                $this->restoreAnswer($recovery->exam_session_id, (int) $questionIndex, $answerData);
            }
        }

        $recovery->markAsRecovered();

        return $recovery;
    }

    /**
     * Auto-save answer for recovery
     */
    public function autoSaveAnswer(
        ExamSession $examSession,
        User $student,
        int $questionIndex,
        array $answerData
    ): void {
        \Illuminate\Support\Facades\DB::transaction(function () use ($examSession, $student, $questionIndex, $answerData) {
            $recovery = ExamSessionRecovery::where('exam_session_id', $examSession->id)
                ->where('student_id', $student->id)
                ->lockForUpdate()
                ->first();

            if (!$recovery) {
                try {
                    $recovery = ExamSessionRecovery::create([
                        'exam_session_id' => $examSession->id,
                        'student_id' => $student->id,
                        'last_question_index' => $questionIndex,
                        'auto_saved_data' => [],
                    ]);
                    $recovery = ExamSessionRecovery::where('id', $recovery->id)->lockForUpdate()->first();
                } catch (\Illuminate\Database\QueryException $e) {
                    $recovery = ExamSessionRecovery::where('exam_session_id', $examSession->id)
                        ->where('student_id', $student->id)
                        ->lockForUpdate()
                        ->first();
                }
            }

            $autoSavedData = $recovery->auto_saved_data ?? [];
            $autoSavedData[$questionIndex] = $answerData;
            $autoSavedData['last_saved_at'] = now()->toIso8601String();

            $recovery->auto_saved_data = $autoSavedData;
            $recovery->last_question_index = $questionIndex;
            $recovery->save();
        });
    }

    /**
     * Restore a single answer
     */
    private function restoreAnswer(int $examSessionId, int $questionIndex, array $answerData): void
    {
        // Map 'response' to 'student_answer' if needed
        $data = [
            'student_answer' => $answerData['response'] ?? null,
        ];
        
        if (isset($answerData['question_id'])) {
            $data['question_id'] = $answerData['question_id'];
        }
        
        $data['is_auto_saved'] = true;

        ExamAnswer::updateOrCreate(
            [
                'exam_session_id' => $examSessionId,
                'question_index' => $questionIndex,
            ],
            $data
        );
    }

    /**
     * Clear recovery data after successful submission
     */
    public function clearRecoveryData(ExamSession $examSession, User $student): void
    {
        ExamSessionRecovery::where('exam_session_id', $examSession->id)
            ->where('student_id', $student->id)
            ->delete();
    }

    /**
     * Get pending recovery sessions for a user
     */
    public function getPendingRecoverySessions(User $student)
    {
        return ExamSessionRecovery::where('student_id', $student->id)
            ->where('is_recovered', false)
            ->where('connection_lost_at', '!=', null)
            ->with('examSession.exam')
            ->orderBy('connection_lost_at', 'desc')
            ->get();
    }

    /**
     * Validate answer before submission
     */
    public function validateAnswer(array $answerData, array $validationRules): array
    {
        $errors = [];

        foreach ($validationRules as $rule => $config) {
            switch ($rule) {
                case 'required':
                    if (empty($answerData['response'])) {
                        $errors['response'] = 'Answer is required';
                    }
                    break;

                case 'min_length':
                    if (strlen($answerData['response'] ?? '') < $config['value']) {
                        $errors['response'] = "Answer must be at least {$config['value']} characters";
                    }
                    break;

                case 'max_length':
                    if (strlen($answerData['response'] ?? '') > $config['value']) {
                        $errors['response'] = "Answer must not exceed {$config['value']} characters";
                    }
                    break;

                case 'multiple_choice':
                    if (!in_array($answerData['response'] ?? null, $config['options'] ?? [])) {
                        $errors['response'] = 'Invalid option selected';
                    }
                    break;
            }
        }

        return $errors;
    }

    /**
     * Get recovery statistics
     */
    public function getRecoveryStats(): array
    {
        $allRecoveries = ExamSessionRecovery::all();
        $successfulRecoveries = $allRecoveries->where('is_recovered', true);
        $pendingRecoveries = $allRecoveries->where('is_recovered', false)->where('connection_lost_at', '!=', null);

        return [
            'total_recoveries' => $allRecoveries->count(),
            'successful_recoveries' => $successfulRecoveries->count(),
            'pending_recoveries' => $pendingRecoveries->count(),
            'recovery_success_rate' => $allRecoveries->isEmpty() ? 0 : round(($successfulRecoveries->count() / $allRecoveries->count()) * 100, 2),
            'average_recovery_time_minutes' => $successfulRecoveries->isEmpty() ? 0 : round($successfulRecoveries->avg('time_lost_minutes'), 2),
        ];
    }
}
