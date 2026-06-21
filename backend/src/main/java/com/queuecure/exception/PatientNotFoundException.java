package com.queuecure.exception;

/**
 * Thrown when a patient lookup by id or token number fails.
 */
public class PatientNotFoundException extends RuntimeException {

    public PatientNotFoundException(String message) {
        super(message);
    }

    public static PatientNotFoundException byId(Long id) {
        return new PatientNotFoundException("Patient not found with id: " + id);
    }

    public static PatientNotFoundException byToken(Integer tokenNumber) {
        return new PatientNotFoundException("Patient not found with token number: " + tokenNumber);
    }
}
