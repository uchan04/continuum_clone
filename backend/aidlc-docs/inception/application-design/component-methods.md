# Component Methods - Employee Management

## EmployeeController
- `POST /api/v1/employees` → `ApiResponse<EmployeeResponse>` — body: `EmployeeCreateRequest`
- `GET /api/v1/employees?q=&status=&page=&size=` → `ApiResponse<Page<EmployeeResponse>>`
- `GET /api/v1/employees/{id}` → `ApiResponse<EmployeeResponse>`
- `DELETE /api/v1/employees/{id}` → `ApiResponse<EmployeeResponse>` (soft delete; returns the updated record)

## EmployeeService
- `EmployeeResponse register(EmployeeCreateRequest request)` — validates + saves; throws `DuplicateEmployeeException` (mapped to 409) if email already exists
- `Page<EmployeeResponse> list(String query, EmployeeStatus status, Pageable pageable)` — search/filter/paginate
- `EmployeeResponse getById(Long id)` — throws `EmployeeNotFoundException` (mapped to 404) if missing
- `EmployeeResponse offboard(Long id)` — sets `status = OFFBOARDED`, `offboardedAt = now()`; idempotent no-op error if already offboarded (returns 409 "already offboarded")

## EmployeeRepository (Spring Data JPA)
- `Optional<Employee> findByEmailIgnoreCase(String email)`
- `Page<Employee> findByStatusAndNameContainingIgnoreCaseOrStatusAndEmailContainingIgnoreCase(...)` — implemented via a `@Query`/Specification rather than a long derived-name method, for readability
- Standard `save`, `findById` inherited from `JpaRepository<Employee, Long>`

**Note**: Detailed validation rules (e.g., exact email regex, required-field list) are finalized in Functional Design, not here.
