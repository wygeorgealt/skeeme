<?php

namespace App\Http\Controllers\Team\Monitoring;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class ErrorController extends Controller
{
    public function index()
    {
        return view('team.monitoring.errors.index');
    }
}
