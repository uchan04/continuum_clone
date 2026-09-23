# Units of Work - Continuum

## Overview
This document defines the decomposition of Continuum MVP into **4 Units of Work** for implementation. Each unit represents a logical grouping of functionality that can be designed, implemented, and tested incrementally.

**Architecture Type**: Monolith (Single Deployable Application)
**Unit Organization**: Logical modules within the monolith for development sequencing

---

## Unit Decomposition Strategy

**Decomposition Criteria**:
- **Story Affinity**: Group stories that share similar functionality
- **Component Coupling**: Group tightly coupled components
- **Technical Independence**: Minimize inter-unit dependencies during development
- **Business Domain**: Align units with business capabilities
- **Development Sequencing**: Enable incremental delivery (core → UI → enhancements)

**Total Units**: 4
- Unit 1: Core Offboarding Engine (Foundation)
- Unit 2: External Service Integrations (Critical Dependencies)
- Unit 3: Admin Dashboard & API (User Interface)
- Unit 4: Infrastructure & Deployment (Enablement)

---

# Unit 1: Core Offboarding Engine

## Unit ID
`UNIT-001-CORE-ENGINE`

## Purpose
Implement the core offboarding workflow orchestration, event processing, and result aggregation logic.

## Scope

### Components Included
- **OffboardingService** (from Application Design)
- **OffboardingEngine** (from Application Design)
- **SessionManager** (from Application Design)
- **OffboardingRepository** (from Application Design)
- **AuditService** (from Application Design)
- **AuditLogRepository** (from Application Design)

### User Stories Covered
- CONT-007: Receive Offboarding Event from HR/ERP
- CONT-010: Clear Redis Session Cache
- CONT-011: Aggregate Offboarding Results

### Key Functionality
- Webhook event reception and validation
- Offboarding workflow orchestration
- Parallel execution coordination (CompletableFuture)
- Result aggregation and status determination
- Redis session cache management
- Audit logging persistence

### Data Models
- `OffboardingEvent` (event_id, employee_email, offboarded_at)
- `OffboardingResult` (overall_status, steps, total_time)
- `StepResult` (service_name, status, error_message, processing_time)
- `AuditLogEntry` (event_id, employee_email, timestamp, status, details)

### API Endpoints
- `POST /api/v1/offboarding/event` (Webhook)

### External Dependencies
- Redis (session cache)
- PostgreSQL (audit logs, offboarding events)

### Technology Stack
- Java 21
- Spring Boot (Service layer, DI)
- Spring Data JPA (OffboardingRepository, AuditLogRepository)
- Spring Data Redis (SessionManager)
- CompletableFuture (parallel execution)

### Success Criteria
- Webhook receives and validates events (idempotency check)
- Offboarding workflow executes in ≤1 second
- All offboarding steps coordinated correctly
- Audit logs persisted for every event
- Unit tests + Property-Based Tests (jqwik)

---

# Unit 2: External Service Integrations

## Unit ID
`UNIT-002-INTEGRATIONS`

## Purpose
Implement OAuth-based external service integrations for Slack and Google Workspace, including token revocation and connection management.

## Scope

### Components Included
- **IntegrationService** (from Application Design)
- **IntegrationRepository** (from Application Design)

### User Stories Covered
- CONT-003: Slack OAuth Integration Setup
- CONT-004: Google Workspace OAuth Integration Setup
- CONT-006: Monitor External Service Connection Status
- CONT-008: Revoke Slack OAuth Tokens
- CONT-009: Revoke Google Workspace OAuth Tokens
- CONT-015: Handle OAuth API Failures

### Key Functionality
- OAuth configuration storage (encrypted)
- Slack API integration (`auth.revoke`)
- Google Workspace API integration (`tokens.delete`)
- API timeout and error handling
- Connection status checking
- Result formatting (SUCCESS/FAILURE/SKIPPED)

### Data Models
- `IntegrationConfig` (service_name, client_id, encrypted_client_secret, status, last_checked)
- `IntegrationResult` (service_name, status, error_message, processing_time)
- `IntegrationStatusMap` (Map<String, IntegrationStatus>)

