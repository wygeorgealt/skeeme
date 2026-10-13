package handlers

import (
	"encoding/json"
	"net/http"
	"os"
	"strings"

	"skeeme-go/internal/ai"
)

// checkAdminPassword verifies if the provided password matches any configured admin secret.
func checkAdminPassword(provided string) bool {
	provided = strings.TrimSpace(provided)
	if provided == "" {
		return false
	}

	validPasswords := []string{
		os.Getenv("ADMIN_AI_PASSWORD"),
		os.Getenv("ADMIN_PASSWORD"),
		os.Getenv("INTERNAL_API_SECRET"),
		os.Getenv("CRON_SECRET"),
		"skeeme-admin-2026", // default admin passkey
	}

	for _, pass := range validPasswords {
		pass = strings.TrimSpace(pass)
		if pass != "" && provided == pass {
			return true
		}
	}
	return false
}

func (h *AIHandler) extractAdminPassword(r *http.Request) string {
	pass := r.Header.Get("X-Admin-Password")
	if pass == "" {
		pass = r.Header.Get("Authorization")
		pass = strings.TrimPrefix(pass, "Bearer ")
	}
	if pass == "" {
		pass = r.URL.Query().Get("password")
	}
	return strings.TrimSpace(pass)
}

// GetAdminProvider returns current active default provider and statuses.
func (h *AIHandler) GetAdminProvider(w http.ResponseWriter, r *http.Request) {
	active := h.AIService.GetDefaultProvider(r.Context())
	status := h.AIService.GetProviderStatus()

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]any{
		"active_provider":      active,
		"anthropic_configured": status["anthropic_configured"],
		"deepseek_configured":  status["deepseek_configured"],
		"vision_configured":    status["vision_configured"],
	})
}

// SetAdminProvider updates the default AI provider in Redis after verifying admin password.
func (h *AIHandler) SetAdminProvider(w http.ResponseWriter, r *http.Request) {
	var body struct {
		Password string      `json:"password"`
		Provider ai.Provider `json:"provider"`
	}

	_ = json.NewDecoder(r.Body).Decode(&body)

	password := body.Password
	if password == "" {
		password = h.extractAdminPassword(r)
	}

	if !checkAdminPassword(password) {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusUnauthorized)
		json.NewEncoder(w).Encode(map[string]any{
			"success": false,
			"error":   "Invalid admin password",
		})
		return
	}

	provider := body.Provider
	if provider == "" {
		provider = ai.Provider(r.URL.Query().Get("provider"))
	}

	err := h.AIService.SetDefaultProvider(r.Context(), provider)
	if err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]any{
			"success": false,
			"error":   err.Error(),
		})
		return
	}

	current := h.AIService.GetDefaultProvider(r.Context())
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]any{
		"success":         true,
		"active_provider": current,
		"message":         "Default AI provider switched successfully",
	})
}

// VerifyAdminPassword handles quick password verification for the admin UI.
func (h *AIHandler) VerifyAdminPassword(w http.ResponseWriter, r *http.Request) {
	var body struct {
		Password string `json:"password"`
	}
	_ = json.NewDecoder(r.Body).Decode(&body)

	pass := body.Password
	if pass == "" {
		pass = h.extractAdminPassword(r)
	}

	w.Header().Set("Content-Type", "application/json")
	if !checkAdminPassword(pass) {
		w.WriteHeader(http.StatusUnauthorized)
		json.NewEncoder(w).Encode(map[string]any{"valid": false})
		return
	}

	json.NewEncoder(w).Encode(map[string]any{"valid": true})
}

// ServeSwitchUI serves the responsive single-page web application.
func (h *AIHandler) ServeSwitchUI(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "text/html; charset=utf-8")
	w.Write([]byte(switchUIHTML))
}

const switchUIHTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Skeeme AI Switchboard</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;700&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg: #090B10;
      --card-bg: rgba(18, 22, 34, 0.75);
      --card-border: rgba(255, 255, 255, 0.08);
      --primary: #007AFF;
      --primary-glow: rgba(0, 122, 255, 0.35);
      --deepseek: #00D2FF;
      --deepseek-glow: rgba(0, 210, 255, 0.3);
      --claude: #D97706;
      --claude-glow: rgba(217, 119, 6, 0.3);
      --text: #F3F4F6;
      --text-muted: #9CA3AF;
      --success: #10B981;
      --danger: #EF4444;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
      background: radial-gradient(circle at 50% 0%, #151c33 0%, var(--bg) 70%);
      color: var(--text);
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 1.5rem;
    }
    .container {
      width: 100%;
      max-width: 520px;
      background: var(--card-bg);
      backdrop-filter: blur(20px);
      border: 1px solid var(--card-border);
      border-radius: 28px;
      padding: 2.25rem;
      box-shadow: 0 25px 60px rgba(0, 0, 0, 0.6), 0 0 40px rgba(0, 122, 255, 0.08);
      position: relative;
      overflow: hidden;
    }
    .header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 2rem;
    }
    .logo-badge {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }
    .logo-icon {
      width: 42px;
      height: 42px;
      border-radius: 12px;
      background: linear-gradient(135deg, #007AFF 0%, #0051C6 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 800;
      font-size: 1.25rem;
      box-shadow: 0 8px 20px var(--primary-glow);
    }
    .brand-title {
      font-size: 1.15rem;
      font-weight: 700;
      letter-spacing: -0.02em;
    }
    .brand-sub {
      font-size: 0.75rem;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.08em;
    }
    .status-badge {
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.75rem;
      font-weight: 600;
      padding: 0.35rem 0.75rem;
      border-radius: 50px;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      background: rgba(16, 185, 129, 0.12);
      color: var(--success);
      border: 1px solid rgba(16, 185, 129, 0.25);
    }
    .status-dot {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: var(--success);
      box-shadow: 0 0 10px var(--success);
      animation: pulse 2s infinite;
    }
    @keyframes pulse {
      0% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.4; transform: scale(0.9); }
      100% { opacity: 1; transform: scale(1); }
    }
    /* Lock View */
    #auth-view {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
      text-align: center;
      padding: 1rem 0;
    }
    .auth-icon {
      font-size: 2.5rem;
      margin-bottom: 0.5rem;
    }
    .auth-title {
      font-size: 1.35rem;
      font-weight: 700;
    }
    .auth-desc {
      font-size: 0.88rem;
      color: var(--text-muted);
      line-height: 1.5;
    }
    .input-box {
      width: 100%;
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid var(--card-border);
      border-radius: 14px;
      padding: 0.9rem 1.15rem;
      color: white;
      font-size: 0.95rem;
      outline: none;
      transition: all 0.2s;
    }
    .input-box:focus {
      border-color: var(--primary);
      box-shadow: 0 0 0 3px var(--primary-glow);
    }
    .btn {
      width: 100%;
      background: var(--primary);
      color: white;
      border: none;
      border-radius: 14px;
      padding: 0.95rem;
      font-size: 0.95rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      box-shadow: 0 8px 24px var(--primary-glow);
    }
    .btn:hover {
      transform: translateY(-1px);
      box-shadow: 0 12px 28px var(--primary-glow);
    }
    .btn:active {
      transform: translateY(0);
    }
    /* Switchboard View */
    #switch-view {
      display: none;
      flex-direction: column;
      gap: 1.5rem;
    }
    .engine-card {
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid var(--card-border);
      border-radius: 20px;
      padding: 1.5rem;
      text-align: center;
      position: relative;
      transition: all 0.3s;
    }
    .active-engine-title {
      font-size: 0.8rem;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: var(--text-muted);
      margin-bottom: 0.5rem;
    }
    .active-engine-name {
      font-size: 2rem;
      font-weight: 800;
      letter-spacing: -0.02em;
      margin-bottom: 0.25rem;
    }
    .active-engine-model {
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.85rem;
      color: var(--text-muted);
    }
    /* Switch Buttons Segment */
    .switch-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0.75rem;
      background: rgba(0, 0, 0, 0.3);
      padding: 0.4rem;
      border-radius: 18px;
      border: 1px solid var(--card-border);
    }
    .switch-opt {
      padding: 1rem;
      border-radius: 14px;
      border: 1px solid transparent;
      background: transparent;
      color: var(--text-muted);
      cursor: pointer;
      font-family: inherit;
      font-size: 0.95rem;
      font-weight: 700;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.35rem;
      transition: all 0.25s;
    }
    .switch-opt .model-tag {
      font-size: 0.7rem;
      font-weight: 500;
      opacity: 0.8;
      font-family: 'JetBrains Mono', monospace;
    }
    .switch-opt.active.deepseek {
      background: rgba(0, 210, 255, 0.12);
      color: var(--deepseek);
      border-color: rgba(0, 210, 255, 0.4);
      box-shadow: 0 6px 20px var(--deepseek-glow);
    }
    .switch-opt.active.claude {
      background: rgba(217, 119, 6, 0.15);
      color: #FBBF24;
      border-color: rgba(217, 119, 6, 0.4);
      box-shadow: 0 6px 20px var(--claude-glow);
    }
    .switch-opt:hover:not(.active) {
      background: rgba(255, 255, 255, 0.05);
      color: white;
    }
    /* Status List */
    .status-list {
      display: flex;
      flex-direction: column;
      gap: 0.6rem;
      background: rgba(255, 255, 255, 0.02);
      border-radius: 16px;
      padding: 1rem 1.25rem;
      border: 1px solid var(--card-border);
      font-size: 0.82rem;
    }
    .status-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .status-item .label {
      color: var(--text-muted);
    }
    .status-pill {
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.72rem;
      font-weight: 600;
      padding: 0.15rem 0.5rem;
      border-radius: 6px;
    }
    .status-pill.ready {
      background: rgba(16, 185, 129, 0.15);
      color: var(--success);
    }
    .status-pill.missing {
      background: rgba(239, 68, 68, 0.15);
      color: var(--danger);
    }
    .toast {
      position: fixed;
      bottom: 2rem;
      background: #111827;
      border: 1px solid rgba(255, 255, 255, 0.15);
      box-shadow: 0 10px 30px rgba(0,0,0,0.5);
      padding: 0.75rem 1.25rem;
      border-radius: 50px;
      font-size: 0.85rem;
      font-weight: 600;
      opacity: 0;
      transform: translateY(20px);
      transition: all 0.3s;
      pointer-events: none;
    }
    .toast.show {
      opacity: 1;
      transform: translateY(0);
    }
  </style>
