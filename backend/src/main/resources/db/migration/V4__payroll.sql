-- ============================================================
-- V4: Module 4 (Payroll / Bảng lương)
-- ============================================================

CREATE TABLE salary_component (
    id             BIGSERIAL PRIMARY KEY,
    name           VARCHAR(120) NOT NULL,
    type           VARCHAR(20) NOT NULL,          -- ALLOWANCE | DEDUCTION
    is_taxable     BOOLEAN NOT NULL DEFAULT TRUE,
    default_amount NUMERIC(15,2) NOT NULL DEFAULT 0,
    created_at     TIMESTAMP NOT NULL DEFAULT now(),
    updated_at     TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE payroll_period (
    id         BIGSERIAL PRIMARY KEY,
    month      INT NOT NULL,
    year       INT NOT NULL,
    status     VARCHAR(20) NOT NULL DEFAULT 'OPEN',   -- OPEN | LOCKED
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    updated_at TIMESTAMP NOT NULL DEFAULT now(),
    CONSTRAINT uq_payroll_period UNIQUE (month, year)
);

CREATE TABLE payslip (
    id               BIGSERIAL PRIMARY KEY,
    employee_id      BIGINT NOT NULL REFERENCES employee(id) ON DELETE CASCADE,
    period_id        BIGINT NOT NULL REFERENCES payroll_period(id) ON DELETE CASCADE,
    working_days     INT NOT NULL DEFAULT 0,
    base_salary      NUMERIC(15,2) NOT NULL DEFAULT 0,
    total_allowance  NUMERIC(15,2) NOT NULL DEFAULT 0,
    total_deduction  NUMERIC(15,2) NOT NULL DEFAULT 0,
    gross            NUMERIC(15,2) NOT NULL DEFAULT 0,
    insurance        NUMERIC(15,2) NOT NULL DEFAULT 0,
    tax              NUMERIC(15,2) NOT NULL DEFAULT 0,
    net_salary       NUMERIC(15,2) NOT NULL DEFAULT 0,
    created_at       TIMESTAMP NOT NULL DEFAULT now(),
    updated_at       TIMESTAMP NOT NULL DEFAULT now(),
    CONSTRAINT uq_payslip UNIQUE (employee_id, period_id)
);

CREATE TABLE payslip_detail (
    id           BIGSERIAL PRIMARY KEY,
    payslip_id   BIGINT NOT NULL REFERENCES payslip(id) ON DELETE CASCADE,
    component_id BIGINT REFERENCES salary_component(id),
    name         VARCHAR(120) NOT NULL,
    type         VARCHAR(20) NOT NULL,
    amount       NUMERIC(15,2) NOT NULL DEFAULT 0
);

CREATE INDEX idx_payslip_period ON payslip(period_id);

-- ---------- Seed sample salary components ----------
INSERT INTO salary_component (name, type, is_taxable, default_amount) VALUES
    ('Phụ cấp ăn trưa', 'ALLOWANCE', FALSE, 730000),
    ('Phụ cấp xăng xe', 'ALLOWANCE', TRUE, 500000);
