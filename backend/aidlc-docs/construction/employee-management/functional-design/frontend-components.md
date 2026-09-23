# Frontend Components - Employee Management

## Location
Extend `frontend/src/App.tsx`: add `"employees"` to the `NavKey` union and nav list, add a new render branch (following the existing pattern used for `overview`/`events`/`integrations`/`audit` branches).

## Component / State Structure

### Nav
- Add `{ id: "employees", label: "Employees" }` to the nav items array.

### State (within `App`, following existing per-tab state pattern like `eventsPage`/`eventsQuery`)
- `employees: EmployeeResponse[]`
- `employeesPage`, `employeesTotalPages`
- `employeesQuery: { q: string; status: "" | "ACTIVE" | "OFFBOARDED" }`
- `employeesLoading`, `employeesError`
- `showRegisterModal: boolean`
- `registerForm: { name; email; department; position; hireDate }`
- `registerError: string | null`

### Behaviors
1. **List**: on tab activation, `fetchEmployeesTab(0)` → `GET /api/v1/employees?q=&status=&page=&size=10`; render as a table (Name, Email, Department, Position, Hire Date, Status badge, Actions) reusing the existing `Pagination` component and table styling patterns from the Events tab.
2. **Search/Filter**: text input + status `<select>`, "Search" button triggers `fetchEmployeesTab(0)`, mirroring the Events tab's search UX.
3. **Register**: "+ Register Employee" button opens a modal/inline form (name, email, department, position, hire date). On submit: `POST /api/v1/employees`; on `409`, show inline error "이미 등록된 이메일입니다"; on success, close modal, refresh list.
4. **Offboard (delete)**: per-row "Offboard" button → confirmation (`window.confirm` equivalent styled dialog, consistent with existing minimal-dependency approach) → `DELETE /api/v1/employees/{id}` → refresh list; row's Status badge updates to "OFFBOARDED" (styled like existing status badges in Events tab).

## API Integration Points
- `GET /api/v1/employees` (list)
- `POST /api/v1/employees` (register)
- `DELETE /api/v1/employees/{id}` (offboard)

All calls go through the existing `apiRequest<T>()` helper already defined in `App.tsx`, which attaches the JWT bearer token automatically.

## Form Validation (client-side, mirrors backend BR2/BR3)
- `name`: required, non-empty
- `email`: required, basic email pattern check before submit
- `department`, `position`, `hireDate`: optional
