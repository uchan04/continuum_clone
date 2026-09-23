# Unit of Work Dependencies - Continuum

## Dependency Matrix

| From Unit | To Unit | Dependency Type | Reason | Strength |
|---|---|---|---|---|
| UNIT-001 (Core Engine) | UNIT-004 (Infrastructure) | Infrastructure | Needs PostgreSQL for OffboardingRepository, Redis for SessionManager | **Strong** (Blocking) |
| UNIT-001 (Core Engine) | UNIT-002 (Integrations) | Service Call | OffboardingEngine calls IntegrationService.revokeSlackToken(), revokeGoogleWorkspaceToken() | **Strong** (Blocking) |
| UNIT-002 (Integrations) | UNIT-004 (Infrastructure) | Infrastructure | Needs PostgreSQL for IntegrationRepository | **Strong** (Blocking) |
| UNIT-003 (Dashboard API) | UNIT-001 (Core Engine) | Service Call | WebController calls OffboardingService methods | **Strong** (Blocking) |
| UNIT-003 (Dashboard API) | UNIT-002 (Integrations) | Service Call | WebController calls IntegrationService methods | **Strong** (Blocking) |
| UNIT-003 (Dashboard API) | UNIT-004 (Infrastructure) | Infrastructure | Needs PostgreSQL for AdminUserRepository, SMTP for NotificationService | **Strong** (Blocking) |

---

## Dependency Graph

```
UNIT-004 (Infrastructure)
    ↑ (database, cache)
    ├─── UNIT-001 (Core Engine)
    │       ↑ (service calls)
    │       └─── UNIT-003 (Dashboard API)
    │
    └─── UNIT-002 (Integrations)
            ↑ (service calls)
            ├─── UNIT-001 (Core Engine)
            └─── UNIT-003 (Dashboard API)
```

**Legend**:
- `↑` : depends on (bottom depends on top)
- `(dependency type)` : nature of dependency

---

## Critical Path Analysis

### Critical Path (Longest Dependency Chain)
**UNIT-004 → UNIT-002 → UNIT-001 → UNIT-003**

1. **UNIT-004 (Infrastructure)** must be completed first
   - Provides PostgreSQL database
   - Provides Redis cache
   - Provides AWS infrastructure
   - Duration: 1-2 days

2. **UNIT-002 (Integrations)** can start after UNIT-004
   - Requires PostgreSQL for IntegrationRepository
   - Independent of UNIT-001 (can develop in parallel with UNIT-001 after UNIT-004)
   - Duration: 1-2 days

3. **UNIT-001 (Core Engine)** can start after UNIT-004 and UNIT-002
   - Requires PostgreSQL and Redis from UNIT-004
   - Requires IntegrationService from UNIT-002
   - Duration: 2-3 days

4. **UNIT-003 (Dashboard API)** must be last
   - Requires OffboardingService from UNIT-001
   - Requires IntegrationService from UNIT-002
   - Requires all infrastructure from UNIT-004
   - Duration: 2-3 days

---

## Parallel Development Opportunities

### Phase 1: Foundation (Day 1-2)
- **UNIT-004 (Infrastructure)** - SOLO TRACK
  - No dependencies, can proceed immediately
  - Deliverable: AWS infrastructure live, database schema deployed

### Phase 2: Service Layer (Day 3-4)
- **UNIT-002 (Integrations)** - TRACK A
  - Can start immediately after UNIT-004
  - Develop OAuth integration logic
  
- **UNIT-001 (Core Engine)** - TRACK B (depends on UNIT-002 for completion)
  - Can start skeleton code after UNIT-004
  - Mock IntegrationService initially
  - Integrate real IntegrationService when UNIT-002 completes

**Parallelization**: UNIT-001 and UNIT-002 can be developed in parallel for ~1 day, then UNIT-001 integration work continues after UNIT-002 completes.

### Phase 3: User Interface (Day 5-7)
- **UNIT-003 (Dashboard API)** - SOLO TRACK
  - Depends on UNIT-001 and UNIT-002 completion
  - No parallelization opportunity

---

## Dependency Details

### UNIT-001 → UNIT-002 (Service Call Dependency)

**Interface Contract**:
```java
public interface IntegrationService {
    IntegrationResult revokeSlackToken(String employeeEmail);
    IntegrationResult revokeGoogleWorkspaceToken(String employeeEmail);
}
```

**Data Contract**:
```java
public class IntegrationResult {
    private String serviceName;
    private Status status; // SUCCESS, FAILURE, SKIPPED
    private String errorMessage;
    private long processingTimeMs;
}
```

**Mocking Strategy** (for parallel development):
- UNIT-001 can use a mock IntegrationService during initial development
- Mock returns hardcoded `IntegrationResult` with SUCCESS status
- Replace with real IntegrationService when UNIT-002 completes

---

### UNIT-003 → UNIT-001 (Service Call Dependency)

