# Build and Test Summary - Continuum

## Overview
This document provides comprehensive build, test, and deployment instructions for the Continuum MVP application.

---

## Prerequisites

### Required Software
- **Java 21 JDK** (Amazon Corretto, OpenJDK, or Oracle JDK)
- **Gradle 8.5+** or **Maven 3.9+**
- **Docker** (for containerization)
- **PostgreSQL 15** (local development)
- **Redis 7** (local development)
- **AWS CLI** (for deployment)

### Development Environment Setup

```bash
# Install Java 21 (macOS with Homebrew)
brew install openjdk@21

# Install PostgreSQL
brew install postgresql@15
brew services start postgresql@15

# Install Redis
brew install redis
brew services start redis

# Create database
createdb continuum

# Set environment variables
export JAVA_HOME=/opt/homebrew/opt/openjdk@21
export DB_HOST=localhost
export DB_NAME=continuum
export DB_USERNAME=postgres
export DB_PASSWORD=postgres
export REDIS_HOST=localhost
export REDIS_PASSWORD=
export ENCRYPTION_SECRET_KEY=$(openssl rand -base64 32)
export JWT_SECRET=$(openssl rand -base64 64)
export SMTP_HOST=smtp.gmail.com
export SMTP_PORT=587
export SMTP_USERNAME=your-email@gmail.com
export SMTP_PASSWORD=your-app-password
export HR_MANAGER_EMAIL=hr@company.com
```

---

## Project Structure

```
continuum/
├── src/
│   ├── main/
│   │   ├── java/com/continuum/
│   │   └── resources/
│   │       ├── application.yml
│   │       ├── application-dev.yml
│   │       ├── application-prod.yml
│   │       └── db/migration/
│   │           └── V1__initial_schema.sql
│   └── test/
│       └── java/com/continuum/
├── build.gradle (or pom.xml)
├── Dockerfile
├── docker-compose.yml
├── .github/workflows/
│   └── ci-cd.yml
└── README.md
```

---

## Build Instructions

### Option 1: Gradle

```bash
# Clean and build
./gradlew clean build

# Build without tests (faster)
./gradlew clean build -x test

# Build Docker image
./gradlew bootBuildImage --imageName=continuum:latest
```

### Option 2: Maven

```bash
# Clean and build
./mvnw clean package

# Build without tests
./mvnw clean package -DskipTests

# Build Docker image
./mvnw spring-boot:build-image -Dspring-boot.build-image.imageName=continuum:latest
```

### Build Output
- **JAR file**: `build/libs/continuum-1.0.0.jar` (Gradle) or `target/continuum-1.0.0.jar` (Maven)
- **Docker image**: `continuum:latest`

---

## Test Instructions

### Unit Tests

```bash
# Run all unit tests
./gradlew test

# Run specific test class
./gradlew test --tests "OffboardingServiceTest"

# Run tests with coverage
./gradlew test jacocoTestReport
```

**Expected Coverage**: ≥70% for core business logic

### Property-Based Tests (jqwik)

```bash
# Run all property-based tests
./gradlew test --tests "*PropertyTest"

# Run specific PBT
./gradlew test --tests "EncryptionServicePropertyTest"
```

**PBT Focus Areas**:
- `EncryptionServicePropertyTest`: Encrypt/decrypt round-trip
- `OffboardingEnginePropertyTest`: Result aggregation idempotency
- `AuditServicePropertyTest`: Query consistency

### Integration Tests

```bash
# Run integration tests (requires TestContainers)
./gradlew integrationTest

# Run specific integration test
./gradlew integrationTest --tests "OffboardingIntegrationTest"
```

**Integration Test Coverage**:
- End-to-end offboarding flow (Webhook → Core Engine → Database)
- External API mocking (Slack, Google Workspace with WireMock)
- Database operations (Spring Boot Test + TestContainers)

### Performance Tests

```bash
# Run performance tests
./gradlew performanceTest

# Measure offboarding duration
./gradlew test --tests "OffboardingPerformanceTest"
```

**Performance Criteria**:
- Offboarding processing time: ≤1 second (end-to-end)
- API response time: ≤2 seconds for dashboard queries
- Database queries: ≤100ms for single lookups

### Test Reports

