<?php

namespace Database\Seeders;

use App\Models\AIModelConfig;
use Illuminate\Database\Seeder;

class AIModelSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $models = [
            [
                'model_name' => 'gpt-4',
                'provider' => 'OpenAI',
                'cost_per_1k_input_tokens' => 0.03,
                'cost_per_1k_output_tokens' => 0.06,
                'max_tokens' => 8192,
                'is_active' => true,
                'capabilities' => ['chat', 'analysis', 'generation'],
            ],
            [
                'model_name' => 'gpt-3.5-turbo',
                'provider' => 'OpenAI',
                'cost_per_1k_input_tokens' => 0.0005,
                'cost_per_1k_output_tokens' => 0.0015,
                'max_tokens' => 4096,
                'is_active' => true,
                'capabilities' => ['chat', 'generation'],
            ],
            [
                'model_name' => 'claude-3-opus',
                'provider' => 'Anthropic',
                'cost_per_1k_input_tokens' => 0.015,
                'cost_per_1k_output_tokens' => 0.075,
                'max_tokens' => 200000,
                'is_active' => true,
                'capabilities' => ['chat', 'analysis', 'generation', 'correction'],
            ],
            [
                'model_name' => 'claude-3-sonnet',
                'provider' => 'Anthropic',
                'cost_per_1k_input_tokens' => 0.003,
                'cost_per_1k_output_tokens' => 0.015,
                'max_tokens' => 200000,
                'is_active' => true,
                'capabilities' => ['chat', 'analysis', 'generation'],
            ],
            [
                'model_name' => 'deepseek-chat',
                'provider' => 'DeepSeek',
                'cost_per_1k_input_tokens' => 0.0007,
                'cost_per_1k_output_tokens' => 0.0028,
                'max_tokens' => 4096,
                'is_active' => true,
                'capabilities' => ['chat', 'generation'],
            ],
            [
                'model_name' => 'deepseek-coder',
                'provider' => 'DeepSeek',
                'cost_per_1k_input_tokens' => 0.0007,
                'cost_per_1k_output_tokens' => 0.0028,
                'max_tokens' => 4096,
                'is_active' => true,
                'capabilities' => ['chat', 'generation', 'correction'],
            ],
        ];

        foreach ($models as $model) {
            AIModelConfig::updateOrCreate(
                ['model_name' => $model['model_name']],
                $model
            );
        }
    }
}
