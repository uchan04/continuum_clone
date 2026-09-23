package com.continuum.web.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Slack Integration Request DTO
 *
 * Carries an admin-scoped Slack token (e.g. xoxp-... with admin.users.session:write)
 * generated manually by a workspace admin — no OAuth redirect flow.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SlackIntegrationRequest {

    @NotBlank(message = "Slack admin token is required")
    @JsonProperty("token")
    private String token;
}
