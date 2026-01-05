<?php

namespace App\Http\Controllers\Team;

use App\Http\Controllers\Controller;

class TeamMemberController extends Controller
{
    public function index() { return view('team.team-members.index'); }
    public function store() { /* TODO: Create team member */ }
    public function edit($teamMember) { return view('team.team-members.edit'); }
    public function update($teamMember) { /* TODO: Update team member */ }
    public function deactivate($teamMember) { /* TODO: Deactivate team member */ }
    public function setup2FA($teamMember) { /* TODO: Setup 2FA */ }
}
