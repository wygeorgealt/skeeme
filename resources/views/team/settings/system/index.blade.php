@extends('team.layout')

@section('team-content')
    <div class="admin-page">
        <div class="page-header">
            <h1>System Settings</h1>
            <p class="page-subtitle">Configure system settings and features</p>
        </div>

        <div class="settings-container">
            <!-- Settings Navigation -->
            <div class="settings-nav">
                <button class="nav-item active" onclick="switchTab('general')">General Settings</button>
                <button class="nav-item" onclick="switchTab('email')">Email Configuration</button>
                <button class="nav-item" onclick="switchTab('features')">Feature Flags</button>
                <button class="nav-item" onclick="switchTab('security')">Security</button>
            </div>

            <!-- General Settings -->
            <div id="general" class="settings-panel active">
                <h3>General Settings</h3>
                <form onsubmit="saveSettings(event, 'general')">
                    <div class="form-group">
                        <label>Application Name</label>
                        <input type="text" value="Skeeme" class="form-input" />
                    </div>

                    <div class="form-group">
                        <label>Support Email</label>
                        <input type="email" value="noreply@contact.skeeme.com" class="form-input" />
                    </div>

                    <div class="form-group">
                        <label>Admin Email</label>
                        <input type="email" value="admin@skeeme.com" class="form-input" />
                    </div>

                    <div class="form-group">
                        <label>Timezone</label>
                        <select class="form-input">
                            <option>UTC</option>
                            <option>EST</option>
                            <option>CST</option>
                            <option>PST</option>
                        </select>
                    </div>

                    <div class="form-group">
                        <label>Maintenance Mode</label>
                        <div class="toggle-switch">
                            <input type="checkbox" id="maintenanceToggle">
                            <label for="maintenanceToggle" class="toggle-label"></label>
                            <span class="toggle-text">When enabled, users will see maintenance page</span>
                        </div>
                    </div>

                    <button type="submit" class="btn btn-primary">Save Changes</button>
                </form>
            </div>

            <!-- Email Configuration -->
            <div id="email" class="settings-panel">
                <h3>Email Configuration</h3>
                <form onsubmit="saveSettings(event, 'email')">
                    <div class="form-group">
                        <label>Mail Driver</label>
                        <select class="form-input">
                            <option>SMTP</option>
                            <option>Mailgun</option>
                            <option>Sendgrid</option>
                            <option>Mailtrap</option>
                        </select>
                    </div>

                    <div class="form-group">
                        <label>SMTP Host</label>
                        <input type="text" value="smtp.mailtrap.io" class="form-input" />
                    </div>

                    <div class="form-group">
                        <label>SMTP Port</label>
                        <input type="number" value="2525" class="form-input" />
                    </div>

                    <div class="form-group">
                        <label>SMTP Username</label>
                        <input type="text" value="user@example.com" class="form-input" />
                    </div>

                    <div class="form-group">
                        <label>SMTP Password</label>
                        <input type="password" placeholder="••••••••" class="form-input" />
                    </div>

                    <div class="form-group">
                        <button type="button" class="btn btn-secondary">Test Email</button>
                    </div>

                    <button type="submit" class="btn btn-primary">Save Email Configuration</button>
                </form>
            </div>

            <!-- Feature Flags -->
            <div id="features" class="settings-panel">
                <h3>Feature Flags</h3>
                <div class="features-list">
                    <div class="feature-item">
                        <div class="feature-info">
                            <h4>Dark Mode</h4>
                            <p>Allow users to use dark theme interface</p>
                        </div>
                        <div class="toggle-switch">
                            <input type="checkbox" id="darkMode" checked data-feature="dark-mode">
                            <label for="darkMode" class="toggle-label"></label>
                        </div>
                    </div>

                    <div class="feature-item">
                        <div class="feature-info">
                            <h4>Two-Factor Authentication</h4>
                            <p>Enable 2FA for user accounts</p>
                        </div>
                        <div class="toggle-switch">
                            <input type="checkbox" id="twoFactor" checked data-feature="2fa">
                            <label for="twoFactor" class="toggle-label"></label>
                        </div>
                    </div>

                    <div class="feature-item">
                        <div class="feature-info">
                            <h4>API Access</h4>
                            <p>Allow users to generate API keys</p>
                        </div>
                        <div class="toggle-switch">
                            <input type="checkbox" id="apiAccess" checked data-feature="api-access">
                            <label for="apiAccess" class="toggle-label"></label>
                        </div>
                    </div>

                    <div class="feature-item">
                        <div class="feature-info">
                            <h4>Advanced Analytics</h4>
                            <p>Enable detailed user analytics</p>
                        </div>
                        <div class="toggle-switch">
                            <input type="checkbox" id="analytics" checked data-feature="advanced-analytics">
                            <label for="analytics" class="toggle-label"></label>
                        </div>
                    </div>

                    <div class="feature-item">
                        <div class="feature-info">
                            <h4>Bulk Operations</h4>
                            <p>Allow bulk user/data operations</p>
                        </div>
                        <div class="toggle-switch">
                            <input type="checkbox" id="bulkOps" checked data-feature="bulk-operations">
                            <label for="bulkOps" class="toggle-label"></label>
                        </div>
                    </div>

                    <div class="feature-item">
                        <div class="feature-info">
                            <h4>Custom Branding</h4>
                            <p>Let customers customize branding</p>
                        </div>
                        <div class="toggle-switch">
                            <input type="checkbox" id="branding" data-feature="custom-branding">
                            <label for="branding" class="toggle-label"></label>
                        </div>
                    </div>

                    <div class="feature-item">
                        <div class="feature-info">
                            <h4>Webhooks</h4>
                            <p>Enable webhook support for integrations</p>
                        </div>
                        <div class="toggle-switch">
                            <input type="checkbox" id="webhooks" checked data-feature="webhooks">
                            <label for="webhooks" class="toggle-label"></label>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Security -->
            <div id="security" class="settings-panel">
                <h3>Security Settings</h3>
                <form onsubmit="saveSettings(event, 'security')">
                    <div class="form-group">
                        <label>Session Timeout (minutes)</label>
                        <input type="number" value="120" class="form-input" />
                    </div>

                    <div class="form-group">
                        <label>Max Login Attempts</label>
                        <input type="number" value="5" class="form-input" />
                    </div>

                    <div class="form-group">
                        <label>Lockout Duration (minutes)</label>
                        <input type="number" value="30" class="form-input" />
                    </div>

                    <div class="form-group">
                        <label>Require HTTPS</label>
                        <div class="toggle-switch">
                            <input type="checkbox" id="httpsRequired" checked>
                            <label for="httpsRequired" class="toggle-label"></label>
                        </div>
                    </div>

                    <div class="form-group">
                        <label>IP Whitelist (comma separated)</label>
                        <textarea rows="4" class="form-input" placeholder="192.168.1.1, 10.0.0.1, ..."></textarea>
                    </div>

                    <button type="submit" class="btn btn-primary">Save Security Settings</button>
                </form>
            </div>
        </div>

        <a href="{{ route('team.dashboard') }}" class="btn btn-secondary" style="margin-top: 30px;">Back to Dashboard</a>
    </div>

    <style>
        .admin-page {
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
        }

        .page-header {
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 2px solid #334155;
        }

        .page-header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: 700;
            color: #f1f5f9;
        }

        .page-subtitle {
            margin: 8px 0 0;
            color: #cbd5e1;
            font-size: 14px;
        }

        .settings-container {
            display: grid;
            grid-template-columns: 200px 1fr;
            gap: 20px;
        }

        .settings-nav {
            display: flex;
            flex-direction: column;
            gap: 8px;
        }

        .nav-item {
            padding: 12px 16px;
            background: #1e293b;
            border: 1px solid #334155;
            color: #cbd5e1;
            cursor: pointer;
            border-radius: 6px;
            text-align: left;
            font-size: 12px;
            font-weight: 500;
            transition: all 0.3s;
        }

        .nav-item:hover {
            border-color: #60a5fa;
            color: #60a5fa;
        }

        .nav-item.active {
            background: #60a5fa;
            color: white;
            border-color: #60a5fa;
        }

        .settings-panel {
            display: none;
            background: #1e293b;
            border: 1px solid #334155;
            border-radius: 10px;
            padding: 24px;
        }

        .settings-panel.active {
            display: block;
        }

        .settings-panel h3 {
            margin: 0 0 20px;
            font-size: 16px;
            font-weight: 600;
            color: #f1f5f9;
        }

        .form-group {
            margin-bottom: 20px;
        }

        .form-group label {
            display: block;
            font-size: 12px;
            color: #cbd5e1;
            margin-bottom: 8px;
            font-weight: 500;
        }

        .form-input {
            width: 100%;
            background: #0f172a;
            border: 1px solid #334155;
            border-radius: 6px;
            padding: 10px 12px;
            color: #f1f5f9;
            font-size: 12px;
            font-family: inherit;
        }

        .form-input:focus {
            outline: none;
            border-color: #60a5fa;
            box-shadow: 0 0 0 3px rgba(96, 165, 250, 0.1);
        }

        textarea.form-input {
            resize: vertical;
        }

        .toggle-switch {
            display: flex;
            align-items: center;
            gap: 12px;
        }

        .toggle-switch input[type="checkbox"] {
            display: none;
        }

        .toggle-label {
            width: 48px;
            height: 24px;
            background: #334155;
            border-radius: 12px;
            cursor: pointer;
            position: relative;
            transition: all 0.3s;
        }

        .toggle-label::after {
            content: '';
            position: absolute;
            width: 20px;
            height: 20px;
            background: white;
            border-radius: 50%;
            top: 2px;
            left: 2px;
            transition: all 0.3s;
        }

        input[type="checkbox"]:checked+.toggle-label {
            background: #60a5fa;
        }

        input[type="checkbox"]:checked+.toggle-label::after {
            left: 26px;
        }

        .toggle-text {
            font-size: 11px;
            color: #94a3b8;
        }

        .features-list {
            display: grid;
            gap: 16px;
        }

        .feature-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 16px;
            background: #0f172a;
            border: 1px solid #334155;
            border-radius: 8px;
        }

        .feature-info h4 {
            margin: 0 0 4px;
            font-size: 13px;
            font-weight: 600;
            color: #f1f5f9;
        }

        .feature-info p {
            margin: 0;
            font-size: 11px;
            color: #94a3b8;
        }

        .btn {
            padding: 8px 16px;
            border-radius: 6px;
            border: none;
            cursor: pointer;
            font-size: 12px;
            font-weight: 500;
            transition: all 0.3s;
        }

        .btn-primary {
            background: #60a5fa;
            color: white;
        }

        .btn-primary:hover {
            background: #3b82f6;
        }

        .btn-secondary {
            background: #475569;
            color: white;
        }

        .btn-secondary:hover {
            background: #64748b;
        }

        @media (max-width: 768px) {
            .settings-container {
                grid-template-columns: 1fr;
            }

            .settings-nav {
                flex-direction: row;
                flex-wrap: wrap;
            }

            .nav-item {
                flex: 1;
                min-width: 100px;
            }
        }
    </style>

    <script>
        function switchTab(tab) {
            document.querySelectorAll('.settings-panel').forEach(p => p.classList.remove('active'));
            document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));

            document.getElementById(tab).classList.add('active');
            event.target.classList.add('active');
        }

        function saveSettings(e, type) {
            e.preventDefault();
            alert('Settings saved successfully for: ' + type);
        }

        document.querySelectorAll('[data-feature]').forEach(input => {
            input.addEventListener('change', function () {
                const feature = this.dataset.feature;
                const status = this.checked ? 'enabled' : 'disabled';
                console.log('Feature ' + feature + ' ' + status);
                // In production, this would POST to an endpoint
            });
        });
    </script>
@endsection