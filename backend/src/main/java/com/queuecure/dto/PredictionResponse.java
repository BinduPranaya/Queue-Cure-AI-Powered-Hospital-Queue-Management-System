package com.queuecure.dto;

/**
 * Response returned by GET /api/prediction/{tokenId} — the AI-powered
 * wait time estimate for a single patient/token.
 */
public record PredictionResponse(
        Integer tokenNumber,
        Integer patientsAhead,
        Integer predictedWaitTime,
        Integer confidence,
        String source
) {
    public static PredictionResponse fromAi(Integer tokenNumber, Integer patientsAhead,
                                              Integer predictedWaitTime, Integer confidence) {
        return new PredictionResponse(tokenNumber, patientsAhead, predictedWaitTime, confidence, "ai-model");
    }

    /** Used when the AI service is unreachable and we fall back to the deterministic formula. */
    public static PredictionResponse fallback(Integer tokenNumber, Integer patientsAhead, Integer predictedWaitTime) {
        return new PredictionResponse(tokenNumber, patientsAhead, predictedWaitTime, null, "fallback-formula");
    }
}
