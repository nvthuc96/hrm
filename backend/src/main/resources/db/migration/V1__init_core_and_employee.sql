-- ============================================================
-- V1: Auth (role/user) + Module 1 (Organization & Employee)
-- ============================================================

-- ---------- Auth ----------
CREATE TABLE role (
    id         BIGSERIAL PRIMARY KEY,
    name       VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE app_user (
    id            BIGSERIAL PRIMARY KEY,
    username      VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    enabled       BOOLEAN NOT NULL DEFAULT TRUE,
    employee_id   BIGINT,
    created_at    TIMESTAMP NOT NULL DEFAULT now(),
    updated_at    TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE app_user_role (
    user_id BIGINT NOT NULL REFERENCES app_user(id) ON DELETE CASCADE,
    role_id BIGINT NOT NULL REFERENCES role(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, role_id)
);

-- ---------- Organization ----------
CREATE TABLE department (
    id         BIGSERIAL PRIMARY KEY,
    name       VARCHAR(150) NOT NULL,
    parent_id  BIGINT REFERENCES department(id),
    manager_id BIGINT,
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    updated_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE position (
    id         BIGSERIAL PRIMARY KEY,
    name       VARCHAR(150) NOT NULL,
    level      INT NOT NULL DEFAULT 1,
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    updated_at TIMESTAMP NOT NULL DEFAULT now()
);

-- ---------- Employee ----------
CREATE TABLE employee (
    id            BIGSERIAL PRIMARY KEY,
    employee_code VARCHAR(50) NOT NULL UNIQUE,
    full_name     VARCHAR(200) NOT NULL,
    dob           DATE,
    gender        VARCHAR(10),
    national_id   VARCHAR(30),
    email         VARCHAR(150),
    phone         VARCHAR(30),
    address       VARCHAR(300),
    department_id BIGINT REFERENCES department(id),
    position_id   BIGINT REFERENCES position(id),
    manager_id    BIGINT REFERENCES employee(id),
    hire_date     DATE,
    status        VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    created_at    TIMESTAMP NOT NULL DEFAULT now(),
    updated_at    TIMESTAMP NOT NULL DEFAULT now()
);

CREATE INDEX idx_employee_department ON employee(department_id);
CREATE INDEX idx_employee_status ON employee(status);

-- app_user -> employee FK (added after employee exists)
ALTER TABLE app_user
    ADD CONSTRAINT fk_app_user_employee
    FOREIGN KEY (employee_id) REFERENCES employee(id);

CREATE TABLE employment_contract (
    id            BIGSERIAL PRIMARY KEY,
    employee_id   BIGINT NOT NULL REFERENCES employee(id) ON DELETE CASCADE,
    contract_type VARCHAR(30) NOT NULL,
    start_date    DATE NOT NULL,
    end_date      DATE,
    base_salary   NUMERIC(15,2) NOT NULL DEFAULT 0,
    status        VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    created_at    TIMESTAMP NOT NULL DEFAULT now(),
    updated_at    TIMESTAMP NOT NULL DEFAULT now()
);

CREATE INDEX idx_contract_employee ON employment_contract(employee_id);

-- ---------- Seed roles ----------
INSERT INTO role (name) VALUES
    ('ROLE_ADMIN'),
    ('ROLE_HR'),
    ('ROLE_MANAGER'),
    ('ROLE_EMPLOYEE');

-- ---------- Seed sample departments & positions ----------
INSERT INTO department (name) VALUES
    ('Ban Giám đốc'),
    ('Phòng Nhân sự'),
    ('Phòng Kỹ thuật'),
    ('Phòng Kinh doanh');

INSERT INTO position (name, level) VALUES
    ('Giám đốc', 5),
    ('Trưởng phòng', 4),
    ('Chuyên viên', 2),
    ('Nhân viên', 1);
