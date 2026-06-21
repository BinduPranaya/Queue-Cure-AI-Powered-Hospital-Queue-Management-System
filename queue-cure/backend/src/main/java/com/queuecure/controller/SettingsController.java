package com.queuecure.controller;

import com.queuecure.dto.QueueStatusResponse;
import com.queuecure.dto.UpdateSettingsRequest;
import com.queuecure.service.PatientService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * REST endpoint for updating queue-wide settings (currently just the
 * average consultation time used in ETA calculations).
 */
@RestController
@RequestMapping("/api/settings")
@RequiredArgsConstructor
public class SettingsController {

    private final PatientService patientService;

    /**
     * Updates the average consultation time. All waiting patients' ETAs
     * are recalculated dynamically on the next read - nothing is cached
     * or hardcoded, so this immediately affects every subsequent
     * GET /api/patients or /api/queue/status call, and is broadcast live
     * over WebSocket.
     */
    @PutMapping("/time")
    public ResponseEntity<QueueStatusResponse> updateConsultationTime(
            @Valid @RequestBody UpdateSettingsRequest request) {
        return ResponseEntity.ok(patientService.updateConsultationTime(request));
    }
}