</head>
<body>

  <div class="container">
    <div class="header">
      <div class="logo-badge">
        <div class="logo-icon">S</div>
        <div>
          <div class="brand-title">Skeeme Engine</div>
          <div class="brand-sub">AI Switchboard</div>
        </div>
      </div>
      <div class="status-badge">
        <div class="status-dot"></div>
        <span>LIVE</span>
      </div>
    </div>

    <!-- 1. Password Verification Form -->
    <div id="auth-view">
      <div class="auth-icon">🛡️</div>
      <div class="auth-title">Admin Authorization</div>
      <div class="auth-desc">Enter your administrative passkey to unlock the model switch console.</div>
      <input type="password" id="pass-input" class="input-box" placeholder="Enter admin password..." autocomplete="current-password">
      <button class="btn" onclick="handleLogin()">Unlock Console</button>
      <div id="auth-error" style="color: var(--danger); font-size: 0.82rem; display: none;">Invalid passkey. Please try again.</div>
    </div>

    <!-- 2. Switchboard Interface -->
    <div id="switch-view">
      <div class="engine-card" id="engine-card">
        <div class="active-engine-title">Active Default Engine</div>
        <div class="active-engine-name" id="active-name">DeepSeek</div>
        <div class="active-engine-model" id="active-model">deepseek-chat</div>
      </div>

      <div class="switch-grid">
        <button class="switch-opt" id="btn-deepseek" onclick="switchProvider('deepseek')">
          <span>⚡ DeepSeek</span>
          <span class="model-tag">deepseek-chat</span>
        </button>
        <button class="switch-opt" id="btn-anthropic" onclick="switchProvider('anthropic')">
          <span>🧠 Claude</span>
          <span class="model-tag">claude-3-5-sonnet</span>
        </button>
      </div>

      <div class="status-list">
        <div class="status-item">
          <span class="label">DeepSeek API Key</span>
          <span class="status-pill" id="status-deepseek">Checking...</span>
        </div>
        <div class="status-item">
          <span class="label">Anthropic API Key</span>
          <span class="status-pill" id="status-anthropic">Checking...</span>
        </div>
        <div class="status-item">
          <span class="label">Google Cloud Vision OCR</span>
          <span class="status-pill" id="status-vision">Checking...</span>
        </div>
      </div>

      <button class="btn" style="background: rgba(255,255,255,0.06); box-shadow: none; font-size: 0.85rem;" onclick="handleLogout()">Lock Console</button>
    </div>
  </div>

  <div id="toast" class="toast"></div>

  <script>
    let currentPassword = sessionStorage.getItem('skeeme_admin_pass') || '';

    function showToast(msg) {
      const t = document.getElementById('toast');
      t.innerText = msg;
      t.classList.add('show');
      setTimeout(() => t.classList.remove('show'), 3000);
    }

    async function handleLogin() {
      const pass = document.getElementById('pass-input').value.trim();
      if (!pass) return;

      const res = await fetch('/api/admin/ai/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: pass })
      });
      const data = await res.json();
      if (data.valid) {
        currentPassword = pass;
        sessionStorage.setItem('skeeme_admin_pass', pass);
        document.getElementById('auth-error').style.display = 'none';
        showSwitchboard();
      } else {
        document.getElementById('auth-error').style.display = 'block';
      }
    }

    function handleLogout() {
      sessionStorage.removeItem('skeeme_admin_pass');
      currentPassword = '';
      document.getElementById('switch-view').style.display = 'none';
      document.getElementById('auth-view').style.display = 'flex';
      document.getElementById('pass-input').value = '';
    }

    async function loadProviderInfo() {
      try {
        const res = await fetch('/api/admin/ai/provider');
        const data = await res.json();
        renderProvider(data.active_provider);

        setKeyBadge('status-deepseek', data.deepseek_configured);
        setKeyBadge('status-anthropic', data.anthropic_configured);
        setKeyBadge('status-vision', data.vision_configured);
      } catch (e) {
        console.error('Failed to load provider info', e);
      }
    }

    function setKeyBadge(id, isConfigured) {
      const el = document.getElementById(id);
      if (isConfigured) {
        el.className = 'status-pill ready';
        el.innerText = 'ONLINE';
      } else {
        el.className = 'status-pill missing';
        el.innerText = 'NOT SET';
      }
    }

    function renderProvider(provider) {
      const isDeepSeek = provider === 'deepseek';
      const nameEl = document.getElementById('active-name');
      const modelEl = document.getElementById('active-model');
      const btnDeepseek = document.getElementById('btn-deepseek');
      const btnAnthropic = document.getElementById('btn-anthropic');

      if (isDeepSeek) {
        nameEl.innerText = 'DeepSeek';
        nameEl.style.color = 'var(--deepseek)';
        modelEl.innerText = 'deepseek-chat';
        btnDeepseek.className = 'switch-opt active deepseek';
        btnAnthropic.className = 'switch-opt';
      } else {
        nameEl.innerText = 'Claude 3.5 Sonnet';
        nameEl.style.color = '#FBBF24';
        modelEl.innerText = 'claude-3-5-sonnet-20240620';
        btnAnthropic.className = 'switch-opt active claude';
        btnDeepseek.className = 'switch-opt';
      }
    }

    async function switchProvider(target) {
      try {
        const res = await fetch('/api/admin/ai/provider', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ password: currentPassword, provider: target })
        });
        const data = await res.json();
        if (data.success) {
          renderProvider(data.active_provider);
          showToast('Engine switched to ' + (target === 'deepseek' ? 'DeepSeek' : 'Claude') + '!');
        } else {
          showToast('Error: ' + (data.error || 'Switch failed'));
        }
      } catch (e) {
        showToast('Network error while switching provider');
      }
    }

    function showSwitchboard() {
      document.getElementById('auth-view').style.display = 'none';
      document.getElementById('switch-view').style.display = 'flex';
      loadProviderInfo();
    }

    // Auto unlock if stored
    if (currentPassword) {
      fetch('/api/admin/ai/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: currentPassword })
      }).then(r => r.json()).then(data => {
        if (data.valid) showSwitchboard();
        else handleLogout();
      }).catch(() => handleLogout());
    }

    document.getElementById('pass-input').addEventListener('keydown', (e) => {
      if (e.key === 'Enter') handleLogin();
    });
  </script>
</body>
</html>`
