package com.continuum.web.controller;

import com.continuum.domain.model.IntegrationConfig;
import com.continuum.service.GoogleServiceAccountTokenProvider;
import com.continuum.service.IntegrationService;
import com.continuum.web.dto.ApiResponse;
import com.continuum.web.dto.GoogleWorkspaceIntegrationRequest;
import com.continuum.web.dto.SlackIntegrationRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * Integration Controller
 * 
 * Manages external service integrations (Slack, Google Workspace).
 * Protected by JWT authentication.
 */
@RestController
@RequestMapping("/api/v1/integrations")
@RequiredArgsConstructor
@Slf4j
public class IntegrationController {

    private final IntegrationService integrationService;

    /**
     * Configure Slack integration
     * POST /api/v1/integrations/slack
     */
    @PostMapping("/slack")
    public ResponseEntity<ApiResponse<IntegrationConfig>> configureSlack(
        @Valid @RequestBody SlackIntegrationRequest request
    ) {
        try {
            log.info("Configuring Slack integration");

            IntegrationConfig config = integrationService.configureSlack(request.getToken());

            // Don't expose encrypted secret in response
            config.setEncryptedClientSecret("[ENCRYPTED]");

            return ResponseEntity.ok(ApiResponse.success("Slack integration configured successfully", config));

        } catch (IntegrationService.TokenRevocationException e) {
            log.warn("Invalid Slack token: {}", e.getMessage());
            return ResponseEntity.status(400)
                .body(ApiResponse.error("Failed to configure Slack: " + e.getMessage()));
        } catch (Exception e) {
            log.error("Error configuring Slack integration", e);
            return ResponseEntity.status(500)
                .body(ApiResponse.error("Failed to configure Slack: " + e.getMessage()));
        }
    }

    /**
     * Configure Google Workspace integration
     * POST /api/v1/integrations/google-workspace
     */
    @PostMapping("/google-workspace")
    public ResponseEntity<ApiResponse<IntegrationConfig>> configureGoogleWorkspace(
        @Valid @RequestBody GoogleWorkspaceIntegrationRequest request
    ) {
        try {
            log.info("Configuring Google Workspace integration");

            IntegrationConfig config = integrationService.configureGoogleWorkspace(
                request.getServiceAccountJson(),
                request.getAdminEmail()
            );

            // Don't expose encrypted secret in response
            config.setEncryptedClientSecret("[ENCRYPTED]");

            return ResponseEntity.ok(ApiResponse.success("Google Workspace integration configured successfully", config));

        } catch (GoogleServiceAccountTokenProvider.GoogleTokenException e) {
            log.warn("Invalid Google service account credentials: {}", e.getMessage());
            return ResponseEntity.status(400)
                .body(ApiResponse.error("Failed to configure Google Workspace: " + e.getMessage()));
        } catch (Exception e) {
            log.error("Error configuring Google Workspace integration", e);
            return ResponseEntity.status(500)
                .body(ApiResponse.error("Failed to configure Google Workspace: " + e.getMessage()));
        }
    }

    /**
     * Get integration status
     * GET /api/v1/integrations/status
     */
    @GetMapping("/status")
    public ResponseEntity<ApiResponse<Map<String, IntegrationService.IntegrationStatus>>> getIntegrationStatus() {
        try {
            Map<String, IntegrationService.IntegrationStatus> status = integrationService.getIntegrationStatus();
            return ResponseEntity.ok(ApiResponse.success(status));

        } catch (Exception e) {
            log.error("Error fetching integration status", e);
            return ResponseEntity.status(500)
                .body(ApiResponse.error("Failed to fetch integration status: " + e.getMessage()));
        }
    }

    /**
     * Test Slack connection
     * POST /api/v1/integrations/slack/test
     */
    @PostMapping("/slack/test")
    public ResponseEntity<ApiResponse<Boolean>> testSlackConnection() {
        try {
            boolean isConnected = integrationService.testSlackConnection();
            return ResponseEntity.ok(ApiResponse.success("Slack connection test completed", isConnected));

        } catch (Exception e) {
            log.error("Error testing Slack connection", e);
            return ResponseEntity.status(500)
                .body(ApiResponse.error("Failed to test Slack connection: " + e.getMessage()));
        }
    }

    /**
     * Test Google Workspace connection
     * POST /api/v1/integrations/google-workspace/test
     */
    @PostMapping("/google-workspace/test")
    public ResponseEntity<ApiResponse<Boolean>> testGoogleWorkspaceConnection() {
        try {
            boolean isConnected = integrationService.testGoogleWorkspaceConnection();
            return ResponseEntity.ok(ApiResponse.success("Google Workspace connection test completed", isConnected));

        } catch (Exception e) {
            log.error("Error testing Google Workspace connection", e);
            return ResponseEntity.status(500)
                .body(ApiResponse.error("Failed to test Google Workspace connection: " + e.getMessage()));
        }
    }
}
