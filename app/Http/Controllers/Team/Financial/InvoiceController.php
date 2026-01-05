<?php

namespace App\Http\Controllers\Team\Financial;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class InvoiceController extends Controller
{
    public function index()
    {
        return view('team.financial.invoices.index');
    }
}
