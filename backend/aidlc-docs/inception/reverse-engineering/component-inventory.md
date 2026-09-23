# Component Inventory

## Application Packages
- `com.continuum` (backend, Spring Boot monolith) - offboarding automation + admin API
- `frontend/` (React + Vite) - admin dashboard SPA

## Infrastructure Packages
- None as code in this repo (deployment described in `aidlc-docs/construction/build-and-test/`; `Dockerfile` + `docker-compose.yml` present for local/container run)

## Shared Packages
- None — single backend module, single frontend module

## Test Packages
- `src/test/` - unit tests
- `src/integration-test/` - integration tests (TestContainers)

## Total Count
- **Total Packages**: 2 (backend, frontend)
- **Application**: 2
- **Infrastructure**: 0
- **Shared**: 0
- **Test**: 2 (source sets within backend)
