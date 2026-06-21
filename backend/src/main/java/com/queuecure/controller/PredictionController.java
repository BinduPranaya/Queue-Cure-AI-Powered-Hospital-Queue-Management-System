package com.queuecure.controller;

import com.queuecure.dto.AdminPredictionAnalyticsResponse;
import com.queuecure.dto.PredictionResponse;
import com.queuecure.service.PredictionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * AI-powered wait time prediction endpoints.
 *
 * "tokenId" here refers to the patient's token NUMBER (not the database
 * primary key) - this matches how patients identify themselves on the
 * waiting room screen, and mirrors GET /api/patients/token/{tokenNumber}.
 */
@RestController
@RequestMapping("/api/prediction")
@RequiredArgsConstructor
public class PredictionController {

    private final PredictionService predictionService;

    /** Lightweight admin stats: avg predicted wait, peak hour, per-doctor breakdown. */
    @GetMapping("/analytics")
    public ResponseEntity<AdminPredictionAnalyticsResponse> analytics() {
        return ResponseEntity.ok(predictionService.getAdminAnalytics());
    }

    @GetMapping("/{tokenId:\\d+}")
    public ResponseEntity<PredictionResponse> predict(@PathVariable Integer tokenId) {
        return ResponseEntity.ok(predictionService.predictForToken(tokenId));
    }
}
