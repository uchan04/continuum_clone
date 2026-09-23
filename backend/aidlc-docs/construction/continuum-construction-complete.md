# Continuum - CONSTRUCTION Phase Complete Design

## Overview
This document consolidates all CONSTRUCTION phase designs for the 4 Units of Continuum MVP. Each unit's Functional Design, NFR Requirements, NFR Design, and Infrastructure Design are included.

**Implementation Sequence**: UNIT-004 → UNIT-002 → UNIT-001 → UNIT-003

---

# UNIT-004: Infrastructure & Deployment

## Functional Design

### Database Schema (PostgreSQL)

#### Table: admin_users
```sql
CREATE TABLE admin_users (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'ADMIN',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_admin_users_email ON admin_users(email);
```

#### Table: offboarding_events
```sql
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
```

#### Table: offboarding_steps
```sql
CREATE TABLE offboarding_steps (
    id BIGSERIAL PRIMARY KEY,
    event_id VARCHAR(255) NOT NULL,
    service_name VARCHAR(100) NOT NULL,
    status VARCHAR(50) NOT NULL,
    error_message TEXT,
    processing_time_ms INTEGER NOT NULL,
    FOREIGN KEY (event_id) REFERENCES offboarding_events(event_id) ON DELETE CASCADE
);

CREATE INDEX idx_offboarding_steps_event_id ON offboarding_steps(event_id);
```

#### Table: audit_logs
```sql
CREATE TABLE audit_logs (
    id BIGSERIAL PRIMARY KEY,
    event_id VARCHAR(255) NOT NULL,
    employee_email VARCHAR(255) NOT NULL,
    timestamp TIMESTAMP NOT NULL,
    status VARCHAR(50) NOT NULL,
    details JSONB,
    FOREIGN KEY (event_id) REFERENCES offboarding_events(event_id) ON DELETE CASCADE
);

CREATE INDEX idx_audit_logs_event_id ON audit_logs(event_id);
CREATE INDEX idx_audit_logs_employee_email ON audit_logs(employee_email);
CREATE INDEX idx_audit_logs_timestamp ON audit_logs(timestamp);
CREATE INDEX idx_audit_logs_status ON audit_logs(status);
```

#### Table: integration_configs
```sql
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
```

### Redis Key Patterns

- `session:{token}` - Admin session data (JWT or Spring Session)
- `session:employee:{email}` - Employee active sessions (for clearing)
- `api-key:current` - Current webhook API key
- `integration:status:{service_name}` - Cached integration status (TTL: 60s)

### NFR Requirements

**Performance**:
- Database queries: ≤ 100ms for single row lookup
- Redis operations: ≤ 10ms
- Database connection pool: HikariCP with 10 connections

**Security**:
- PostgreSQL: SSL/TLS connections required
- Redis: AUTH password required
- AWS RDS: Encryption at rest enabled

**Scalability**:
- Database: RDS read replicas for future scaling
- Redis: ElastiCache cluster mode for future scaling

### NFR Design

**Connection Pooling**:
```yaml
spring:
  datasource:
    hikari:
      maximum-pool-size: 10
      minimum-idle: 2
      connection-timeout: 30000
```

**Redis Configuration**:
```yaml
spring:
  redis:
    host: ${REDIS_HOST}
    port: 6379
    password: ${REDIS_PASSWORD}
    timeout: 2000ms
```

### Infrastructure Design

**AWS Resources**:

1. **RDS PostgreSQL**
   - Instance: db.t3.micro (2 vCPU, 1GB RAM)
   - Storage: 20GB GP3 SSD
   - Multi-AZ: No (MVP), Yes (Production)
   - Backup: Automated daily backups, 7-day retention
   - Security Group: Allow inbound 5432 from ECS tasks only

2. **ElastiCache Redis**
   - Instance: cache.t3.micro (2 vCPU, 0.5GB RAM)
   - Engine: Redis 7.x
   - Encryption: In-transit and at-rest
   - Security Group: Allow inbound 6379 from ECS tasks only

