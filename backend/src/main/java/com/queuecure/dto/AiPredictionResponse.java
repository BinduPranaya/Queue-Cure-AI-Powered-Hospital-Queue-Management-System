package com.queuecure.dto;

/**
 * Response payload received from the FastAPI AI prediction microservice.
 */
public record AiPredictionResponse(
        Integer predictedWaitTime,
        Double confidence
) {
}
