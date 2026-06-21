package com.queuecure.controller;

import com.queuecure.dto.AddDoctorRequest;
import com.queuecure.dto.DoctorResponse;
import com.queuecure.service.DoctorService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST endpoints for managing doctors. Doctors are optional - patients can
 * still join a general/shared queue without one - but associating a
 * patient with a doctor + department feeds the AI wait-time prediction
 * service with useful signal.
 */
@RestController
@RequestMapping("/api/doctors")
@RequiredArgsConstructor
public class DoctorController {

    private final DoctorService doctorService;

    @PostMapping
    public ResponseEntity<DoctorResponse> addDoctor(@Valid @RequestBody AddDoctorRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(doctorService.addDoctor(request));
    }

    @GetMapping
    public ResponseEntity<List<DoctorResponse>> getAllDoctors() {
        return ResponseEntity.ok(doctorService.getAllDoctors());
    }
}
