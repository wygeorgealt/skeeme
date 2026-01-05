<?php

namespace App\Http\Controllers\Team;

use App\Http\Controllers\Controller;

class SubscriptionController extends Controller
{
    public function index() { return view('team.subscriptions.index'); }
    public function show($subscription) { return view('team.subscriptions.show'); }
    public function refund($subscription) { /* TODO: Process refund */ }
    public function cancel($subscription) { /* TODO: Cancel subscription */ }
    public function renew($subscription) { /* TODO: Renew subscription */ }
}
