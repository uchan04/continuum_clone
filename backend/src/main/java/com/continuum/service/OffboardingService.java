package com.continuum.service;

import com.continuum.domain.OffboardingEngine;
import com.continuum.domain.model.OffboardingEvent;
import com.continuum.domain.model.OffboardingResult;
import com.continuum.domain.model.OffboardingStep;
import com.continuum.repository.OffboardingEventRepository;
import com.continuum.repository.OffboardingStepRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Offboarding Service
 * 
 * Orchestrates offboarding workflow:
 * 1. Check idempotency (event_id uniqueness)
 * 2. Execute offboarding via OffboardingEngine
 * 3. Persist results to database
 * 4. Trigger audit logging
 * 5. Send notifications
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class OffboardingService {

    private final OffboardingEngine offboardingEngine;
    private final OffboardingEventRepository eventRepository;
    private final OffboardingStepRepository stepRepository;
    private final AuditService auditService;
    private final NotificationService notificationService;

    /**
     * Process offboarding event
     * 
     * Main entry point for offboarding workflow.
     * Ensures idempotency by checking event_id uniqueness.
     */
    @Transactional
    public OffboardingResult processOffboarding(String eventId, String employeeEmail, LocalDateTime offboardedAt) {
        log.info("Processing offboarding request: eventId={}, email={}", eventId, employeeEmail);

        // Check idempotency
        if (eventRepository.existsByEventId(eventId)) {
            log.warn("Duplicate event_id detected: {}. Returning existing result.", eventId);
            OffboardingEvent existingEvent = eventRepository.findByEventId(eventId)
                .orElseThrow(() -> new IllegalStateException("Event exists but cannot be retrieved"));
            return convertToResult(existingEvent);
        }

        // Execute offboarding
        OffboardingResult result = offboardingEngine.executeOffboarding(eventId, employeeEmail);

        // Persist to database
        OffboardingEvent event = saveOffboardingEvent(result, offboardedAt);

        // Log audit trail
        auditService.logOffboardingEvent(result);

        // Send notifications
        notificationService.sendOffboardingNotification(result);

        log.info("Offboarding completed: eventId={}, status={}, time={}ms", 
                 eventId, result.getOverallStatus(), result.getTotalProcessingTimeMs());

        return result;
    }

    /**
     * Save offboarding event and steps to database
     */
    private OffboardingEvent saveOffboardingEvent(OffboardingResult result, LocalDateTime offboardedAt) {
        // Create event entity
        OffboardingEvent event = OffboardingEvent.builder()
            .eventId(result.getEventId())
            .employeeEmail(result.getEmployeeEmail())
            .offboardedAt(offboardedAt)
            .overallStatus(result.getOverallStatus())
            .totalProcessingTimeMs((int) result.getTotalProcessingTimeMs())
            .build();

        event = eventRepository.save(event);

        // Create step entities
        List<OffboardingStep> steps = result.getSteps().stream()
            .map(stepResult -> OffboardingStep.builder()
                .eventId(result.getEventId())
                .serviceName(stepResult.getServiceName())
                .status(stepResult.getStatus())
                .errorMessage(stepResult.getErrorMessage())
                .processingTimeMs((int) stepResult.getProcessingTimeMs())
                .build())
            .collect(Collectors.toList());

        stepRepository.saveAll(steps);

        return event;
    }

    /**
     * Get recent offboarding events
     */
    @Transactional(readOnly = true)
    public Page<OffboardingEvent> getRecentEvents(Pageable pageable) {
        return eventRepository.findRecentEvents(pageable);
    }

    /**
     * Get offboarding event by event ID
     */
    @Transactional(readOnly = true)
    public OffboardingEvent getEventById(String eventId) {
        return eventRepository.findByEventId(eventId)
            .orElseThrow(() -> new IllegalArgumentException("Event not found: " + eventId));
    }

    /**
     * Get events by employee email
     */
    @Transactional(readOnly = true)
    public Page<OffboardingEvent> getEventsByEmployee(String employeeEmail, Pageable pageable) {
        return eventRepository.findByEmployeeEmailOrderByCreatedAtDesc(employeeEmail, pageable);
    }

    /**
     * Get events by date range
     */
    @Transactional(readOnly = true)
    public Page<OffboardingEvent> getEventsByDateRange(LocalDateTime startDate, LocalDateTime endDate, Pageable pageable) {
        return eventRepository.findByDateRange(startDate, endDate, pageable);
    }

    /**
     * Get events by status
     */
    @Transactional(readOnly = true)
    public Page<OffboardingEvent> getEventsByStatus(OffboardingEvent.OverallStatus status, Pageable pageable) {
        return eventRepository.findByOverallStatusOrderByCreatedAtDesc(status, pageable);
    }

    /**
     * Get steps for event
     */
    @Transactional(readOnly = true)
    public List<OffboardingStep> getStepsForEvent(String eventId) {
        return stepRepository.findByEventIdOrderById(eventId);
    }

    /**
     * Get event statistics
     */
    @Transactional(readOnly = true)
    public OffboardingStatistics getStatistics() {
        long totalEvents = eventRepository.count();
        long successCount = eventRepository.countByOverallStatus(OffboardingEvent.OverallStatus.SUCCESS);
        long partialFailureCount = eventRepository.countByOverallStatus(OffboardingEvent.OverallStatus.PARTIAL_FAILURE);
        long failureCount = eventRepository.countByOverallStatus(OffboardingEvent.OverallStatus.FAILURE);

        return new OffboardingStatistics(totalEvents, successCount, partialFailureCount, failureCount);
    }

    /**
     * Convert persisted event to result DTO
     */
    private OffboardingResult convertToResult(OffboardingEvent event) {
        List<OffboardingStep> steps = stepRepository.findByEventIdOrderById(event.getEventId());
        
        List<OffboardingResult.StepResult> stepResults = steps.stream()
            .map(step -> OffboardingResult.StepResult.builder()
                .serviceName(step.getServiceName())
                .status(step.getStatus())
                .errorMessage(step.getErrorMessage())
                .processingTimeMs(step.getProcessingTimeMs())
                .build())
            .collect(Collectors.toList());

        return OffboardingResult.builder()
            .eventId(event.getEventId())
            .employeeEmail(event.getEmployeeEmail())
            .overallStatus(event.getOverallStatus())
            .steps(stepResults)
            .totalProcessingTimeMs(event.getTotalProcessingTimeMs())
            .build();
    }

    /**
     * Statistics DTO
     */
    public record OffboardingStatistics(
        long totalEvents,
        long successCount,
        long partialFailureCount,
        long failureCount
    ) {}
}
