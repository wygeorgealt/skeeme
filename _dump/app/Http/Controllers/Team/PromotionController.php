<?php

namespace App\Http\Controllers\Team;

use App\Http\Controllers\Controller;
use App\Models\SubscriptionPromotion;
use App\Models\PromotionUsage;
use App\Models\AdminAuditLog;
use Illuminate\Http\Request;

class PromotionController extends Controller
{
    public function index(Request $request)
    {
        $query = SubscriptionPromotion::with('creator');

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('code', 'like', "%{$search}%")
                  ->orWhere('name', 'like', "%{$search}%");
            });
        }

        $promotions = $query->latest('created_at')->paginate(20);
        $activeCount = SubscriptionPromotion::where('status', 'active')->count();
        $totalUsed = PromotionUsage::sum('discount_amount');

        return view('team.promotions.index', compact('promotions', 'activeCount', 'totalUsed'));
    }

    public function create()
    {
        return view('team.promotions.create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'code' => 'required|string|uppercase|unique:subscription_promotions|max:50',
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'discount_type' => 'required|in:percentage,fixed_amount',
            'discount_value' => 'required|numeric|min:0.01',
            'max_uses' => 'nullable|integer|min:1',
            'max_per_school' => 'nullable|integer|min:1',
            'applies_to_all_plans' => 'boolean',
            'applicable_plans' => 'nullable|array',
            'applies_to_first_month' => 'boolean',
            'applies_to_renewal' => 'boolean',
            'duration_months' => 'nullable|integer|min:1',
            'starts_at' => 'nullable|date',
            'expires_at' => 'required|date|after:now',
            'min_subscription_amount' => 'numeric|min:0',
        ]);

        $promotion = SubscriptionPromotion::create([
            'created_by' => $request->user()->teamMember->id,
            ...$validated,
        ]);

        AdminAuditLog::log(
            $request->user()->teamMember,
            'promotion.created',
            'SubscriptionPromotion',
            $promotion->id,
            ['code' => $validated['code'], 'discount' => $validated['discount_value']]
        );

        return redirect()->route('team.promotions.index')
            ->with('success', "Promotion '{$validated['code']}' created successfully");
    }

    public function show(SubscriptionPromotion $promotion)
    {
        $usages = $promotion->usages()->latest('used_at')->paginate(15);
        $totalDiscount = $promotion->usages()->sum('discount_amount');

        return view('team.promotions.show', compact('promotion', 'usages', 'totalDiscount'));
    }

    public function edit(SubscriptionPromotion $promotion)
    {
        return view('team.promotions.edit', compact('promotion'));
    }

    public function update(Request $request, SubscriptionPromotion $promotion)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'discount_value' => 'required|numeric|min:0.01',
            'max_uses' => 'nullable|integer|min:1',
            'max_per_school' => 'nullable|integer|min:1',
            'applies_to_all_plans' => 'boolean',
            'applicable_plans' => 'nullable|array',
            'applies_to_first_month' => 'boolean',
            'applies_to_renewal' => 'boolean',
            'duration_months' => 'nullable|integer|min:1',
            'status' => 'required|in:active,paused,expired',
            'expires_at' => 'required|date|after:now',
            'min_subscription_amount' => 'numeric|min:0',
        ]);

        $changes = [];
        foreach ($validated as $key => $value) {
            if ($promotion->{$key} != $value) {
                $changes[$key] = ['old' => $promotion->{$key}, 'new' => $value];
            }
        }

        $promotion->update($validated);

        if ($changes) {
            AdminAuditLog::log(
                $request->user()->teamMember,
                'promotion.updated',
                'SubscriptionPromotion',
                $promotion->id,
                $changes
            );
        }

        return redirect()->route('team.promotions.show', $promotion)
            ->with('success', 'Promotion updated');
    }

    public function pause(Request $request, SubscriptionPromotion $promotion)
    {
        $promotion->update(['status' => 'paused']);

        AdminAuditLog::log(
            $request->user()->teamMember,
            'promotion.paused',
            'SubscriptionPromotion',
            $promotion->id,
            []
        );

        return redirect()->back()->with('success', 'Promotion paused');
    }

    public function resume(Request $request, SubscriptionPromotion $promotion)
    {
        $promotion->update(['status' => 'active']);

        AdminAuditLog::log(
            $request->user()->teamMember,
            'promotion.resumed',
            'SubscriptionPromotion',
            $promotion->id,
            []
        );

        return redirect()->back()->with('success', 'Promotion resumed');
    }

    public function delete(Request $request, SubscriptionPromotion $promotion)
    {
        AdminAuditLog::log(
            $request->user()->teamMember,
            'promotion.deleted',
            'SubscriptionPromotion',
            $promotion->id,
            ['code' => $promotion->code]
        );

        $promotion->delete();

        return redirect()->route('team.promotions.index')
            ->with('success', 'Promotion deleted');
    }

    public function validatePromotion(Request $request)
    {
        $code = strtoupper($request->input('code'));
        $amount = $request->input('amount', 0);

        $promotion = SubscriptionPromotion::findByCode($code);

        if (!$promotion) {
            return response()->json([
                'valid' => false,
                'message' => 'Promotion code not found',
            ]);
        }

        if (!$promotion->canBeUsed()) {
            return response()->json([
                'valid' => false,
                'message' => 'This promotion code is no longer valid',
            ]);
        }

        if ($promotion->min_subscription_amount > $amount) {
            return response()->json([
                'valid' => false,
                'message' => "Minimum subscription amount of \${$promotion->min_subscription_amount} required",
            ]);
        }

        $discount = $promotion->calculateDiscount($amount);

        return response()->json([
            'valid' => true,
            'discount' => round($discount, 2),
            'discount_formatted' => $promotion->getFormattedDiscount(),
            'final_amount' => round($amount - $discount, 2),
            'message' => 'Promotion code applied successfully!',
        ]);
    }

    public function stats()
    {
        $totalPromotions = SubscriptionPromotion::count();
        $activePromotions = SubscriptionPromotion::where('status', 'active')->count();
        $totalUsages = PromotionUsage::count();
        $totalDiscounted = PromotionUsage::sum('discount_amount');

        $topPromotions = SubscriptionPromotion::withCount('usages')
            ->orderBy('usages_count', 'desc')
            ->limit(10)
            ->get();

        $discountTrend = PromotionUsage::selectRaw('DATE(used_at) as date, COUNT(*) as count, SUM(discount_amount) as total')
            ->where('used_at', '>=', now()->subDays(30))
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        return view('team.promotions.stats', compact(
            'totalPromotions',
            'activePromotions',
            'totalUsages',
            'totalDiscounted',
            'topPromotions',
            'discountTrend'
        ));
    }
}
