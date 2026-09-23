# API Documentation

All `/api/v1/**` routes require a JWT bearer token except `/api/v1/auth/login` and `/api/v1/offboarding/event` (webhook), which are `permitAll`. Security is enforced in `config/SecurityConfig.java`.

## REST APIs

### Auth
- `POST /api/v1/auth/login` - login, returns JWT
- `POST /api/v1/auth/logout`

### Offboarding
- `POST /api/v1/offboarding/event` - webhook receiving an offboarding event (public, HR/ERP-facing)

### Events
- `GET /api/v1/events/recent?limit=` - recent events
- `GET /api/v1/events/{eventId}` - event detail
- `GET /api/v1/events/employee/{email}` - events for one employee email
- `GET /api/v1/events/search?startDate=&endDate=&page=&size=` - search
- `GET /api/v1/events/statistics`

### Audit
- `GET /api/v1/audit/logs?page=&size=&startDate=&endDate=`
- `GET /api/v1/audit/logs/event/{eventId}`
- `GET /api/v1/audit/logs/employee/{email}`
- `GET /api/v1/audit/logs/export` (CSV)

### Integrations
- `POST /api/v1/integrations/slack`
- `POST /api/v1/integrations/google-workspace`
- `GET /api/v1/integrations/status`
- `POST /api/v1/integrations/slack/test`
- `POST /api/v1/integrations/google-workspace/test`

**No `/api/v1/employees/**` endpoints exist.**

## Data Models

### OffboardingEvent
- **Fields**: id, eventId, employeeEmail (string, not a foreign key to any employee table), offboardedAt, status, steps
- **Relationships**: has many OffboardingStep
- **Validation**: employeeEmail treated as free-text identifier throughout the system (events, audit logs) — there is no employee master record it links to

### AdminUser
- **Fields**: id, email, password (hashed), role
- **Relationships**: none relevant here

### AuditLog
- **Fields**: id, eventId, employeeEmail, timestamp, status, details

**Conclusion relevant to this request**: adding employee list/create/delete requires a brand-new `Employee` entity + repository + service + controller + Flyway migration on the backend, and a brand-new nav tab/view on the frontend — there is nothing to reuse except the existing layered pattern, JWT auth wiring, and `apiRequest` frontend helper.
