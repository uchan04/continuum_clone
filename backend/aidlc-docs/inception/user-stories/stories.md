# User Stories - Continuum

## Overview
This document contains user stories for the Continuum B2B offboarding middleware MVP. Stories are organized using an **Epic-Based** structure with **Medium granularity** (15-25 stories total). Each story follows the **Classic format** and includes **Hybrid acceptance criteria** (Given-When-Then for main flows, checklist for edge cases).

**Scope**: MVP + Setup (F1 Automated Offboarding + Initial System Configuration)

---

## Story Organization

### Phase 1: Initial Setup & Configuration
- Epic 1: System Onboarding
- Epic 2: External Service Integration

### Phase 2: Core Offboarding Functionality
- Epic 3: Automated Offboarding Engine
- Epic 4: Monitoring & Notifications

### Phase 3: Audit & Compliance
- Epic 5: Audit Logging & Reporting

---

# PHASE 1: INITIAL SETUP & CONFIGURATION

## Epic 1: System Onboarding

### Story 1.1: Administrator Account Creation
**ID**: CONT-001  
**Priority**: Must Have  
**Persona**: IT Administrator  
**Dependencies**: None

**Story**:
As an IT Administrator,  
I want to create an administrator account for Continuum,  
So that I can securely access the system and configure integrations.

**Acceptance Criteria**:

Given I am on the Continuum registration page  
When I enter valid credentials (email, password)  
And I click "Create Account"  
Then my administrator account is created  
And I receive a confirmation email  
And I am redirected to the dashboard

Edge Cases:
- [ ] Invalid email format shows error message
- [ ] Weak password (< 8 characters) is rejected
- [ ] Duplicate email shows "Account already exists" error
- [ ] Email confirmation link expires after 24 hours

**Technical Notes**: Use bcrypt for password hashing, AES-256 for storing OAuth tokens later.

---

### Story 1.2: Administrator Login
**ID**: CONT-002  
**Priority**: Must Have  
**Persona**: IT Administrator, HR Manager, System Operator  
**Dependencies**: CONT-001

**Story**:
As a Continuum user,  
I want to log in to the admin dashboard,  
So that I can access system features.

**Acceptance Criteria**:

Given I have a valid administrator account  
When I enter my email and password  
And I click "Login"  
Then I am authenticated  
And I am redirected to the dashboard homepage

Edge Cases:
- [ ] Incorrect password shows "Invalid credentials" error
- [ ] Account locked after 5 failed login attempts
- [ ] Session expires after 24 hours of inactivity
- [ ] "Remember Me" option extends session to 30 days

**Performance**: Login response time ≤ 500ms

---

## Epic 2: External Service Integration

### Story 2.1: Slack OAuth Integration Setup
**ID**: CONT-003  
**Priority**: Must Have  
**Persona**: IT Administrator  
**Dependencies**: CONT-002

**Story**:
As an IT Administrator,  
I want to configure Slack OAuth integration,  
So that Continuum can revoke Slack access tokens during offboarding.

**Acceptance Criteria**:

Given I am logged in to the Continuum dashboard  
When I navigate to "External Services" → "Slack"  
And I click "Connect Slack"  
Then I see a setup guide with step-by-step instructions  
And I am prompted to enter Slack OAuth Client ID and Client Secret  
When I enter valid credentials and click "Save"  
Then Slack integration status changes to "Connected"  
And a success message is displayed

Edge Cases:
- [ ] Invalid Client ID/Secret shows "Authentication failed" error
- [ ] Connection test button verifies Slack API accessibility
- [ ] Expired OAuth tokens show warning and prompt re-authentication
- [ ] Disconnect button removes integration after confirmation dialog

**Technical Notes**: Use Slack OAuth 2.0 with `admin` scope for token revocation. Store tokens encrypted in PostgreSQL.

---

### Story 2.2: Google Workspace OAuth Integration Setup
**ID**: CONT-004  
**Priority**: Must Have  
**Persona**: IT Administrator  
**Dependencies**: CONT-002

