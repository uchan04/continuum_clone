package com.continuum.domain.model;

import lombok.*;

import java.util.List;

/**
 * Offboarding Result (DTO)
 * 
 * Result object returned by OffboardingEngine after processing.
 * Not persisted - used for business logic flow.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OffboardingResult {

    private String eventId;
    private String employeeEmail;
    private OffboardingEvent.OverallStatus overallStatus;
    private List<StepResult> steps;
    private long totalProcessingTimeMs;

    /**
     * Individual step result
     */
    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class StepResult {
        private String serviceName;
        private OffboardingStep.Status status;
        private String errorMessage;
        private long processingTimeMs;
    }
}
