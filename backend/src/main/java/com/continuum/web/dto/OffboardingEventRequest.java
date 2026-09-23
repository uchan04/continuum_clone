package com.continuum.web.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Offboarding Event Request DTO
 * 
 * Webhook payload from HR/ERP system
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class OffboardingEventRequest {

    @NotBlank(message = "Event ID is required")
    @JsonProperty("event_id")
    private String eventId;

    @NotBlank(message = "Event type is required")
    @JsonProperty("event_type")
    private String eventType;

    @NotBlank(message = "Employee email is required")
    @Email(message = "Invalid email format")
    @JsonProperty("employee_email")
    private String employeeEmail;

    @NotNull(message = "Offboarded timestamp is required")
    @JsonProperty("offboarded_at")
    private LocalDateTime offboardedAt;
}
