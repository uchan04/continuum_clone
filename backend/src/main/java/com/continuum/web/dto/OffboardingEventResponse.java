package com.continuum.web.dto;

import com.continuum.domain.model.OffboardingEvent;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Offboarding Event Response DTO
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OffboardingEventResponse {

    @JsonProperty("event_id")
    private String eventId;

    @JsonProperty("employee_email")
    private String employeeEmail;

    @JsonProperty("offboarded_at")
    private LocalDateTime offboardedAt;

    @JsonProperty("overall_status")
    private String overallStatus;

    @JsonProperty("total_processing_time_ms")
    private Integer totalProcessingTimeMs;

    @JsonProperty("created_at")
    private LocalDateTime createdAt;

    private List<StepResponse> steps;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class StepResponse {
        @JsonProperty("service_name")
        private String serviceName;

        private String status;

        @JsonProperty("error_message")
        private String errorMessage;

        @JsonProperty("processing_time_ms")
        private Integer processingTimeMs;
    }

    /**
     * Create from entity
     */
    public static OffboardingEventResponse fromEntity(OffboardingEvent event, List<StepResponse> steps) {
        return OffboardingEventResponse.builder()
            .eventId(event.getEventId())
            .employeeEmail(event.getEmployeeEmail())
            .offboardedAt(event.getOffboardedAt())
            .overallStatus(event.getOverallStatus().toString())
            .totalProcessingTimeMs(event.getTotalProcessingTimeMs())
            .createdAt(event.getCreatedAt())
            .steps(steps)
            .build();
    }
}
