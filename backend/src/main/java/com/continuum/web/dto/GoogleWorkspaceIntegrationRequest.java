package com.continuum.web.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Google Workspace Integration Request DTO
 *
 * Carries a service-account JSON key (domain-wide delegated) and the
 * super-admin email to impersonate when calling the Admin SDK Directory API.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class GoogleWorkspaceIntegrationRequest {

    @NotBlank(message = "Service account JSON key is required")
    @JsonProperty("service_account_json")
    private String serviceAccountJson;

    @NotBlank(message = "Admin email is required")
    @Email(message = "Admin email must be a valid email address")
    @JsonProperty("admin_email")
    private String adminEmail;
}
