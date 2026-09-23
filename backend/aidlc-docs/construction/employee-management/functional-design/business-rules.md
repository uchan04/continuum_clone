# Business Rules - Employee Management

## BR1 — Email uniqueness
`email` must be unique across all employees, compared case-insensitively (`a@b.com` == `A@B.com`). Enforced at both the DB level (unique index on `LOWER(email)`) and the service level (pre-check + catch constraint violation → map to `409 Conflict` with message `"Employee with this email already exists"`).

## BR2 — Required fields on registration
`name` and `email` are required (400 Bad Request via Bean Validation `@NotBlank` if missing). `department`, `position`, `hireDate` are optional.

## BR3 — Email format validation
`email` must match a standard email pattern (`@Email` Bean Validation annotation). Invalid format → 400 Bad Request.

## BR4 — Soft delete only
"Delete" never physically removes a row. `offboard(id)` sets `status = OFFBOARDED` and `offboardedAt = now()`. This preserves any historical correlation with `OffboardingEvent`/`AuditLog` rows that reference the same email.

## BR5 — Idempotency of offboarding
Calling `offboard(id)` on an already-`OFFBOARDED` employee returns `409 Conflict` ("Employee is already offboarded") rather than silently succeeding or erroring ambiguously.

## BR6 — Not found handling
`getById`/`offboard` on a non-existent `id` → `404 Not Found` via `EmployeeNotFoundException`, handled by the existing `GlobalExceptionHandler`.

## BR7 — List defaults
`GET /api/v1/employees` with no query params returns all statuses, default page size matching existing conventions in `EventController`/`AuditController` (`size=10` default, `page=0` default).

## BR8 — Search matching
`q` param matches employees whose `name` OR `email` contains the query, case-insensitive substring match (not prefix-only).
