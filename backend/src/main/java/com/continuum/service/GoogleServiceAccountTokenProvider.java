package com.continuum.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import java.security.KeyFactory;
import java.security.PrivateKey;
import java.security.spec.PKCS8EncodedKeySpec;
import java.time.Instant;
import java.util.Base64;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

/**
 * Google Service Account Token Provider
 *
 * Mints short-lived OAuth2 access tokens for a domain-wide-delegated service
 * account, impersonating a Workspace super-admin, per RFC 7523 (JWT Bearer
 * grant). No refresh tokens are involved — a fresh signed JWT is exchanged
 * for a fresh access token on every call.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class GoogleServiceAccountTokenProvider {

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    @Value("${continuum.integrations.google-workspace.token-endpoint}")
    private String tokenEndpoint;

    @Value("${continuum.integrations.google-workspace.admin-scope}")
    private String adminScope;

    /**
     * Mint an access token for the given service account, impersonating adminEmail.
     */
    public String mintAccessToken(String serviceAccountJson, String adminEmail) {
        try {
            JsonNode key = objectMapper.readTree(serviceAccountJson);
            String clientEmail = key.get("client_email").asText();
            String privateKeyPem = key.get("private_key").asText();
            String tokenUri = key.hasNonNull("token_uri") ? key.get("token_uri").asText() : tokenEndpoint;

            String assertion = signAssertion(clientEmail, adminEmail, privateKeyPem);

            MultiValueMap<String, String> form = new LinkedMultiValueMap<>();
            form.add("grant_type", "urn:ietf:params:oauth:grant-type:jwt-bearer");
            form.add("assertion", assertion);

            JsonNode response = restTemplate.postForObject(tokenUri, form, JsonNode.class);
            if (response == null || !response.hasNonNull("access_token")) {
                throw new GoogleTokenException("Google token endpoint returned no access_token");
            }
            return response.get("access_token").asText();

        } catch (GoogleTokenException e) {
            throw e;
        } catch (Exception e) {
            log.error("Failed to mint Google service-account access token", e);
            throw new GoogleTokenException("Failed to mint Google access token: " + e.getMessage());
        }
    }

    private String signAssertion(String clientEmail, String impersonatedEmail, String privateKeyPem) throws Exception {
        PrivateKey privateKey = parsePrivateKey(privateKeyPem);
        Instant now = Instant.now();

        Map<String, Object> claims = new HashMap<>();
        claims.put("scope", adminScope);

        return Jwts.builder()
            .setClaims(claims)
            .setIssuer(clientEmail)
            .setSubject(impersonatedEmail)
            .setAudience(tokenEndpoint)
            .setIssuedAt(Date.from(now))
            .setExpiration(Date.from(now.plusSeconds(3600)))
            .signWith(privateKey, SignatureAlgorithm.RS256)
            .compact();
    }

    private PrivateKey parsePrivateKey(String pem) throws Exception {
        String normalized = pem
            .replace("-----BEGIN PRIVATE KEY-----", "")
            .replace("-----END PRIVATE KEY-----", "")
            .replaceAll("\\s", "");
        byte[] der = Base64.getDecoder().decode(normalized);
        PKCS8EncodedKeySpec keySpec = new PKCS8EncodedKeySpec(der);
        return KeyFactory.getInstance("RSA").generatePrivate(keySpec);
    }

    public static class GoogleTokenException extends RuntimeException {
        public GoogleTokenException(String message) {
            super(message);
        }
    }
}