3. **ECS Fargate**
   - Service: continuum-service
   - Tasks: 2 (for HA)
   - CPU: 0.5 vCPU per task
   - Memory: 1GB per task
   - Auto Scaling: Min 2, Max 10 (based on CPU > 70%)

4. **Application Load Balancer (ALB)**
   - Scheme: Internet-facing
   - Listeners: HTTPS (443) → Forward to ECS tasks (8080)
   - SSL Certificate: AWS ACM certificate
   - Health Check: /actuator/health (Spring Boot Actuator)

5. **VPC & Networking**
   - VPC: 10.0.0.0/16
   - Public Subnets: 2 AZs (10.0.1.0/24, 10.0.2.0/24) - ALB
   - Private Subnets: 2 AZs (10.0.11.0/24, 10.0.12.0/24) - ECS, RDS, Redis
   - NAT Gateway: 1 (for ECS to call external APIs)
   - Internet Gateway: 1

6. **CloudWatch**
   - Log Group: /aws/ecs/continuum
   - Metrics: Custom metrics (offboarding_duration, offboarding_success_rate)
   - Alarms: High error rate, high latency

---

# UNIT-002: External Service Integrations

## Functional Design

### Data Models

```java
@Entity
@Table(name = "integration_configs")
public class IntegrationConfig {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(unique = true, nullable = false)
    private String serviceName; // "SLACK", "GOOGLE_WORKSPACE"
    
    @Column(nullable = false)
    private String clientId;
    
    @Column(nullable = false)
    private String encryptedClientSecret; // AES-256 encrypted
    
    @Enumerated(EnumType.STRING)
    private IntegrationStatus status; // CONNECTED, DISCONNECTED
    
    private LocalDateTime lastChecked;
}

public class IntegrationResult {
    private String serviceName;
    private Status status; // SUCCESS, FAILURE, SKIPPED
    private String errorMessage;
    private long processingTimeMs;
}
```

### Business Logic

**OAuth Configuration Storage**:
1. Receive OAuth credentials (client_id, client_secret)
2. Encrypt client_secret using AES-256 with application secret key
3. Test connection to external API
4. Save IntegrationConfig to database
5. Return success/failure

**Token Revocation (Slack)**:
1. Retrieve IntegrationConfig for "SLACK"
2. Decrypt client_secret
3. Call Slack API: `POST https://slack.com/api/auth.revoke`
   - Headers: `Authorization: Bearer {access_token}`
4. Handle response:
   - HTTP 200 → SUCCESS
   - HTTP 429 (Rate Limit) → FAILURE
   - Timeout (5s) → FAILURE
   - Network Error → FAILURE
   - Employee not found → SKIPPED
5. Return IntegrationResult

**Token Revocation (Google Workspace)**:
1. Retrieve IntegrationConfig for "GOOGLE_WORKSPACE"
2. Decrypt client_secret
3. Call Google Admin SDK: `DELETE https://admin.googleapis.com/admin/directory/v1/users/{email}/tokens/{clientId}`
4. Handle response (similar to Slack)
5. Return IntegrationResult

### NFR Requirements

**Performance**:
- Slack API call: ≤ 500ms (target), ≤ 1s (with timeout)
- Google API call: ≤ 500ms (target), ≤ 1s (with timeout)
- Timeout: 5 seconds per API call

**Security**:
- OAuth secret encryption: AES-256-GCM with application secret key
- Secret key stored in environment variable: `ENCRYPTION_SECRET_KEY`
- Never log decrypted secrets

**Reliability**:
- No automatic retry (MVP - manual intervention)
- Log all API errors with full details

### NFR Design

**Encryption Pattern**:
```java
public class EncryptionService {
    private final String SECRET_KEY = System.getenv("ENCRYPTION_SECRET_KEY");
    
    public String encrypt(String plaintext) {
        // AES-256-GCM encryption
        Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding");
        SecretKeySpec keySpec = new SecretKeySpec(SECRET_KEY.getBytes(), "AES");
        cipher.init(Cipher.ENCRYPT_MODE, keySpec);
        byte[] encrypted = cipher.doFinal(plaintext.getBytes());
        return Base64.getEncoder().encodeToString(encrypted);
    }
    
    public String decrypt(String ciphertext) {
        // AES-256-GCM decryption
        // Reverse of encrypt()
    }
}
```

