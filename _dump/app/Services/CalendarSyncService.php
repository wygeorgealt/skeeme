<?php

namespace App\Services;

use App\Models\SocialAccount;
use App\Services\Integrations\GoogleProvider;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class CalendarSyncService
{
    /**
     * Synchronize a model with Google Calendar.
     * 
     * @param Model $model The model instance (Announcement, Exam, Timetable, etc.)
     * @param array $options Additional options (recurrence, etc.)
     * @return bool Success status
     */
    public function sync(Model $model, array $options = []): bool
    {
        $user = Auth::user();
        if (!$user) return false;

        $socialAccount = SocialAccount::where('user_id', $user->id)
            ->where('provider', 'google')
            ->first();

        if (!$socialAccount) {
            return false;
        }

        try {
            $googleProvider = new GoogleProvider($socialAccount);
            $eventData = $this->mapModelToEventData($model, $options);

            if ($model->google_event_id) {
                // Ideally we would update, but the current GoogleProvider only has create.
                // For now, we'll create new and update the ID if we want to keep it simple,
                // or we can add update logic to GoogleProvider.
                // Let's add createCalendarEvent to GoogleProvider first.
                $result = $googleProvider->createCalendarEvent($eventData);
            } else {
                $result = $googleProvider->createCalendarEvent($eventData);
            }

            if (isset($result['id'])) {
                $model->update(['google_event_id' => $result['id']]);
                return true;
            }

            return false;
        } catch (\Exception $e) {
            Log::error('CalendarSyncService Error: ' . $e->getMessage(), [
                'model' => get_class($model),
                'id' => $model->id
            ]);
            return false;
        }
    }

    /**
     * Map model data to Google Calendar event data.
     */
    protected function mapModelToEventData(Model $model, array $options): array
    {
        $data = [
            'topic' => $model->title ?? $model->name ?? $model->topic ?? 'Skeeme Event',
            'description' => $model->description ?? $model->content ?? '',
        ];

        // Specific mapping based on model type
        if ($model instanceof \App\Models\Announcement) {
            $data['start_time'] = $model->event_start_date->toIso8601String();
            $data['end_time'] = ($model->event_end_date ?? $model->event_start_date->addHour())->toIso8601String();
        } elseif ($model instanceof \App\Models\Exam) {
            $data['topic'] = "[" . strtoupper($model->category ?? 'exam') . "] " . $data['topic'];
            $data['start_time'] = $model->exam_date->toIso8601String();
            $data['end_time'] = $model->exam_date->addMinutes($model->duration ?? 60)->toIso8601String();
        } elseif ($model instanceof \App\Models\AcademicEvent) {
            $data['start_time'] = $model->start_date->toIso8601String();
            $data['end_time'] = $model->end_date->toIso8601String();
        } elseif ($model instanceof \App\Models\Timetable) {
            // Timetables are more complex due to recurrence
            // We'll handle recurrence in the GoogleProvider or by generating a rule
            $data['start_time'] = $this->getNearestDateTimeForDay($model->day_of_week, $model->start_time);
            $data['end_time'] = $this->getNearestDateTimeForDay($model->day_of_week, $model->end_time);
            $data['recurrence'] = ["RRULE:FREQ=WEEKLY;BYDAY=" . $this->mapDayToByDay($model->day_of_week)];
        }

        return $data;
    }

    protected function getNearestDateTimeForDay(string $day, string $time): string
    {
        return \Carbon\Carbon::parse("next {$day} {$time}")->toIso8601String();
    }

    protected function mapDayToByDay(string $day): string
    {
        $map = [
            'monday' => 'MO',
            'tuesday' => 'TU',
            'wednesday' => 'WE',
            'thursday' => 'TH',
            'friday' => 'FR',
            'saturday' => 'SA',
            'sunday' => 'SU',
        ];

        return $map[strtolower($day)] ?? 'MO';
    }
}