```bash
# Generate test report
./gradlew test
open build/reports/tests/test/index.html

# Generate coverage report
./gradlew jacocoTestReport
open build/reports/jacoco/test/html/index.html
```

---

## Running Locally

### Option 1: Run with Gradle/Maven

```bash
# Run application (Gradle)
./gradlew bootRun

# Run application (Maven)
./mvnw spring-boot:run

# Run with specific profile
./gradlew bootRun --args='--spring.profiles.active=dev'
```

**Application URL**: `http://localhost:8080`
**Health Check**: `http://localhost:8080/actuator/health`

### Option 2: Run with Docker Compose

```bash
# Start all services (app + PostgreSQL + Redis)
docker-compose up -d

# View logs
docker-compose logs -f continuum

# Stop services
docker-compose down
```

**docker-compose.yml**:
```yaml
version: '3.8'
services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: continuum
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    ports:
      - "5432:5432"
  
  redis:
    image: redis:7
    ports:
      - "6379:6379"
  
  continuum:
    image: continuum:latest
    depends_on:
      - postgres
      - redis
    environment:
      DB_HOST: postgres
      REDIS_HOST: redis
      ENCRYPTION_SECRET_KEY: ${ENCRYPTION_SECRET_KEY}
      JWT_SECRET: ${JWT_SECRET}
    ports:
      - "8080:8080"
```

---

## Database Migration

**Flyway** manages database schema migrations automatically.

### Migration Files
- Location: `src/main/resources/db/migration/`
- Naming: `V{version}__{description}.sql`
- Example: `V1__initial_schema.sql`

### Migration on Startup
Spring Boot automatically runs Flyway migrations when the application starts.

```yaml
# application.yml
spring:
  flyway:
    enabled: true
    baseline-on-migrate: true
```

### Manual Migration Commands

```bash
# Show migration status
./gradlew flywayInfo

# Run migrations
./gradlew flywayMigrate

# Rollback (use with caution)
./gradlew flywayClean
```

---

## API Testing

### Manual Testing with curl

#### 1. Login (Get JWT Token)
```bash
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@continuum.com",
    "password": "admin123"
  }'

# Response:
# {"token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...", "expires_at": "..."}
```

#### 2. Send Offboarding Event (Webhook)
```bash
curl -X POST http://localhost:8080/api/v1/offboarding/event \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-api-key" \
  -d '{
    "event_id": "evt_test_001",
    "event_type": "employee.offboarded",
    "employee_email": "john.doe@company.com",
    "offboarded_at": "2026-08-19T10:30:00Z"
  }'

# Response: 202 Accepted
```

#### 3. Get Recent Events
```bash
TOKEN="your-jwt-token"

curl -X GET "http://localhost:8080/api/v1/events/recent?limit=10" \
  -H "Authorization: Bearer $TOKEN"
```

#### 4. Configure Slack Integration
```bash
curl -X POST http://localhost:8080/api/v1/integrations/slack \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "client_id": "slack_client_id",
    "client_secret": "slack_client_secret"
  }'
```

### Automated API Testing

**Postman Collection**: Import `continuum-api-collection.json` (create this collection)

---

## Deployment to AWS

### Prerequisites
- AWS CLI configured (`aws configure`)
- ECR repository created
- ECS cluster and service created (see Infrastructure Design)

### Step 1: Build and Push Docker Image

```bash
# Authenticate Docker to ECR
aws ecr get-login-password --region us-east-1 | \
  docker login --username AWS --password-stdin \
  123456789012.dkr.ecr.us-east-1.amazonaws.com

# Build Docker image
docker build -t continuum:latest .

# Tag image
docker tag continuum:latest \
  123456789012.dkr.ecr.us-east-1.amazonaws.com/continuum:latest

# Push to ECR
docker push 123456789012.dkr.ecr.us-east-1.amazonaws.com/continuum:latest
```

### Step 2: Update ECS Service

```bash
# Force new deployment (pulls latest image)
aws ecs update-service \
  --cluster continuum-cluster \
  --service continuum-service \
  --force-new-deployment \
  --region us-east-1
```

### Step 3: Verify Deployment

```bash
# Check service status
aws ecs describe-services \
  --cluster continuum-cluster \
  --services continuum-service \
  --region us-east-1

# Check task health
aws ecs list-tasks \
  --cluster continuum-cluster \
  --service-name continuum-service \
  --region us-east-1

# View application logs
aws logs tail /aws/ecs/continuum --follow
```

