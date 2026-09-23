package com.continuum.domain.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * Integration Configuration Entity
 * 
 * Stores OAuth credentials for external services (Slack, Google Workspace).
 * Client secrets are encrypted using AES-256.
 */
@Entity
@Table(name = "integration_configs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class IntegrationConfig {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "service_name", unique = true, nullable = false)
    private String serviceName;

    /**
     * SLACK: unused (manual admin token stored in encryptedClientSecret).
     * GOOGLE_WORKSPACE: the impersonated super-admin email for domain-wide delegation.
     */
    @Column(name = "client_id")
    private String clientId;

    @Column(name = "encrypted_client_secret", nullable = false, columnDefinition = "TEXT")
    private String encryptedClientSecret;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    @Builder.Default
    private IntegrationStatus status = IntegrationStatus.DISCONNECTED;

    @Column(name = "last_checked")
    private LocalDateTime lastChecked;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        if (createdAt == null) {
            createdAt = now;
        }
        if (updatedAt == null) {
            updatedAt = now;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    /**
     * Integration connection status
     */
    public enum IntegrationStatus {
        CONNECTED,
        DISCONNECTED
    }
}
