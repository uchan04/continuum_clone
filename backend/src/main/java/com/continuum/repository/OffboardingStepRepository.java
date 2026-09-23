package com.continuum.repository;

import com.continuum.domain.model.OffboardingStep;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository for OffboardingStep entities
 */
@Repository
public interface OffboardingStepRepository extends JpaRepository<OffboardingStep, Long> {

    /**
     * Find all steps for a given event
     */
    List<OffboardingStep> findByEventIdOrderById(String eventId);

    /**
     * Find steps by event and service name
     */
    List<OffboardingStep> findByEventIdAndServiceName(String eventId, String serviceName);
}
