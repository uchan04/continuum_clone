package com.continuum.web.exception;

/**
 * Thrown when an employee cannot be found by id (BR6).
 */
public class EmployeeNotFoundException extends RuntimeException {
    public EmployeeNotFoundException(String message) {
        super(message);
    }
}