### API Endpoints
- `POST /api/v1/integrations/slack`
- `POST /api/v1/integrations/google-workspace`
- `GET /api/v1/integrations/status`

### External Dependencies
- Slack API (OAuth 2.0, `auth.revoke`)
- Google Workspace Admin SDK (OAuth 2.0, `tokens.delete`)
- PostgreSQL (integration configs)

### Technology Stack
- Java 21
- Spring Boot (Service layer)
- Spring Data JPA (IntegrationRepository)
- RestTemplate/WebClient (HTTP client for external APIs)
- AES-256 encryption (OAuth token encryption)

### Success Criteria
- OAuth credentials stored securely (AES-256 encrypted)
- Slack token revocation completes in ≤500ms
- Google Workspace token revocation completes in ≤500ms
- API errors handled gracefully (timeout, rate limit, network error)
- Connection status accurately reported
- Unit tests + Property-Based Tests (encryption round-trip)

---

# Unit 3: Admin Dashboard & API

## Unit ID
`UNIT-003-DASHBOARD-API`

## Purpose
Implement the web-based admin dashboard backend API, including authentication, event monitoring, audit log querying, and webhook configuration management.

## Scope

### Components Included
- **WebController** (from Application Design)
- **NotificationService** (from Application Design)

### User Stories Covered
- CONT-001: Administrator Account Creation
- CONT-002: Administrator Login
- CONT-005: Webhook Configuration for HR/ERP Integration
- CONT-012: View Recent Offboarding Events on Dashboard
- CONT-013: View Offboarding Event Details
- CONT-014: Send Email Notification on Offboarding Completion
- CONT-016: Query Audit Logs by Date Range
- CONT-017: Search Audit Logs by Employee Email
- CONT-018: Filter Audit Logs by Status
- CONT-019: Export Audit Logs to CSV

### Key Functionality
- Admin authentication (login, session management)
- Webhook settings display (URL, API Key)
- API Key regeneration
- Recent events dashboard display
- Event detail view
- Audit log query (date range, email, status filters)
- Audit log CSV export
- Email notification sending (success/failure alerts)

### Data Models
- `AdminUser` (email, hashed_password, role)
- `LoginRequest`, `TokenResponse`
- `OffboardingEventSummary` (event_id, email, status, time)
- `OffboardingEventDetail` (full event + step breakdown)
- `AuditQueryFilter` (date_range, employee_email, status)
- `WebhookSettingsResponse` (webhook_url, api_key)

### API Endpoints
- `POST /api/v1/auth/login`
- `GET /api/v1/events/recent`
- `GET /api/v1/events/{eventId}`
- `GET /api/v1/webhook/settings`
- `POST /api/v1/webhook/regenerate-key`
- `GET /api/v1/audit/logs` (with query params)
- `GET /api/v1/audit/logs/export` (CSV download)

### External Dependencies
- SMTP Server (JavaMailSender for email notifications)
- PostgreSQL (admin users, cached query results)

### Technology Stack
- Java 21
- Spring Boot REST Controller
- Spring Security (authentication, authorization)
- JWT (session tokens) or Spring Session
- bcrypt (password hashing)
- OpenCSV (CSV export)
- Spring Mail (JavaMailSender)

### Success Criteria
- Admin login functional with secure password hashing
- Dashboard displays recent 10 events
- Event detail page shows step-by-step breakdown
- Audit log queries support all filters (date, email, status)
- CSV export generates valid CSV file
- Email notifications sent on offboarding completion
- API response times ≤2 seconds
- Unit tests for all endpoints

---

# Unit 4: Infrastructure & Deployment

## Unit ID
`UNIT-004-INFRASTRUCTURE`

## Purpose
Define and deploy the AWS infrastructure, database schema, caching layer, networking, and CI/CD pipeline.

## Scope

