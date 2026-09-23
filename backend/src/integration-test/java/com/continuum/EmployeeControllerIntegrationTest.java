package com.continuum;

import com.continuum.web.security.CustomUserDetailsService;
import com.continuum.web.security.JwtService;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.http.*;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Integration test for the Employee vertical slice (register/list/get/offboard),
 * exercised against a real PostgreSQL container with Flyway migrations applied.
 */
@Testcontainers
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class EmployeeControllerIntegrationTest {

    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:15-alpine")
        .withDatabaseName("continuum_test")
        .withUsername("test")
        .withPassword("test");

    @DynamicPropertySource
    static void registerProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", postgres::getJdbcUrl);
        registry.add("spring.datasource.username", postgres::getUsername);
        registry.add("spring.datasource.password", postgres::getPassword);
        registry.add("continuum.security.jwt.secret", () -> "integration-test-jwt-secret-key-must-be-at-least-32-bytes");
        registry.add("continuum.security.encryption.secret-key", () -> "0123456789abcdef0123456789abcdef");
    }

    @LocalServerPort
    private int port;

    @Autowired
    private TestRestTemplate restTemplate;

    @Autowired
    private CustomUserDetailsService userDetailsService;

    @Autowired
    private JwtService jwtService;

    private final ObjectMapper objectMapper = new ObjectMapper();
    private HttpHeaders authHeaders;

    @BeforeEach
    void setUp() {
        UserDetails admin = userDetailsService.loadUserByUsername("admin@continuum.com");
        String token = jwtService.generateToken(admin);
        authHeaders = new HttpHeaders();
        authHeaders.setContentType(MediaType.APPLICATION_JSON);
        authHeaders.setBearerAuth(token);
    }

    private String url(String path) {
        return "http://localhost:" + port + path;
    }

    @Test
    void registerListGetOffboard_fullLifecycle() throws Exception {
        String email = "integration.test." + System.nanoTime() + "@company.com";
        String createBody = objectMapper.writeValueAsString(new CreateRequest(
            "Integration Test", email, "QA", "Tester", "2024-01-15"
        ));

        ResponseEntity<String> createResponse = restTemplate.exchange(
            url("/api/v1/employees"), HttpMethod.POST, new HttpEntity<>(createBody, authHeaders), String.class
        );
        assertThat(createResponse.getStatusCode()).isEqualTo(HttpStatus.OK);
        JsonNode created = objectMapper.readTree(createResponse.getBody()).path("data");
        assertThat(created.path("status").asText()).isEqualTo("ACTIVE");
        long id = created.path("id").asLong();

        // Duplicate registration -> 409
        ResponseEntity<String> duplicateResponse = restTemplate.exchange(
            url("/api/v1/employees"), HttpMethod.POST, new HttpEntity<>(createBody, authHeaders), String.class
        );
        assertThat(duplicateResponse.getStatusCode()).isEqualTo(HttpStatus.CONFLICT);

        // List with search query finds the new employee
        ResponseEntity<String> listResponse = restTemplate.exchange(
            url("/api/v1/employees?q=" + email), HttpMethod.GET, new HttpEntity<>(authHeaders), String.class
        );
        assertThat(listResponse.getStatusCode()).isEqualTo(HttpStatus.OK);
        JsonNode content = objectMapper.readTree(listResponse.getBody()).path("data").path("content");
        assertThat(content.isArray()).isTrue();
        assertThat(content.size()).isGreaterThanOrEqualTo(1);

        // Get by id
        ResponseEntity<String> getResponse = restTemplate.exchange(
            url("/api/v1/employees/" + id), HttpMethod.GET, new HttpEntity<>(authHeaders), String.class
        );
        assertThat(getResponse.getStatusCode()).isEqualTo(HttpStatus.OK);

        // Offboard (soft delete)
        ResponseEntity<String> offboardResponse = restTemplate.exchange(
            url("/api/v1/employees/" + id), HttpMethod.DELETE, new HttpEntity<>(authHeaders), String.class
        );
        assertThat(offboardResponse.getStatusCode()).isEqualTo(HttpStatus.OK);
        JsonNode offboarded = objectMapper.readTree(offboardResponse.getBody()).path("data");
        assertThat(offboarded.path("status").asText()).isEqualTo("OFFBOARDED");

        // Offboarding again -> 409 (idempotency guard, BR5)
        ResponseEntity<String> reOffboardResponse = restTemplate.exchange(
            url("/api/v1/employees/" + id), HttpMethod.DELETE, new HttpEntity<>(authHeaders), String.class
        );
        assertThat(reOffboardResponse.getStatusCode()).isEqualTo(HttpStatus.CONFLICT);
    }

    @Test
    void getById_returnsNotFound_forMissingEmployee() {
        ResponseEntity<String> response = restTemplate.exchange(
            url("/api/v1/employees/999999999"), HttpMethod.GET, new HttpEntity<>(authHeaders), String.class
        );
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
    }

    @Test
    void endpoints_requireAuthentication() {
        ResponseEntity<String> response = restTemplate.exchange(
            url("/api/v1/employees"), HttpMethod.GET, HttpEntity.EMPTY, String.class
        );
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
    }

    private record CreateRequest(
        String name, String email, String department, String position, String hireDate
    ) {}
}
