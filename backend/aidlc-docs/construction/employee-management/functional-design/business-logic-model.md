# Business Logic Model - Employee Management

## Register Flow
1. Validate request DTO (Bean Validation: `@NotBlank name`, `@NotBlank @Email email`)
2. Check `EmployeeRepository.findByEmailIgnoreCase(email)` — if present, throw `DuplicateEmployeeException`
3. Build `Employee` entity with `status = ACTIVE`, `createdAt/updatedAt = now()`
4. Save via repository
5. Map to `EmployeeResponse` and return

## List Flow
1. Accept optional `q` (search), `status` (filter), `page`/`size` (pagination) query params
2. Build a JPA Specification / `@Query` combining: `status = :status` (if provided) AND (`name ILIKE %q%` OR `email ILIKE %q%`) (if `q` provided)
3. Execute paginated query via `EmployeeRepository`
4. Map `Page<Employee>` to `Page<EmployeeResponse>`

## Get Detail Flow
1. `EmployeeRepository.findById(id)` — if absent, throw `EmployeeNotFoundException`
2. Map to `EmployeeResponse`

## Offboard (Soft Delete) Flow
1. `EmployeeRepository.findById(id)` — if absent, throw `EmployeeNotFoundException`
2. If `status == OFFBOARDED`, throw `AlreadyOffboardedException` (409)
3. Set `status = OFFBOARDED`, `offboardedAt = now()`, `updatedAt = now()`
4. Save and return mapped `EmployeeResponse`

## Error → HTTP Mapping (via existing GlobalExceptionHandler pattern)
| Exception | HTTP Status |
|---|---|
| `DuplicateEmployeeException` | 409 |
| `AlreadyOffboardedException` | 409 |
| `EmployeeNotFoundException` | 404 |
| Bean Validation failure | 400 |
