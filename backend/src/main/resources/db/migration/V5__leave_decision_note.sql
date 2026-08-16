-- ============================================================
-- V5: Lý do khi từ chối đơn nghỉ phép
-- ============================================================

ALTER TABLE leave_request ADD COLUMN decision_note VARCHAR(500);
