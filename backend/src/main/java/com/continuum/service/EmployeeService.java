package com.continuum.service;

import com.continuum.domain.model.Employee;
import com.continuum.repository.EmployeeRepository;
import com.continuum.web.dto.EmployeeCreateRequest;
import com.continuum.web.dto.EmployeeResponse;
import com.continuum.web.exception.AlreadyOffboardedException;
import com.continuum.web.exception.DuplicateEmployeeException;
import com.continuum.web.exception.EmployeeNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

/**
 * Employee Service
 *
 * Orchestrates employee lifecycle: register, list/search, get, offboard (soft delete).
 * Deliberately decoupled from OffboardingService/AuditService in this cycle
 * (see aidlc-docs/inception/requirements/requirements.md addendum).
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class EmployeeService {

    private final EmployeeRepository employeeRepository;

    /**
     * Register a new employee (FR2, BR1-BR3)
     */
    @Transactional
    public EmployeeResponse register(EmployeeCreateRequest request) {
        employeeRepository.findByEmailIgnoreCase(request.getEmail()).ifPresent(existing -> {
            throw new DuplicateEmployeeException("Employee with this email already exists: " + request.getEmail());
        });

        Employee employee = Employee.builder()
            .name(request.getName())
            .email(request.getEmail())
            .department(request.getDepartment())
            .position(request.getPosition())
            .hireDate(request.getHireDate())
            .status(Employee.EmployeeStatus.ACTIVE)
            .build();

        employee = employeeRepository.save(employee);
        log.info("Employee registered: id={}, email={}", employee.getId(), employee.getEmail());

        return EmployeeResponse.fromEntity(employee);
    }

    /**
     * List/search employees with optional query and status filter (FR1, BR7, BR8)
     */
    @Transactional(readOnly = true)
    public Page<EmployeeResponse> list(String query, Employee.EmployeeStatus status, Pageable pageable) {
        return employeeRepository.search(query, status, pageable).map(EmployeeResponse::fromEntity);
    }

    /**
     * Get a single employee by id (FR4, BR6)
     */
    @Transactional(readOnly = true)
    public EmployeeResponse getById(Long id) {
        Employee employee = findEmployeeOrThrow(id);
        return EmployeeResponse.fromEntity(employee);
    }

    /**
     * Offboard (soft-delete) an employee (FR3, BR4, BR5, BR6)
     */
    @Transactional
    public EmployeeResponse offboard(Long id) {
        Employee employee = findEmployeeOrThrow(id);

        if (employee.getStatus() == Employee.EmployeeStatus.OFFBOARDED) {
            throw new AlreadyOffboardedException("Employee is already offboarded: " + id);
        }

        employee.setStatus(Employee.EmployeeStatus.OFFBOARDED);
        employee.setOffboardedAt(LocalDateTime.now());
        employee = employeeRepository.save(employee);

        log.info("Employee offboarded: id={}, email={}", employee.getId(), employee.getEmail());

        return EmployeeResponse.fromEntity(employee);
    }

    private Employee findEmployeeOrThrow(Long id) {
        return employeeRepository.findById(id)
            .orElseThrow(() -> new EmployeeNotFoundException("Employee not found: " + id));
    }
}
