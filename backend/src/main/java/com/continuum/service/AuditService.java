package com.continuum.service;

import com.continuum.domain.model.AuditLog;
import com.continuum.domain.model.OffboardingResult;
import com.continuum.repository.AuditLogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Audit Service
 * 
 * Manages audit logging for all offboarding activities.
 * Provides compliance trail and troubleshooting data.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class AuditService {

    private final AuditLogRepository auditLogRepository;

    /**
     * Log offboarding event to audit trail
     */
    @Transactional
    public void logOffboardingEvent(OffboardingResult result) {
        try {
            Map<String, Object> details = new HashMap<>();
            details.put("overall_status", result.getOverallStatus().toString());
            details.put("total_processing_time_ms", result.getTotalProcessingTimeMs());
            
            // Add step details
            List<Map<String, Object>> stepDetails = result.getSteps().stream()
                .map(step -> {
                    Map<String, Object> stepMap = new HashMap<>();
                    stepMap.put("service_name", step.getServiceName());
                    stepMap.put("status", step.getStatus().toString());
                    stepMap.put("processing_time_ms", step.getProcessingTimeMs());
                    if (step.getErrorMessage() != null) {
                        stepMap.put("error_message", step.getErrorMessage());
                    }
                    return stepMap;
                })
                .collect(Collectors.toList());
            
            details.put("steps", stepDetails);

            AuditLog auditLog = AuditLog.builder()
                .eventId(result.getEventId())
                .employeeEmail(result.getEmployeeEmail())
                .timestamp(LocalDateTime.now())
                .status(result.getOverallStatus().toString())
                .details(details)
                .build();

            auditLogRepository.save(auditLog);
            
            log.info("Audit log created for event: {}", result.getEventId());

        } catch (Exception e) {
            log.error("Failed to create audit log for event: {}", result.getEventId(), e);
            // Don't throw - audit logging failure shouldn't block offboarding
        }
    }

    /**
     * Log custom event to audit trail
     */
    @Transactional
    public void logCustomEvent(String eventId, String employeeEmail, String status, Map<String, Object> details) {
        try {
            AuditLog auditLog = AuditLog.builder()
                .eventId(eventId)
                .employeeEmail(employeeEmail)
                .timestamp(LocalDateTime.now())
                .status(status)
                .details(details)
                .build();

            auditLogRepository.save(auditLog);
            
            log.debug("Custom audit log created for event: {}", eventId);

        } catch (Exception e) {
            log.error("Failed to create custom audit log for event: {}", eventId, e);
        }
    }

    /**
     * Query audit logs by event ID
     */
    @Transactional(readOnly = true)
    public Page<AuditLog> getLogsByEventId(String eventId, Pageable pageable) {
        return auditLogRepository.findByEventIdOrderByTimestampDesc(eventId, pageable);
    }

    /**
     * Query audit logs by employee email
     */
    @Transactional(readOnly = true)
    public Page<AuditLog> getLogsByEmployee(String employeeEmail, Pageable pageable) {
        return auditLogRepository.findByEmployeeEmailOrderByTimestampDesc(employeeEmail, pageable);
    }

    /**
     * Query audit logs by status
     */
    @Transactional(readOnly = true)
    public Page<AuditLog> getLogsByStatus(String status, Pageable pageable) {
        return auditLogRepository.findByStatusOrderByTimestampDesc(status, pageable);
    }

    /**
     * Query audit logs by date range
     */
    @Transactional(readOnly = true)
    public Page<AuditLog> getLogsByDateRange(LocalDateTime startDate, LocalDateTime endDate, Pageable pageable) {
        return auditLogRepository.findByDateRange(startDate, endDate, pageable);
    }

    /**
     * Query audit logs with multiple filters
     */
    @Transactional(readOnly = true)
    public Page<AuditLog> queryLogs(
        String eventId, 
        String employeeEmail, 
        String status,
        LocalDateTime startDate, 
        LocalDateTime endDate, 
        Pageable pageable
    ) {
        return auditLogRepository.findByFilters(eventId, employeeEmail, status, startDate, endDate, pageable);
    }

    /**
     * Export audit logs to CSV format
     */
    @Transactional(readOnly = true)
    public String exportLogsToCsv(LocalDateTime startDate, LocalDateTime endDate) {
        Page<AuditLog> logs = auditLogRepository.findByDateRange(startDate, endDate, Pageable.unpaged());
        
        StringBuilder csv = new StringBuilder();
        csv.append("Event ID,Employee Email,Timestamp,Status,Details\n");
        
        for (AuditLog log : logs) {
            csv.append(escapeCsv(log.getEventId())).append(",");
            csv.append(escapeCsv(log.getEmployeeEmail())).append(",");
            csv.append(log.getTimestamp()).append(",");
            csv.append(escapeCsv(log.getStatus())).append(",");
            csv.append(escapeCsv(log.getDetails() != null ? log.getDetails().toString() : "")).append("\n");
        }
        
        return csv.toString();
    }

    /**
     * Escape CSV special characters
     */
    private String escapeCsv(String value) {
        if (value == null) {
            return "";
        }
        if (value.contains(",") || value.contains("\"") || value.contains("\n")) {
            return "\"" + value.replace("\"", "\"\"") + "\"";
        }
        return value;
    }
}
