package com.continuum.service;

import com.continuum.domain.model.IntegrationConfig;
import com.continuum.repository.IntegrationConfigRepository;
import com.fasterxml.jackson.databind.JsonNode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.HttpServerErrorException;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

/**
 * Integration Service
 *
 * Manages external service integrations (Slack, Google Workspace) and
 * performs admin-level session/token revocation for offboarded employees.
 *
 * Slack: uses a manually-issued SCIM API token (no OAuth redirect flow).
 * SCIM is used instead of the Web API admin.* namespace because admin.* is
 * Enterprise Grid-only, while SCIM is available on Business+ (the realistic
 * plan tier for this product's target company size) without requiring
 * SSO/SAML to be configured.
 *
 * Google Workspace: uses a domain-wide-delegated service account. A fresh
 * access token is minted per call via {@link GoogleServiceAccountTokenProvider}
 * — no refresh token is stored or needed.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class IntegrationService {

    private final IntegrationConfigRepository integrationConfigRepository;
    private final EncryptionService encryptionService;
    private final GoogleServiceAccountTokenProvider googleTokenProvider;
    private final RestTemplate restTemplate;

    @Value("${continuum.integrations.slack.scim-base-url}")
    private String slackScimBaseUrl;

    @Value("${continuum.integrations.google-workspace.api-base-url}")
    private String googleApiBaseUrl;

    @Value("${continuum.integrations.google-workspace.sign-out-endpoint}")
    private String googleSignOutEndpoint;

    /**
     * Configure Slack integration with a manually-issued SCIM token.
     * Validates the token against Slack's SCIM Users endpoint before persisting it.
     */
    @Transactional
    public IntegrationConfig configureSlack(String scimToken) {
        log.info("Configuring Slack integration");

        if (!pingSlackScim(scimToken)) {
            throw new TokenRevocationException("Slack token validation failed (SCIM Users endpoint rejected the token)");
        }

        String encryptedToken = encryptionService.encrypt(scimToken);

        IntegrationConfig config = integrationConfigRepository
            .findByServiceName("SLACK")
            .orElse(IntegrationConfig.builder()
                .serviceName("SLACK")
                .build());

        config.setClientId(null);
        config.setEncryptedClientSecret(encryptedToken);
        config.setStatus(IntegrationConfig.IntegrationStatus.CONNECTED);
        config.setLastChecked(LocalDateTime.now());

        return integrationConfigRepository.save(config);
    }

    /**
     * Configure Google Workspace integration with a domain-wide-delegated
     * service account. Validates by minting a real access token before persisting.
     */
    @Transactional
    public IntegrationConfig configureGoogleWorkspace(String serviceAccountJson, String adminEmail) {
        log.info("Configuring Google Workspace integration");

        // Validate by minting a token now; throws GoogleTokenException on failure.
        googleTokenProvider.mintAccessToken(serviceAccountJson, adminEmail);

        String encryptedKey = encryptionService.encrypt(serviceAccountJson);

        IntegrationConfig config = integrationConfigRepository
            .findByServiceName("GOOGLE_WORKSPACE")
            .orElse(IntegrationConfig.builder()
                .serviceName("GOOGLE_WORKSPACE")
                .build());

        config.setClientId(adminEmail);
        config.setEncryptedClientSecret(encryptedKey);
        config.setStatus(IntegrationConfig.IntegrationStatus.CONNECTED);
        config.setLastChecked(LocalDateTime.now());

        return integrationConfigRepository.save(config);
    }

    /**
     * Revoke Slack access for employee: resolve their SCIM user id by email,
     * then deactivate the account via SCIM DELETE (Business+ compatible —
     * does not require Enterprise Grid or SSO/SAML).
     */
    public void revokeSlackToken(String employeeEmail) {
        log.info("Deactivating Slack account for employee: {}", employeeEmail);

        IntegrationConfig config = requireConfig("SLACK");
        String scimToken = encryptionService.decrypt(config.getEncryptedClientSecret());

        try {
            String scimUserId = lookupSlackScimUserId(scimToken, employeeEmail);

            HttpHeaders headers = new HttpHeaders();
            headers.setBearerAuth(scimToken);
            HttpEntity<Void> request = new HttpEntity<>(headers);

            String url = slackScimBaseUrl + "/Users/" + scimUserId;
            ResponseEntity<Void> response = restTemplate.exchange(url, HttpMethod.DELETE, request, Void.class);

            if (!response.getStatusCode().is2xxSuccessful()) {
                log.error("Slack SCIM deactivation failed for {}. Status: {}", employeeEmail, response.getStatusCode());
                throw new TokenRevocationException("Slack SCIM deactivation failed with status: " + response.getStatusCode());
            }

            log.info("Successfully deactivated Slack account for employee: {}", employeeEmail);

        } catch (TokenRevocationException | EmployeeNotFoundException e) {
            throw e;
        } catch (HttpClientErrorException e) {
            if (e.getStatusCode() == HttpStatus.NOT_FOUND) {
                log.warn("Employee not found in Slack: {}", employeeEmail);
                throw new EmployeeNotFoundException("Employee not found in Slack: " + employeeEmail);
            }
            handleSlackHttpError(employeeEmail, e);
        } catch (HttpServerErrorException e) {
            log.error("Slack API server error: {}", e.getMessage());
            throw new TokenRevocationException("Slack API server error: " + e.getMessage());
        } catch (ResourceAccessException e) {
            log.error("Slack API timeout or connection error: {}", e.getMessage());
            throw new TokenRevocationException("Slack API connection error: " + e.getMessage());
        } catch (Exception e) {
            log.error("Unexpected error revoking Slack access: {}", e.getMessage(), e);
            throw new TokenRevocationException("Unexpected error: " + e.getMessage());
        }
    }

    /**
     * Revoke Google Workspace session for employee via the Admin SDK Directory
     * API's users.signOut, authenticated as the domain-wide-delegated service account.
     */
    public void revokeGoogleWorkspaceToken(String employeeEmail) {
        log.info("Revoking Google Workspace session for employee: {}", employeeEmail);

        IntegrationConfig config = requireConfig("GOOGLE_WORKSPACE");
        String serviceAccountJson = encryptionService.decrypt(config.getEncryptedClientSecret());
        String adminEmail = config.getClientId();

        try {
            String accessToken = googleTokenProvider.mintAccessToken(serviceAccountJson, adminEmail);

            HttpHeaders headers = new HttpHeaders();
            headers.setBearerAuth(accessToken);

            HttpEntity<Void> request = new HttpEntity<>(headers);
            String url = googleApiBaseUrl + googleSignOutEndpoint.replace("{email}", employeeEmail);

            ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.POST, request, String.class);

            if (response.getStatusCode().is2xxSuccessful()) {
                log.info("Successfully signed out Google Workspace sessions for employee: {}", employeeEmail);
            } else {
                log.error("Failed to sign out Google Workspace user. Status: {}", response.getStatusCode());
                throw new TokenRevocationException("Google Workspace sign-out failed with status: " + response.getStatusCode());
            }

        } catch (GoogleServiceAccountTokenProvider.GoogleTokenException e) {
            log.error("Failed to mint Google access token for {}: {}", employeeEmail, e.getMessage());
            throw new TokenRevocationException("Google authentication failed: " + e.getMessage());
        } catch (HttpClientErrorException e) {
            if (e.getStatusCode() == HttpStatus.NOT_FOUND) {
                log.warn("Employee not found in Google Workspace: {}", employeeEmail);
                throw new EmployeeNotFoundException("Employee not found in Google Workspace: " + employeeEmail);
            } else if (e.getStatusCode() == HttpStatus.TOO_MANY_REQUESTS) {
                log.error("Google API rate limit exceeded");
                throw new TokenRevocationException("Google API rate limit exceeded");
            } else {
                log.error("Google API client error: {}", e.getMessage());
                throw new TokenRevocationException("Google API error: " + e.getMessage());
            }
        } catch (HttpServerErrorException e) {
            log.error("Google API server error: {}", e.getMessage());
            throw new TokenRevocationException("Google API server error: " + e.getMessage());
        } catch (ResourceAccessException e) {
            log.error("Google API timeout or connection error: {}", e.getMessage());
            throw new TokenRevocationException("Google API connection error: " + e.getMessage());
        }
    }

    /**
     * Get integration status
     */
    @Transactional(readOnly = true)
    public Map<String, IntegrationStatus> getIntegrationStatus() {
        Map<String, IntegrationStatus> statusMap = new HashMap<>();

        integrationConfigRepository.findByServiceName("SLACK")
            .ifPresentOrElse(
                config -> statusMap.put("SLACK", new IntegrationStatus(
                    config.getStatus().toString(),
                    config.getLastChecked()
                )),
                () -> statusMap.put("SLACK", new IntegrationStatus("NOT_CONFIGURED", null))
            );

        integrationConfigRepository.findByServiceName("GOOGLE_WORKSPACE")
            .ifPresentOrElse(
                config -> statusMap.put("GOOGLE_WORKSPACE", new IntegrationStatus(
                    config.getStatus().toString(),
                    config.getLastChecked()
                )),
                () -> statusMap.put("GOOGLE_WORKSPACE", new IntegrationStatus("NOT_CONFIGURED", null))
            );

        return statusMap;
    }

    /**
     * Test connection to Slack via a lightweight SCIM Users call.
     */
    public boolean testSlackConnection() {
        Optional<IntegrationConfig> configOpt = integrationConfigRepository.findByServiceName("SLACK");
        if (configOpt.isEmpty()) {
            return false;
        }

        try {
            String scimToken = encryptionService.decrypt(configOpt.get().getEncryptedClientSecret());
            return pingSlackScim(scimToken);
        } catch (Exception e) {
            log.error("Slack connection test failed", e);
            return false;
        }
    }

    /**
     * Test connection to Google Workspace by minting a real access token.
     */
    public boolean testGoogleWorkspaceConnection() {
        Optional<IntegrationConfig> configOpt = integrationConfigRepository.findByServiceName("GOOGLE_WORKSPACE");
        if (configOpt.isEmpty()) {
            return false;
        }

        try {
            IntegrationConfig config = configOpt.get();
            String serviceAccountJson = encryptionService.decrypt(config.getEncryptedClientSecret());
            googleTokenProvider.mintAccessToken(serviceAccountJson, config.getClientId());
            return true;
        } catch (Exception e) {
            log.error("Google Workspace connection test failed", e);
            return false;
        }
    }

    private IntegrationConfig requireConfig(String serviceName) {
        return integrationConfigRepository.findByServiceName(serviceName)
            .orElseThrow(() -> {
                log.warn("{} integration not configured. Skipping revocation.", serviceName);
                return new IntegrationNotConfiguredException(serviceName + " integration not configured");
            });
    }

    private boolean pingSlackScim(String scimToken) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setBearerAuth(scimToken);
            HttpEntity<Void> request = new HttpEntity<>(headers);

            String url = UriComponentsBuilder.fromHttpUrl(slackScimBaseUrl + "/Users")
                .queryParam("count", 1)
                .toUriString();

            ResponseEntity<JsonNode> response = restTemplate.exchange(url, HttpMethod.GET, request, JsonNode.class);
            return response.getStatusCode().is2xxSuccessful();
        } catch (Exception e) {
            log.warn("Slack SCIM ping failed: {}", e.getMessage());
            return false;
        }
    }

    private String lookupSlackScimUserId(String scimToken, String employeeEmail) {
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(scimToken);
        HttpEntity<Void> request = new HttpEntity<>(headers);

        String url = UriComponentsBuilder.fromHttpUrl(slackScimBaseUrl + "/Users")
            .queryParam("filter", "email eq \"" + employeeEmail + "\"")
            .encode()
            .toUriString();

        ResponseEntity<JsonNode> response = restTemplate.exchange(url, HttpMethod.GET, request, JsonNode.class);

        JsonNode body = response.getBody();
        JsonNode resources = body != null ? body.path("Resources") : null;
        if (resources == null || !resources.isArray() || resources.isEmpty()) {
            throw new EmployeeNotFoundException("Employee not found in Slack: " + employeeEmail);
        }

        return resources.get(0).path("id").asText();
    }

    private void handleSlackHttpError(String employeeEmail, HttpClientErrorException e) {
        if (e.getStatusCode() == HttpStatus.TOO_MANY_REQUESTS) {
            log.error("Slack API rate limit exceeded");
            throw new TokenRevocationException("Slack API rate limit exceeded");
        }
        log.error("Slack API client error for {}: {}", employeeEmail, e.getMessage());
        throw new TokenRevocationException("Slack API error: " + e.getMessage());
    }

    /**
     * Integration status DTO
     */
    public record IntegrationStatus(String status, LocalDateTime lastChecked) {}

    /**
     * Custom exceptions
     */
    public static class IntegrationNotConfiguredException extends RuntimeException {
        public IntegrationNotConfiguredException(String message) {
            super(message);
        }
    }

    public static class TokenRevocationException extends RuntimeException {
        public TokenRevocationException(String message) {
            super(message);
        }
    }

    public static class EmployeeNotFoundException extends RuntimeException {
        public EmployeeNotFoundException(String message) {
            super(message);
        }
    }
}
