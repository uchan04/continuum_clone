package com.continuum.repository;

import com.continuum.domain.model.IntegrationConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Repository for IntegrationConfig entities
 */
@Repository
public interface IntegrationConfigRepository extends JpaRepository<IntegrationConfig, Long> {

    /**
     * Find integration by service name (SLACK, GOOGLE_WORKSPACE)
     */
    Optional<IntegrationConfig> findByServiceName(String serviceName);

    /**
     * Check if integration exists for service
     */
    boolean existsByServiceName(String serviceName);
}