### Step 4: Smoke Test

```bash
# Health check
curl https://continuum.your-domain.com/actuator/health

# Login test
curl -X POST https://continuum.your-domain.com/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@continuum.com","password":"admin123"}'
```

---

## CI/CD Pipeline

**GitHub Actions** (`.github/workflows/ci-cd.yml`):

```yaml
name: CI/CD

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Set up JDK 21
        uses: actions/setup-java@v3
        with:
          java-version: '21'
          distribution: 'corretto'
      
      - name: Build with Gradle
        run: ./gradlew build
      
      - name: Run tests
        run: ./gradlew test
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
  
  deploy:
    needs: build
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v3
      
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v2
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-east-1
      
      - name: Build and push Docker image
        run: |
          aws ecr get-login-password | docker login --username AWS --password-stdin ${{ secrets.ECR_REPOSITORY }}
          docker build -t continuum:${{ github.sha }} .
          docker tag continuum:${{ github.sha }} ${{ secrets.ECR_REPOSITORY }}:latest
          docker push ${{ secrets.ECR_REPOSITORY }}:latest
      
      - name: Deploy to ECS
        run: |
          aws ecs update-service --cluster continuum-cluster --service continuum-service --force-new-deployment
```

---

## Monitoring and Logging

### Application Logs

```bash
# View CloudWatch logs (AWS)
aws logs tail /aws/ecs/continuum --follow

# View local logs (Docker)
docker logs -f continuum-app
```

### Health Checks

```bash
# Application health
curl http://localhost:8080/actuator/health

# Database connectivity
curl http://localhost:8080/actuator/health/db

# Redis connectivity
curl http://localhost:8080/actuator/health/redis
```

### Metrics

**Spring Boot Actuator Endpoints**:
- `/actuator/metrics` - All metrics
- `/actuator/metrics/offboarding.duration` - Offboarding processing time
- `/actuator/metrics/http.server.requests` - API request metrics

**Custom CloudWatch Metrics**:
```java
@Component
public class OffboardingMetrics {
    private final MeterRegistry meterRegistry;
    
    public void recordOffboardingDuration(long durationMs) {
        meterRegistry.timer("offboarding.duration").record(durationMs, TimeUnit.MILLISECONDS);
    }
    
    public void incrementOffboardingSuccess() {
        meterRegistry.counter("offboarding.success").increment();
    }
    
    public void incrementOffboardingFailure() {
        meterRegistry.counter("offboarding.failure").increment();
    }
}
```

---

## Troubleshooting

### Common Issues

#### Issue 1: Database Connection Refused
```
Error: org.postgresql.util.PSQLException: Connection refused
```

**Solution**:
- Check PostgreSQL is running: `brew services list`
- Verify `DB_HOST`, `DB_USERNAME`, `DB_PASSWORD` environment variables
- Check PostgreSQL accepts connections: `psql -h localhost -U postgres`

#### Issue 2: Redis Connection Timeout
```
Error: io.lettuce.core.RedisConnectionException: Unable to connect
```

**Solution**:
- Check Redis is running: `brew services list`
- Verify `REDIS_HOST` environment variable
- Test Redis: `redis-cli ping` (should return PONG)

#### Issue 3: Offboarding Takes >1 Second
```
Performance test failed: offboarding took 1250ms
```

**Solution**:
- Check external API latencies (Slack, Google Workspace)
- Review CompletableFuture timeout configuration
- Check database query performance (use EXPLAIN ANALYZE)

#### Issue 4: JWT Token Invalid
```
Error: 401 Unauthorized - Invalid JWT signature
```

**Solution**:
- Verify `JWT_SECRET` environment variable is consistent across restarts
- Check JWT expiration time (default: 24 hours)
- Regenerate token: POST `/api/v1/auth/login`

---

## Performance Benchmarks

### Expected Metrics (MVP)

| Metric | Target | Actual |
|---|---|---|
| Offboarding Duration (end-to-end) | ≤1.0s | [Test result] |
| API Response Time (dashboard) | ≤2.0s | [Test result] |
| Database Query Time (single row) | ≤100ms | [Test result] |
| Redis Operation Time | ≤10ms | [Test result] |
| Concurrent Offboarding (10 events) | All complete in ≤2s | [Test result] |

