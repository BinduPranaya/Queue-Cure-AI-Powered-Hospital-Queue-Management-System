package com.queuecure.dto;

import com.queuecure.entity.Doctor;

public record DoctorResponse(
        Long id,
        String name,
        String department,
        Integer averageConsultationTime
) {
    public static DoctorResponse from(Doctor doctor) {
        return new DoctorResponse(doctor.getId(), doctor.getName(), doctor.getDepartment(), doctor.getAverageConsultationTime());
    }
}
