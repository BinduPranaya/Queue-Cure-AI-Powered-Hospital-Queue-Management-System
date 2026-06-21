package com.queuecure.service;

import com.queuecure.dto.AddDoctorRequest;
import com.queuecure.dto.DoctorResponse;
import com.queuecure.entity.Doctor;
import com.queuecure.exception.DoctorNotFoundException;
import com.queuecure.repository.DoctorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Manages doctors that patients can be queued against. Intentionally
 * simple CRUD - Queue Cure remains a single shared-queue system, but
 * each patient can optionally be tagged with a doctor + department so
 * the AI prediction service has per-doctor signal to learn from.
 */
@Service
@RequiredArgsConstructor
public class DoctorService {

    private final DoctorRepository doctorRepository;

    @Transactional
    public DoctorResponse addDoctor(AddDoctorRequest request) {
        Doctor doctor = Doctor.builder()
                .name(request.name().trim())
                .department(request.department().trim())
                .averageConsultationTime(request.averageConsultationTime())
                .build();
        return DoctorResponse.from(doctorRepository.save(doctor));
    }

    @Transactional(readOnly = true)
    public List<DoctorResponse> getAllDoctors() {
        return doctorRepository.findAll().stream().map(DoctorResponse::from).toList();
    }

    @Transactional(readOnly = true)
    public Doctor getDoctorOrThrow(Long doctorId) {
        return doctorRepository.findById(doctorId)
                .orElseThrow(() -> DoctorNotFoundException.byId(doctorId));
    }
}
