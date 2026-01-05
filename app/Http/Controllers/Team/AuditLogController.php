<?php

namespace App\Http\Controllers\Team;

use App\Http\Controllers\Controller;

class AuditLogController extends Controller
{
    public function index() { return view('team.audit-logs.index'); }
    public function show($auditLog) { return view('team.audit-logs.show'); }
}
