package com.queuecure.dto;

/**
 * Response payload returned after successfully adding a patient.
 */
public record AddPatientResponse(
        Integer tokenNumber,
        String message
) {
    public static AddPatientResponse of(Integer tokenNumber) {
        return new AddPatientResponse(tokenNumber, "Patient Added Successfully");
    }
}