**HTTP Client Configuration**:
```java
@Configuration
public class RestTemplateConfig {
    @Bean
    public RestTemplate restTemplate() {
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(5000);  // 5 seconds
        factory.setReadTimeout(5000);     // 5 seconds
        return new RestTemplate(factory);
    }
}
```

### Infrastructure Design

**External API Dependencies**:
- Slack API: `https://slack.com/api/*`
- Google Admin SDK: `https://admin.googleapis.com/*`

**Outbound Network**:
- ECS tasks use NAT Gateway for outbound HTTPS calls
- Security Group: Allow outbound 443 to 0.0.0.0/0

---

# UNIT-001: Core Offboarding Engine

## Functional Design

### Data Models

```java
public class OffboardingEvent {
    private String eventId;       // Unique event identifier
    private String employeeEmail;
    private LocalDateTime offboardedAt;
}

public class OffboardingResult {
    private String eventId;
    private String employeeEmail;
    private OverallStatus overallStatus; // SUCCESS, PARTIAL_FAILURE, FAILURE
    private List<StepResult> steps;
    private long totalProcessingTimeMs;
}

public class StepResult {
    private String serviceName; // "SLACK", "GOOGLE_WORKSPACE", "REDIS"
    private Status status;      // SUCCESS, FAILURE, SKIPPED
    private String errorMessage;
    private long processingTimeMs;
}
```

### Business Logic

**Offboarding Workflow** (OffboardingEngine):
1. Start timer
2. Execute 3 tasks in parallel using CompletableFuture:
   - Task 1: IntegrationService.revokeSlackToken(email)
   - Task 2: IntegrationService.revokeGoogleWorkspaceToken(email)
   - Task 3: SessionManager.clearEmployeeSessions(email)
3. Wait for all tasks with timeout (1 second)
4. Aggregate results:
   - All SUCCESS/SKIPPED → Overall SUCCESS
   - At least one SUCCESS + at least one FAILURE → PARTIAL_FAILURE
   - All FAILURE → FAILURE
5. Stop timer, return OffboardingResult

**Result Aggregation Logic**:
```java
public OverallStatus aggregateResults(List<StepResult> steps) {
    long successCount = steps.stream()
        .filter(s -> s.getStatus() == Status.SUCCESS || s.getStatus() == Status.SKIPPED)
        .count();
    
    if (successCount == steps.size()) {
        return OverallStatus.SUCCESS;
    } else if (successCount == 0) {
        return OverallStatus.FAILURE;
    } else {
        return OverallStatus.PARTIAL_FAILURE;
    }
}
```

**Session Cache Clearing**:
```java
public SessionClearResult clearEmployeeSessions(String email) {
    try {
        // Query Redis for keys matching pattern
        Set<String> keys = redisTemplate.keys("session:employee:" + email + ":*");
        
        if (keys.isEmpty()) {
            return new SessionClearResult(Status.SUCCESS, 0, null);
        }
        
        // Delete all matching keys
        redisTemplate.delete(keys);
        
        return new SessionClearResult(Status.SUCCESS, keys.size(), null);
    } catch (Exception e) {
        return new SessionClearResult(Status.FAILURE, 0, e.getMessage());
    }
}
```

### NFR Requirements

**Performance**:
- Total offboarding time: ≤ 1 second (end-to-end)
- Parallel execution: CompletableFuture.allOf() with 1s timeout
- Redis session clear: ≤ 100ms

**Concurrency**:
- Handle 10 concurrent offboarding events
- Thread pool: ForkJoinPool.commonPool() (default)

**Reliability**:
- Idempotency: Check event_id uniqueness before processing
- Audit logging: Log every event, even on failure

