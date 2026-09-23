package com.continuum.domain;

import com.continuum.domain.model.OffboardingEvent;
import com.continuum.domain.model.OffboardingResult;
import com.continuum.domain.model.OffboardingStep;
import com.continuum.service.IntegrationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.TimeoutException;

/**
 * Offboarding Engine
 * 
 * Core business logic for executing parallel offboarding operations.
 * Orchestrates revocation across Slack, Google Workspace, and Redis sessions.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class OffboardingEngine {

    private final IntegrationService integrationService;
    private final SessionManager sessionManager;

    @Value("${continuum.offboarding.timeout-seconds:1}")
    private int timeoutSeconds;

    /**
     * Execute offboarding for an employee
     * 
     * Runs 3 revocation tasks in parallel:
     * 1. Slack token revocation
     * 2. Google Workspace token revocation
     * 3. Redis session clearing
     * 
     * Returns aggregated results with overall status.
     */
    public OffboardingResult executeOffboarding(String eventId, String employeeEmail) {
        log.info("Starting offboarding for employee: {} (eventId: {})", employeeEmail, eventId);
        long startTime = System.currentTimeMillis();

        // Execute tasks in parallel
        CompletableFuture<OffboardingResult.StepResult> slackFuture = 
            CompletableFuture.supplyAsync(() -> revokeSlackToken(employeeEmail));

        CompletableFuture<OffboardingResult.StepResult> googleFuture = 
            CompletableFuture.supplyAsync(() -> revokeGoogleWorkspaceToken(employeeEmail));

        CompletableFuture<OffboardingResult.StepResult> redisFuture = 
            CompletableFuture.supplyAsync(() -> clearSessions(employeeEmail));

        // Wait for all tasks with timeout
        List<OffboardingResult.StepResult> steps = new ArrayList<>();
        try {
            CompletableFuture.allOf(slackFuture, googleFuture, redisFuture)
                .get(timeoutSeconds, TimeUnit.SECONDS);

            steps.add(slackFuture.get());
            steps.add(googleFuture.get());
            steps.add(redisFuture.get());

        } catch (TimeoutException e) {
            log.error("Offboarding timeout exceeded for employee: {}", employeeEmail);
            
            // Collect whatever completed
            if (slackFuture.isDone()) steps.add(slackFuture.getNow(createTimeoutStep("SLACK")));
            if (googleFuture.isDone()) steps.add(googleFuture.getNow(createTimeoutStep("GOOGLE_WORKSPACE")));
            if (redisFuture.isDone()) steps.add(redisFuture.getNow(createTimeoutStep("REDIS")));

            // Add timeout steps for incomplete tasks
            if (!slackFuture.isDone()) steps.add(createTimeoutStep("SLACK"));
            if (!googleFuture.isDone()) steps.add(createTimeoutStep("GOOGLE_WORKSPACE"));
            if (!redisFuture.isDone()) steps.add(createTimeoutStep("REDIS"));

        } catch (Exception e) {
            log.error("Unexpected error during offboarding for employee: {}", employeeEmail, e);
            steps.add(createErrorStep("SLACK", e.getMessage()));
            steps.add(createErrorStep("GOOGLE_WORKSPACE", e.getMessage()));
            steps.add(createErrorStep("REDIS", e.getMessage()));
        }

        long totalTime = System.currentTimeMillis() - startTime;
        OffboardingEvent.OverallStatus overallStatus = aggregateResults(steps);

        log.info("Offboarding completed for employee: {} in {}ms with status: {}", 
                 employeeEmail, totalTime, overallStatus);

        return OffboardingResult.builder()
            .eventId(eventId)
            .employeeEmail(employeeEmail)
            .overallStatus(overallStatus)
            .steps(steps)
            .totalProcessingTimeMs(totalTime)
            .build();
    }

    /**
     * Revoke Slack token for employee
     */
    private OffboardingResult.StepResult revokeSlackToken(String employeeEmail) {
        long startTime = System.currentTimeMillis();
        try {
            integrationService.revokeSlackToken(employeeEmail);
            long processingTime = System.currentTimeMillis() - startTime;
            
            return OffboardingResult.StepResult.builder()
                .serviceName("SLACK")
                .status(OffboardingStep.Status.SUCCESS)
                .processingTimeMs(processingTime)
                .build();
                
        } catch (Exception e) {
            long processingTime = System.currentTimeMillis() - startTime;
            log.error("Failed to revoke Slack token for employee: {}", employeeEmail, e);
            
            return OffboardingResult.StepResult.builder()
                .serviceName("SLACK")
                .status(OffboardingStep.Status.FAILURE)
                .errorMessage(e.getMessage())
                .processingTimeMs(processingTime)
                .build();
        }
    }

    /**
     * Revoke Google Workspace token for employee
     */
    private OffboardingResult.StepResult revokeGoogleWorkspaceToken(String employeeEmail) {
        long startTime = System.currentTimeMillis();
        try {
            integrationService.revokeGoogleWorkspaceToken(employeeEmail);
            long processingTime = System.currentTimeMillis() - startTime;
            
            return OffboardingResult.StepResult.builder()
                .serviceName("GOOGLE_WORKSPACE")
                .status(OffboardingStep.Status.SUCCESS)
                .processingTimeMs(processingTime)
                .build();
                
        } catch (Exception e) {
            long processingTime = System.currentTimeMillis() - startTime;
            log.error("Failed to revoke Google Workspace token for employee: {}", employeeEmail, e);
            
            return OffboardingResult.StepResult.builder()
                .serviceName("GOOGLE_WORKSPACE")
                .status(OffboardingStep.Status.FAILURE)
                .errorMessage(e.getMessage())
                .processingTimeMs(processingTime)
                .build();
        }
    }

    /**
     * Clear Redis sessions for employee
     */
    private OffboardingResult.StepResult clearSessions(String employeeEmail) {
        long startTime = System.currentTimeMillis();
        try {
            int clearedCount = sessionManager.clearEmployeeSessions(employeeEmail);
            long processingTime = System.currentTimeMillis() - startTime;
            
            log.info("Cleared {} sessions for employee: {}", clearedCount, employeeEmail);
            
            return OffboardingResult.StepResult.builder()
                .serviceName("REDIS")
                .status(OffboardingStep.Status.SUCCESS)
                .processingTimeMs(processingTime)
                .build();
                
        } catch (Exception e) {
            long processingTime = System.currentTimeMillis() - startTime;
            log.error("Failed to clear sessions for employee: {}", employeeEmail, e);
            
            return OffboardingResult.StepResult.builder()
                .serviceName("REDIS")
                .status(OffboardingStep.Status.FAILURE)
                .errorMessage(e.getMessage())
                .processingTimeMs(processingTime)
                .build();
        }
    }

    /**
     * Aggregate step results into overall status
     * 
     * Logic:
     * - All SUCCESS/SKIPPED → SUCCESS
     * - All FAILURE → FAILURE
     * - Mixed → PARTIAL_FAILURE
     */
    public OffboardingEvent.OverallStatus aggregateResults(List<OffboardingResult.StepResult> steps) {
        long successCount = steps.stream()
            .filter(s -> s.getStatus() == OffboardingStep.Status.SUCCESS || 
                         s.getStatus() == OffboardingStep.Status.SKIPPED)
            .count();

        if (successCount == steps.size()) {
            return OffboardingEvent.OverallStatus.SUCCESS;
        } else if (successCount == 0) {
            return OffboardingEvent.OverallStatus.FAILURE;
        } else {
            return OffboardingEvent.OverallStatus.PARTIAL_FAILURE;
        }
    }

    /**
     * Create timeout step result
     */
    private OffboardingResult.StepResult createTimeoutStep(String serviceName) {
        return OffboardingResult.StepResult.builder()
            .serviceName(serviceName)
            .status(OffboardingStep.Status.FAILURE)
            .errorMessage("Operation timed out after " + timeoutSeconds + " seconds")
            .processingTimeMs(timeoutSeconds * 1000L)
            .build();
    }

    /**
     * Create error step result
     */
    private OffboardingResult.StepResult createErrorStep(String serviceName, String errorMessage) {
        return OffboardingResult.StepResult.builder()
            .serviceName(serviceName)
            .status(OffboardingStep.Status.FAILURE)
            .errorMessage(errorMessage)
            .processingTimeMs(0)
            .build();
    }
}
