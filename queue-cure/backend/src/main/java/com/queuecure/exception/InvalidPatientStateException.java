package com.queuecure.exception;

/**
 * Thrown when an operation is requested against a patient who is in a
 * state that does not allow it (e.g. trying to remove an already
 * COMPLETED patient, or calling next when a patient is already CURRENT).
 */
public class InvalidPatientStateException extends RuntimeException {

    public InvalidPatientStateException(String message) {
        super(message);
    }
}