### Load Testing

```bash
# Install Apache Bench
brew install httpd

# Benchmark webhook endpoint (10 concurrent, 100 requests)
ab -n 100 -c 10 -H "X-API-Key: your-api-key" \
   -p offboarding-event.json \
   -T application/json \
   http://localhost:8080/api/v1/offboarding/event
```

---

## Security Checklist

- [ ] All passwords hashed with bcrypt (strength ≥12)
- [ ] OAuth secrets encrypted with AES-256
- [ ] JWT tokens signed with HS256
- [ ] HTTPS enabled (TLS 1.3)
- [ ] API Key authentication for webhook
- [ ] CORS configured (if separate frontend)
- [ ] SQL injection prevented (use parameterized queries)
- [ ] Input validation on all endpoints
- [ ] Secrets stored in environment variables (never in code)
- [ ] CloudWatch logs do NOT contain secrets

---

## Next Steps

1. **Code Review**: Review all generated code for quality and security
2. **Manual Testing**: Test all API endpoints with Postman/curl
3. **Integration Testing**: Test end-to-end offboarding flow
4. **Performance Testing**: Validate 1-second offboarding goal
5. **Security Audit**: Run security scan (OWASP ZAP, SonarQube)
6. **Deploy to Staging**: Test in AWS staging environment
7. **UAT**: User acceptance testing with stakeholders
8. **Deploy to Production**: Final deployment

---

**Document Version**: 1.0  
**Last Updated**: 2026-08-19  
**Author**: AI-DLC Build & Test  
**Status**: Complete

---

# Addendum: Employee Management (Feature Cycle 2)

## Build Status
- **Build Tool**: Gradle (backend), Vite (frontend)
- **Build Status**:
  - Frontend: ✅ Success — `npx tsc --noEmit` (0 errors), `npx vite build` (built in ~88ms, `dist/assets/index-*.js` 240.19 kB / gzip 71.40 kB)
  - Backend: ⚠️ **Not verified in this environment** — no JDK installed (`java -version`: "Unable to locate a Java Runtime"). New files compile-checked by inspection against existing classes only.
- **Build Artifacts**: `frontend/dist/` generated and verified. `build/libs/continuum-*.jar` not generated here — requires local/CI run with Java 21.

## Test Execution Summary

### Unit Tests
- **Total Tests (new this cycle)**: 5 (`EmployeeServiceTest`) + 2 properties (`EmployeePropertyTest`, jqwik)
- **Passed / Failed**: Not executed here (no JDK) — see `unit-test-instructions.md`
- **Status**: Pending local/CI run

### Integration Tests
- **Test Scenarios (new this cycle)**: 3 (`EmployeeControllerIntegrationTest` — full lifecycle, not-found, auth-required), via TestContainers PostgreSQL
- **Passed / Failed**: Not executed here (no JDK + Docker daemon not exercised) — see `integration-test-instructions.md`
- **Status**: Pending local/CI run

### Performance Tests
- **Status**: N/A — no new performance requirements introduced by this feature (reuses existing DB/auth infra; not part of the 1-second offboarding critical path)

### Additional Tests
- **Contract Tests**: N/A — no cross-service contracts changed
- **Security Tests**: N/A — new endpoints reuse existing JWT auth (`/api/v1/**` rule), no new auth surface introduced
- **E2E Tests**: N/A — not in scope for this cycle; frontend build verified instead (see above)

## Overall Status
- **Build**: Frontend verified success; Backend requires local/CI verification (Java 21)
- **All Tests**: Not run in this environment — generated code follows existing project conventions (Controller→Service→Repository, Mockito/JUnit5, jqwik, TestContainers) but is unverified until `./gradlew test integrationTest` is run where Java 21 + Docker are available
- **Ready for Operations**: **No** — pending the user (or CI) running the backend build/test suite locally

## Next Steps
1. Run `./gradlew clean build` and `./gradlew integrationTest` in an environment with Java 21 + Docker
2. Fix any compilation or test failures surfaced
3. Manually smoke-test the new "직원 관리" (Employee Management) tab against a running backend (`./gradlew bootRun` + `cd frontend && pnpm dev`)
4. Once green, this feature is ready for the same Operations/deployment path as the rest of the MVP

