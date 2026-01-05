<?php

namespace App\Http\Controllers\Team\Monitoring;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class ApiController extends Controller
{
    public function index()
    {
        return view('team.monitoring.api.index');
    }
}
