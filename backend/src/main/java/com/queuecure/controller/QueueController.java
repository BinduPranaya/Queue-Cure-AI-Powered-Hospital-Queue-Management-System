package com.queuecure.controller;

import com.queuecure.dto.QueueAnalyticsResponse;
import com.queuecure.dto.QueueStatusResponse;
import com.queuecure.service.PatientService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * REST endpoints for overall queue operations: status snapshot, calling
 * the next patient, and dashboard analytics.
 */
@RestController
@RequestMapping("/api/queue")
@RequiredArgsConstructor
public class QueueController {

    private final PatientService patientService;

    /** Current snapshot of the queue: current token, waiting count, average time, etc. */
    @GetMapping("/status")
    public ResponseEntity<QueueStatusResponse> getQueueStatus() {
        return ResponseEntity.ok(patientService.getQueueStatus());
    }

    /**
     * Calls the next patient: completes the current one (if any) and
     * promotes the next WAITING patient to CURRENT. Throws QueueEmptyException
     * (mapped to 409) if there are no waiting patients.
     */
    @PostMapping("/next")
    public ResponseEntity<QueueStatusResponse> callNextPatient() {
        return ResponseEntity.ok(patientService.callNextPatient());
    }

    /** Aggregated analytics for the dashboard analytics section. */
    @GetMapping("/analytics")
    public ResponseEntity<QueueAnalyticsResponse> getAnalytics() {
        return ResponseEntity.ok(patientService.getAnalytics());
    }
}
