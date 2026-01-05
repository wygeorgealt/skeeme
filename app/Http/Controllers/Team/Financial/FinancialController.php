<?php

namespace App\Http\Controllers\Team\Financial;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class FinancialController extends Controller
{
    public function dashboard()
    {
        return view('team.financial.dashboard', [
            'revenue_this_month' => 45230.50,
            'revenue_last_month' => 38920.75,
            'total_refunds' => 2100.00,
            'pending_invoices' => 12,
            'failed_payments' => 5,
        ]);
    }
}
