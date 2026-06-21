package com.queuecure.exception;

/**
 * Thrown when a doctor lookup by id fails.
 */
public class DoctorNotFoundException extends RuntimeException {

    public DoctorNotFoundException(String message) {
        super(message);
    }

    public static DoctorNotFoundException byId(Long id) {
        return new DoctorNotFoundException("Doctor not found with id: " + id);
    }
}
