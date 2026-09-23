# Unit of Work to User Story Mapping - Continuum

## Overview
This document maps the 19 User Stories to the 4 Units of Work, ensuring complete coverage and traceability.

---

## Mapping Summary

| Unit | Story Count | Story IDs |
|---|---|---|
| UNIT-001 (Core Engine) | 3 | CONT-007, CONT-010, CONT-011 |
| UNIT-002 (Integrations) | 6 | CONT-003, CONT-004, CONT-006, CONT-008, CONT-009, CONT-015 |
| UNIT-003 (Dashboard API) | 10 | CONT-001, CONT-002, CONT-005, CONT-012, CONT-013, CONT-014, CONT-016, CONT-017, CONT-018, CONT-019 |
| UNIT-004 (Infrastructure) | 0 | (Enables all stories, no direct mapping) |

**Total Stories**: 19 (all mapped)

---

# UNIT-001: Core Offboarding Engine

## Mapped Stories (3)

### CONT-007: Receive Offboarding Event from HR/ERP
**Epic**: Epic 3 - Automated Offboarding Engine  
**Priority**: Must Have  
**Persona**: (System Process)

**Mapping Rationale**: Core Engine is responsible for webhook event reception and validation.

**Component**: OffboardingService
- Method: `processOffboardingEvent(OffboardingEvent)`
- Validates event schema, checks idempotency, queues for async processing

---

### CONT-010: Clear Redis Session Cache
**Epic**: Epic 3 - Automated Offboarding Engine  
**Priority**: Must Have  
**Persona**: (System Process)

**Mapping Rationale**: Core Engine includes SessionManager component for Redis operations.

**Component**: SessionManager
- Method: `clearEmployeeSessions(String employeeEmail)`
- Queries and deletes all session keys for the employee

---

### CONT-011: Aggregate Offboarding Results
**Epic**: Epic 3 - Automated Offboarding Engine  
**Priority**: Must Have  
**Persona**: (System Process)

**Mapping Rationale**: Core Engine's OffboardingEngine aggregates results from all steps.

**Component**: OffboardingEngine
- Method: `aggregateResults(List<StepResult>)`
- Determines overall status (SUCCESS/PARTIAL_FAILURE/FAILURE) from individual step results

---

# UNIT-002: External Service Integrations

## Mapped Stories (6)

### CONT-003: Slack OAuth Integration Setup
**Epic**: Epic 2 - External Service Integration  
**Priority**: Must Have  
**Persona**: IT Administrator

**Mapping Rationale**: Integration unit handles OAuth configuration for Slack.

**Component**: IntegrationService
- Method: `configureSlackIntegration(SlackOAuthConfig)`
- Stores encrypted OAuth credentials, tests connection

**API Endpoint**: `POST /api/v1/integrations/slack` (handled by Dashboard unit WebController, but delegates to this unit)

---

### CONT-004: Google Workspace OAuth Integration Setup
**Epic**: Epic 2 - External Service Integration  
**Priority**: Must Have  
**Persona**: IT Administrator

**Mapping Rationale**: Integration unit handles OAuth configuration for Google Workspace.

**Component**: IntegrationService
- Method: `configureGoogleWorkspaceIntegration(GoogleOAuthConfig)`
- Stores encrypted OAuth credentials, tests connection

**API Endpoint**: `POST /api/v1/integrations/google-workspace` (handled by Dashboard unit)

---

### CONT-006: Monitor External Service Connection Status
**Epic**: Epic 2 - External Service Integration  
**Priority**: Should Have  
**Persona**: IT Administrator

**Mapping Rationale**: Integration unit checks and reports connection status for all services.

**Component**: IntegrationService
- Method: `getIntegrationStatus()`
- Returns Map<String, IntegrationStatus> with real-time status checks

**API Endpoint**: `GET /api/v1/integrations/status` (handled by Dashboard unit)

---

### CONT-008: Revoke Slack OAuth Tokens
**Epic**: Epic 3 - Automated Offboarding Engine  
**Priority**: Must Have  
**Persona**: (System Process)

**Mapping Rationale**: Integration unit implements Slack API integration and token revocation.

**Component**: IntegrationService
- Method: `revokeSlackToken(String employeeEmail)`
- Calls Slack `auth.revoke` API, handles timeouts and errors

**Called By**: OffboardingEngine (UNIT-001)

---

### CONT-009: Revoke Google Workspace OAuth Tokens
**Epic**: Epic 3 - Automated Offboarding Engine  
**Priority**: Must Have  
**Persona**: (System Process)

**Mapping Rationale**: Integration unit implements Google Workspace API integration and token revocation.

**Component**: IntegrationService
- Method: `revokeGoogleWorkspaceToken(String employeeEmail)`
- Calls Google Admin SDK `tokens.delete` API, handles timeouts and errors

**Called By**: OffboardingEngine (UNIT-001)

---

