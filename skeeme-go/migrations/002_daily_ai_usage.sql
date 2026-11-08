-- Server-authoritative daily feature quotas for Free and Pro plans.
CREATE TABLE IF NOT EXISTS ai_daily_usage (
    user_id     BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    feature     VARCHAR(32) NOT NULL,
    usage_date  DATE NOT NULL,
    used        INTEGER NOT NULL DEFAULT 0 CHECK (used >= 0),
    updated_at  TIMESTAMP NOT NULL DEFAULT NOW(),
    PRIMARY KEY (user_id, feature, usage_date)
);

CREATE INDEX IF NOT EXISTS idx_ai_daily_usage_date
    ON ai_daily_usage (usage_date);

CREATE TABLE IF NOT EXISTS ai_daily_usage_requests (
    user_id     BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    request_id  VARCHAR(255) NOT NULL,
    feature     VARCHAR(32) NOT NULL,
    usage_date  DATE NOT NULL,
    status      VARCHAR(16) NOT NULL CHECK (status IN ('reserved', 'completed', 'released')),
    created_at  TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMP NOT NULL DEFAULT NOW(),
    PRIMARY KEY (user_id, request_id)
);

CREATE INDEX IF NOT EXISTS idx_ai_daily_usage_requests_date
    ON ai_daily_usage_requests (usage_date);