### Components Included
- AWS infrastructure resources (RDS, ElastiCache, ECS/EC2, ALB)
- Database schemas (PostgreSQL)
- Redis cache configuration
- Application configuration (application.yml, environment variables)
- CI/CD pipeline (GitHub Actions)

### User Stories Covered
- (Infrastructure enables all user stories but doesn't directly map to any)

### Key Functionality
- PostgreSQL database schema creation (tables, indexes, constraints)
- Redis cache configuration (connection, timeouts, eviction policies)
- AWS resource provisioning (RDS instance, ElastiCache cluster, ECS tasks, ALB)
- VPC and networking setup (subnets, security groups, routing)
- Application configuration management (environment-specific configs)
- CI/CD pipeline setup (build, test, deploy)
- Monitoring and logging configuration (CloudWatch Logs, metrics)

### Data Structures
- **PostgreSQL Tables**:
  - `admin_users` (id, email, password_hash, role, created_at)
  - `offboarding_events` (id, event_id UNIQUE, employee_email, offboarded_at, status, total_time, created_at)
  - `offboarding_steps` (id, event_id FK, service_name, status, error_message, processing_time)
  - `audit_logs` (id, event_id FK, employee_email, timestamp, status, details JSONB)
  - `integration_configs` (id, service_name UNIQUE, client_id, encrypted_client_secret, status, last_checked, created_at, updated_at)

- **Redis Keys**:
  - `session:{token}:{email}` (admin session data)
  - `session:employee:{email}` (employee active sessions - for clearing)
  - `api-key:current` (current API key for webhook auth)

### AWS Resources
- **Compute**: ECS Fargate service (2 tasks, 0.5 vCPU, 1GB RAM each) OR EC2 t3.micro instances
- **Database**: RDS PostgreSQL 15 (db.t3.micro, 20GB storage, Multi-AZ for production)
- **Cache**: ElastiCache Redis 7 (cache.t3.micro, 1 node for MVP)
- **Load Balancer**: Application Load Balancer (ALB) with HTTPS (TLS 1.3)
- **Networking**: VPC with public/private subnets, security groups, NAT gateway
- **Monitoring**: CloudWatch Logs (application logs), CloudWatch Metrics (custom metrics)

### Configuration Files
- `application.yml` (Spring Boot configuration)
- `application-dev.yml`, `application-prod.yml` (environment-specific)
- `.env.example` (environment variable template)
- CI/CD pipeline config (`.github/workflows/deploy.yml`)

### Success Criteria
- Database schema created with all tables and indexes
- Redis cache accessible from application
- AWS infrastructure deployed and accessible
- Application successfully deployed to AWS
- HTTPS endpoint functional
- CloudWatch logs receiving application logs
- CI/CD pipeline successfully builds and deploys application

---

## Unit Dependencies

### Dependency Matrix

| Unit | Depends On | Reason |
|---|---|---|
| UNIT-001 (Core Engine) | UNIT-004 (Infrastructure) | Needs PostgreSQL, Redis |
| UNIT-002 (Integrations) | UNIT-004 (Infrastructure) | Needs PostgreSQL for config storage |
| UNIT-003 (Dashboard API) | UNIT-001 (Core Engine), UNIT-002 (Integrations), UNIT-004 (Infrastructure) | Calls Core Engine services, displays Integration status, needs all infrastructure |
| UNIT-004 (Infrastructure) | None | Foundation layer |

### Recommended Implementation Sequence

1. **UNIT-004: Infrastructure & Deployment** (FIRST)
   - Reason: All other units depend on database and cache
   - Duration: 1-2 days
   - Deliverable: AWS infrastructure live, database schema created, application deployable

2. **UNIT-002: External Service Integrations** (SECOND)
   - Reason: Core Engine depends on IntegrationService
   - Duration: 1-2 days
   - Deliverable: OAuth integrations functional, token revocation tested

3. **UNIT-001: Core Offboarding Engine** (THIRD)
   - Reason: Dashboard depends on Core Engine services
   - Duration: 2-3 days
   - Deliverable: Webhook functional, offboarding workflow completes in ≤1 second

4. **UNIT-003: Admin Dashboard & API** (FOURTH)
   - Reason: Integrates all other units
   - Duration: 2-3 days
   - Deliverable: Full dashboard functional, all API endpoints working

**Total Estimated Duration**: 6-10 days (development + testing)

---

## Code Organization (Greenfield Monolith)

**Deployment Model**: Single Spring Boot JAR deployed to AWS ECS/EC2

**Directory Structure**:
```
continuum/
├── src/
│   ├── main/
│   │   ├── java/
│   │   │   └── com/
│   │   │       └── continuum/
│   │   │           ├── ContinuumApplication.java
│   │   │           ├── config/
│   │   │           │   ├── SecurityConfig.java
│   │   │           │   ├── RedisConfig.java
│   │   │           │   └── AsyncConfig.java
│   │   │           ├── web/
│   │   │           │   ├── controller/
│   │   │           │   │   ├── OffboardingController.java
│   │   │           │   │   ├── AuthController.java
│   │   │           │   │   ├── IntegrationController.java
│   │   │           │   │   └── AuditController.java
│   │   │           │   └── dto/
│   │   │           │       ├── OffboardingEventRequest.java
│   │   │           │       └── ...
│   │   │           ├── service/
│   │   │           │   ├── OffboardingService.java
│   │   │           │   ├── IntegrationService.java
│   │   │           │   ├── AuditService.java
│   │   │           │   └── NotificationService.java
│   │   │           ├── domain/
│   │   │           │   ├── OffboardingEngine.java
│   │   │           │   ├── SessionManager.java
│   │   │           │   └── model/
│   │   │           │       ├── OffboardingEvent.java
│   │   │           │       ├── OffboardingResult.java
│   │   │           │       └── ...
│   │   │           └── repository/
│   │   │               ├── OffboardingRepository.java
│   │   │               ├── IntegrationRepository.java
│   │   │               ├── AuditLogRepository.java
│   │   │               └── AdminUserRepository.java
│   │   └── resources/
│   │       ├── application.yml
│   │       ├── application-dev.yml
│   │       ├── application-prod.yml
│   │       └── db/
│   │           └── migration/
│   │               └── V1__initial_schema.sql
│   └── test/
│       └── java/
│           └── com/
│               └── continuum/
│                   ├── service/
│                   ├── domain/
│                   └── repository/
├── pom.xml (or build.gradle)
├── Dockerfile
├── .github/
│   └── workflows/
│       └── deploy.yml
└── README.md
```

**Package Organization**:
- `web`: Controllers, DTOs, request/response models
- `service`: Service layer (business orchestration)
- `domain`: Domain logic, engines, business rules
- `repository`: Data access layer (JPA repositories)
- `config`: Spring configuration classes

---

## Integration Testing Strategy

**Per-Unit Testing**:
- Each unit has its own unit tests and property-based tests
- Mocking external dependencies (e.g., Slack API, Google API)

**Cross-Unit Integration Testing** (after all units complete):
- Test end-to-end offboarding flow (Webhook → Core Engine → Integrations → Dashboard display)
- Test admin dashboard queries against real database
- Test email notifications triggered by offboarding events

**Performance Testing**:
- Measure offboarding end-to-end time (target: ≤1 second)
- Load test: 10 concurrent offboarding events

---

## Deployment Strategy

**Initial Deployment**:
1. Deploy UNIT-004 (Infrastructure) - AWS resources provisioned
2. Deploy application JAR with UNIT-002, UNIT-001, UNIT-003 integrated
3. Smoke test: Webhook endpoint accessible, login functional
4. Integration test: Full offboarding flow

**Rollback Strategy**:
- ECS: Revert to previous task definition
- EC2: Deploy previous JAR version
- Database: Flyway migrations (no rollback for MVP, manual intervention if needed)

---

**Document Version**: 1.0  
**Last Updated**: 2026-08-19  
**Author**: AI-DLC Units Generation  
**Status**: Ready for Review
