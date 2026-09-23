# Code Generation Plan - employee-management

**Source of truth for this stage.** Executed step-by-step; each step is marked [x] immediately upon completion.

## Unit Context
- **Stories/requirements covered**: FR1 (List), FR2 (Register), FR3 (Soft delete/offboard), FR4 (Detail), FR5 (Frontend tab) from `aidlc-docs/inception/requirements/requirements.md` addendum
- **Design source**: `aidlc-docs/inception/application-design/`, `aidlc-docs/construction/employee-management/functional-design/`
- **Dependencies**: None on other units. Reuses existing `ApiResponse`, `GlobalExceptionHandler`, JWT security chain (`/api/v1/**` already authenticated), frontend `apiRequest` helper.
- **Workspace root**: `/Users/hwang-yuchan/Desktop/Continuum` (brownfield — modify/extend existing structure, never duplicate files)

## Steps

- [x] **Step 1 — Database Migration**: Create `src/main/resources/db/migration/V2__create_employees_table.sql` (employees table: id, name, email unique case-insensitive index, department, position, hire_date, status, offboarded_at, created_at, updated_at)
- [x] **Step 2 — Domain Model**: Create `src/main/java/com/continuum/domain/model/Employee.java` (JPA entity + `EmployeeStatus` enum: ACTIVE/OFFBOARDED), following the `OffboardingEvent.java` Lombok/JPA convention
- [x] **Step 3 — Exceptions**: Create `src/main/java/com/continuum/web/exception/DuplicateEmployeeException.java`, `EmployeeNotFoundException.java`, `AlreadyOffboardedException.java`
- [x] **Step 4 — Repository**: Create `src/main/java/com/continuum/repository/EmployeeRepository.java` (`findByEmailIgnoreCase`, search+status+pagination query)
- [x] **Step 5 — DTOs**: Create `src/main/java/com/continuum/web/dto/EmployeeCreateRequest.java`, `EmployeeResponse.java`
- [x] **Step 6 — Business Logic**: Create `src/main/java/com/continuum/service/EmployeeService.java` (register/list/getById/offboard per business-logic-model.md and business-rules.md BR1-BR8)
- [x] **Step 7 — Business Logic Unit Testing**: Create `src/test/java/com/continuum/service/EmployeeServiceTest.java`
- [x] **Step 8 — Business Logic Property-Based Testing**: Create `src/test/java/com/continuum/service/EmployeePropertyTest.java` (jqwik, per Property-Based Testing extension enabled in aidlc-state.md)
- [x] **Step 9 — API Layer**: Create `src/main/java/com/continuum/web/controller/EmployeeController.java` (`POST/GET /api/v1/employees`, `GET/DELETE /api/v1/employees/{id}`)
- [x] **Step 10 — Exception Handling**: Modify `src/main/java/com/continuum/web/exception/GlobalExceptionHandler.java` to add handlers for the 3 new exceptions (409/409/404)
- [x] **Step 11 — API Layer Integration Testing**: Create `src/integration-test/java/com/continuum/EmployeeControllerIntegrationTest.java` (TestContainers PostgreSQL, per existing project convention)
- [x] **Step 12 — Frontend Components**: Modify `frontend/src/App.tsx` — add `EmployeeResponse`/`EmployeeStatus` types, `"employees"` to `NavKey`/nav items, employees tab state, `fetchEmployeesTab`/register/offboard handlers, and the Employees tab render branch (table, search/filter, register form, offboard action with confirmation), per `frontend-components.md`. All in Korean per prior localization pass; `data-testid` attributes on interactive elements per Automation Friendly Code Rules.
- [x] **Step 13 — Documentation**: Create `aidlc-docs/construction/employee-management/code/code-summary.md` summarizing generated files

## Notes
- All new backend code follows the existing Controller → Service → Repository layered pattern.
- No infra/NFR-design steps needed (skipped per execution plan).
- Frontend edits are additive to `App.tsx`, not a new file, per Functional Design.
