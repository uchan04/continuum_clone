package com.continuum.repository;

import com.continuum.domain.model.OffboardingEvent;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;

/**
 * Repository for OffboardingEvent entities
 */
@Repository
public interface OffboardingEventRepository extends JpaRepository<OffboardingEvent, Long> {

    /**
     * Find event by unique event ID
     */
    Optional<OffboardingEvent> findByEventId(String eventId);

    /**
     * Check if event ID already exists (for idempotency)
     */
    boolean existsByEventId(String eventId);

    /**
     * Find recent events ordered by creation time
     */
    @Query("SELECT e FROM OffboardingEvent e ORDER BY e.createdAt DESC")
    Page<OffboardingEvent> findRecentEvents(Pageable pageable);

    /**
     * Find events by employee email
     */
    Page<OffboardingEvent> findByEmployeeEmailOrderByCreatedAtDesc(String employeeEmail, Pageable pageable);

    /**
     * Find events within date range
     */
    @Query("SELECT e FROM OffboardingEvent e WHERE e.createdAt BETWEEN :startDate AND :endDate ORDER BY e.createdAt DESC")
    Page<OffboardingEvent> findByDateRange(
        @Param("startDate") LocalDateTime startDate, 
        @Param("endDate") LocalDateTime endDate, 
        Pageable pageable
    );

    /**
     * Find events by overall status
     */
    Page<OffboardingEvent> findByOverallStatusOrderByCreatedAtDesc(
        OffboardingEvent.OverallStatus status, 
        Pageable pageable
    );

    /**
     * Count events by status
     */
    long countByOverallStatus(OffboardingEvent.OverallStatus status);
}
