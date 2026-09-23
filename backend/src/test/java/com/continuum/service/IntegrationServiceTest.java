package com.continuum.service;

import com.continuum.domain.model.IntegrationConfig;
import com.continuum.repository.IntegrationConfigRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.client.RestTemplate;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.contains;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class IntegrationServiceTest {

    @Mock
    private IntegrationConfigRepository integrationConfigRepository;

    @Mock
    private EncryptionService encryptionService;

    @Mock
    private GoogleServiceAccountTokenProvider googleTokenProvider;

    @Mock
    private RestTemplate restTemplate;

    private IntegrationService integrationService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @BeforeEach
    void setUp() {
        integrationService = new IntegrationService(
            integrationConfigRepository, encryptionService, googleTokenProvider, restTemplate
        );
        ReflectionTestUtils.setField(integrationService, "slackScimBaseUrl", "https://api.slack.com/scim/v2");
        ReflectionTestUtils.setField(integrationService, "googleApiBaseUrl", "https://admin.googleapis.com");
        ReflectionTestUtils.setField(integrationService, "googleSignOutEndpoint", "/admin/directory/v1/users/{email}/signOut");
    }

    private IntegrationConfig slackConfig() {
        return IntegrationConfig.builder()
            .serviceName("SLACK")
            .encryptedClientSecret("encrypted-token")
            .status(IntegrationConfig.IntegrationStatus.CONNECTED)
            .build();
    }

    private IntegrationConfig googleConfig() {
        return IntegrationConfig.builder()
            .serviceName("GOOGLE_WORKSPACE")
            .clientId("admin@company.com")
            .encryptedClientSecret("encrypted-json")
            .status(IntegrationConfig.IntegrationStatus.CONNECTED)
            .build();
    }

    private ObjectNode scimUserFoundResponse(String scimId) {
        ObjectNode root = objectMapper.createObjectNode();
        ArrayNode resources = root.putArray("Resources");
        ObjectNode user = objectMapper.createObjectNode();
        user.put("id", scimId);
        resources.add(user);
        return root;
    }

    private ObjectNode scimUserNotFoundResponse() {
        ObjectNode root = objectMapper.createObjectNode();
        root.putArray("Resources");
        root.put("totalResults", 0);
        return root;
    }

    @Test
    void revokeSlackToken_succeeds_whenScimLookupFindsUserAndDeleteReturns2xx() {
        when(integrationConfigRepository.findByServiceName("SLACK")).thenReturn(Optional.of(slackConfig()));
        when(encryptionService.decrypt("encrypted-token")).thenReturn("scim-admin-token");

        when(restTemplate.exchange(
            contains("/Users?filter="), eq(HttpMethod.GET), any(HttpEntity.class), eq(JsonNode.class)
        )).thenReturn(ResponseEntity.ok(scimUserFoundResponse("W12345")));

        when(restTemplate.exchange(
            eq("https://api.slack.com/scim/v2/Users/W12345"), eq(HttpMethod.DELETE), any(HttpEntity.class), eq(Void.class)
        )).thenReturn(ResponseEntity.noContent().build());

        integrationService.revokeSlackToken("jane.doe@company.com");

        verify(restTemplate).exchange(
            eq("https://api.slack.com/scim/v2/Users/W12345"), eq(HttpMethod.DELETE), any(HttpEntity.class), eq(Void.class)
        );
    }

    @Test
    void revokeSlackToken_throwsEmployeeNotFound_whenScimLookupReturnsNoResources() {
        when(integrationConfigRepository.findByServiceName("SLACK")).thenReturn(Optional.of(slackConfig()));
        when(encryptionService.decrypt("encrypted-token")).thenReturn("scim-admin-token");

        when(restTemplate.exchange(
            contains("/Users?filter="), eq(HttpMethod.GET), any(HttpEntity.class), eq(JsonNode.class)
        )).thenReturn(ResponseEntity.ok(scimUserNotFoundResponse()));

        assertThatThrownBy(() -> integrationService.revokeSlackToken("ghost@company.com"))
            .isInstanceOf(IntegrationService.EmployeeNotFoundException.class);
    }

    @Test
    void revokeSlackToken_throwsTokenRevocationException_whenDeleteReturnsClientError() {
        when(integrationConfigRepository.findByServiceName("SLACK")).thenReturn(Optional.of(slackConfig()));
        when(encryptionService.decrypt("encrypted-token")).thenReturn("scim-admin-token");

        when(restTemplate.exchange(
            contains("/Users?filter="), eq(HttpMethod.GET), any(HttpEntity.class), eq(JsonNode.class)
        )).thenReturn(ResponseEntity.ok(scimUserFoundResponse("W12345")));

        when(restTemplate.exchange(
            eq("https://api.slack.com/scim/v2/Users/W12345"), eq(HttpMethod.DELETE), any(HttpEntity.class), eq(Void.class)
        )).thenThrow(org.springframework.web.client.HttpClientErrorException.create(
            HttpStatus.FORBIDDEN, "Forbidden", null, null, null));

        assertThatThrownBy(() -> integrationService.revokeSlackToken("jane.doe@company.com"))
            .isInstanceOf(IntegrationService.TokenRevocationException.class);
    }

    @Test
    void revokeSlackToken_throwsIntegrationNotConfigured_whenNoConfigStored() {
        when(integrationConfigRepository.findByServiceName("SLACK")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> integrationService.revokeSlackToken("jane.doe@company.com"))
            .isInstanceOf(IntegrationService.IntegrationNotConfiguredException.class);
    }

    @Test
    void revokeGoogleWorkspaceToken_succeeds_whenSignOutReturns2xx() {
        when(integrationConfigRepository.findByServiceName("GOOGLE_WORKSPACE")).thenReturn(Optional.of(googleConfig()));
        when(encryptionService.decrypt("encrypted-json")).thenReturn("{\"type\":\"service_account\"}");
        when(googleTokenProvider.mintAccessToken("{\"type\":\"service_account\"}", "admin@company.com"))
            .thenReturn("ya29.access-token");
        when(restTemplate.exchange(anyString(), eq(HttpMethod.POST), any(HttpEntity.class), eq(String.class)))
            .thenReturn(ResponseEntity.ok(""));

        integrationService.revokeGoogleWorkspaceToken("jane.doe@company.com");

        verify(restTemplate).exchange(
            eq("https://admin.googleapis.com/admin/directory/v1/users/jane.doe@company.com/signOut"),
            eq(HttpMethod.POST), any(HttpEntity.class), eq(String.class)
        );
    }

    @Test
    void revokeGoogleWorkspaceToken_throwsEmployeeNotFound_when404() {
        when(integrationConfigRepository.findByServiceName("GOOGLE_WORKSPACE")).thenReturn(Optional.of(googleConfig()));
        when(encryptionService.decrypt("encrypted-json")).thenReturn("{\"type\":\"service_account\"}");
        when(googleTokenProvider.mintAccessToken(anyString(), anyString())).thenReturn("ya29.access-token");
        when(restTemplate.exchange(anyString(), eq(HttpMethod.POST), any(HttpEntity.class), eq(String.class)))
            .thenThrow(org.springframework.web.client.HttpClientErrorException.create(
                HttpStatus.NOT_FOUND, "Not Found", null, null, null));

        assertThatThrownBy(() -> integrationService.revokeGoogleWorkspaceToken("ghost@company.com"))
            .isInstanceOf(IntegrationService.EmployeeNotFoundException.class);
    }

    @Test
    void configureSlack_throws_whenScimPingRejectsToken() {
        when(restTemplate.exchange(
            contains("/Users?count="), eq(HttpMethod.GET), any(HttpEntity.class), eq(JsonNode.class)
        )).thenThrow(org.springframework.web.client.HttpClientErrorException.create(
            HttpStatus.UNAUTHORIZED, "Unauthorized", null, null, null));

        assertThatThrownBy(() -> integrationService.configureSlack("bad-token"))
            .isInstanceOf(IntegrationService.TokenRevocationException.class);

        verify(integrationConfigRepository, never()).save(any());
    }

    @Test
    void configureSlack_persistsEncryptedToken_whenScimPingSucceeds() {
        when(restTemplate.exchange(
            contains("/Users?count="), eq(HttpMethod.GET), any(HttpEntity.class), eq(JsonNode.class)
        )).thenReturn(ResponseEntity.ok(objectMapper.createObjectNode()));
        when(encryptionService.encrypt("good-token")).thenReturn("encrypted-good-token");
        when(integrationConfigRepository.findByServiceName("SLACK")).thenReturn(Optional.empty());
        when(integrationConfigRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));

        IntegrationConfig result = integrationService.configureSlack("good-token");

        org.assertj.core.api.Assertions.assertThat(result.getEncryptedClientSecret()).isEqualTo("encrypted-good-token");
        org.assertj.core.api.Assertions.assertThat(result.getStatus()).isEqualTo(IntegrationConfig.IntegrationStatus.CONNECTED);
    }
}