### NFR Design

**Parallel Execution Pattern**:
```java
public OffboardingResult executeOffboarding(String email) {
    long startTime = System.currentTimeMillis();
    
    // Execute in parallel
    CompletableFuture<IntegrationResult> slackFuture = 
        CompletableFuture.supplyAsync(() -> integrationService.revokeSlackToken(email));
    
    CompletableFuture<IntegrationResult> googleFuture = 
        CompletableFuture.supplyAsync(() -> integrationService.revokeGoogleWorkspaceToken(email));
    
    CompletableFuture<SessionClearResult> redisFuture = 
        CompletableFuture.supplyAsync(() -> sessionManager.clearEmployeeSessions(email));
    
    // Wait for all with timeout
    try {
        CompletableFuture.allOf(slackFuture, googleFuture, redisFuture)
            .get(1, TimeUnit.SECONDS);
    } catch (TimeoutException e) {
        // Handle timeout
    }
    
    // Aggregate results
    List<StepResult> steps = Arrays.asList(
        toStepResult(slackFuture.get(), "SLACK"),
        toStepResult(googleFuture.get(), "GOOGLE_WORKSPACE"),
        toStepResult(redisFuture.get(), "REDIS")
    );
    
    long totalTime = System.currentTimeMillis() - startTime;
    
    return new OffboardingResult(eventId, email, aggregateResults(steps), steps, totalTime);
}
```

### Infrastructure Design

**Async Processing**:
- Webhook receives event → Returns 202 Accepted immediately
- Event queued to Redis (simple queue) or AWS SQS (future)
- Background worker processes queue

---

# UNIT-003: Admin Dashboard & API

## Functional Design

### API Endpoints

**Authentication**:
- `POST /api/v1/auth/login` → Login, return JWT token
- `POST /api/v1/auth/logout` → Invalidate session

**Dashboard**:
- `GET /api/v1/events/recent?limit=10` → Recent offboarding events
- `GET /api/v1/events/{eventId}` → Event detail with step breakdown

**Integrations**:
- `POST /api/v1/integrations/slack` → Configure Slack OAuth
- `POST /api/v1/integrations/google-workspace` → Configure Google OAuth
- `GET /api/v1/integrations/status` → Integration status

**Webhook**:
- `POST /api/v1/offboarding/event` → Receive offboarding event (webhook)
- `GET /api/v1/webhook/settings` → Get webhook URL and API key
- `POST /api/v1/webhook/regenerate-key` → Regenerate API key

**Audit Logs**:
- `GET /api/v1/audit/logs?start_date=...&end_date=...&email=...&status=...` → Query logs
- `GET /api/v1/audit/logs/export` → Export CSV

### Business Logic

**Authentication**:
- bcrypt password hashing (strength: 12)
- JWT tokens with 24-hour expiration
- Spring Security configuration

**Email Notifications**:
```java
public void sendOffboardingSuccessEmail(OffboardingResult result) {
    MimeMessage message = mailSender.createMimeMessage();
    message.setTo(hrManagerEmail);
    message.setSubject("Offboarding Complete: " + result.getEmployeeEmail());
    message.setText(formatSuccessEmail(result), true);
    mailSender.send(message);
}
```

### NFR Requirements

**Performance**:
- API response time: ≤ 2 seconds for dashboard pages
- CSV export: ≤ 10 seconds for 10,000 rows

**Security**:
- HTTPS only (HTTP redirected to HTTPS)
- JWT tokens signed with HS256
- CORS enabled for frontend (if separate)

### NFR Design

**Security Configuration**:
```java
@Configuration
@EnableWebSecurity
public class SecurityConfig {
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) {
        http
            .csrf().disable() // API uses JWT
            .authorizeRequests()
                .antMatchers("/api/v1/auth/login").permitAll()
                .antMatchers("/api/v1/offboarding/event").permitAll() // Webhook
                .anyRequest().authenticated()
            .and()
            .sessionManagement()
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS);
        
        return http.build();
    }
}
```

