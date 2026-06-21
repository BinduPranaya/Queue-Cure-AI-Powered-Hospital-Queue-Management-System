package com.queuecure.dto;

import com.queuecure.entity.Patient;
import com.queuecure.entity.PatientStatus;

import java.time.LocalDateTime;

/**
 * Representation of a patient returned to clients (receptionist dashboard,
 * patient waiting room). Includes the dynamically computed wait-time fields
 * for WAITING patients so the frontend never needs to hardcode logic.
 */
public record PatientResponse(
        Long id,
        Integer tokenNumber,
        String patientName,
        PatientStatus status,
        LocalDateTime createdAt,
        Integer tokensAhead,
        Integer estimatedWaitMinutes
) {
    public static PatientResponse from(Patient patient, Integer tokensAhead, Integer estimatedWaitMinutes) {
        return new PatientResponse(
                patient.getId(),
                patient.getTokenNumber(),
                patient.getPatientName(),
                patient.getStatus(),
                patient.getCreatedAt(),
                tokensAhead,
                estimatedWaitMinutes
        );
    }

    public static PatientResponse from(Patient patient) {
        return from(patient, null, null);
    }
}
