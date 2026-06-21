package com.queuecure.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;

public record AddDoctorRequest(
        @NotBlank(message = "Doctor name must not be blank")
        String name,

        @NotBlank(message = "Department must not be blank")
        String department,

        @Min(value = 1, message = "averageConsultationTime must be at least 1 minute")
        @Max(value = 240, message = "averageConsultationTime must not exceed 240 minutes")
        Integer averageConsultationTime
) {
}
