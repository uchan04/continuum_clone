-- Slack integration no longer stores a client_id (manual admin token instead);
-- Google Workspace repurposes client_id to hold the impersonated admin email.
ALTER TABLE integration_configs ALTER COLUMN client_id DROP NOT NULL;