**Story**:
As an IT Administrator,  
I want to configure Google Workspace OAuth integration,  
So that Continuum can revoke Google Workspace access tokens during offboarding.

**Acceptance Criteria**:

Given I am logged in to the Continuum dashboard  
When I navigate to "External Services" → "Google Workspace"  
And I click "Connect Google Workspace"  
Then I see a setup guide with step-by-step instructions  
And I am prompted to enter Google OAuth Client ID and Client Secret  
When I enter valid credentials and click "Save"  
Then Google Workspace integration status changes to "Connected"  
And a success message is displayed

Edge Cases:
- [ ] Invalid credentials show "Authentication failed" error
- [ ] Connection test button verifies Google Admin SDK accessibility
- [ ] Missing required scopes show warning message
- [ ] Disconnect button removes integration after confirmation

**Technical Notes**: Use Google OAuth 2.0 with Admin SDK Directory API scope. Requires super admin privileges.

---

### Story 2.3: Webhook Configuration for HR/ERP Integration
**ID**: CONT-005  
**Priority**: Must Have  
**Persona**: IT Administrator  
**Dependencies**: CONT-002

**Story**:
As an IT Administrator,  
I want to configure webhook settings for HR/ERP integration,  
So that Continuum can receive offboarding events from our HR system.

**Acceptance Criteria**:

Given I am logged in to the Continuum dashboard  
When I navigate to "Webhook Settings"  
Then I see the Webhook URL (POST endpoint)  
And I see the API Key for authentication  
When I click "Copy Webhook URL"  
Then the URL is copied to clipboard  
When I click "Regenerate API Key"  
Then a new API Key is generated after confirmation  
And the old API Key is immediately invalidated

Edge Cases:
- [ ] "Test Webhook" button sends a test event and shows response
- [ ] Webhook request logs show recent API calls with timestamps
- [ ] API Key regeneration requires confirmation dialog
- [ ] Webhook URL is displayed in code block format for easy copy

**Technical Notes**: Webhook endpoint: `POST /api/v1/offboarding/event`. API Key in `X-API-Key` header.

---

### Story 2.4: Monitor External Service Connection Status
**ID**: CONT-006  
**Priority**: Should Have  
**Persona**: IT Administrator  
**Dependencies**: CONT-003, CONT-004

**Story**:
As an IT Administrator,  
I want to view real-time connection status of external services,  
So that I can quickly identify integration issues.

**Acceptance Criteria**:

Given I am logged in to the dashboard  
When I navigate to "External Services"  
Then I see a status indicator for each integrated service  
And "Connected" status is shown in green with checkmark icon  
And "Disconnected" status is shown in red with warning icon  
When a service is disconnected  
Then I see the last successful connection timestamp  
And an error message describing the issue

Edge Cases:
- [ ] "Refresh Status" button re-checks all connections
- [ ] Auto-refresh every 60 seconds
- [ ] Tooltip shows last health check timestamp on hover
- [ ] Click on service card opens detailed connection settings

**Performance**: Status check completes in ≤ 2 seconds for all services.

---

# PHASE 2: CORE OFFBOARDING FUNCTIONALITY

## Epic 3: Automated Offboarding Engine

### Story 3.1: Receive Offboarding Event from HR/ERP
**ID**: CONT-007  
**Priority**: Must Have  
**Persona**: (System Process)  
**Dependencies**: CONT-005

**Story**:
As the Continuum system,  
I want to receive offboarding events via webhook from HR/ERP systems,  
So that I can initiate automated offboarding processes.

**Acceptance Criteria**:

Given the HR/ERP system sends a POST request to the webhook endpoint  
And the request includes a valid API Key in the `X-API-Key` header  
And the request body contains:
- `event_id` (string, unique)
- `event_type` (string, value: "employee.offboarded")
- `employee_email` (string, valid email format)
- `offboarded_at` (ISO 8601 timestamp)  
When Continuum receives the request  
Then the event is validated (schema, API key, event_id uniqueness)  
And a synchronous response is returned within 200ms (HTTP 202 Accepted)  
And the offboarding process is queued for asynchronous execution

