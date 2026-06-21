package com.queuecure.exception;

/**
 * Thrown when an action that requires a non-empty queue (e.g. "Call Next")
 * is attempted while there are no WAITING patients.
 */
public class QueueEmptyException extends RuntimeException {

    public QueueEmptyException(String message) {
        super(message);
    }

    public static QueueEmptyException noWaitingPatients() {
        return new QueueEmptyException("No patients in queue. Cannot call next patient.");
    }
}
