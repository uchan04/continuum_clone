# Unit Test Execution

## Run Unit Tests

### 1. Execute All Unit Tests
```bash
./gradlew test
```

To run only the employee-management unit tests:
```bash
./gradlew test --tests "com.continuum.service.EmployeeServiceTest" \
                --tests "com.continuum.service.EmployeePropertyTest"
```

### 2. Review Test Results
- **Expected**: All tests pass, 0 failures. New tests added this cycle:
  - `EmployeeServiceTest` — 5 cases: register success, duplicate email → `DuplicateEmployeeException`, get-by-id missing → `EmployeeNotFoundException`, offboard success (status + timestamp), offboard-twice → `AlreadyOffboardedException`
  - `EmployeePropertyTest` (jqwik, per this project's Property-Based Testing convention) — 2 properties: register always returns `ACTIVE` status for any valid name/email, register always throws `DuplicateEmployeeException` for a case-variant of an existing email
- **Test Report Location**: `build/reports/tests/test/index.html` (Gradle), `build/test-results/test/*.xml` (JUnit XML)

### 3. Fix Failing Tests
If tests fail:
1. Open `build/reports/tests/test/index.html` in a browser for the failure stack trace
2. For `EmployeeServiceTest` failures, check that mocked `EmployeeRepository` stubs match the exact `EmployeeService` method calls (e.g., `findByEmailIgnoreCase`, `findById`, `save`)
3. For `EmployeePropertyTest` failures, jqwik prints the exact failing sample (name/email) in the console — reproduce with `@ForAll` seed shown in the failure output
4. Rerun `./gradlew test` until all pass

## Verification Status (this environment)
Could not be executed here — no JDK installed (`java -version` fails). The test files were generated following this project's existing Mockito + JUnit5 (unit) and jqwik (property-based) conventions and compile-checked by inspection against existing classes (`EmployeeRepository`, `EmployeeService`, DTOs, exceptions). Run `./gradlew test` locally/CI to get actual pass/fail results.
