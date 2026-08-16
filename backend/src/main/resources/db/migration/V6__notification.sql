-- ============================================================
-- V6: Thông báo trong ứng dụng (in-app notifications)
-- ============================================================

CREATE TABLE notification (
    id                BIGSERIAL PRIMARY KEY,
    recipient_user_id BIGINT NOT NULL REFERENCES app_user(id) ON DELETE CASCADE,
    type              VARCHAR(40) NOT NULL,
    title             VARCHAR(160) NOT NULL,
    message           VARCHAR(500),
    link              VARCHAR(200),
    is_read           BOOLEAN NOT NULL DEFAULT FALSE,
    created_at        TIMESTAMP NOT NULL DEFAULT now(),
    updated_at        TIMESTAMP NOT NULL DEFAULT now()
);

CREATE INDEX idx_notification_recipient ON notification(recipient_user_id, is_read, created_at DESC);
