package com.continuum.repository;

import com.continuum.domain.model.AuditLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;

/**
 * Repository for AuditLog entities
 */
@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {

    /**
     * Find all logs for a given event
     */
    Page<AuditLog> findByEventIdOrderByTimestampDesc(String eventId, Pageable pageable);

    /**
     * Find logs by employee email
     */
    Page<AuditLog> findByEmployeeEmailOrderByTimestampDesc(String employeeEmail, Pageable pageable);

    /**
     * Find logs by status
     */
    Page<AuditLog> findByStatusOrderByTimestampDesc(String status, Pageable pageable);

    /**
     * Find logs within date range
     */
    @Query("SELECT a FROM AuditLog a WHERE a.timestamp BETWEEN :startDate AND :endDate ORDER BY a.timestamp DESC")
    Page<AuditLog> findByDateRange(
        @Param("startDate") LocalDateTime startDate, 
        @Param("endDate") LocalDateTime endDate, 
        Pageable pageable
    );

    /**
     * Complex query with multiple filters
     */
    @Query("SELECT a FROM AuditLog a WHERE " +
           "(:eventId IS NULL OR a.eventId = :eventId) AND " +
           "(:email IS NULL OR a.employeeEmail = :email) AND " +
           "(:status IS NULL OR a.status = :status) AND " +
           "a.timestamp BETWEEN :startDate AND :endDate " +
           "ORDER BY a.timestamp DESC")
    Page<AuditLog> findByFilters(
        @Param("eventId") String eventId,
        @Param("email") String email,
        @Param("status") String status,
        @Param("startDate") LocalDateTime startDate,
        @Param("endDate") LocalDateTime endDate,
        Pageable pageable
    );
}
