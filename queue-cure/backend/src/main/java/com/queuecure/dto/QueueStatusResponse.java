package com.queuecure.dto;

/**
 * Snapshot of the overall queue status, returned by GET /api/queue/status
 * and broadcast over WebSocket whenever the queue changes.
 */
public record QueueStatusResponse(
        Integer currentToken,
        Integer currentPatientId,
        String currentPatientName,
        Integer waitingCount,
        Integer completedCount,
        Integer averageConsultationTime,
        Integer lastGeneratedToken
) {
}
