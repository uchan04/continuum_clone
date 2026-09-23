# Technology Stack

## Programming Languages
- Java 21 - backend
- TypeScript - frontend

## Frameworks
- Spring Boot 3.2 - backend (web, data-jpa, data-redis, security, validation, mail, actuator)
- React 19 + Vite 8 - frontend
- Tailwind CSS 4 - frontend styling (declared as devDependency; `App.tsx` currently uses inline styles, not Tailwind classes)

## Infrastructure
- PostgreSQL 15 - primary datastore (Flyway-migrated)
- Redis 7 - session/cache store
- AWS ECS Fargate - target deployment (per construction docs; not yet provisioned as IaC)

## Build Tools
- Gradle - backend
- npm/pnpm - frontend

## Testing Tools
- JUnit 5 / Spring Boot Test - unit tests
- jqwik 1.8.5 - property-based tests
- TestContainers 1.19.8 - integration tests against real PostgreSQL
- MockWebServer (OkHttp) 4.12.0 - mocking Slack/Google HTTP calls
