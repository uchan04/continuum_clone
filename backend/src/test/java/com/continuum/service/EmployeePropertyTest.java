package com.continuum.service;

import com.continuum.domain.model.Employee;
import com.continuum.repository.EmployeeRepository;
import com.continuum.web.dto.EmployeeCreateRequest;
import com.continuum.web.dto.EmployeeResponse;
import com.continuum.web.exception.DuplicateEmployeeException;
import net.jqwik.api.*;
import net.jqwik.api.constraints.AlphaChars;
import net.jqwik.api.constraints.StringLength;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

/**
 * Property-based tests for EmployeeService validation logic (BR1-BR3),
 * per this project's Property-Based Testing extension convention.
 */
class EmployeePropertyTest {

    @Property
    void register_alwaysReturnsActiveStatus_forAnyValidNameAndEmail(
        @ForAll @AlphaChars @StringLength(min = 1, max = 50) String name,
        @ForAll("validEmails") String email
    ) {
        EmployeeRepository repository = mock(EmployeeRepository.class);
        EmployeeService service = new EmployeeService(repository);
        when(repository.findByEmailIgnoreCase(email)).thenReturn(Optional.empty());
        when(repository.save(any(Employee.class))).thenAnswer(invocation -> {
            Employee saved = invocation.getArgument(0);
            saved.setId(1L);
            return saved;
        });

        EmployeeResponse response = service.register(new EmployeeCreateRequest(name, email, null, null, null));

        assertThat(response.getStatus()).isEqualTo("ACTIVE");
        assertThat(response.getEmail()).isEqualTo(email);
    }

    @Property
    void register_alwaysThrowsDuplicateEmployeeException_whenEmailCaseVariantExists(
        @ForAll("validEmails") String email
    ) {
        EmployeeRepository repository = mock(EmployeeRepository.class);
        EmployeeService service = new EmployeeService(repository);
        Employee existing = Employee.builder().id(1L).email(email.toUpperCase()).build();
        when(repository.findByEmailIgnoreCase(email)).thenReturn(Optional.of(existing));

        assertThatThrownBy(() -> service.register(new EmployeeCreateRequest("Any Name", email, null, null, null)))
            .isInstanceOf(DuplicateEmployeeException.class);
    }

    @Provide
    Arbitrary<String> validEmails() {
        Arbitrary<String> local = Arbitraries.strings().alpha().ofMinLength(1).ofMaxLength(15);
        Arbitrary<String> domain = Arbitraries.strings().alpha().ofMinLength(1).ofMaxLength(15);
        return Combinators.combine(local, domain).as((l, d) -> l + "@" + d + ".com");
    }
}
