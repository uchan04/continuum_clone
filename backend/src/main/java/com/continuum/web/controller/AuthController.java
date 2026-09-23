package com.continuum.web.controller;

import com.continuum.web.dto.ApiResponse;
import com.continuum.web.dto.LoginRequest;
import com.continuum.web.dto.LoginResponse;
import com.continuum.web.security.JwtService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

/**
 * Authentication Controller
 * 
 * Handles login and JWT token generation.
 */
@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
@Slf4j
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;

    @Value("${continuum.security.jwt.expiration-ms}")
    private long jwtExpirationMs;

    /**
     * Login endpoint
     * POST /api/v1/auth/login
     */
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<LoginResponse>> login(@Valid @RequestBody LoginRequest request) {
        try {
            log.info("Login attempt for user: {}", request.getEmail());

            // Authenticate user
            Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
            );

            UserDetails userDetails = (UserDetails) authentication.getPrincipal();

            // Generate JWT token
            String token = jwtService.generateToken(userDetails);
            LocalDateTime expiresAt = LocalDateTime.now().plusSeconds(jwtExpirationMs / 1000);

            LoginResponse response = LoginResponse.builder()
                .token(token)
                .type("Bearer")
                .expiresAt(expiresAt)
                .email(userDetails.getUsername())
                .build();

            log.info("Login successful for user: {}", request.getEmail());

            return ResponseEntity.ok(ApiResponse.success("Login successful", response));

        } catch (BadCredentialsException e) {
            log.warn("Login failed for user: {} - Invalid credentials", request.getEmail());
            return ResponseEntity.status(401)
                .body(ApiResponse.error("Invalid email or password"));
        } catch (Exception e) {
            log.error("Login error for user: {}", request.getEmail(), e);
            return ResponseEntity.status(500)
                .body(ApiResponse.error("Login failed: " + e.getMessage()));
        }
    }

    /**
     * Logout endpoint
     * POST /api/v1/auth/logout
     */
    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout() {
        // In a stateless JWT system, logout is handled client-side by discarding the token
        // For additional security, you could implement token blacklisting with Redis
        log.info("Logout requested");
        return ResponseEntity.ok(ApiResponse.success("Logout successful", null));
    }
}
