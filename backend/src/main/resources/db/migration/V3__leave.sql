-- ============================================================
-- V3: Module 3 (Leave / Nghỉ phép)
-- ============================================================

CREATE TABLE leave_type (
    id                BIGSERIAL PRIMARY KEY,
    name              VARCHAR(120) NOT NULL,
    paid              BOOLEAN NOT NULL DEFAULT TRUE,
    max_days_per_year INT NOT NULL DEFAULT 0,
    created_at        TIMESTAMP NOT NULL DEFAULT now(),
    updated_at        TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE leave_balance (
    id            BIGSERIAL PRIMARY KEY,
    employee_id   BIGINT NOT NULL REFERENCES employee(id) ON DELETE CASCADE,
    leave_type_id BIGINT NOT NULL REFERENCES leave_type(id),
    year          INT NOT NULL,
    entitled      INT NOT NULL DEFAULT 0,
    used          INT NOT NULL DEFAULT 0,
    remaining     INT NOT NULL DEFAULT 0,
    created_at    TIMESTAMP NOT NULL DEFAULT now(),
    updated_at    TIMESTAMP NOT NULL DEFAULT now(),
    CONSTRAINT uq_leave_balance UNIQUE (employee_id, leave_type_id, year)
);

CREATE TABLE leave_request (
    id            BIGSERIAL PRIMARY KEY,
    employee_id   BIGINT NOT NULL REFERENCES employee(id) ON DELETE CASCADE,
    leave_type_id BIGINT NOT NULL REFERENCES leave_type(id),
    start_date    DATE NOT NULL,
    end_date      DATE NOT NULL,
    days          INT NOT NULL,
    reason        VARCHAR(400),
    status        VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    approver_id   BIGINT REFERENCES employee(id),
    created_at    TIMESTAMP NOT NULL DEFAULT now(),
    updated_at    TIMESTAMP NOT NULL DEFAULT now()
);

CREATE INDEX idx_leave_request_emp ON leave_request(employee_id);
CREATE INDEX idx_leave_request_status ON leave_request(status);

-- ---------- Seed common leave types ----------
INSERT INTO leave_type (name, paid, max_days_per_year) VALUES
    ('Nghỉ phép năm', TRUE, 12),
    ('Nghỉ ốm', TRUE, 30),
    ('Nghỉ không lương', FALSE, 0);
