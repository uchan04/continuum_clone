# System Architecture

## System Overview
Continuum is a single Spring Boot monolith (`com.continuum`) backed by PostgreSQL and Redis, paired with a separate React/Vite admin dashboard (`frontend/`). It is deployed as a container (ECS Fargate in AWS design docs, or Docker Compose locally).

## Architecture Diagram

```mermaid
flowchart TB
    subgraph Frontend["frontend/ (React + Vite)"]
        App[App.tsx - nav tabs: overview, events, integrations, audit, settings, handoff]
    end

    subgraph Backend["Spring Boot App (com.continuum)"]
        Web[web/controller - REST controllers]
        Service[service/* - business services]
        Domain[domain/* - OffboardingEngine, SessionManager, models]
        Repo[repository/* - Spring Data JPA]
    end

    DB[(PostgreSQL - Flyway managed)]
    Redis[(Redis - sessions)]
    Slack[Slack API]
    Google[Google Workspace API]

    App -->|REST /api/v1/*| Web
    Web --> Service
    Service --> Domain
    Domain --> Repo
    Repo --> DB
    Domain --> Redis
    Service --> Slack
    Service --> Google
```

## Component Descriptions

### web/controller
- **Purpose**: REST API surface
- **Responsibilities**: AuthController, EventController, AuditController, IntegrationController, OffboardingController
- **Dependencies**: service layer
- **Type**: Application

### service
- **Purpose**: Business logic
- **Responsibilities**: OffboardingService, IntegrationService, AuditService, EncryptionService, NotificationService
- **Dependencies**: domain, repository
- **Type**: Application

### domain
- **Purpose**: Core domain logic and models
- **Responsibilities**: OffboardingEngine (parallel token revocation), SessionManager, model/* (AdminUser, AuditLog, IntegrationConfig, OffboardingEvent, OffboardingResult, OffboardingStep)
- **Dependencies**: repository
- **Type**: Application
- **Note**: No `Employee` model exists

### repository
- **Purpose**: Persistence (Spring Data JPA)
- **Responsibilities**: One repository per entity (AdminUserRepository, AuditLogRepository, IntegrationConfigRepository, OffboardingEventRepository, OffboardingStepRepository)
- **Dependencies**: PostgreSQL via Flyway-managed schema
- **Type**: Application

### frontend
- **Purpose**: Admin dashboard SPA
- **Responsibilities**: Single `App.tsx` (1573 lines) containing all tabs/views and API calls via a shared `apiRequest` helper
- **Dependencies**: Backend REST API (JWT bearer auth)
- **Type**: Application

## Data Flow

```mermaid
sequenceDiagram
    participant HR as HR/ERP System
    participant API as OffboardingController
    participant Svc as OffboardingService
    participant Eng as OffboardingEngine
    participant Slack
    participant Google
    participant DB as PostgreSQL

    HR->>API: POST /api/v1/offboarding/event
    API->>Svc: process(event)
    Svc->>DB: persist OffboardingEvent
    Svc->>Eng: revoke(event)
    par Parallel revocation
        Eng->>Slack: revoke OAuth token
        Eng->>Google: revoke OAuth token
    end
    Eng->>DB: persist OffboardingStep results
    Svc->>DB: write AuditLog
```

## Integration Points
- **External APIs**: Slack API (OAuth revoke), Google Workspace Admin API (OAuth revoke)
- **Databases**: PostgreSQL (primary store, Flyway migrations), Redis (session/cache)
- **Third-party Services**: SMTP (notification service) for HR email alerts

## Infrastructure Components
- **Deployment Model**: Docker Compose locally; AWS ECS Fargate per `aidlc-docs/construction/build-and-test/`
- **Networking**: Not yet provisioned as IaC in this repo (design-only, per prior construction docs)
