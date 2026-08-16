-- ============================================================
-- V7: Refresh token (thu hồi được / logout phía server)
-- ============================================================

CREATE TABLE refresh_token (
    id          BIGSERIAL PRIMARY KEY,
    token_hash  VARCHAR(64) NOT NULL UNIQUE,   -- SHA-256 hex của token gốc (không lưu token thô)
    user_id     BIGINT NOT NULL REFERENCES app_user(id) ON DELETE CASCADE,
    expires_at  TIMESTAMP NOT NULL,
    revoked     BOOLEAN NOT NULL DEFAULT FALSE,
    created_at  TIMESTAMP NOT NULL DEFAULT now(),
    updated_at  TIMESTAMP NOT NULL DEFAULT now()
);

CREATE INDEX idx_refresh_token_user ON refresh_token(user_id);
