-- Continuum Database Schema V1
-- Initial schema for MVP F1: Automated Offboarding Engine

-- Admin Users Table
CREATE TABLE admin_users (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'ADMIN',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_admin_users_email ON admin_users(email);

-- Insert default admin user (password: admin123, bcrypt hash with strength 12)
INSERT INTO admin_users (email, password_hash, role) 
VALUES ('admin@continuum.com', '$2y$12$SuVLzmoJJ8u2N8PLUwG9uOl9ZOh5uByeGT9azmRFHZXTTVz3f3V2C', 'ADMIN');

-- Offboarding Events Table
CREATE TABLE offboarding_events (
    id BIGSERIAL PRIMARY KEY,
    event_id VARCHAR(255) UNIQUE NOT NULL,
    employee_email VARCHAR(255) NOT NULL,
    offboarded_at TIMESTAMP NOT NULL,
    overall_status VARCHAR(50) NOT NULL,
    total_processing_time_ms INTEGER NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_offboarding_events_event_id ON offboarding_events(event_id);
CREATE INDEX idx_offboarding_events_employee_email ON offboarding_events(employee_email);
CREATE INDEX idx_offboarding_events_created_at ON offboarding_events(created_at);

-- Offboarding Steps Table
CREATE TABLE offboarding_steps (
    id BIGSERIAL PRIMARY KEY,
    event_id VARCHAR(255) NOT NULL,
    service_name VARCHAR(100) NOT NULL,
    status VARCHAR(50) NOT NULL,
    error_message TEXT,
    processing_time_ms INTEGER NOT NULL,
    CONSTRAINT fk_offboarding_steps_event 
        FOREIGN KEY (event_id) 
        REFERENCES offboarding_events(event_id) 
        ON DELETE CASCADE
);

CREATE INDEX idx_offboarding_steps_event_id ON offboarding_steps(event_id);

-- Audit Logs Table
CREATE TABLE audit_logs (
    id BIGSERIAL PRIMARY KEY,
    event_id VARCHAR(255) NOT NULL,
    employee_email VARCHAR(255) NOT NULL,
    timestamp TIMESTAMP NOT NULL,
    status VARCHAR(50) NOT NULL,
    details JSONB,
    CONSTRAINT fk_audit_logs_event 
        FOREIGN KEY (event_id) 
        REFERENCES offboarding_events(event_id) 
        ON DELETE CASCADE
);

CREATE INDEX idx_audit_logs_event_id ON audit_logs(event_id);
CREATE INDEX idx_audit_logs_employee_email ON audit_logs(employee_email);
CREATE INDEX idx_audit_logs_timestamp ON audit_logs(timestamp);
CREATE INDEX idx_audit_logs_status ON audit_logs(status);

-- Integration Configs Table
CREATE TABLE integration_configs (
    id BIGSERIAL PRIMARY KEY,
    service_name VARCHAR(100) UNIQUE NOT NULL,
    client_id VARCHAR(255) NOT NULL,
    encrypted_client_secret TEXT NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'DISCONNECTED',
    last_checked TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_integration_configs_service_name ON integration_configs(service_name);

-- Comments for documentation
COMMENT ON TABLE admin_users IS 'Admin users who can access the dashboard';
COMMENT ON TABLE offboarding_events IS 'Main offboarding event records';
COMMENT ON TABLE offboarding_steps IS 'Individual service revocation steps for each offboarding event';
COMMENT ON TABLE audit_logs IS 'Audit trail for all offboarding activities';
COMMENT ON TABLE integration_configs IS 'OAuth configuration for external services (Slack, Google Workspace)';
