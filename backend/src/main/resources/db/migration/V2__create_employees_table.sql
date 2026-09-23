-- Continuum Database Schema V2
-- Employee Management (list / register / soft-delete)

CREATE TABLE employees (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    department VARCHAR(100),
    position VARCHAR(100),
    hire_date DATE,
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    offboarded_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Case-insensitive uniqueness on email (BR1)
CREATE UNIQUE INDEX idx_employees_email_lower ON employees (LOWER(email));
CREATE INDEX idx_employees_status ON employees (status);
CREATE INDEX idx_employees_name ON employees (name);

COMMENT ON TABLE employees IS 'Employee master records for list/register/offboard management';