### CONT-015: Handle OAuth API Failures
**Epic**: Epic 4 - Monitoring & Notifications  
**Priority**: Must Have  
**Persona**: System Operator, HR Manager

**Mapping Rationale**: Integration unit implements graceful error handling for external API failures.

**Component**: IntegrationService
- Methods: `revokeSlackToken()`, `revokeGoogleWorkspaceToken()`
- Returns IntegrationResult with status=FAILURE and error details on timeout, API error, or network error

**Notification Trigger**: OffboardingService (UNIT-001) detects FAILURE status and triggers NotificationService (UNIT-003)

---

# UNIT-003: Admin Dashboard & API

## Mapped Stories (10)

### CONT-001: Administrator Account Creation
**Epic**: Epic 1 - System Onboarding  
**Priority**: Must Have  
**Persona**: IT Administrator

**Mapping Rationale**: Dashboard unit implements admin authentication and account management.

**Component**: WebController (AuthController)
- Endpoint: `POST /api/v1/auth/register` (or pre-created admin account in database)
- Stores admin user with bcrypt-hashed password

---

### CONT-002: Administrator Login
**Epic**: Epic 1 - System Onboarding  
**Priority**: Must Have  
**Persona**: IT Administrator, HR Manager, System Operator

**Mapping Rationale**: Dashboard unit implements login endpoint and session management.

**Component**: WebController (AuthController)
- Endpoint: `POST /api/v1/auth/login`
- Validates credentials, issues JWT or session token

---

### CONT-005: Webhook Configuration for HR/ERP Integration
**Epic**: Epic 2 - External Service Integration  
**Priority**: Must Have  
**Persona**: IT Administrator

**Mapping Rationale**: Dashboard unit displays webhook settings and regenerates API keys.

**Component**: WebController
- Endpoint: `GET /api/v1/webhook/settings`
- Returns webhook URL and current API Key

- Endpoint: `POST /api/v1/webhook/regenerate-key`
- Generates new API Key, invalidates old one

---

### CONT-012: View Recent Offboarding Events on Dashboard
**Epic**: Epic 4 - Monitoring & Notifications  
**Priority**: Must Have  
**Persona**: HR Manager, System Operator

**Mapping Rationale**: Dashboard unit implements dashboard homepage displaying recent events.

**Component**: WebController
- Endpoint: `GET /api/v1/events/recent?limit=10`
- Delegates to OffboardingService (UNIT-001) to retrieve events
- Returns list of OffboardingEventSummary

---

### CONT-013: View Offboarding Event Details
**Epic**: Epic 4 - Monitoring & Notifications  
**Priority**: Must Have  
**Persona**: HR Manager, System Operator

**Mapping Rationale**: Dashboard unit implements event detail page.

**Component**: WebController
- Endpoint: `GET /api/v1/events/{eventId}`
- Delegates to OffboardingService (UNIT-001) to retrieve event details
- Returns OffboardingEventDetail with step-by-step breakdown

---

### CONT-014: Send Email Notification on Offboarding Completion
**Epic**: Epic 4 - Monitoring & Notifications  
**Priority**: Must Have  
**Persona**: HR Manager

**Mapping Rationale**: Dashboard unit includes NotificationService for email sending.

**Component**: NotificationService
- Methods: `sendOffboardingSuccessEmail()`, `sendOffboardingFailureEmail()`
- Triggered by OffboardingService (UNIT-001) after offboarding completion

**External Dependency**: SMTP Server (configured in UNIT-004)

---

### CONT-016: Query Audit Logs by Date Range
**Epic**: Epic 5 - Audit Logging & Reporting  
**Priority**: Should Have  
**Persona**: System Operator

**Mapping Rationale**: Dashboard unit implements audit log query endpoint with date range filter.

**Component**: WebController (AuditController)
- Endpoint: `GET /api/v1/audit/logs?start_date=...&end_date=...`
- Delegates to AuditService (UNIT-001) to query logs
- Returns list of AuditLogEntry

---

### CONT-017: Search Audit Logs by Employee Email
**Epic**: Epic 5 - Audit Logging & Reporting  
**Priority**: Should Have  
**Persona**: System Operator, HR Manager

**Mapping Rationale**: Dashboard unit implements audit log search endpoint with email filter.

**Component**: WebController (AuditController)
- Endpoint: `GET /api/v1/audit/logs?employee_email=...`
- Delegates to AuditService (UNIT-001) to query logs

---

### CONT-018: Filter Audit Logs by Status
**Epic**: Epic 5 - Audit Logging & Reporting  
**Priority**: Should Have  
**Persona**: System Operator

**Mapping Rationale**: Dashboard unit implements audit log filter endpoint with status filter.

**Component**: WebController (AuditController)
- Endpoint: `GET /api/v1/audit/logs?status=SUCCESS|PARTIAL_FAILURE|FAILURE`
- Delegates to AuditService (UNIT-001) to query logs

---

### CONT-019: Export Audit Logs to CSV
**Epic**: Epic 5 - Audit Logging & Reporting  
**Priority**: Should Have  
**Persona**: System Operator

