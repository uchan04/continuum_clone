# Application Design - Employee Management (Consolidated)

This consolidates `components.md`, `component-methods.md`, `services.md`, and `component-dependency.md` into a single reference document.

## Scope
Add employee list/register/soft-delete capability as a new, self-contained vertical slice on top of the existing Continuum backend (Spring Boot layered architecture) and frontend (single-file React dashboard).

## Components
See `components.md` for full detail. New: `EmployeeController`, `EmployeeService`, `Employee` entity, `EmployeeRepository`. Reused unchanged: `ApiResponse`, `GlobalExceptionHandler`, `JwtAuthenticationFilter`/`SecurityConfig`, frontend `apiRequest` helper + `Pagination` component.

## Component Methods
See `component-methods.md`. Key endpoints: `POST/GET /api/v1/employees`, `GET/DELETE /api/v1/employees/{id}`.

## Services
See `services.md`. `EmployeeService` is a single orchestration point, deliberately decoupled from `OffboardingService`/`AuditService` in this cycle per the requirements addendum.

## Component Dependencies & Data Flow
See `component-dependency.md` for the dependency matrix and sequence diagrams.

## Design Decisions Made (no further questions needed)
Given the requirements addendum already pinned down field list, uniqueness, soft-delete semantics, decoupling from offboarding automation, and JWT-only auth, the component boundaries below follow directly without introducing new ambiguity:
- **One controller, one service, one repository** — no need to split further; this is a small, cohesive feature
- **No new shared/cross-cutting service** — audit logging and encryption are intentionally out of scope for this cycle
- **Standard Spring Data JPA repository** — no custom query builder framework needed
