package com.queuecure.dto;

import java.util.List;

/**
 * Lightweight admin-facing analytics for the AI prediction feature:
 * overall average predicted wait, the current busiest hour (by today's
 * predictions logged), and a basic per-doctor breakdown. Intentionally
 * simple - no charting data, just numbers for a stats panel.
 */
public record AdminPredictionAnalyticsResponse(
        double averagePredictedWaitMinutes,
        Integer peakHour,
        List<DoctorStat> doctorStats
) {
    public record DoctorStat(
            Long doctorId,
            String doctorName,
            String department,
            long predictionsLogged,
            double averagePredictedWaitMinutes
    ) {
    }
}