Edge Cases:
- [ ] Invalid API Key returns HTTP 401 Unauthorized
- [ ] Malformed JSON returns HTTP 400 Bad Request with error details
- [ ] Duplicate `event_id` returns HTTP 409 Conflict (idempotent)
- [ ] Missing required fields return HTTP 400 with validation errors
- [ ] Unknown `event_type` is logged but ignored (forward compatibility)

**Technical Notes**: Use Redis queue for asynchronous offboarding processing.

---

### Story 3.2: Revoke Slack OAuth Tokens
**ID**: CONT-008  
**Priority**: Must Have  
**Persona**: (System Process)  
**Dependencies**: CONT-003, CONT-007

**Story**:
As the Continuum system,  
I want to revoke Slack OAuth tokens for offboarded employees,  
So that they immediately lose access to company Slack workspace.

**Acceptance Criteria**:

Given an offboarding event has been received for employee "john.doe@company.com"  
And Slack integration is connected  
When the offboarding process executes  
Then Continuum calls Slack `auth.revoke` API with the employee's OAuth token  
And the API call completes within 500ms  
When Slack API returns success (HTTP 200)  
Then the Slack revocation is marked as "SUCCESS"  
And the result is logged with timestamp

Edge Cases:
- [ ] Slack API timeout (> 5 seconds) is marked as "FAILURE"
- [ ] Slack API error (HTTP 4xx/5xx) is marked as "FAILURE" with error message
- [ ] Employee not found in Slack returns "SKIPPED" (not an error)
- [ ] Network errors are caught and logged

**Performance**: Slack API call completes in ≤ 500ms (target), ≤ 1 second (max with retry).

---

### Story 3.3: Revoke Google Workspace OAuth Tokens
**ID**: CONT-009  
**Priority**: Must Have  
**Persona**: (System Process)  
**Dependencies**: CONT-004, CONT-007

**Story**:
As the Continuum system,  
I want to revoke Google Workspace OAuth tokens for offboarded employees,  
So that they immediately lose access to company Google Workspace.

**Acceptance Criteria**:

Given an offboarding event has been received for employee "john.doe@company.com"  
And Google Workspace integration is connected  
When the offboarding process executes  
Then Continuum calls Google Admin SDK `tokens.delete` API with the employee's OAuth token  
And the API call completes within 500ms  
When Google API returns success (HTTP 200)  
Then the Google Workspace revocation is marked as "SUCCESS"  
And the result is logged with timestamp

Edge Cases:
- [ ] Google API timeout (> 5 seconds) is marked as "FAILURE"
- [ ] Google API error (HTTP 4xx/5xx) is marked as "FAILURE" with error message
- [ ] Employee not found in Google Workspace returns "SKIPPED"
- [ ] Rate limit errors (HTTP 429) are logged as "FAILURE"

**Performance**: Google API call completes in ≤ 500ms (target), ≤ 1 second (max with retry).

---

### Story 3.4: Clear Redis Session Cache
**ID**: CONT-010  
**Priority**: Must Have  
**Persona**: (System Process)  
**Dependencies**: CONT-007

**Story**:
As the Continuum system,  
I want to clear all active sessions for offboarded employees from Redis cache,  
So that any in-progress user sessions are immediately terminated.

**Acceptance Criteria**:

Given an offboarding event has been received for employee "john.doe@company.com"  
When the offboarding process executes  
Then Continuum queries Redis for all session keys matching the employee's email  
And all matching session keys are deleted  
And the session cache clear is marked as "SUCCESS"

Edge Cases:
- [ ] No active sessions found returns "SUCCESS" (no-op)
- [ ] Redis connection error is marked as "FAILURE"
- [ ] Partial deletion (some keys fail) is marked as "PARTIAL_SUCCESS"

