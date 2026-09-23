# Integration Test Instructions

## Purpose
Test the Employee vertical slice end-to-end against a real PostgreSQL database (via TestContainers), including JWT authentication.

## Test Scenarios

### Scenario 1: Full Employee Lifecycle (register → list → get → offboard)
- **Description**: `EmployeeControllerIntegrationTest.registerListGetOffboard_fullLifecycle`
- **Setup**: Ephemeral `postgres:15-alpine` TestContainer; Flyway runs `V1__initial_schema.sql` + `V2__create_employees_table.sql` automatically on context startup; JWT obtained via `JwtService.generateToken` for the seeded `admin@continuum.com` admin user
- **Test Steps**:
  1. `POST /api/v1/employees` with a unique email → expect `200` with `status: ACTIVE`
  2. Repeat the same `POST` → expect `409 Conflict` (BR1 uniqueness)
  3. `GET /api/v1/employees?q=<email>` → expect the new employee in `data.content`
  4. `GET /api/v1/employees/{id}` → expect `200`
  5. `DELETE /api/v1/employees/{id}` → expect `200` with `status: OFFBOARDED`
  6. Repeat `DELETE` on the same id → expect `409 Conflict` (BR5 idempotency)
- **Expected Results**: All assertions pass; no physical row deletion occurs (soft delete only, BR4)
- **Cleanup**: Automatic — TestContainer is torn down after the test class

### Scenario 2: Not Found
- **Description**: `EmployeeControllerIntegrationTest.getById_returnsNotFound_forMissingEmployee`
- **Test Steps**: `GET /api/v1/employees/999999999`
- **Expected Results**: `404 Not Found`

### Scenario 3: Authentication Required
- **Description**: `EmployeeControllerIntegrationTest.endpoints_requireAuthentication`
- **Test Steps**: `GET /api/v1/employees` with no `Authorization` header
- **Expected Results**: `401 Unauthorized` (confirms `/api/v1/employees/**` is covered by the existing `SecurityConfig` rule — no config change was needed for this cycle)

## Setup Integration Test Environment

### 1. Start Required Services
```bash
# Docker must be running — TestContainers starts/stops postgres:15-alpine automatically per test class.
# No manual docker-compose step needed for this test.
```

### 2. Configure Service Endpoints
No manual endpoint configuration needed — `@DynamicPropertySource` in the test class wires the TestContainer's JDBC URL and a test-only JWT secret/encryption key at runtime.

## Run Integration Tests

### 1. Execute Integration Test Suite
```bash
./gradlew integrationTest
```

To run only the new Employee integration test:
```bash
./gradlew integrationTest --tests "com.continuum.EmployeeControllerIntegrationTest"
```

### 2. Verify Service Interactions
- **Test Scenarios**: 3 (lifecycle, not-found, auth-required) — see above
- **Expected Results**: All pass; database schema validated against both `V1` and `V2` migrations
- **Logs Location**: `build/reports/tests/integrationTest/index.html`, console output includes Testcontainers container startup logs

### 3. Cleanup
```bash
# No manual cleanup needed — TestContainers removes the container after the JVM exits.
docker ps -a | grep postgres  # confirm no orphaned containers remain, if needed
```

## Verification Status (this environment)
Could not be executed here — no JDK installed, and TestContainers additionally requires a running Docker daemon. The test was written against the actual `EmployeeController`/`EmployeeService`/`GlobalExceptionHandler` classes and the project's existing `CustomUserDetailsService`/`JwtService` beans. Run `./gradlew integrationTest` locally/CI (Java 21 + Docker available) to get actual results.
