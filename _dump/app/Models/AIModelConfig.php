<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AIModelConfig extends Model
{
    protected $table = 'ai_model_configs';

    protected $fillable = [
        'model_name',
        'provider',
        'cost_per_1k_input_tokens',
        'cost_per_1k_output_tokens',
        'max_tokens',
        'is_active',
        'capabilities',
        'settings',
    ];

    protected $casts = [
        'capabilities' => 'array',
        'settings' => 'array',
        'is_active' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function getCostPerRequest($inputTokens, $outputTokens)
    {
        $inputCost = ($inputTokens / 1000) * $this->cost_per_1k_input_tokens;
        $outputCost = ($outputTokens / 1000) * $this->cost_per_1k_output_tokens;
        return $inputCost + $outputCost;
    }

    public static function getActiveModels()
    {
        return self::where('is_active', true)->get();
    }

    public static function getByName($name)
    {
        return self::where('model_name', $name)->firstOrFail();
    }
}