**Performance**: Redis session clear completes in ≤ 100ms.

---

### Story 3.5: Aggregate Offboarding Results
**ID**: CONT-011  
**Priority**: Must Have  
**Persona**: (System Process)  
**Dependencies**: CONT-008, CONT-009, CONT-010

**Story**:
As the Continuum system,  
I want to aggregate results from all offboarding steps (Slack, Google, Redis),  
So that I can determine overall offboarding status and log the results.

**Acceptance Criteria**:

Given all offboarding steps have completed (Slack revoke, Google revoke, Redis clear)  
When the offboarding process aggregates results  
Then the overall status is calculated:
- "SUCCESS" if all steps are "SUCCESS"
- "PARTIAL_FAILURE" if some steps are "FAILURE" or "SKIPPED"
- "FAILURE" if all steps are "FAILURE"  
And the total processing time is calculated (end time - start time)  
And the result is persisted to the audit log in PostgreSQL

Edge Cases:
- [ ] Individual step timeouts are included in total time calculation
- [ ] Failed step details (service name, error message) are preserved
- [ ] Processing time exceeding 1 second triggers performance warning log

**Performance**: Total offboarding time (all steps) ≤ 1 second (end-to-end).

---

## Epic 4: Monitoring & Notifications

### Story 4.1: View Recent Offboarding Events on Dashboard
**ID**: CONT-012  
**Priority**: Must Have  
**Persona**: HR Manager, System Operator  
**Dependencies**: CONT-011

**Story**:
As an HR Manager,  
I want to view recent offboarding events on the dashboard,  
So that I can quickly see which employees were offboarded and their status.

**Acceptance Criteria**:

Given I am logged in to the Continuum dashboard  
When I view the homepage  
Then I see a "Recent Offboarding Events" section  
And it displays the 10 most recent events in reverse chronological order  
And each event shows:
- Employee email
- Offboarding timestamp
- Overall status (SUCCESS / PARTIAL_FAILURE / FAILURE) with colored badge
- Processing time (e.g., "0.8s")  
When I click on an event  
Then I am navigated to the event detail page

Edge Cases:
- [ ] Empty state shows "No offboarding events yet" message
- [ ] Status badges use color coding (green=success, yellow=partial, red=failure)
- [ ] Timestamp displays as relative time (e.g., "2 hours ago")
- [ ] Processing time > 1 second is highlighted in red

**Performance**: Dashboard loads in ≤ 2 seconds.

---

### Story 4.2: View Offboarding Event Details
**ID**: CONT-013  
**Priority**: Must Have  
**Persona**: HR Manager, System Operator  
**Dependencies**: CONT-012

**Story**:
As an HR Manager,  
I want to view detailed information about a specific offboarding event,  
So that I can understand what happened and identify any failures.

**Acceptance Criteria**:

Given I clicked on an offboarding event from the dashboard  
When the event detail page loads  
Then I see:
- Employee email
- Event ID
- Offboarding timestamp
- Overall status
- Total processing time  
And I see a breakdown of each step:
  - Slack revocation (status, error message if failed)
  - Google Workspace revocation (status, error message if failed)
  - Redis session clear (status, error message if failed)  
And each step shows individual processing time

Edge Cases:
- [ ] Failed steps display error messages in red
- [ ] Skipped steps (e.g., employee not in Slack) show "SKIPPED" with explanation
- [ ] "Copy Event ID" button copies to clipboard
- [ ] "Back to Dashboard" button returns to homepage

---

### Story 4.3: Send Email Notification on Offboarding Completion
**ID**: CONT-014  
**Priority**: Must Have  
**Persona**: HR Manager  
**Dependencies**: CONT-011

**Story**:
As an HR Manager,  
I want to receive an email notification when an offboarding process completes,  
So that I am immediately informed of the result without having to check the dashboard.

**Acceptance Criteria**:

