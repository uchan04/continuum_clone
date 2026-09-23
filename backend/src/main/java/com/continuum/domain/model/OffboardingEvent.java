package com.continuum.domain.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Offboarding Event Entity
 * 
 * Represents a single offboarding event triggered by HR/ERP system.
 * Contains overall status and processing time for the entire operation.
 */
@Entity
@Table(name = "offboarding_events")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OffboardingEvent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "event_id", unique = true, nullable = false)
    private String eventId;

    @Column(name = "employee_email", nullable = false)
    private String employeeEmail;

    @Column(name = "offboarded_at", nullable = false)
    private LocalDateTime offboardedAt;

    @Enumerated(EnumType.STRING)
    @Column(name = "overall_status", nullable = false)
    private OverallStatus overallStatus;

    @Column(name = "total_processing_time_ms", nullable = false)
    private Integer totalProcessingTimeMs;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @OneToMany(mappedBy = "eventId", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<OffboardingStep> steps = new ArrayList<>();

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }

    /**
     * Overall status of offboarding operation
     */
    public enum OverallStatus {
        SUCCESS,           // All services succeeded or skipped
        PARTIAL_FAILURE,   // Some succeeded, some failed
        FAILURE            // All services failed
    }
}
