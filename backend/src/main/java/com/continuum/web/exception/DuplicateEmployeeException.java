package com.continuum.web.exception;

/**
 * Thrown when registering an employee whose email already exists (BR1).
 */
public class DuplicateEmployeeException extends RuntimeException {
    public DuplicateEmployeeException(String message) {
        super(message);
    }
}