Given an offboarding process has completed  
When the overall status is "SUCCESS"  
Then an email is sent to the configured HR Manager email address  
And the email subject is "Offboarding Complete: [Employee Email]"  
And the email body includes:
- Employee email
- Overall status: SUCCESS
- Total processing time
- Link to event details in dashboard  
When the overall status is "PARTIAL_FAILURE" or "FAILURE"  
Then the email subject is "Offboarding Failed: [Employee Email]"  
And the email body includes failed step details and recommended actions

Edge Cases:
- [ ] Email sending failure is logged but does not block offboarding
- [ ] Email template is configurable in admin settings
- [ ] Multiple recipients can be configured (comma-separated emails)
- [ ] Email includes direct link to event detail page with auth token

---

### Story 4.4: Handle OAuth API Failures
**ID**: CONT-015  
**Priority**: Must Have  
**Persona**: System Operator, HR Manager  
**Dependencies**: CONT-008, CONT-009

**Story**:
As a System Operator,  
I want Continuum to handle external API failures gracefully,  
So that offboarding failures are logged and the HR team is notified for manual intervention.

**Acceptance Criteria**:

Given an offboarding process is executing  
When Slack or Google Workspace API call fails (timeout, error response, network error)  
Then the failure is logged with:
- Service name (Slack / Google Workspace)
- Error type (timeout / API error / network error)
- Error message from API response
- Timestamp  
And the overall offboarding status is set to "PARTIAL_FAILURE" or "FAILURE"  
And an email notification is sent to HR Manager with:
- Employee email
- Failed service name
- Error details
- Manual remediation instructions (e.g., "Please manually revoke access in Slack Admin Console")

Edge Cases:
- [ ] Retry logic: No automatic retries in MVP (manual intervention required)
- [ ] Multiple service failures are all logged separately
- [ ] Network timeout threshold: 5 seconds per API call
- [ ] Error messages are sanitized (no sensitive data in logs)

---

# PHASE 3: AUDIT & COMPLIANCE

## Epic 5: Audit Logging & Reporting

### Story 5.1: Query Audit Logs by Date Range
**ID**: CONT-016  
**Priority**: Should Have  
**Persona**: System Operator  
**Dependencies**: CONT-011

**Story**:
As a System Operator,  
I want to query audit logs by date range,  
So that I can review offboarding history for a specific period.

**Acceptance Criteria**:

Given I am logged in to the Continuum dashboard  
When I navigate to "Audit Logs"  
And I specify a date range (start date, end date)  
And I click "Search"  
Then I see a list of offboarding events within the specified date range  
And the results are sorted by timestamp (most recent first)  
And each result shows:
- Employee email
- Offboarding timestamp
- Overall status
- Processing time

Edge Cases:
- [ ] Default date range: Last 30 days
- [ ] Maximum date range: 1 year
- [ ] Empty results show "No events found for this date range"
- [ ] Date picker uses calendar widget for easy selection

**Performance**: Query completes in ≤ 3 seconds for 1 year of data.

---

### Story 5.2: Search Audit Logs by Employee Email
**ID**: CONT-017  
**Priority**: Should Have  
**Persona**: System Operator, HR Manager  
**Dependencies**: CONT-016

**Story**:
As an HR Manager,  
I want to search audit logs by employee email,  
So that I can find all offboarding events for a specific employee.

**Acceptance Criteria**:

Given I am on the "Audit Logs" page  
When I enter an employee email in the search box  
And I click "Search" (or press Enter)  
Then I see all offboarding events for that employee  
And the results are sorted by timestamp (most recent first)

Edge Cases:
- [ ] Partial email matching (e.g., "john" matches "john.doe@company.com")
- [ ] Case-insensitive search
- [ ] No results show "No events found for this employee"
- [ ] Search box supports autocomplete from recent searches

---

### Story 5.3: Filter Audit Logs by Status
**ID**: CONT-018  
**Priority**: Should Have  
**Persona**: System Operator  
**Dependencies**: CONT-016

**Story**:
As a System Operator,  
I want to filter audit logs by status (SUCCESS / PARTIAL_FAILURE / FAILURE),  
So that I can quickly identify failed offboarding events that need attention.

