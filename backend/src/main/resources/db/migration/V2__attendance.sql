-- ============================================================
-- V2: Module 2 (Attendance / Chấm công)
-- ============================================================

CREATE TABLE holiday (
    id         BIGSERIAL PRIMARY KEY,
    date       DATE NOT NULL UNIQUE,
    name       VARCHAR(150) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    updated_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE attendance (
    id           BIGSERIAL PRIMARY KEY,
    employee_id  BIGINT NOT NULL REFERENCES employee(id) ON DELETE CASCADE,
    work_date    DATE NOT NULL,
    check_in     TIME,
    check_out    TIME,
    worked_hours NUMERIC(5,2) NOT NULL DEFAULT 0,
    ot_hours     NUMERIC(5,2) NOT NULL DEFAULT 0,
    status       VARCHAR(20) NOT NULL DEFAULT 'PRESENT',
    source       VARCHAR(20) NOT NULL DEFAULT 'MANUAL',
    note         VARCHAR(300),
    created_at   TIMESTAMP NOT NULL DEFAULT now(),
    updated_at   TIMESTAMP NOT NULL DEFAULT now(),
    CONSTRAINT uq_attendance_emp_date UNIQUE (employee_id, work_date)
);

CREATE INDEX idx_attendance_emp_date ON attendance(employee_id, work_date);
