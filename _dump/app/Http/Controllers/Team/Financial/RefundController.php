<?php

namespace App\Http\Controllers\Team\Financial;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class RefundController extends Controller
{
    public function process(Request $request)
    {
        return redirect()->back()->with('success', 'Refund processed successfully');
    }
}
