package com.queuecure.service;

import com.queuecure.dto.AdminPredictionAnalyticsResponse;
import com.queuecure.dto.AiPredictionRequest;
import com.queuecure.dto.AiPredictionResponse;
import com.queuecure.dto.PredictionResponse;
import com.queuecure.entity.Doctor;
import com.queuecure.entity.Patient;
import com.queuecure.entity.PatientStatus;
import com.queuecure.entity.QueuePrediction;
import com.queuecure.entity.QueueSettings;
import com.queuecure.exception.PatientNotFoundException;
import com.queuecure.repository.PatientRepository;
import com.queuecure.repository.QueuePredictionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * Produces AI-powered wait-time predictions for a single patient/token.
 *
 * Gathers the feature set described in the spec (patients ahead, average
 * consultation time, doctor, department, hour of day, day of week, total
 * active patients) and sends it to the FastAPI prediction microservice via
 * {@link AiPredictionClient}. If that service is unavailable, transparently
 * falls back to the existing deterministic formula
 * (tokensAhead x averageConsultationTime) so a missing/slow AI service
 * never breaks the patient experience - it only means a missing
 * "confidence" score and a different reported `source`.
 *
 * Every prediction (AI or fallback) is logged to {@code queue_predictions}
 * so predicted vs. actual wait times can be analyzed later.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class PredictionService {

    private final PatientRepository patientRepository;
    private final QueueSettingsService queueSettingsService;
    private final DoctorService doctorService;
    private final AiPredictionClient aiPredictionClient;
    private final QueuePredictionRepository queuePredictionRepository;

    @Transactional
    public PredictionResponse predictForToken(Integer tokenNumber) {
        Patient patient = patientRepository.findByTokenNumber(tokenNumber)
                .orElseThrow(() -> PatientNotFoundException.byToken(tokenNumber));

        QueueSettings settings = queueSettingsService.getOrCreateSettings();

        int patientsAhead = patient.getStatus() == PatientStatus.WAITING
                ? (int) patientRepository.countWaitingAheadOf(tokenNumber)
                : 0;

        Long doctorId = patient.getDoctorId();
        String department = "General Medicine";
        Integer avgConsultationTime = settings.getAverageConsultationTime();

        if (doctorId != null) {
            Doctor doctor = doctorService.getDoctorOrThrow(doctorId);
            department = doctor.getDepartment();
            if (doctor.getAverageConsultationTime() != null) {
                avgConsultationTime = doctor.getAverageConsultationTime();
            }
        }

        long totalActivePatients = patientRepository.countByStatus(PatientStatus.WAITING)
                + patientRepository.countByStatus(PatientStatus.CURRENT);

        LocalDateTime now = LocalDateTime.now();
        AiPredictionRequest aiRequest = new AiPredictionRequest(
                patientsAhead,
                avgConsultationTime,
                doctorId,
                department,
                now.getHour(),
                isoDayOfWeek(now.getDayOfWeek()),
                (int) totalActivePatients
        );

        Optional<AiPredictionResponse> aiResult = aiPredictionClient.predict(aiRequest);

        PredictionResponse response;
        Integer confidencePercent = null;

        if (aiResult.isPresent()) {
            AiPredictionResponse ai = aiResult.get();
            confidencePercent = ai.confidence() == null ? null : Math.round(ai.confidence().floatValue() * 100);
            response = PredictionResponse.fromAi(tokenNumber, patientsAhead, ai.predictedWaitTime(), confidencePercent);
        } else {
            int fallbackWait = patientsAhead * avgConsultationTime;
            response = PredictionResponse.fallback(tokenNumber, patientsAhead, fallbackWait);
        }

        logPrediction(doctorId, patientsAhead, avgConsultationTime, response.predictedWaitTime(), confidencePercent, tokenNumber);

        return response;
    }

    private void logPrediction(Long doctorId, int patientsAhead, int avgConsultationTime,
                                 int predictedWaitTime, Integer confidence, Integer tokenNumber) {
        try {
            QueuePrediction prediction = QueuePrediction.builder()
                    .doctorId(doctorId == null ? 0L : doctorId)
                    .patientsAhead(patientsAhead)
                    .avgConsultationTime(avgConsultationTime)
                    .predictedWaitTime(predictedWaitTime)
                    .confidence(confidence)
                    .tokenNumber(tokenNumber)
                    .build();
            queuePredictionRepository.save(prediction);
        } catch (Exception ex) {
            // Logging the prediction is best-effort only - never let a
            // persistence hiccup here break the response to the patient.
            log.warn("Failed to log queue prediction for token {}: {}", tokenNumber, ex.getMessage());
        }
    }

    /** Converts java.time.DayOfWeek (MONDAY=1..SUNDAY=7) to the same convention for the AI service. */
    private int isoDayOfWeek(DayOfWeek dayOfWeek) {
        return dayOfWeek.getValue();
    }

    // ----------------------------------------------------------------
    // Lightweight admin analytics for the AI prediction feature
    // ----------------------------------------------------------------

    @Transactional(readOnly = true)
    public AdminPredictionAnalyticsResponse getAdminAnalytics() {
        LocalDateTime startOfToday = LocalDate.now().atStartOfDay();
        List<QueuePrediction> todaysPredictions = queuePredictionRepository.findByPredictionDateGreaterThanEqual(startOfToday);

        double avgPredictedWait = todaysPredictions.stream()
                .mapToInt(QueuePrediction::getPredictedWaitTime)
                .average()
                .orElse(0.0);

        Integer peakHour = todaysPredictions.stream()
                .collect(Collectors.groupingBy(p -> p.getPredictionDate().getHour(), Collectors.counting()))
                .entrySet().stream()
                .max(Map.Entry.comparingByValue())
                .map(Map.Entry::getKey)
                .orElse(null);

        Map<Long, List<QueuePrediction>> byDoctor = todaysPredictions.stream()
                .collect(Collectors.groupingBy(QueuePrediction::getDoctorId));

        // Note: looks up each doctor individually rather than batching -
        // acceptable for the small number of doctors a single clinic has,
        // but would want a batched findAllById() if this scales up.
        List<AdminPredictionAnalyticsResponse.DoctorStat> doctorStats = byDoctor.entrySet().stream()
                .map(entry -> {
                    Long doctorId = entry.getKey();
                    List<QueuePrediction> predictions = entry.getValue();
                    double avgWait = predictions.stream().mapToInt(QueuePrediction::getPredictedWaitTime).average().orElse(0.0);

                    String doctorName = "General Queue";
                    String department = "—";
                    if (doctorId != null && doctorId != 0L) {
                        try {
                            Doctor doctor = doctorService.getDoctorOrThrow(doctorId);
                            doctorName = doctor.getName();
                            department = doctor.getDepartment();
                        } catch (Exception ignored) {
                            doctorName = "Unknown Doctor";
                        }
                    }

                    return new AdminPredictionAnalyticsResponse.DoctorStat(
                            doctorId, doctorName, department, predictions.size(), round2(avgWait));
                })
                .toList();

        return new AdminPredictionAnalyticsResponse(round2(avgPredictedWait), peakHour, doctorStats);
    }

    private double round2(double value) {
        return Math.round(value * 100) / 100.0;
    }
}
