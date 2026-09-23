package com.continuum.web.controller;

import com.continuum.domain.model.AuditLog;
import com.continuum.service.AuditService;
import com.continuum.web.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

/**
 * Audit Controller
 * 
 * Query and export audit logs.
 * Protected by JWT authentication.
 */
@RestController
@RequestMapping("/api/v1/audit")
@RequiredArgsConstructor
@Slf4j
public class AuditController {

    private final AuditService auditService;

    /**
     * Query audit logs with filters
     * GET /api/v1/audit/logs?eventId=evt_001&email=john@company.com&status=SUCCESS&startDate=...&endDate=...&page=0&size=10
     */
    @GetMapping("/logs")
    public ResponseEntity<ApiResponse<Page<AuditLog>>> queryLogs(
        @RequestParam(required = false) String eventId,
        @RequestParam(required = false) String email,
        @RequestParam(required = false) String status,
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "10") int size
    ) {
        try {
            Pageable pageable = PageRequest.of(page, size);
            Page<AuditLog> logs = auditService.queryLogs(eventId, email, status, startDate, endDate, pageable);

            return ResponseEntity.ok(ApiResponse.success(logs));

        } catch (Exception e) {
            log.error("Error querying audit logs", e);
            return ResponseEntity.status(500)
                .body(ApiResponse.error("Failed to query audit logs: " + e.getMessage()));
        }
    }

    /**
     * Get audit logs by event ID
     * GET /api/v1/audit/logs/event/{eventId}?page=0&size=10
     */
    @GetMapping("/logs/event/{eventId}")
    public ResponseEntity<ApiResponse<Page<AuditLog>>> getLogsByEventId(
        @PathVariable String eventId,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "10") int size
    ) {
        try {
            Pageable pageable = PageRequest.of(page, size);
            Page<AuditLog> logs = auditService.getLogsByEventId(eventId, pageable);

            return ResponseEntity.ok(ApiResponse.success(logs));

        } catch (Exception e) {
            log.error("Error fetching audit logs for event: {}", eventId, e);
            return ResponseEntity.status(500)
                .body(ApiResponse.error("Failed to fetch audit logs: " + e.getMessage()));
        }
    }

    /**
     * Get audit logs by employee email
     * GET /api/v1/audit/logs/employee/{email}?page=0&size=10
     */
    @GetMapping("/logs/employee/{email}")
    public ResponseEntity<ApiResponse<Page<AuditLog>>> getLogsByEmployee(
        @PathVariable String email,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "10") int size
    ) {
        try {
            Pageable pageable = PageRequest.of(page, size);
            Page<AuditLog> logs = auditService.getLogsByEmployee(email, pageable);

            return ResponseEntity.ok(ApiResponse.success(logs));

        } catch (Exception e) {
            log.error("Error fetching audit logs for employee: {}", email, e);
            return ResponseEntity.status(500)
                .body(ApiResponse.error("Failed to fetch audit logs: " + e.getMessage()));
        }
    }

    /**
     * Export audit logs to CSV
     * GET /api/v1/audit/logs/export?startDate=...&endDate=...
     */
    @GetMapping(value = "/logs/export", produces = "text/csv")
    public ResponseEntity<String> exportLogs(
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate
    ) {
        try {
            log.info("Exporting audit logs from {} to {}", startDate, endDate);
            
            String csv = auditService.exportLogsToCsv(startDate, endDate);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.parseMediaType("text/csv"));
            headers.setContentDispositionFormData("attachment", "audit-logs.csv");

            return ResponseEntity.ok()
                .headers(headers)
                .body(csv);

        } catch (Exception e) {
            log.error("Error exporting audit logs", e);
            return ResponseEntity.status(500)
                .body("Failed to export audit logs: " + e.getMessage());
        }
    }
}
