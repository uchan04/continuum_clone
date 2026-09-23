# Services - Employee Management

## EmployeeService
- **Responsibilities**: Sole orchestration point for employee lifecycle (register, list, get, offboard/soft-delete)
- **Orchestration pattern**: Thin orchestration — no cross-service calls needed in this cycle (deliberately decoupled from `OffboardingService`/`OffboardingEngine` per requirements addendum). If a future cycle wires "delete employee" to trigger real OAuth revocation, `EmployeeService` would call `OffboardingService` at that point — not now.
- **Transaction boundary**: Each method is a single `@Transactional` unit; no distributed/multi-service transactions needed.

## No new cross-cutting services required
- Reuses `EncryptionService`? No — employee fields are not sensitive credentials, no encryption needed (unlike `IntegrationConfig`)
- Reuses `AuditService`? Not wired in this cycle — employee register/offboard actions are not written to `AuditLog` (that table is scoped to offboarding-event audit trail per existing schema). This is a boundary decision, not an oversight — kept in scope for a possible future cycle if the user wants unified audit history.
