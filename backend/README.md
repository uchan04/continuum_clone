# Continuum - B2B AI Offboarding Middleware MVP

## Overview

Continuum is a B2B middleware that provides **1-second automated offboarding** for employees by revoking OAuth tokens across Slack and Google Workspace. This MVP focuses on **F1: Automated Offboarding Engine** to solve the "ghost privileges" security risk in SMBs.

## Key Features

- ✅ **1-Second Offboarding**: Revoke all OAuth tokens in under 1 second
- ✅ **Multi-Service Support**: Slack + Google Workspace integration
- ✅ **Parallel Execution**: CompletableFuture-based async revocation
- ✅ **Audit Trail**: Complete audit logs for compliance
- ✅ **Admin Dashboard**: REST API for event monitoring
- ✅ **Webhook Integration**: Receive offboarding events from HR/ERP systems

## Tech Stack

- **Java 21** + **Spring Boot 3.2**
- **PostgreSQL 15** (RDS) - Relational data
- **Redis 7** (ElastiCache) - Session management
- **AWS ECS Fargate** - Container orchestration
- **jqwik** - Property-based testing

## Repository Setup Checklist

This repo is now ready for the next engineering steps after the initial repo bootstrap:

- [ ] Add GitHub branch protection rules for `main`
- [ ] Set up GitHub Actions CI for backend + frontend
- [ ] Move secrets into GitHub repository secrets
- [ ] Create a short issue backlog for MVP milestones
- [ ] Connect backend API to the admin dashboard
- [ ] Add real auth and webhook tests before production release

## Immediate Next Steps

1. Configure a production-safe `.env` from `.env.example`
2. Create a `feature/*` branch for each milestone
3. Keep PRs small and focused around API, auth, or dashboard integration
4. Require CI to pass before merging into `main`
5. Treat the dashboard as a real integration target, not a static mockup

## Quick Start

### Prerequisites

- Java 21
- Docker & Docker Compose
- PostgreSQL 15 (or use Docker)
- Redis 7 (or use Docker)

### Run with Docker Compose (Recommended)

```bash
# Set environment variables
export ENCRYPTION_SECRET_KEY=$(openssl rand -base64 32)
export JWT_SECRET=$(openssl rand -base64 64)

# Start all services
docker-compose up -d

# Check logs
docker-compose logs -f continuum

# Application will be available at http://localhost:8080
```

### Run Locally (Development)

```bash
# 1. Start PostgreSQL and Redis
docker-compose up -d postgres redis

# 2. Set environment variables
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

# 3. Run application
./gradlew bootRun

# Application runs on http://localhost:8080
```

### Run the Admin Dashboard

The Figma Make admin dashboard is included in `frontend/` as a React + Vite application.

```bash
cd frontend
pnpm install
pnpm dev
```

The dashboard is available at the URL printed by Vite (normally `http://localhost:5173`).

## API Endpoints

### Authentication

**Login**
```bash
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@continuum.com", "password": "admin123"}'
```

### Offboarding Webhook

**Receive Offboarding Event**
```bash
curl -X POST http://localhost:8080/api/v1/offboarding/event \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-api-key" \
  -d '{
    "event_id": "evt_001",
    "event_type": "employee.offboarded",
    "employee_email": "john.doe@company.com",
    "offboarded_at": "2026-08-19T10:30:00Z"
  }'
```

### Dashboard

**Get Recent Events**
```bash
TOKEN="your-jwt-token"

curl -X GET "http://localhost:8080/api/v1/events/recent?limit=10" \
  -H "Authorization: Bearer $TOKEN"
```

**Get Event Details**
```bash
curl -X GET "http://localhost:8080/api/v1/events/evt_001" \
  -H "Authorization: Bearer $TOKEN"
```

### Integration Configuration

**Configure Slack**
```bash
curl -X POST http://localhost:8080/api/v1/integrations/slack \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "client_id": "slack_client_id",
    "client_secret": "slack_client_secret"
  }'
```

**Get Integration Status**
```bash
curl -X GET http://localhost:8080/api/v1/integrations/status \
  -H "Authorization: Bearer $TOKEN"
```

## Testing

```bash
# Unit tests
./gradlew test

# Integration tests (requires TestContainers)
./gradlew integrationTest

# Property-based tests
./gradlew test --tests "*PropertyTest"

# All tests
./gradlew clean build
```

## Database Schema

See `src/main/resources/db/migration/V1__initial_schema.sql` for complete schema.

Key tables:
- `admin_users` - Dashboard admin users
- `offboarding_events` - Main event records
- `offboarding_steps` - Per-service revocation steps
- `audit_logs` - Complete audit trail
- `integration_configs` - OAuth credentials (encrypted)

## Deployment to AWS

See `aidlc-docs/construction/build-and-test/build-and-test-summary.md` for complete deployment instructions.

### Quick Deploy

```bash
# Build and push Docker image
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <account-id>.dkr.ecr.us-east-1.amazonaws.com
docker build -t continuum:latest .
docker tag continuum:latest <account-id>.dkr.ecr.us-east-1.amazonaws.com/continuum:latest
docker push <account-id>.dkr.ecr.us-east-1.amazonaws.com/continuum:latest

# Update ECS service
aws ecs update-service --cluster continuum-cluster --service continuum-service --force-new-deployment --region us-east-1
```

## Project Structure

```
continuum/
├── src/
│   ├── main/
│   │   ├── java/com/continuum/
│   │   │   ├── ContinuumApplication.java
│   │   │   ├── config/           # Configuration classes
│   │   │   ├── web/              # Controllers, DTOs
│   │   │   ├── service/          # Business services
│   │   │   ├── domain/           # Domain models
│   │   │   └── repository/       # JPA repositories
│   │   └── resources/
│   │       ├── application.yml
│   │       └── db/migration/     # Flyway SQL migrations
│   ├── test/                     # Unit tests
│   └── integration-test/         # Integration tests
├── build.gradle
├── Dockerfile
├── docker-compose.yml
└── README.md
```

## Documentation

Complete project documentation is in the `aidlc-docs/` directory:

- **Requirements**: `aidlc-docs/inception/requirements/requirements.md`
- **User Stories**: `aidlc-docs/inception/user-stories/stories.md`
- **Application Design**: `aidlc-docs/inception/application-design/application-design.md`
- **Construction Design**: `aidlc-docs/construction/continuum-construction-complete.md`
- **Build & Test**: `aidlc-docs/construction/build-and-test/build-and-test-summary.md`

## Default Credentials

**Admin Dashboard**:
- Email: `admin@continuum.com`
- Password: `admin123`

⚠️ **Change these credentials in production!**

## License

Proprietary - AgentBridge Team

## Contact

For questions or support, contact: hr@company.com
