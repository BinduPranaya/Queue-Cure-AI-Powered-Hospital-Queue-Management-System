package com.queuecure.dto;

/**
 * Request payload sent to the FastAPI AI prediction microservice.
 * Field names match the Python service's expected JSON body exactly.
 */
public record AiPredictionRequest(
        Integer patientsAhead,
        Integer avgConsultationTime,
        Long doctorId,
        String department,
        Integer currentHour,
        Integer dayOfWeek,
        Integer totalActivePatients
) {
}
