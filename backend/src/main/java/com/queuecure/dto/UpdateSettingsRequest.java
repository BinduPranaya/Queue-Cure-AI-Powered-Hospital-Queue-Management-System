package com.queuecure.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

/**
 * Request payload for updating the average consultation time setting.
 */
public record UpdateSettingsRequest(

        @NotNull(message = "averageConsultationTime is required")
        @Min(value = 1, message = "averageConsultationTime must be at least 1 minute")
        @Max(value = 240, message = "averageConsultationTime must not exceed 240 minutes")
        Integer averageConsultationTime
) {
}
