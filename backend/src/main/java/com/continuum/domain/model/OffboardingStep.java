package com.continuum.domain.model;

import jakarta.persistence.*;
import lombok.*;

/**
 * Offboarding Step Entity
 * 
 * Represents a single service revocation step (Slack, Google, Redis).
 * Child entity of OffboardingEvent.
 */
@Entity
@Table(name = "offboarding_steps")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OffboardingStep {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "event_id", nullable = false)
    private String eventId;

    @Column(name = "service_name", nullable = false)
    private String serviceName;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private Status status;

    @Column(name = "error_message", columnDefinition = "TEXT")
    private String errorMessage;

    @Column(name = "processing_time_ms", nullable = false)
    private Integer processingTimeMs;

    /**
     * Status of individual service revocation
     */
    public enum Status {
        SUCCESS,    // Token revoked successfully
        FAILURE,    // Token revocation failed
        SKIPPED     // Service not configured or employee not found
    }
}
