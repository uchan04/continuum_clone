package com.continuum.web.controller;

import com.continuum.domain.model.Employee;
import com.continuum.service.EmployeeService;
import com.continuum.web.dto.ApiResponse;
import com.continuum.web.dto.EmployeeCreateRequest;
import com.continuum.web.dto.EmployeeResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Employee Controller
 *
 * Admin dashboard endpoints for employee list/register/offboard.
 * Protected by JWT authentication (covered by the existing /api/v1/** security rule).
 */
@RestController
@RequestMapping("/api/v1/employees")
@RequiredArgsConstructor
@Slf4j
public class EmployeeController {

    private final EmployeeService employeeService;

    /**
     * Register a new employee
     * POST /api/v1/employees
     */
    @PostMapping
    public ResponseEntity<ApiResponse<EmployeeResponse>> register(@Valid @RequestBody EmployeeCreateRequest request) {
        EmployeeResponse response = employeeService.register(request);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    /**
     * List/search employees
     * GET /api/v1/employees?q=&status=&page=0&size=10
     */
    @GetMapping
    public ResponseEntity<ApiResponse<Page<EmployeeResponse>>> list(
        @RequestParam(required = false) String q,
        @RequestParam(required = false) Employee.EmployeeStatus status,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "10") int size
    ) {
        Pageable pageable = PageRequest.of(page, size);
        Page<EmployeeResponse> response = employeeService.list(q, status, pageable);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    /**
     * Get employee detail
     * GET /api/v1/employees/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<EmployeeResponse>> getById(@PathVariable Long id) {
        EmployeeResponse response = employeeService.getById(id);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    /**
     * Offboard (soft-delete) an employee
     * DELETE /api/v1/employees/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<EmployeeResponse>> offboard(@PathVariable Long id) {
        EmployeeResponse response = employeeService.offboard(id);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}
