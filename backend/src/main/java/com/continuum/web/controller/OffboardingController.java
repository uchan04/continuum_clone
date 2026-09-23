package com.continuum.web.controller;

import com.continuum.domain.model.OffboardingResult;
import com.continuum.service.OffboardingService;
import com.continuum.web.dto.ApiResponse;
import com.continuum.web.dto.OffboardingEventRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Offboarding Controller
 * 
 * Webhook endpoint for receiving offboarding events from HR/ERP systems.
 */
@RestController
@RequestMapping("/api/v1/offboarding")
@RequiredArgsConstructor
@Slf4j
public class OffboardingController {

    private final OffboardingService offboardingService;

    /**
     * Receive offboarding event webhook
     * POST /api/v1/offboarding/event
     * 
     * Public endpoint - requires API key authentication (X-API-Key header)
     */
    @PostMapping("/event")
    public ResponseEntity<ApiResponse<String>> receiveOffboardingEvent(
        @Valid @RequestBody OffboardingEventRequest request,
        @RequestHeader(value = "X-API-Key", required = false) String apiKey
    ) {
        try {
            log.info("Received offboarding event: eventId={}, email={}", 
                     request.getEventId(), request.getEmployeeEmail());

            // TODO: Validate API key
            // For MVP, we'll skip API key validation
            // In production, validate against stored API key in Redis or database

            // Process offboarding asynchronously (return 202 Accepted immediately)
            // For simplicity in MVP, we'll process synchronously
            OffboardingResult result = offboardingService.processOffboarding(
                request.getEventId(),
                request.getEmployeeEmail(),
                request.getOffboardedAt()
            );

            log.info("Offboarding event processed: eventId={}, status={}", 
                     request.getEventId(), result.getOverallStatus());

            return ResponseEntity.status(HttpStatus.ACCEPTED)
                .body(ApiResponse.success("Offboarding event accepted and processed", request.getEventId()));

        } catch (IllegalArgumentException e) {
            log.warn("Invalid offboarding event: {}", e.getMessage());
            return ResponseEntity.badRequest()
                .body(ApiResponse.error("Invalid event: " + e.getMessage()));
        } catch (Exception e) {
            log.error("Error processing offboarding event", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("Failed to process offboarding event: " + e.getMessage()));
        }
    }
}
