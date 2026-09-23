package com.continuum.web.controller;

import com.continuum.domain.model.OffboardingEvent;
import com.continuum.domain.model.OffboardingStep;
import com.continuum.service.OffboardingService;
import com.continuum.web.dto.ApiResponse;
import com.continuum.web.dto.OffboardingEventResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Event Controller
 * 
 * Dashboard endpoints for viewing offboarding events.
 * Protected by JWT authentication.
 */
@RestController
@RequestMapping("/api/v1/events")
@RequiredArgsConstructor
@Slf4j
public class EventController {

    private final OffboardingService offboardingService;

    /**
     * Get recent offboarding events
     * GET /api/v1/events/recent?limit=10
     */
    @GetMapping("/recent")
    public ResponseEntity<ApiResponse<Page<OffboardingEventResponse>>> getRecentEvents(
        @RequestParam(defaultValue = "10") int limit
    ) {
        try {
            Pageable pageable = PageRequest.of(0, limit);
            Page<OffboardingEvent> events = offboardingService.getRecentEvents(pageable);
            
            Page<OffboardingEventResponse> response = events.map(event -> {
                List<OffboardingStep> steps = offboardingService.getStepsForEvent(event.getEventId());
                List<OffboardingEventResponse.StepResponse> stepResponses = steps.stream()
                    .map(step -> OffboardingEventResponse.StepResponse.builder()
                        .serviceName(step.getServiceName())
                        .status(step.getStatus().toString())
                        .errorMessage(step.getErrorMessage())
                        .processingTimeMs(step.getProcessingTimeMs())
                        .build())
                    .collect(Collectors.toList());
                
                return OffboardingEventResponse.fromEntity(event, stepResponses);
            });

            return ResponseEntity.ok(ApiResponse.success(response));

        } catch (Exception e) {
            log.error("Error fetching recent events", e);
            return ResponseEntity.status(500)
                .body(ApiResponse.error("Failed to fetch events: " + e.getMessage()));
        }
    }

    /**
     * Get offboarding event by ID
     * GET /api/v1/events/{eventId}
     */
    @GetMapping("/{eventId}")
    public ResponseEntity<ApiResponse<OffboardingEventResponse>> getEventById(@PathVariable String eventId) {
        try {
            OffboardingEvent event = offboardingService.getEventById(eventId);
            List<OffboardingStep> steps = offboardingService.getStepsForEvent(eventId);
            
            List<OffboardingEventResponse.StepResponse> stepResponses = steps.stream()
                .map(step -> OffboardingEventResponse.StepResponse.builder()
                    .serviceName(step.getServiceName())
                    .status(step.getStatus().toString())
                    .errorMessage(step.getErrorMessage())
                    .processingTimeMs(step.getProcessingTimeMs())
                    .build())
                .collect(Collectors.toList());
            
            OffboardingEventResponse response = OffboardingEventResponse.fromEntity(event, stepResponses);

            return ResponseEntity.ok(ApiResponse.success(response));

        } catch (IllegalArgumentException e) {
            log.warn("Event not found: {}", eventId);
            return ResponseEntity.status(404)
                .body(ApiResponse.error("Event not found: " + eventId));
        } catch (Exception e) {
            log.error("Error fetching event: {}", eventId, e);
            return ResponseEntity.status(500)
                .body(ApiResponse.error("Failed to fetch event: " + e.getMessage()));
        }
    }

    /**
     * Get events by employee email
     * GET /api/v1/events/employee/{email}?page=0&size=10
     */
    @GetMapping("/employee/{email}")
    public ResponseEntity<ApiResponse<Page<OffboardingEventResponse>>> getEventsByEmployee(
        @PathVariable String email,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "10") int size
    ) {
        try {
            Pageable pageable = PageRequest.of(page, size);
            Page<OffboardingEvent> events = offboardingService.getEventsByEmployee(email, pageable);
            
            Page<OffboardingEventResponse> response = events.map(event -> {
                List<OffboardingStep> steps = offboardingService.getStepsForEvent(event.getEventId());
                List<OffboardingEventResponse.StepResponse> stepResponses = steps.stream()
                    .map(step -> OffboardingEventResponse.StepResponse.builder()
                        .serviceName(step.getServiceName())
                        .status(step.getStatus().toString())
                        .errorMessage(step.getErrorMessage())
                        .processingTimeMs(step.getProcessingTimeMs())
                        .build())
                    .collect(Collectors.toList());
                
                return OffboardingEventResponse.fromEntity(event, stepResponses);
            });

            return ResponseEntity.ok(ApiResponse.success(response));

        } catch (Exception e) {
            log.error("Error fetching events for employee: {}", email, e);
            return ResponseEntity.status(500)
                .body(ApiResponse.error("Failed to fetch events: " + e.getMessage()));
        }
    }

    /**
     * Get events by date range
     * GET /api/v1/events/search?startDate=2026-01-01T00:00:00&endDate=2026-12-31T23:59:59&page=0&size=10
     */
    @GetMapping("/search")
    public ResponseEntity<ApiResponse<Page<OffboardingEventResponse>>> searchEvents(
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "10") int size
    ) {
        try {
            Pageable pageable = PageRequest.of(page, size);
            Page<OffboardingEvent> events = offboardingService.getEventsByDateRange(startDate, endDate, pageable);
            
            Page<OffboardingEventResponse> response = events.map(event -> {
                List<OffboardingStep> steps = offboardingService.getStepsForEvent(event.getEventId());
                List<OffboardingEventResponse.StepResponse> stepResponses = steps.stream()
                    .map(step -> OffboardingEventResponse.StepResponse.builder()
                        .serviceName(step.getServiceName())
                        .status(step.getStatus().toString())
                        .errorMessage(step.getErrorMessage())
                        .processingTimeMs(step.getProcessingTimeMs())
                        .build())
                    .collect(Collectors.toList());
                
                return OffboardingEventResponse.fromEntity(event, stepResponses);
            });

            return ResponseEntity.ok(ApiResponse.success(response));

        } catch (Exception e) {
            log.error("Error searching events", e);
            return ResponseEntity.status(500)
                .body(ApiResponse.error("Failed to search events: " + e.getMessage()));
        }
    }

    /**
     * Get event statistics
     * GET /api/v1/events/statistics
     */
    @GetMapping("/statistics")
    public ResponseEntity<ApiResponse<OffboardingService.OffboardingStatistics>> getStatistics() {
        try {
            OffboardingService.OffboardingStatistics stats = offboardingService.getStatistics();
            return ResponseEntity.ok(ApiResponse.success(stats));

        } catch (Exception e) {
            log.error("Error fetching statistics", e);
            return ResponseEntity.status(500)
                .body(ApiResponse.error("Failed to fetch statistics: " + e.getMessage()));
        }
    }
}