**Acceptance Criteria**:

Given I am on the "Audit Logs" page  
When I select a status filter (SUCCESS / PARTIAL_FAILURE / FAILURE / All)  
Then the audit log list is filtered to show only events matching the selected status  
And the filter selection is highlighted

Edge Cases:
- [ ] "All" filter shows all events (default)
- [ ] Status filter works in combination with date range and email search
- [ ] Filter state persists when navigating away and returning
- [ ] Badge shows count of each status type

---

### Story 5.4: Export Audit Logs to CSV
**ID**: CONT-019  
**Priority**: Should Have  
**Persona**: System Operator  
**Dependencies**: CONT-016

**Story**:
As a System Operator,  
I want to export audit logs to CSV format,  
So that I can include them in compliance reports or analyze data in Excel.

**Acceptance Criteria**:

Given I am on the "Audit Logs" page  
And I have applied filters (date range, email, status)  
When I click "Export CSV"  
Then a CSV file is downloaded to my computer  
And the CSV contains all events matching the current filters  
And the CSV includes columns:
- Event ID
- Employee Email
- Offboarded At (ISO 8601 timestamp)
- Overall Status
- Slack Status
- Google Workspace Status
- Redis Status
- Total Processing Time (seconds)

Edge Cases:
- [ ] CSV filename includes export date: `continuum-audit-logs-2026-08-19.csv`
- [ ] CSV uses UTF-8 encoding
- [ ] Export limit: 10,000 rows (show warning if exceeded)
- [ ] Empty results show "No data to export" message

---

## Summary Statistics

### Total Stories: 19
- **Must Have**: 16 stories
- **Should Have**: 3 stories
- **Could Have**: 0 stories
- **Won't Have**: 0 stories (Phase 2 features deferred)

### Stories by Persona:
- **HR Manager**: 5 stories (CONT-002, CONT-012, CONT-013, CONT-014, CONT-017)
- **IT Administrator**: 5 stories (CONT-001, CONT-002, CONT-003, CONT-004, CONT-005, CONT-006)
- **System Operator**: 6 stories (CONT-002, CONT-013, CONT-015, CONT-016, CONT-017, CONT-018, CONT-019)
- **System Process**: 6 stories (CONT-007, CONT-008, CONT-009, CONT-010, CONT-011)

### INVEST Criteria Validation:
- **Independent**: Each story can be developed independently (dependencies documented)
- **Negotiable**: Stories describe goals, not implementation details (except where technical notes clarify)
- **Valuable**: Each story delivers user value or system capability
- **Estimable**: Stories are sized for 1 sprint (medium granularity)
- **Small**: No story spans multiple components (except Epic-level aggregation)
- **Testable**: All stories have clear acceptance criteria with Given-When-Then or checklists

---

## Traceability to Requirements

| Requirement ID | User Stories |
|---|---|
| FR-1.1: HR/ERP Event Detection | CONT-007 |
| FR-1.2: OAuth Token Revocation | CONT-008, CONT-009 |
| FR-1.3: Session Control | CONT-010 |
| FR-1.4: Audit Log Generation | CONT-011, CONT-016 |
| FR-1.5: Admin Notification | CONT-014 |
| FR-2.1: Authentication | CONT-001, CONT-002 |
| FR-2.2: External Service Integration | CONT-003, CONT-004, CONT-006 |
| FR-2.3: Event Monitoring | CONT-012, CONT-013 |
| FR-2.4: Audit Log Query | CONT-016, CONT-017, CONT-018, CONT-019 |
| FR-3.1: Webhook Endpoint | CONT-005, CONT-007 |
| NFR-1.1: Performance (1 second) | CONT-011 (acceptance criteria) |
| NFR-3.2: Error Handling | CONT-015 |

---

**Document Version**: 1.0  
**Last Updated**: 2026-08-19  
**Author**: AI-DLC User Stories Generation  
**Status**: Generated
