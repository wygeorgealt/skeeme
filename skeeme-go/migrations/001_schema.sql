-- ============================================================================
-- Skeeme Database Schema (PostgreSQL)
-- Canonical schema for the Go backend.
-- Derived from Laravel migrations in _dump/database/migrations/
-- ============================================================================

-- NOTE: This file is a REFERENCE schema. The existing production database
-- already has these tables via Laravel migrations. This file ensures Go
-- developers know the exact schema and can recreate it from scratch if needed.

-- ============================================================================
-- USERS (Core Identity)
-- ============================================================================
CREATE TABLE IF NOT EXISTS users (
    id                      BIGSERIAL PRIMARY KEY,
    name                    VARCHAR(255) NOT NULL DEFAULT '',
    first_name              VARCHAR(255),
    last_name               VARCHAR(255),
    middle_name             VARCHAR(255),
    email                   VARCHAR(255) NOT NULL UNIQUE,
    email_verified_at       TIMESTAMP,
    password                VARCHAR(255) NOT NULL,
    
    -- Social Auth
    provider                VARCHAR(255),
    provider_id             VARCHAR(255),
    avatar                  VARCHAR(255),
    
    -- AI Preferences (JSONB: level, field, style, tone)
    ai_preferences          JSONB DEFAULT '{}',
    
    -- Two-Factor Auth
    two_factor_secret       TEXT,
    two_factor_recovery_codes TEXT,
    two_factor_confirmed_at TIMESTAMP,
    
    -- Session / Push
    remember_token          VARCHAR(100),
    expo_push_token         VARCHAR(255),
    notifications_enabled   BOOLEAN NOT NULL DEFAULT TRUE,
    
    -- Credits & Subscription
    credits                 INTEGER NOT NULL DEFAULT 0,
    subscription_tier       VARCHAR(50) NOT NULL DEFAULT 'free',
    last_credit_refill_at   TIMESTAMP,
    credits_emptied_at      TIMESTAMP,
    daily_free_scans_used   INTEGER NOT NULL DEFAULT 0,
    last_free_scan_at       TIMESTAMP,
    
    -- RevenueCat
    rc_app_user_id          VARCHAR(255),
    
    -- Referral
    referral_code           VARCHAR(12),
    last_credit_alert_at    TIMESTAMP,
    
    -- School/Team (legacy but still in DB)
    school_id               BIGINT,
    class_id                BIGINT,
    approved_by             BIGINT,
    approved_at             TIMESTAMP,
    role                    VARCHAR(50),
    status                  VARCHAR(50) NOT NULL DEFAULT 'active',
    
    -- Profile
    phone_number            VARCHAR(50),
    address                 TEXT,
    parent_token            VARCHAR(255),
    dob                     DATE,
    age                     INTEGER,
    timezone                VARCHAR(50) NOT NULL DEFAULT 'UTC',
    
    -- Flags
    is_flagged              BOOLEAN NOT NULL DEFAULT FALSE,
    flag_reason             TEXT,
    is_vip                  BOOLEAN NOT NULL DEFAULT FALSE,
    is_beta_tester          BOOLEAN NOT NULL DEFAULT FALSE,
    is_banned               BOOLEAN NOT NULL DEFAULT FALSE,
    ban_reason              TEXT,
    custom_api_limit        INTEGER,
    preferred_ai_model      VARCHAR(50),
    
    -- Exam countdown
    next_exam_date          TIMESTAMP,
    
    created_at              TIMESTAMP DEFAULT NOW(),
    updated_at              TIMESTAMP DEFAULT NOW()
);

