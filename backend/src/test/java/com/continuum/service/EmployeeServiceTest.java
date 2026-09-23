package com.continuum.service;

import com.continuum.domain.model.Employee;
import com.continuum.repository.EmployeeRepository;
import com.continuum.web.dto.EmployeeCreateRequest;
import com.continuum.web.dto.EmployeeResponse;
import com.continuum.web.exception.AlreadyOffboardedException;
import com.continuum.web.exception.DuplicateEmployeeException;
import com.continuum.web.exception.EmployeeNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class EmployeeServiceTest {

    @Mock
    private EmployeeRepository employeeRepository;

    private EmployeeService employeeService;

    @BeforeEach
    void setUp() {
        employeeService = new EmployeeService(employeeRepository);
    }

    @Test
    void register_savesNewEmployee_whenEmailIsUnique() {
        EmployeeCreateRequest request = new EmployeeCreateRequest(
            "Alex Kim", "alex.kim@company.com", "Engineering", "Backend Engineer", LocalDate.of(2024, 3, 1)
        );
        when(employeeRepository.findByEmailIgnoreCase("alex.kim@company.com")).thenReturn(Optional.empty());
        when(employeeRepository.save(any(Employee.class))).thenAnswer(invocation -> {
            Employee saved = invocation.getArgument(0);
            saved.setId(1L);
            saved.setCreatedAt(LocalDateTime.now());
            return saved;
        });

        EmployeeResponse response = employeeService.register(request);

        assertThat(response.getId()).isEqualTo(1L);
        assertThat(response.getEmail()).isEqualTo("alex.kim@company.com");
        assertThat(response.getStatus()).isEqualTo("ACTIVE");

        ArgumentCaptor<Employee> captor = ArgumentCaptor.forClass(Employee.class);
        verify(employeeRepository).save(captor.capture());
        assertThat(captor.getValue().getStatus()).isEqualTo(Employee.EmployeeStatus.ACTIVE);
    }

    @Test
    void register_throwsDuplicateEmployeeException_whenEmailAlreadyExists() {
        EmployeeCreateRequest request = new EmployeeCreateRequest(
            "Alex Kim", "alex.kim@company.com", null, null, null
        );
        Employee existing = Employee.builder().id(1L).email("alex.kim@company.com").build();
        when(employeeRepository.findByEmailIgnoreCase("alex.kim@company.com")).thenReturn(Optional.of(existing));

        assertThatThrownBy(() -> employeeService.register(request))
            .isInstanceOf(DuplicateEmployeeException.class);

        verify(employeeRepository, never()).save(any());
    }

    @Test
    void getById_throwsEmployeeNotFoundException_whenMissing() {
        when(employeeRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> employeeService.getById(99L))
            .isInstanceOf(EmployeeNotFoundException.class);
    }

    @Test
    void offboard_setsStatusAndTimestamp_whenActive() {
        Employee employee = Employee.builder()
            .id(1L)
            .email("alex.kim@company.com")
            .status(Employee.EmployeeStatus.ACTIVE)
            .build();
        when(employeeRepository.findById(1L)).thenReturn(Optional.of(employee));
        when(employeeRepository.save(any(Employee.class))).thenAnswer(invocation -> invocation.getArgument(0));

        EmployeeResponse response = employeeService.offboard(1L);

        assertThat(response.getStatus()).isEqualTo("OFFBOARDED");
        assertThat(response.getOffboardedAt()).isNotNull();
    }

    @Test
    void offboard_throwsAlreadyOffboardedException_whenAlreadyOffboarded() {
        Employee employee = Employee.builder()
            .id(1L)
            .email("alex.kim@company.com")
            .status(Employee.EmployeeStatus.OFFBOARDED)
            .offboardedAt(LocalDateTime.now())
            .build();
        when(employeeRepository.findById(1L)).thenReturn(Optional.of(employee));

        assertThatThrownBy(() -> employeeService.offboard(1L))
            .isInstanceOf(AlreadyOffboardedException.class);

        verify(employeeRepository, never()).save(any());
    }
}