### Infrastructure Design

**Frontend** (Out of scope for MVP backend, but noted):
- Option 1: Server-side rendering with Thymeleaf
- Option 2: Separate React/Vue SPA (future)
- Option 3: Admin pages in Spring Boot (simple HTML + Bootstrap)

---

# Code Generation Summary

## Technology Stack

- **Language**: Java 21
- **Framework**: Spring Boot 3.2.x
- **Build**: Gradle 8.5 or Maven 3.9
- **Database**: PostgreSQL 15 (Spring Data JPA)
- **Cache**: Redis 7 (Spring Data Redis)
- **Security**: Spring Security + JWT
- **Testing**: JUnit 5 + jqwik (Property-Based Testing)
- **Email**: Spring Mail (JavaMailSender)

## Package Structure

```
com.continuum
├── ContinuumApplication.java
├── config/
│   ├── SecurityConfig.java
│   ├── RedisConfig.java
│   ├── RestTemplateConfig.java
│   └── AsyncConfig.java
├── web/
│   ├── controller/
│   │   ├── AuthController.java
│   │   ├── OffboardingController.java
│   │   ├── IntegrationController.java
│   │   └── AuditController.java
│   ├── dto/
│   │   ├── OffboardingEventRequest.java
│   │   ├── LoginRequest.java
│   │   └── ...
│   └── exception/
│       └── GlobalExceptionHandler.java
├── service/
│   ├── OffboardingService.java
│   ├── IntegrationService.java
│   ├── AuditService.java
│   ├── NotificationService.java
│   └── EncryptionService.java
├── domain/
│   ├── OffboardingEngine.java
│   ├── SessionManager.java
│   └── model/
│       ├── OffboardingEvent.java
│       ├── OffboardingResult.java
│       ├── IntegrationResult.java
│       └── ...
└── repository/
    ├── OffboardingRepository.java
    ├── IntegrationRepository.java
    ├── AuditLogRepository.java
    └── AdminUserRepository.java
```

## Testing Strategy

**Unit Tests** (JUnit 5):
- All service methods
- Business logic in OffboardingEngine
- Repository queries

**Property-Based Tests** (jqwik):
- EncryptionService: encrypt/decrypt round-trip
- OffboardingEngine: result aggregation idempotency
- AuditService: query filters produce consistent results

**Integration Tests**:
- Spring Boot Test (@SpringBootTest)
- TestContainers for PostgreSQL and Redis
- MockWebServer for external API mocking

---

# Build & Test Instructions

## Build

```bash
# Gradle
./gradlew clean build

# Maven
./mvnw clean package
```

## Run Tests

```bash
# Unit tests only
./gradlew test

# All tests (including integration)
./gradlew integrationTest

# Property-based tests
./gradlew test --tests "*PropertyTest"
```

## Run Locally

```bash
# Set environment variables
export DB_HOST=localhost
export DB_NAME=continuum
export DB_USERNAME=postgres
export DB_PASSWORD=password
export REDIS_HOST=localhost
export REDIS_PASSWORD=
export ENCRYPTION_SECRET_KEY=your-32-byte-secret-key
export SMTP_HOST=smtp.gmail.com
export SMTP_PORT=587
export SMTP_USERNAME=your-email@gmail.com
export SMTP_PASSWORD=your-app-password

# Run application
./gradlew bootRun
```

## Deploy to AWS

```bash
# Build Docker image
docker build -t continuum:latest .

# Push to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin {account-id}.dkr.ecr.us-east-1.amazonaws.com
docker tag continuum:latest {account-id}.dkr.ecr.us-east-1.amazonaws.com/continuum:latest
docker push {account-id}.dkr.ecr.us-east-1.amazonaws.com/continuum:latest

# Update ECS service
aws ecs update-service --cluster continuum-cluster --service continuum-service --force-new-deployment
```

---

**Document Version**: 1.0  
**Last Updated**: 2026-08-19  
**Author**: AI-DLC CONSTRUCTION Phase  
**Status**: Ready for Code Generation
