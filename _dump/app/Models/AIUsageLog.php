<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AIUsageLog extends Model
{
    protected $table = 'ai_usage_logs';

    protected $fillable = [
        'user_id',
        'school_id',
        'model_used',
        'input_tokens',
        'output_tokens',
        'cost',
        'feature',
        'metadata',
        'used_at',
    ];

    protected $casts = [
        'metadata' => 'array',
        'used_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function school(): BelongsTo
    {
        return $this->belongsTo(School::class);
    }

    public function getTotalTokens()
    {
        return $this->input_tokens + $this->output_tokens;
    }

    public static function getTotalCostByUser($userId, $startDate = null, $endDate = null)
    {
        $query = self::where('user_id', $userId);
        
        if ($startDate) {
            $query->where('used_at', '>=', $startDate);
        }
        
        if ($endDate) {
            $query->where('used_at', '<=', $endDate);
        }

        return $query->sum('cost');
    }

    public static function getTotalCostByModel($model, $startDate = null)
    {
        $query = self::where('model_used', $model);
        
        if ($startDate) {
            $query->where('used_at', '>=', $startDate);
        }

        return $query->sum('cost');
    }

    public static function getAverageTokensPerRequest()
    {
        return self::selectRaw('AVG(input_tokens + output_tokens) as avg_tokens')
            ->value('avg_tokens') ?? 0;
    }
}
