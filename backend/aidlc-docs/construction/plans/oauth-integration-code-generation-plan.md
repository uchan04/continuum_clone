# Code Generation Plan — Feature Cycle 3: Real Slack/Google Admin-Credential Integration

Based on requirements addendum in `aidlc-docs/inception/requirements/requirements.md` (Feature Cycle 3).

## Steps

- [x] 1. Flyway migration `V3__widen_integration_config_client_id.sql` — make `client_id` nullable on `integration_configs` (Slack no longer uses it)
- [x] 2. `IntegrationConfig` entity — remove `nullable = false` on `clientId`
- [x] 3. Replace `IntegrationConfigRequest` with two DTOs: `SlackIntegrationRequest` (`token`), `GoogleWorkspaceIntegrationRequest` (`serviceAccountJson`, `adminEmail`)
- [x] 4. New `GoogleServiceAccountTokenProvider` — parses a service-account JSON key, signs a JWT assertion (RS256, via jjwt) impersonating the configured admin email with the Directory API security scope, exchanges it at Google's token endpoint for a short-lived access token
- [x] 5. Rewrite `IntegrationService`:
   - `configureSlack(token)` — validates via `auth.test`, stores encrypted token
   - `configureGoogleWorkspace(serviceAccountJson, adminEmail)` — validates by minting a token via `GoogleServiceAccountTokenProvider`, stores encrypted JSON + admin email
   - `revokeSlackToken(email)` — `users.lookupByEmail` to resolve Slack user ID, then `admin.users.session.reset`
   - `revokeGoogleWorkspaceToken(email)` — mint access token, call Directory API `users.signOut`
   - `testSlackConnection()` / `testGoogleWorkspaceConnection()` — real calls instead of stub `return true`
- [x] 6. Update `IntegrationController` to use the two new request DTOs on `/slack` and `/google-workspace` endpoints (same URLs, new body shape)
- [x] 7. `application.yml` — add Slack `auth-test-endpoint`, `lookup-by-email-endpoint`, `session-reset-endpoint`; Google `token-endpoint`, `sign-out-endpoint`, `admin-scope`
- [x] 8. Unit tests: `IntegrationServiceTest` (mock `RestTemplate`) covering Slack success/lookup-failure/session-reset-failure, Google success/failure, `GoogleServiceAccountTokenProviderTest` (signs + parses a JWT against a test RSA keypair)
- [x] 9. Update `code-summary.md` / audit.md with what changed

## Explicit Non-Goals (per approved requirements)
- No Slack OAuth "Install to Workspace" redirect flow
- No Google OAuth Authorization Code redirect flow
- No frontend/dashboard UI changes
