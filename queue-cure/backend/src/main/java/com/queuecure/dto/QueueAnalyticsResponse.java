package com.queuecure.dto;

/**
 * Aggregated analytics for the receptionist dashboard's analytics section.
 */
public record QueueAnalyticsResponse(
        long totalPatientsToday,
        long completedPatientsToday,
        long patientsWaiting,
        double averageWaitTimeMinutes,
        double queueEfficiencyPercentage
) {
}
