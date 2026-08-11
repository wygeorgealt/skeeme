<?php

namespace App\Http\Controllers\Team;

use App\Http\Controllers\Controller;
use App\Models\AIUsageLog;
use App\Models\AIModelConfig;
use App\Models\PromptLibrary;
use App\Models\AdminAuditLog;
use Illuminate\Http\Request;

class AIController extends Controller
{
    public function index()
    {
        $totalCost = AIUsageLog::sum('cost');
        $totalTokens = AIUsageLog::selectRaw('SUM(input_tokens + output_tokens) as total')->value('total') ?? 0;
        $averageTokensPerRequest = AIUsageLog::getAverageTokensPerRequest();
        
        $costByModel = AIUsageLog::selectRaw('model_used, SUM(cost) as total_cost, COUNT(*) as usage_count')
            ->groupBy('model_used')
            ->get();

        $recentUsage = AIUsageLog::latest('used_at')->limit(10)->get();

        return view('team.ai.index', compact(
            'totalCost',
            'totalTokens',
            'averageTokensPerRequest',
            'costByModel',
            'recentUsage'
        ));
    }

    public function comparison(Request $request)
    {
        $models = AIModelConfig::getActiveModels();
        
        $costComparison = [];
        foreach ($models as $model) {
            $usage = AIUsageLog::where('model_used', $model->model_name)->sum('cost');
            $count = AIUsageLog::where('model_used', $model->model_name)->count();
            
            $costComparison[] = [
                'model' => $model,
                'total_cost' => $usage,
                'usage_count' => $count,
                'avg_cost' => $count > 0 ? $usage / $count : 0,
            ];
        }

        usort($costComparison, fn($a, $b) => $b['total_cost'] <=> $a['total_cost']);

        return view('team.ai.comparison', compact('costComparison', 'models'));
    }

    public function costs(Request $request)
    {
        $period = $request->input('period', '30'); // days
        $startDate = now()->subDays($period);

        $costByModel = AIUsageLog::where('used_at', '>=', $startDate)
            ->selectRaw('model_used, SUM(cost) as total_cost, COUNT(*) as count')
            ->groupBy('model_used')
            ->get();

        $costByFeature = AIUsageLog::where('used_at', '>=', $startDate)
            ->selectRaw('feature, SUM(cost) as total_cost, COUNT(*) as count')
            ->groupBy('feature')
            ->get();

        $costByUser = AIUsageLog::where('used_at', '>=', $startDate)
            ->with('user')
            ->selectRaw('user_id, SUM(cost) as total_cost, COUNT(*) as count')
            ->groupBy('user_id')
            ->orderByDesc('total_cost')
            ->limit(20)
            ->get();

        $totalCost = AIUsageLog::where('used_at', '>=', $startDate)->sum('cost');
        $avgCostPerRequest = AIUsageLog::where('used_at', '>=', $startDate)
            ->selectRaw('AVG(cost) as avg')
            ->value('avg') ?? 0;

        return view('team.ai.costs', compact(
            'costByModel',
            'costByFeature',
            'costByUser',
            'totalCost',
            'avgCostPerRequest',
            'period'
        ));
    }

    public function prompts(Request $request)
    {
        $query = PromptLibrary::with('creator');

        if ($request->filled('category')) {
            $query->where('category', $request->category);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        if ($request->filled('sort')) {
            match ($request->sort) {
                'most_used' => $query->orderBy('usage_count', 'desc'),
                'cheapest' => $query->orderBy('avg_cost_per_use', 'asc'),
                'highest_quality' => $query->orderBy('avg_quality_score', 'desc'),
                default => $query->latest('created_at'),
            };
        }

        $prompts = $query->where('is_active', true)->paginate(20);
        $categories = PromptLibrary::distinct()->pluck('category');

        return view('team.ai.prompts', compact('prompts', 'categories'));
    }

    public function createPrompt()
    {
        return view('team.ai.create-prompt');
    }

    public function storePrompt(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'prompt_text' => 'required|string|min:20',
            'category' => 'required|string|max:100',
            'description' => 'nullable|string',
            'variables' => 'nullable|json',
            'is_public' => 'boolean',
        ]);

        $prompt = PromptLibrary::create([
            'created_by' => $request->user()->teamMember->id,
            ...$validated,
        ]);

        AdminAuditLog::log(
            $request->user()->teamMember,
            'prompt.created',
            'PromptLibrary',
            $prompt->id,
            ['title' => $validated['title']]
        );

        return redirect()->route('team.ai.prompts')->with('success', 'Prompt saved to library');
    }

    public function editPrompt(PromptLibrary $prompt)
    {
        return view('team.ai.edit-prompt', compact('prompt'));
    }

    public function updatePrompt(Request $request, PromptLibrary $prompt)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'prompt_text' => 'required|string|min:20',
            'category' => 'required|string|max:100',
            'description' => 'nullable|string',
            'variables' => 'nullable|json',
            'is_public' => 'boolean',
        ]);

        $prompt->update($validated);

        AdminAuditLog::log(
            $request->user()->teamMember,
            'prompt.updated',
            'PromptLibrary',
            $prompt->id,
            ['title' => $validated['title']]
        );

        return redirect()->route('team.ai.prompts')->with('success', 'Prompt updated');
    }

    public function deletePrompt(Request $request, PromptLibrary $prompt)
    {
        $prompt->update(['is_active' => false]);

        AdminAuditLog::log(
            $request->user()->teamMember,
            'prompt.deleted',
            'PromptLibrary',
            $prompt->id,
            []
        );

        return redirect()->route('team.ai.prompts')->with('success', 'Prompt archived');
    }

    public function logUsage(Request $request)
    {
        // This would typically be called from the application
        // when AI features are used by school admins/users
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'model_used' => 'required|string',
            'input_tokens' => 'required|integer',
            'output_tokens' => 'required|integer',
            'feature' => 'required|in:chat,analysis,generation,correction,tutoring',
            'metadata' => 'nullable|json',
        ]);

        $model = AIModelConfig::getByName($validated['model_used']);
        $cost = $model->getCostPerRequest($validated['input_tokens'], $validated['output_tokens']);

        AIUsageLog::create([
            ...$validated,
            'cost' => $cost,
            'used_at' => now(),
        ]);

        return response()->json(['cost' => $cost]);
    }
}