**Mapping Rationale**: Dashboard unit implements CSV export endpoint.

**Component**: WebController (AuditController)
- Endpoint: `GET /api/v1/audit/logs/export?...` (with query params)
- Delegates to AuditService (UNIT-001) to generate CSV
- Returns CSV file as InputStream download

**Library**: OpenCSV for CSV generation

---

# UNIT-004: Infrastructure & Deployment

## Mapped Stories (0 direct, enables all)

**Rationale**: Infrastructure unit does not directly implement any user-facing features. Instead, it provides the foundational infrastructure that enables all other units:

- **Database (PostgreSQL)**: Required by UNIT-001 (audit logs, offboarding events), UNIT-002 (integration configs), UNIT-003 (admin users)
- **Cache (Redis)**: Required by UNIT-001 (session management), UNIT-003 (admin sessions, API key storage)
- **AWS Infrastructure**: Required by all units for deployment
- **CI/CD Pipeline**: Required for building and deploying all units

**Enablement Impact**: Without UNIT-004, no stories can be functionally tested or deployed.

---

## Cross-Unit Story Dependencies

Some stories span multiple units. Here's how they coordinate:

### Example 1: CONT-003 (Slack OAuth Integration Setup)
- **Primary Unit**: UNIT-002 (IntegrationService implementation)
- **Supporting Unit**: UNIT-003 (WebController endpoint)
- **Flow**: 
  1. IT Administrator calls `POST /api/v1/integrations/slack` (UNIT-003)
  2. WebController delegates to IntegrationService (UNIT-002)
  3. IntegrationService stores encrypted config in PostgreSQL (UNIT-004)

### Example 2: CONT-012 (View Recent Offboarding Events)
- **Primary Unit**: UNIT-001 (OffboardingService data retrieval)
- **Supporting Unit**: UNIT-003 (WebController endpoint)
- **Flow**:
  1. HR Manager calls `GET /api/v1/events/recent` (UNIT-003)
  2. WebController delegates to OffboardingService (UNIT-001)
  3. OffboardingService queries OffboardingRepository (UNIT-001)
  4. Results returned to WebController, serialized to JSON

---

## Traceability Matrix

| Story ID | Unit | Component | Method/Endpoint |
|---|---|---|---|
| CONT-001 | UNIT-003 | WebController (AuthController) | POST /api/v1/auth/register |
| CONT-002 | UNIT-003 | WebController (AuthController) | POST /api/v1/auth/login |
| CONT-003 | UNIT-002 | IntegrationService | configureSlackIntegration() |
| CONT-004 | UNIT-002 | IntegrationService | configureGoogleWorkspaceIntegration() |
| CONT-005 | UNIT-003 | WebController | GET /api/v1/webhook/settings, POST /api/v1/webhook/regenerate-key |
| CONT-006 | UNIT-002 | IntegrationService | getIntegrationStatus() |
| CONT-007 | UNIT-001 | OffboardingService | processOffboardingEvent() |
| CONT-008 | UNIT-002 | IntegrationService | revokeSlackToken() |
| CONT-009 | UNIT-002 | IntegrationService | revokeGoogleWorkspaceToken() |
| CONT-010 | UNIT-001 | SessionManager | clearEmployeeSessions() |
| CONT-011 | UNIT-001 | OffboardingEngine | aggregateResults() |
| CONT-012 | UNIT-001 + UNIT-003 | OffboardingService + WebController | getRecentOffboardingEvents(), GET /api/v1/events/recent |
| CONT-013 | UNIT-001 + UNIT-003 | OffboardingService + WebController | getOffboardingEventDetails(), GET /api/v1/events/{eventId} |
| CONT-014 | UNIT-003 | NotificationService | sendOffboardingSuccessEmail(), sendOffboardingFailureEmail() |
| CONT-015 | UNIT-002 | IntegrationService | Error handling in revokeSlackToken(), revokeGoogleWorkspaceToken() |
| CONT-016 | UNIT-001 + UNIT-003 | AuditService + WebController | queryAuditLogs(), GET /api/v1/audit/logs?start_date=...&end_date=... |
| CONT-017 | UNIT-001 + UNIT-003 | AuditService + WebController | queryAuditLogs(), GET /api/v1/audit/logs?employee_email=... |
| CONT-018 | UNIT-001 + UNIT-003 | AuditService + WebController | queryAuditLogs(), GET /api/v1/audit/logs?status=... |
| CONT-019 | UNIT-001 + UNIT-003 | AuditService + WebController | exportAuditLogsToCsv(), GET /api/v1/audit/logs/export |

---

## Acceptance Criteria Coverage

Each unit must pass acceptance criteria for its mapped stories before being marked complete. See `user-stories/stories.md` for detailed acceptance criteria.

---

**Document Version**: 1.0  
**Last Updated**: 2026-08-19  
**Author**: AI-DLC Units Generation  
**Status**: Ready for Review
