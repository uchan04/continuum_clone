package com.continuum.repository;

import com.continuum.domain.model.Employee;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Repository for Employee entities
 */
@Repository
public interface EmployeeRepository extends JpaRepository<Employee, Long> {

    /**
     * Find employee by email, case-insensitive (BR1)
     */
    Optional<Employee> findByEmailIgnoreCase(String email);

    /**
     * Search employees by optional status filter and optional name/email substring match (BR7, BR8)
     */
    @Query(
        "SELECT e FROM Employee e " +
        "WHERE (:status IS NULL OR e.status = :status) " +
        "AND (:query IS NULL OR :query = '' " +
        "     OR LOWER(e.name) LIKE LOWER(CONCAT('%', :query, '%')) " +
        "     OR LOWER(e.email) LIKE LOWER(CONCAT('%', :query, '%'))) " +
        "ORDER BY e.createdAt DESC"
    )
    Page<Employee> search(
        @Param("query") String query,
        @Param("status") Employee.EmployeeStatus status,
        Pageable pageable
    );
}
