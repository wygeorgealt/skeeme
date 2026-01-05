<?php

namespace App\Http\Controllers\Team;

use App\Http\Controllers\Controller;

class PaymentController extends Controller
{
    public function index() { return view('team.payments.index'); }
    public function show($payment) { return view('team.payments.show'); }
    public function retry($payment) { /* TODO: Retry payment */ }
    public function refund($payment) { /* TODO: Refund payment */ }
}
