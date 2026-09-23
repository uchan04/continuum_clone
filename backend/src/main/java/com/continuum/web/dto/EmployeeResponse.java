package com.continuum.web.dto;

import com.continuum.domain.model.Employee;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Response body for an employee record
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EmployeeResponse {

    private Long id;
    private String name;
    private String email;
    private String department;
    private String position;
    private LocalDate hireDate;
    private String status;
    private LocalDateTime offboardedAt;
    private LocalDateTime createdAt;

    public static EmployeeResponse fromEntity(Employee employee) {
        return EmployeeResponse.builder()
            .id(employee.getId())
            .name(employee.getName())
            .email(employee.getEmail())
            .department(employee.getDepartment())
            .position(employee.getPosition())
            .hireDate(employee.getHireDate())
            .status(employee.getStatus().toString())
            .offboardedAt(employee.getOffboardedAt())
            .createdAt(employee.getCreatedAt())
            .build();
    }
}
