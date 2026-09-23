# Code Generation Summary - employee-management

## Backend (created)
- `src/main/resources/db/migration/V2__create_employees_table.sql` — `employees` table, case-insensitive unique index on email
- `src/main/java/com/continuum/domain/model/Employee.java` — entity + `EmployeeStatus` enum
- `src/main/java/com/continuum/web/exception/DuplicateEmployeeException.java`
- `src/main/java/com/continuum/web/exception/EmployeeNotFoundException.java`
- `src/main/java/com/continuum/web/exception/AlreadyOffboardedException.java`
- `src/main/java/com/continuum/repository/EmployeeRepository.java`
- `src/main/java/com/continuum/web/dto/EmployeeCreateRequest.java`
- `src/main/java/com/continuum/web/dto/EmployeeResponse.java`
- `src/main/java/com/continuum/service/EmployeeService.java`
- `src/main/java/com/continuum/web/controller/EmployeeController.java`
- `src/test/java/com/continuum/service/EmployeeServiceTest.java` — unit tests (register/duplicate/not-found/offboard/already-offboarded)
- `src/test/java/com/continuum/service/EmployeePropertyTest.java` — jqwik property-based tests (BR1-BR3)
- `src/integration-test/java/com/continuum/EmployeeControllerIntegrationTest.java` — TestContainers PostgreSQL, full lifecycle + auth + 404/409 cases

## Backend (modified)
- `src/main/java/com/continuum/web/exception/GlobalExceptionHandler.java` — added handlers for `DuplicateEmployeeException`/`AlreadyOffboardedException` (409) and `EmployeeNotFoundException` (404)

## Frontend (modified)
- `frontend/src/App.tsx`:
  - Types: `EmployeeStatus`, `EmployeeItem`, `BackendEmployee`; `NavKey` extended with `"employees"`
  - Labels/colors: `employeeStatusLabels`, `employeeStatusColors`
  - Helpers: `toEmployeeStatus`, `mapEmployeeFromApi`
  - State: `employees`, `employeesQuery`, pagination, `showRegisterModal`, `registerForm`, `offboardingEmployeeId`
  - Handlers: `fetchEmployeesTab`, `handleRegisterEmployee`, `handleOffboardEmployee`
  - New "직원 관리" nav tab: search/status filter, table (name/email/department/position/hire date/status/offboard action), register modal, confirmation on offboard
  - `data-testid` attributes on all interactive elements (`employees-*`)

## Verification performed
- `npx tsc --noEmit` — passed
- `npx vite build` — passed
- Backend (`./gradlew compileJava`) — **could not be run in this environment: no JDK installed on the machine.** Compilation and test execution (unit/property/integration) are deferred to the Build & Test stage, or the user should run `./gradlew clean build` locally / in CI where Java 21 is available.

## Endpoints added
- `POST /api/v1/employees`
- `GET /api/v1/employees?q=&status=&page=&size=`
- `GET /api/v1/employees/{id}`
- `DELETE /api/v1/employees/{id}` (soft delete → status=OFFBOARDED)

All behind the existing JWT-authenticated `/api/v1/**` security rule — no `SecurityConfig` change was needed.
