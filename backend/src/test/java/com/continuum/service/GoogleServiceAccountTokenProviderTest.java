package com.continuum.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import java.security.KeyPair;
import java.security.KeyPairGenerator;
import java.util.Base64;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class GoogleServiceAccountTokenProviderTest {

    @Mock
    private RestTemplate restTemplate;

    private GoogleServiceAccountTokenProvider provider;
    private final ObjectMapper objectMapper = new ObjectMapper();
    private String serviceAccountJson;

    @BeforeEach
    void setUp() throws Exception {
        provider = new GoogleServiceAccountTokenProvider(restTemplate, objectMapper);
        ReflectionTestUtils.setField(provider, "tokenEndpoint", "https://oauth2.googleapis.com/token");
        ReflectionTestUtils.setField(provider, "adminScope", "https://www.googleapis.com/auth/admin.directory.user.security");

        KeyPairGenerator generator = KeyPairGenerator.getInstance("RSA");
        generator.initialize(2048);
        KeyPair keyPair = generator.generateKeyPair();
        String privateKeyPem = "-----BEGIN PRIVATE KEY-----\n"
            + Base64.getEncoder().encodeToString(keyPair.getPrivate().getEncoded())
            + "\n-----END PRIVATE KEY-----\n";

        ObjectNode key = objectMapper.createObjectNode();
        key.put("type", "service_account");
        key.put("client_email", "offboarding-bot@my-project.iam.gserviceaccount.com");
        key.put("private_key", privateKeyPem);
        key.put("token_uri", "https://oauth2.googleapis.com/token");
        serviceAccountJson = objectMapper.writeValueAsString(key);
    }

    @Test
    void mintAccessToken_returnsAccessToken_whenGoogleRespondsSuccessfully() {
        ObjectNode tokenResponse = objectMapper.createObjectNode();
        tokenResponse.put("access_token", "ya29.mocked-access-token");
        tokenResponse.put("expires_in", 3599);
        when(restTemplate.postForObject(anyString(), any(MultiValueMap.class), org.mockito.ArgumentMatchers.eq(JsonNode.class)))
            .thenReturn(tokenResponse);

        String token = provider.mintAccessToken(serviceAccountJson, "admin@company.com");

        assertThat(token).isEqualTo("ya29.mocked-access-token");
    }

    @Test
    void mintAccessToken_throws_whenGoogleResponseHasNoAccessToken() {
        ObjectNode tokenResponse = objectMapper.createObjectNode();
        tokenResponse.put("error", "invalid_grant");
        when(restTemplate.postForObject(anyString(), any(MultiValueMap.class), org.mockito.ArgumentMatchers.eq(JsonNode.class)))
            .thenReturn(tokenResponse);

        assertThatThrownBy(() -> provider.mintAccessToken(serviceAccountJson, "admin@company.com"))
            .isInstanceOf(GoogleServiceAccountTokenProvider.GoogleTokenException.class);
    }

    @Test
    void mintAccessToken_throws_whenServiceAccountJsonIsMalformed() {
        assertThatThrownBy(() -> provider.mintAccessToken("not-json", "admin@company.com"))
            .isInstanceOf(GoogleServiceAccountTokenProvider.GoogleTokenException.class);
    }
}
