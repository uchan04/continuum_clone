# Components - Employee Management

## EmployeeController (new)
- **Purpose**: REST entry point for employee management
- **Responsibilities**: Request/response mapping, validation trigger, delegates to `EmployeeService`; sits behind existing JWT filter chain like every other `/api/v1/**` controller
- **Interfaces**: HTTP REST (`/api/v1/employees/**`)

## EmployeeService (new)
- **Purpose**: Business logic orchestration for employee lifecycle
- **Responsibilities**: Enforce email uniqueness (case-insensitive), create employees, list/search/filter with pagination, perform soft-delete (status transition to `OFFBOARDED` + timestamp)
- **Interfaces**: Java service interface consumed by `EmployeeController`

## Employee (new domain model / JPA entity)
- **Purpose**: Represents an employee master record
- **Responsibilities**: Hold employee attributes and status; no business logic beyond simple state (status enum)
- **Interfaces**: JPA entity, mapped to new `employees` table

## EmployeeRepository (new)
- **Purpose**: Persistence access for `Employee`
- **Responsibilities**: Spring Data JPA CRUD + custom finder methods (by email, paginated search by name/email + status filter)
- **Interfaces**: Spring Data JPA repository interface

## Reused existing components (no changes)
- **ApiResponse** (`web/dto/ApiResponse.java`) - standard response envelope, reused for all new endpoints
- **GlobalExceptionHandler** - reused as-is; will map the new "duplicate email" conflict to `409` and "not found" to `404`
- **JwtAuthenticationFilter / SecurityConfig** - reused as-is; `/api/v1/employees/**` is already covered by the existing `.requestMatchers("/api/v1/**").authenticated()` rule, no config change needed
- **App.tsx (frontend)** - extended with a new "Employees" nav entry and view, reusing the existing `apiRequest` helper and `Pagination` component
