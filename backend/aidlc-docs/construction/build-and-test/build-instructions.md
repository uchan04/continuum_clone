# Build Instructions

## Prerequisites
- **Build Tool**: Gradle (wrapper included, `./gradlew`) for backend; npm/pnpm + Vite for frontend
- **Dependencies**: Java 21 (JDK), PostgreSQL 15 (or Docker), Redis 7 (or Docker), Node.js for frontend
- **Environment Variables**: `DB_HOST`, `DB_NAME`, `DB_USERNAME`, `DB_PASSWORD`, `REDIS_HOST`, `REDIS_PASSWORD`, `ENCRYPTION_SECRET_KEY`, `JWT_SECRET`, `SMTP_*`, `HR_MANAGER_EMAIL` (see `.env.example`)
- **System Requirements**: Any OS with Java 21 + Docker support

## Build Steps

### 1. Install Dependencies
```bash
# Backend — Gradle wrapper resolves dependencies automatically
./gradlew dependencies

# Frontend
cd frontend && pnpm install
```

### 2. Configure Environment
```bash
export ENCRYPTION_SECRET_KEY=$(openssl rand -base64 32)
export JWT_SECRET=$(openssl rand -base64 64)
# or: cp .env.example .env and edit
```

### 3. Build All Units
```bash
# Backend — compiles main + test + integration-test source sets, runs Flyway validation
./gradlew clean build

# Frontend
cd frontend && npx tsc --noEmit && npx vite build
```

### 4. Verify Build Success
- **Expected Output**: `BUILD SUCCESSFUL` from Gradle; `✓ built in Xms` from Vite with no TypeScript errors
- **Build Artifacts**: `build/libs/continuum-*.jar` (backend), `frontend/dist/` (frontend static assets)
- **Common Warnings**: None expected for this cycle's additions (Employee vertical slice)

## What changed in this cycle (employee-management)
- New Flyway migration `V2__create_employees_table.sql` — Flyway runs automatically on app startup (`baseline-on-migrate: true`), no manual migration step needed
- No new dependencies added to `build.gradle` or `package.json` — Employee feature reuses existing Spring Data JPA, Lombok, Bean Validation, jqwik, TestContainers, and the frontend's existing React/fetch stack

## Troubleshooting

### Build Fails with Dependency Errors
- **Cause**: Gradle cache corruption or network issues resolving `spring-boot-starter-*`/`jjwt`/`testcontainers`
- **Solution**: `./gradlew clean build --refresh-dependencies`

### Build Fails with Compilation Errors
- **Cause**: Most likely a missing import or Lombok annotation-processing not enabled in the IDE
- **Solution**: Run `./gradlew compileJava compileTestJava compileIntegrationTestJava` directly to isolate which source set fails; ensure `annotationProcessor` includes Lombok (already configured in `build.gradle`)

### Environment Note for This Verification Pass
This environment has no JDK installed (`java -version` fails: "Unable to locate a Java Runtime"), so `./gradlew build` could not be executed here. Frontend was verified directly (`npx tsc --noEmit` and `npx vite build` both passed). The user should run `./gradlew clean build` locally or in CI (Java 21 available) to complete backend verification — see `unit-test-instructions.md` and `integration-test-instructions.md` for exact commands and expected results.
