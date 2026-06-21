package com.queuecure.entity;

/**
 * Represents the lifecycle state of a patient within the queue.
 */
public enum PatientStatus {
    WAITING,
    CURRENT,
    COMPLETED,
    CANCELLED
}
