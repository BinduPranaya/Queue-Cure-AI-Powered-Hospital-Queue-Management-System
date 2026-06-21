package com.queuecure.websocket;

import com.queuecure.dto.QueueStatusResponse;

import java.time.LocalDateTime;
import java.util.List;

/**
 * The payload broadcast to all clients subscribed to /topic/queue.
 *
 * The {@code eventType} field tells clients why the update happened
 * (useful for animations / toast messages on the frontend), while
 * {@code queueStatus} and {@code waitingPatients} give them everything
 * needed to re-render without an additional REST call.
 */
public record QueueUpdateEvent(
        QueueEventType eventType,
        LocalDateTime timestamp,
        QueueStatusResponse queueStatus,
        List<PatientSummary> waitingPatients
) {

    public enum QueueEventType {
        PATIENT_ADDED,
        PATIENT_REMOVED,
        NEXT_CALLED,
        SETTINGS_UPDATED
    }

    /** Lightweight patient projection used inside the broadcast payload. */
    public record PatientSummary(
            Long id,
            Integer tokenNumber,
            String patientName,
            String status,
            Integer tokensAhead,
            Integer estimatedWaitMinutes
    ) {
    }

    public static QueueUpdateEvent of(QueueEventType type, QueueStatusResponse status, List<PatientSummary> waiting) {
        return new QueueUpdateEvent(type, LocalDateTime.now(), status, waiting);
    }
}