-- ============================================================================
-- PERSONAL ACCESS TOKENS (Sanctum-compatible)
-- ============================================================================
CREATE TABLE IF NOT EXISTS personal_access_tokens (
    id              BIGSERIAL PRIMARY KEY,
    tokenable_type  VARCHAR(255) NOT NULL,
    tokenable_id    BIGINT NOT NULL,
    name            VARCHAR(255) NOT NULL,
    token           VARCHAR(64) NOT NULL UNIQUE,
    abilities       TEXT,
    last_used_at    TIMESTAMP,
    expires_at      TIMESTAMP,
    created_at      TIMESTAMP DEFAULT NOW(),
    updated_at      TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pat_tokenable ON personal_access_tokens (tokenable_type, tokenable_id);

-- ============================================================================
-- EMAIL OTPs
-- ============================================================================
CREATE TABLE IF NOT EXISTS email_otps (
    id          BIGSERIAL PRIMARY KEY,
    email       VARCHAR(255) NOT NULL,
    code_hash   VARCHAR(255) NOT NULL,
    type        VARCHAR(50) NOT NULL DEFAULT 'verification', -- verification, password_reset
    attempts    INTEGER NOT NULL DEFAULT 0,
    last_sent_at TIMESTAMP,
    expires_at  TIMESTAMP,
    created_at  TIMESTAMP DEFAULT NOW(),
    updated_at  TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_email_otps_email ON email_otps (email);

-- ============================================================================
-- TRANSACTIONS (Credit Ledger)
-- ============================================================================
CREATE TABLE IF NOT EXISTS transactions (
    id          BIGSERIAL PRIMARY KEY,
    user_id     BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type        VARCHAR(50) NOT NULL,  -- usage, reward, purchase, refund
    action_type VARCHAR(100),          -- quiz_generation, flashcard_generation, scan_solve, etc.
    model_used  VARCHAR(100),          -- claude-sonnet-4-5, deepseek-chat, etc.
    request_id  VARCHAR(255),          -- idempotency/correlation key
    amount      INTEGER NOT NULL,      -- positive = credit, negative = debit
    description TEXT,
    metadata    JSONB,
    created_at  TIMESTAMP DEFAULT NOW(),
    updated_at  TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_transactions_request_id ON transactions (request_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions (user_id);

-- ============================================================================
-- FLASHCARD DECKS
-- ============================================================================
CREATE TABLE IF NOT EXISTS flashcard_decks (
    id          BIGSERIAL PRIMARY KEY,
    user_id     BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title       VARCHAR(255) NOT NULL,
    description TEXT,
    source_type VARCHAR(50) NOT NULL DEFAULT 'topic',
    created_at  TIMESTAMP DEFAULT NOW(),
    updated_at  TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_flashcard_decks_user_id ON flashcard_decks (user_id);

-- ============================================================================
-- FLASHCARDS
-- ============================================================================
CREATE TABLE IF NOT EXISTS flashcards (
    id                  BIGSERIAL PRIMARY KEY,
    flashcard_deck_id   BIGINT NOT NULL REFERENCES flashcard_decks(id) ON DELETE CASCADE,
    front               TEXT NOT NULL,
    back                TEXT NOT NULL,
    order_column        INTEGER NOT NULL DEFAULT 0,
    created_at          TIMESTAMP DEFAULT NOW(),
    updated_at          TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_flashcards_deck_id ON flashcards (flashcard_deck_id);

-- ============================================================================
-- FLASHCARD SESSIONS
-- ============================================================================
CREATE TABLE IF NOT EXISTS flashcard_sessions (
    id                  BIGSERIAL PRIMARY KEY,
    user_id             BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    flashcard_deck_id   BIGINT NOT NULL REFERENCES flashcard_decks(id) ON DELETE CASCADE,
    cards_count         INTEGER NOT NULL DEFAULT 0,
    completed_at        TIMESTAMP,
    created_at          TIMESTAMP DEFAULT NOW(),
    updated_at          TIMESTAMP DEFAULT NOW()
);

-- ============================================================================
-- QUIZ SESSIONS
-- ============================================================================
CREATE TABLE IF NOT EXISTS quiz_sessions (
    id                  BIGSERIAL PRIMARY KEY,
    user_id             BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    topic               VARCHAR(255) NOT NULL,
    difficulty          VARCHAR(50) NOT NULL DEFAULT 'medium',
    total_questions     INTEGER NOT NULL DEFAULT 0,
    correct_answers     INTEGER NOT NULL DEFAULT 0,
    score_percentage    DECIMAL(5,2) NOT NULL DEFAULT 0,
    time_spent_seconds  INTEGER,
    created_at          TIMESTAMP DEFAULT NOW(),
    updated_at          TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_quiz_sessions_user_id ON quiz_sessions (user_id);

-- ============================================================================
-- QUIZ QUESTIONS (per-question detail)
-- ============================================================================
CREATE TABLE IF NOT EXISTS quiz_questions (
    id              BIGSERIAL PRIMARY KEY,
    quiz_session_id BIGINT NOT NULL REFERENCES quiz_sessions(id) ON DELETE CASCADE,
    question_text   TEXT NOT NULL,
    question_type   VARCHAR(50) NOT NULL DEFAULT 'mcq',
    options         JSONB,
    correct_answer  TEXT NOT NULL,
    user_answer     TEXT,
    is_correct      BOOLEAN NOT NULL DEFAULT FALSE,
    explanation     TEXT,
    created_at      TIMESTAMP DEFAULT NOW(),
    updated_at      TIMESTAMP DEFAULT NOW()
);

-- ============================================================================
-- STUDY STREAKS
-- ============================================================================
CREATE TABLE IF NOT EXISTS study_streaks (
    id              BIGSERIAL PRIMARY KEY,
    user_id         BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    current_streak  INTEGER NOT NULL DEFAULT 0,
    longest_streak  INTEGER NOT NULL DEFAULT 0,
    unclaimed_reward INTEGER NOT NULL DEFAULT 0,
    last_study_date TIMESTAMP,
    created_at      TIMESTAMP DEFAULT NOW(),
    updated_at      TIMESTAMP DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_study_streaks_user_id ON study_streaks (user_id);

-- ============================================================================
-- STREAK FREEZES
-- ============================================================================
CREATE TABLE IF NOT EXISTS streak_freezes (
    id                  BIGSERIAL PRIMARY KEY,
    user_id             BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    month               DATE NOT NULL,
    freezes_allocated   INTEGER NOT NULL DEFAULT 2,
    freezes_used        INTEGER NOT NULL DEFAULT 0,
    last_freeze_used_at TIMESTAMP,
    created_at          TIMESTAMP DEFAULT NOW(),
    updated_at          TIMESTAMP DEFAULT NOW(),
    UNIQUE (user_id, month)
);

-- ============================================================================
-- STREAK NOTIFICATION LOG
-- ============================================================================
CREATE TABLE IF NOT EXISTS streak_notification_log (
    id                  BIGSERIAL PRIMARY KEY,
    user_id             BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    milestone_target    INTEGER NOT NULL,
    notification_type   VARCHAR(50) NOT NULL,
    sent_at             TIMESTAMP NOT NULL,
    delivered           BOOLEAN NOT NULL DEFAULT FALSE,
    created_at          TIMESTAMP DEFAULT NOW(),
    updated_at          TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS streak_notif_log_idx ON streak_notification_log (user_id, milestone_target, notification_type);

-- ============================================================================
-- REFERRALS
-- ============================================================================
CREATE TABLE IF NOT EXISTS referrals (
    id                          BIGSERIAL PRIMARY KEY,
    referrer_user_id            BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    indirect_referrer_user_id   BIGINT REFERENCES users(id) ON DELETE SET NULL,
    referred_user_id            BIGINT REFERENCES users(id) ON DELETE SET NULL,
    referral_code               VARCHAR(12) NOT NULL,
    status                      VARCHAR(20) NOT NULL DEFAULT 'pending',  -- pending, completed, credited
    direct_reward_amount        INTEGER NOT NULL DEFAULT 200,
    indirect_reward_amount      INTEGER NOT NULL DEFAULT 50,
    referred_at                 TIMESTAMP,
    credited_at                 TIMESTAMP,
    direct_reward_claimed_at    TIMESTAMP,
    indirect_reward_claimed_at  TIMESTAMP,
    created_at                  TIMESTAMP DEFAULT NOW(),
    updated_at                  TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_referrals_code ON referrals (referral_code);
CREATE INDEX IF NOT EXISTS idx_referrals_referrer ON referrals (referrer_user_id);

-- ============================================================================
-- OUT OF CREDIT EVENTS
-- ============================================================================
CREATE TABLE IF NOT EXISTS out_of_credit_events (
    id                      BIGSERIAL PRIMARY KEY,
    user_id                 BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    plan                    VARCHAR(50) NOT NULL,
    feature_attempted       VARCHAR(50) NOT NULL,  -- scan, quiz, flashcard
    days_since_last_purchase INTEGER,
    created_at              TIMESTAMP DEFAULT NOW(),
    updated_at              TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ooc_events_user_created ON out_of_credit_events (user_id, created_at);

-- ============================================================================
-- INDIVIDUAL SUBSCRIPTIONS
-- ============================================================================
CREATE TABLE IF NOT EXISTS individual_subscriptions (
    id              BIGSERIAL PRIMARY KEY,
    user_id         BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    plan_name       VARCHAR(100) NOT NULL,
    billing_cycle   VARCHAR(20) NOT NULL DEFAULT 'monthly',
    price           DECIMAL(10,2) NOT NULL DEFAULT 0,
    start_date      DATE NOT NULL,
    expiry_date     DATE,
    status          VARCHAR(20) NOT NULL DEFAULT 'active',  -- active, inactive, expired
    auto_renew      BOOLEAN NOT NULL DEFAULT TRUE,
    is_trial        BOOLEAN NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMP DEFAULT NOW(),
    updated_at      TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_individual_subs_user_status ON individual_subscriptions (user_id, status);

-- ============================================================================
-- USER AI PROFILES
-- ============================================================================
CREATE TABLE IF NOT EXISTS user_ai_profiles (
    id              BIGSERIAL PRIMARY KEY,
    user_id         BIGINT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    academic_level  VARCHAR(100),
    learning_style  VARCHAR(100),
    strengths       TEXT,
    weaknesses      TEXT,
    interests       TEXT,
    tone_preferences JSONB,
    custom_context  TEXT,
    created_at      TIMESTAMP DEFAULT NOW(),
    updated_at      TIMESTAMP DEFAULT NOW()
);

-- ============================================================================
-- USER EXAMS (Exam countdown tracker)
-- ============================================================================
CREATE TABLE IF NOT EXISTS user_exams (
    id          BIGSERIAL PRIMARY KEY,
    user_id     BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title       VARCHAR(255),
    exam_date   TIMESTAMP NOT NULL,
    created_at  TIMESTAMP DEFAULT NOW(),
    updated_at  TIMESTAMP DEFAULT NOW()
);

-- ============================================================================
-- SYSTEM SETTINGS (Key-value config store)
-- ============================================================================
CREATE TABLE IF NOT EXISTS system_settings (
    id          BIGSERIAL PRIMARY KEY,
    key         VARCHAR(255) NOT NULL UNIQUE,
    value       JSONB,
    description TEXT,
    created_at  TIMESTAMP DEFAULT NOW(),
    updated_at  TIMESTAMP DEFAULT NOW()
);

-- ============================================================================
-- INVOICES (Billing records)
-- ============================================================================
CREATE TABLE IF NOT EXISTS invoices (
    id              BIGSERIAL PRIMARY KEY,
    user_id         BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    amount          DECIMAL(10,2) NOT NULL,
    currency        VARCHAR(10) NOT NULL DEFAULT 'NGN',
    status          VARCHAR(20) NOT NULL DEFAULT 'pending', -- pending, paid, failed
    reference       VARCHAR(255),
    payment_method  VARCHAR(50),
    description     TEXT,
    metadata        JSONB,
    paid_at         TIMESTAMP,
    created_at      TIMESTAMP DEFAULT NOW(),
    updated_at      TIMESTAMP DEFAULT NOW()
);

-- ============================================================================
-- PAYMENTS (Payment gateway records)
-- ============================================================================
CREATE TABLE IF NOT EXISTS payments (
    id              BIGSERIAL PRIMARY KEY,
    user_id         BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    invoice_id      BIGINT REFERENCES invoices(id),
    amount          DECIMAL(10,2) NOT NULL,
    currency        VARCHAR(10) NOT NULL DEFAULT 'NGN',
    gateway         VARCHAR(50) NOT NULL DEFAULT 'paystack',
    reference       VARCHAR(255),
    status          VARCHAR(20) NOT NULL DEFAULT 'pending',
    metadata        JSONB,
    created_at      TIMESTAMP DEFAULT NOW(),
    updated_at      TIMESTAMP DEFAULT NOW()
);

-- ============================================================================
-- SUPPORT TICKETS
-- ============================================================================
CREATE TABLE IF NOT EXISTS support_tickets (
    id              BIGSERIAL PRIMARY KEY,
    user_id         BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    subject         VARCHAR(255) NOT NULL,
    message         TEXT NOT NULL,
    screenshot_url  VARCHAR(500),
    status          VARCHAR(20) NOT NULL DEFAULT 'open',
    created_at      TIMESTAMP DEFAULT NOW(),
    updated_at      TIMESTAMP DEFAULT NOW()
);

-- ============================================================================
-- QUEUE / CACHE TABLES (Laravel-compatible, used by Go scheduler)
-- ============================================================================
CREATE TABLE IF NOT EXISTS jobs (
    id          BIGSERIAL PRIMARY KEY,
    queue       VARCHAR(255) NOT NULL DEFAULT 'default',
    payload     TEXT NOT NULL,
    attempts    SMALLINT NOT NULL DEFAULT 0,
    reserved_at INTEGER,
    available_at INTEGER NOT NULL,
    created_at  INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS failed_jobs (
    id          BIGSERIAL PRIMARY KEY,
    uuid        VARCHAR(255) NOT NULL UNIQUE,
    connection  TEXT NOT NULL,
    queue       TEXT NOT NULL,
    payload     TEXT NOT NULL,
    exception   TEXT NOT NULL,
    failed_at   TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cache (
    key         VARCHAR(255) PRIMARY KEY,
    value       TEXT NOT NULL,
    expiration  INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS cache_locks (
    key         VARCHAR(255) PRIMARY KEY,
    owner       VARCHAR(255) NOT NULL,
    expiration  INTEGER NOT NULL
);
