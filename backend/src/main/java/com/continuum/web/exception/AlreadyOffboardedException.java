package com.continuum.web.exception;

/**
 * Thrown when attempting to offboard an employee who is already OFFBOARDED (BR5).
 */
public class AlreadyOffboardedException extends RuntimeException {
    public AlreadyOffboardedException(String message) {
        super(message);
    }
}
