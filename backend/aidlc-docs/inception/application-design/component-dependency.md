# Component Dependency - Employee Management

## Dependency Matrix

| Component | Depends On |
|---|---|
| EmployeeController | EmployeeService |
| EmployeeService | EmployeeRepository |
| EmployeeRepository | Employee (entity), Spring Data JPA, PostgreSQL |
| Frontend Employees tab | Existing `apiRequest` helper → `/api/v1/employees/**` |

## Communication Pattern
- Synchronous REST (frontend ↔ backend), synchronous method calls within backend layers — identical pattern to every existing feature (Events, Integrations, Audit)
- No new async/queue/event-driven communication introduced

## Data Flow

```mermaid
sequenceDiagram
    participant UI as Employees Tab (App.tsx)
    participant API as EmployeeController
    participant Svc as EmployeeService
    participant Repo as EmployeeRepository
    participant DB as PostgreSQL

    UI->>API: POST /api/v1/employees {name, email, department, position, hireDate}
    API->>Svc: register(request)
    Svc->>Repo: findByEmailIgnoreCase(email)
    Repo->>DB: SELECT
    alt email exists
        Svc-->>API: 409 Conflict
    else new email
        Svc->>Repo: save(employee)
        Repo->>DB: INSERT
        Svc-->>API: EmployeeResponse
    end
    API-->>UI: ApiResponse<EmployeeResponse>

    UI->>API: DELETE /api/v1/employees/{id}
    API->>Svc: offboard(id)
    Svc->>Repo: findById(id)
    Svc->>Repo: save(status=OFFBOARDED, offboardedAt=now)
    Svc-->>API: EmployeeResponse
    API-->>UI: ApiResponse<EmployeeResponse>
```
