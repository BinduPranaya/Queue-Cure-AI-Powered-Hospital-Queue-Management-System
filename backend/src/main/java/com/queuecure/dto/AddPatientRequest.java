package com.queuecure.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * Request payload for adding a new patient to the queue.
 */
public record AddPatientRequest(

        @NotBlank(message = "Patient name must not be blank")
        @Size(min = 2, max = 150, message = "Patient name must be between 2 and 150 characters")
        String patientName,

        /** Optional - if omitted, the patient joins the general/shared queue. */
        Long doctorId
) {
}