**Interface Contract**:
```java
public interface OffboardingService {
    OffboardingResult processOffboardingEvent(OffboardingEvent event);
    List<OffboardingEventSummary> getRecentOffboardingEvents(int limit);
    OffboardingEventDetail getOffboardingEventDetails(String eventId);
}
```

**Data Contracts**: (See Application Design for full definitions)
- `OffboardingResult`, `OffboardingEventSummary`, `OffboardingEventDetail`

**Integration Point**: WebController directly calls OffboardingService methods via Spring DI

---

### UNIT-003 → UNIT-002 (Service Call Dependency)

**Interface Contract**:
```java
public interface IntegrationService {
    void configureSlackIntegration(SlackOAuthConfig config);
    void configureGoogleWorkspaceIntegration(GoogleOAuthConfig config);
    Map<String, IntegrationStatus> getIntegrationStatus();
}
```

**Integration Point**: WebController directly calls IntegrationService methods via Spring DI

---

### All Units → UNIT-004 (Infrastructure Dependency)

**Infrastructure Contracts**:

1. **PostgreSQL Database**:
   - Connection String: `jdbc:postgresql://${DB_HOST}:5432/${DB_NAME}`
   - Credentials: `${DB_USERNAME}`, `${DB_PASSWORD}`
   - Tables: `offboarding_events`, `audit_logs`, `integration_configs`, `admin_users`

2. **Redis Cache**:
   - Connection String: `redis://${REDIS_HOST}:6379`
   - Credentials: `${REDIS_PASSWORD}` (if auth enabled)
   - Key Patterns: `session:*`, `api-key:current`

3. **AWS ECS/EC2**:
   - Application listens on port 8080
   - ALB forwards HTTPS (443) to ECS tasks (8080)
   - Environment variables injected via ECS task definition

4. **CloudWatch Logs**:
   - Log Group: `/aws/ecs/continuum`
   - Log Stream: Application stdout/stderr

---

## Dependency Coordination Requirements

### Coordination Point 1: Database Schema Version
- **Responsible Unit**: UNIT-004 (Infrastructure)
- **Consumers**: UNIT-001, UNIT-002, UNIT-003
- **Coordination**: 
  - UNIT-004 creates initial schema (Flyway V1 migration)
  - All units use the same schema version
  - Schema changes in later units require new Flyway migrations

### Coordination Point 2: Spring Configuration
- **Responsible Unit**: UNIT-004 (Infrastructure)
- **Consumers**: All units
- **Coordination**:
  - `application.yml` defines all Spring configurations (datasource, Redis, etc.)
  - All units share the same Spring Boot application context

### Coordination Point 3: Service Interface Contracts
- **Responsible Units**: UNIT-001, UNIT-002
- **Consumers**: UNIT-003
- **Coordination**:
  - Service interfaces defined in UNIT-001 and UNIT-002
  - UNIT-003 depends on stable interfaces (no breaking changes)
  - Use @Transactional annotations consistently

---

## Risk Mitigation

### Risk: UNIT-002 Delayed → UNIT-001 Blocked
**Mitigation**: 
- UNIT-001 uses mock IntegrationService during development
- Integration testing deferred until UNIT-002 completes

### Risk: UNIT-004 Database Schema Incomplete
**Mitigation**:
- UNIT-004 includes comprehensive schema design review before starting UNIT-001/002
- All tables, indexes, constraints defined upfront

### Risk: UNIT-003 Discovers Missing Service Methods
**Mitigation**:
- Application Design already defined all service methods (Step 2 in workflow)
- UNIT-003 development reviews Application Design document before starting

---

## Testing Strategy Per Dependency

### UNIT-001 → UNIT-002 Integration Test
**Test Case**: Core Engine calls IntegrationService to revoke tokens
- Input: Employee email "test@example.com"
- Expected: IntegrationService returns SUCCESS or FAILURE
- Validation: Verify HTTP call to Slack API made (can use WireMock)

### UNIT-003 → UNIT-001 Integration Test
**Test Case**: Dashboard API calls OffboardingService to get recent events
- Input: GET /api/v1/events/recent?limit=10
- Expected: Response contains list of OffboardingEventSummary
- Validation: Verify database query executed, results serialized to JSON

### UNIT-003 → UNIT-002 Integration Test
**Test Case**: Dashboard API calls IntegrationService to configure Slack
- Input: POST /api/v1/integrations/slack with OAuth credentials
- Expected: Response 200 OK, integration status changes to "Connected"
- Validation: Verify IntegrationRepository saved config, Slack API tested

---

## Dependency Versioning

**Approach**: All units are part of the same Spring Boot monolith application, so no independent versioning required. All units share the same application version (e.g., `1.0.0-SNAPSHOT`).

**Deployment**: All units deployed together as a single JAR file.

---

**Document Version**: 1.0  
**Last Updated**: 2026-08-19  
**Author**: AI-DLC Units Generation  
**Status**: Ready for Review
