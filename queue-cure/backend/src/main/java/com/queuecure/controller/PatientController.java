package com.queuecure.controller;

import com.queuecure.dto.AddPatientRequest;
import com.queuecure.dto.AddPatientResponse;
import com.queuecure.dto.PatientResponse;
import com.queuecure.service.PatientService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST endpoints for patient management: adding, listing, and removing
 * patients from the queue.
 */
@RestController
@RequestMapping("/api/patients")
@RequiredArgsConstructor
public class PatientController {

    private final PatientService patientService;

    /** Add a new patient - generates and returns their token number. */
    @PostMapping
    public ResponseEntity<AddPatientResponse> addPatient(@Valid @RequestBody AddPatientRequest request) {
        AddPatientResponse response = patientService.addPatient(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /** Get all patients (any status), ordered by token number. */
    @GetMapping
    public ResponseEntity<List<PatientResponse>> getAllPatients() {
        return ResponseEntity.ok(patientService.getAllPatients());
    }

    /** Get only patients currently WAITING, with live ETA fields. */
    @GetMapping("/waiting")
    public ResponseEntity<List<PatientResponse>> getWaitingPatients() {
        return ResponseEntity.ok(patientService.getWaitingPatients());
    }

    /** Look up a single patient by their token number (used by the patient waiting screen). */
    @GetMapping("/token/{tokenNumber}")
    public ResponseEntity<PatientResponse> getByToken(@PathVariable Integer tokenNumber) {
        return ResponseEntity.ok(patientService.getPatientByToken(tokenNumber));
    }

    /** Remove (cancel) a patient from the queue. */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> removePatient(@PathVariable Long id) {
        patientService.removePatient(id);
        return ResponseEntity.noContent().build();
    }
}
