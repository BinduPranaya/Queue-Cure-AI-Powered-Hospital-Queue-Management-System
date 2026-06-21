package com.queuecure.service;

import com.queuecure.dto.*;
import com.queuecure.entity.Patient;
import com.queuecure.entity.PatientStatus;
import com.queuecure.entity.QueueSettings;
import com.queuecure.exception.InvalidPatientStateException;
import com.queuecure.exception.PatientNotFoundException;
import com.queuecure.exception.QueueEmptyException;
import com.queuecure.repository.PatientRepository;
import com.queuecure.websocket.QueueBroadcaster;
import com.queuecure.websocket.QueueUpdateEvent;
import com.queuecure.websocket.QueueUpdateEvent.QueueEventType;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Core service for all patient and queue operations.
 *
 * This is the single source of truth for queue business logic: token
 * generation, calling the next patient, removing patients, and computing
 * each waiting patient's dynamic ETA. Every mutating operation broadcasts
 * the updated queue state over WebSocket so connected clients (receptionist
 * dashboard and patient waiting room) update live without a page refresh.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class PatientService {

    private final PatientRepository patientRepository;
    private final QueueSettingsService queueSettingsService;
    private final QueueBroadcaster queueBroadcaster;

    // ----------------------------------------------------------------
    // Add Patient
    // ----------------------------------------------------------------

    @Transactional
    public AddPatientResponse addPatient(AddPatientRequest request) {
        QueueSettings settings = queueSettingsService.getOrCreateSettings();

        int nextToken = settings.getLastGeneratedToken() + 1;
        settings.setLastGeneratedToken(nextToken);
        queueSettingsService.save(settings);

        Patient patient = Patient.builder()
                .tokenNumber(nextToken)
                .patientName(request.patientName().trim())
                .doctorId(request.doctorId())
                .status(PatientStatus.WAITING)
                .build();
        patientRepository.save(patient);

        log.info("Added patient '{}' with token #{}", patient.getPatientName(), nextToken);

        broadcastQueueUpdate(QueueEventType.PATIENT_ADDED);

        return AddPatientResponse.of(nextToken);
    }

    // ----------------------------------------------------------------
    // Get All Patients
    // ----------------------------------------------------------------

    @Transactional(readOnly = true)
    public List<PatientResponse> getAllPatients() {
        QueueSettings settings = queueSettingsService.getOrCreateSettings();
        return patientRepository.findAll().stream()
                .sorted((a, b) -> a.getTokenNumber().compareTo(b.getTokenNumber()))
                .map(p -> toPatientResponse(p, settings))
                .toList();
    }

    @Transactional(readOnly = true)
    public List<PatientResponse> getWaitingPatients() {
        QueueSettings settings = queueSettingsService.getOrCreateSettings();
        return patientRepository.findByStatusOrderByTokenNumberAsc(PatientStatus.WAITING).stream()
                .map(p -> toPatientResponse(p, settings))
                .toList();
    }

    // ----------------------------------------------------------------
    // Queue Status
    // ----------------------------------------------------------------

    @Transactional(readOnly = true)
    public QueueStatusResponse getQueueStatus() {
        QueueSettings settings = queueSettingsService.getOrCreateSettings();
        return buildQueueStatus(settings);
    }

    private QueueStatusResponse buildQueueStatus(QueueSettings settings) {
        Optional<Patient> current = patientRepository.findByStatus(PatientStatus.CURRENT);
        long waitingCount = patientRepository.countByStatus(PatientStatus.WAITING);
        long completedCount = patientRepository.countByStatus(PatientStatus.COMPLETED);

        return new QueueStatusResponse(
                settings.getCurrentToken(),
                current.map(Patient::getId).map(Long::intValue).orElse(null),
                current.map(Patient::getPatientName).orElse(null),
                (int) waitingCount,
                (int) completedCount,
                settings.getAverageConsultationTime(),
                settings.getLastGeneratedToken()
        );
    }

    // ----------------------------------------------------------------
    // Call Next Patient
    // ----------------------------------------------------------------

    @Transactional
    public QueueStatusResponse callNextPatient() {
        QueueSettings settings = queueSettingsService.getOrCreateSettings();

        // Step 1: mark current patient (if any) as COMPLETED.
        patientRepository.findByStatus(PatientStatus.CURRENT).ifPresent(currentPatient -> {
            currentPatient.setStatus(PatientStatus.COMPLETED);
            patientRepository.save(currentPatient);
            log.info("Completed token #{} ({})", currentPatient.getTokenNumber(), currentPatient.getPatientName());
        });

        // Step 2: pick the next WAITING patient (lowest token number first).
        List<Patient> waiting = patientRepository.findByStatusOrderByTokenNumberAsc(PatientStatus.WAITING);
        if (waiting.isEmpty()) {
            // Nothing left to call. Reset currentToken to 0 to indicate an
            // empty/idle queue, persist, and broadcast so clients reflect
            // the now-empty state, then signal the error to the caller.
            settings.setCurrentToken(0);
            queueSettingsService.save(settings);
            broadcastQueueUpdate(QueueEventType.NEXT_CALLED);
            throw QueueEmptyException.noWaitingPatients();
        }

        Patient next = waiting.get(0);
        next.setStatus(PatientStatus.CURRENT);
        patientRepository.save(next);

        settings.setCurrentToken(next.getTokenNumber());
        queueSettingsService.save(settings);

        log.info("Now serving token #{} ({})", next.getTokenNumber(), next.getPatientName());

        QueueStatusResponse status = broadcastQueueUpdate(QueueEventType.NEXT_CALLED);
        return status;
    }

    // ----------------------------------------------------------------
    // Remove Patient
    // ----------------------------------------------------------------

    @Transactional
    public void removePatient(Long id) {
        Patient patient = patientRepository.findById(id)
                .orElseThrow(() -> PatientNotFoundException.byId(id));

        if (patient.getStatus() == PatientStatus.COMPLETED) {
            throw new InvalidPatientStateException(
                    "Cannot remove patient with token #" + patient.getTokenNumber() + " - already completed");
        }

        boolean wasCurrent = patient.getStatus() == PatientStatus.CURRENT;
        patient.setStatus(PatientStatus.CANCELLED);
        patientRepository.save(patient);

        if (wasCurrent) {
            // The removed patient was the one currently being served -
            // reset currentToken so the dashboard doesn't show a stale
            // "current" patient that no longer exists in that state.
            QueueSettings settings = queueSettingsService.getOrCreateSettings();
            settings.setCurrentToken(0);
            queueSettingsService.save(settings);
        }

        log.info("Removed/cancelled token #{} ({})", patient.getTokenNumber(), patient.getPatientName());

        broadcastQueueUpdate(QueueEventType.PATIENT_REMOVED);
    }

    // ----------------------------------------------------------------
    // Update Average Consultation Time
    // ----------------------------------------------------------------

    @Transactional
    public QueueStatusResponse updateConsultationTime(UpdateSettingsRequest request) {
        QueueSettings settings = queueSettingsService.getOrCreateSettings();
        settings.setAverageConsultationTime(request.averageConsultationTime());
        queueSettingsService.save(settings);

        log.info("Updated average consultation time to {} minutes", request.averageConsultationTime());

        return broadcastQueueUpdate(QueueEventType.SETTINGS_UPDATED);
    }

    // ----------------------------------------------------------------
    // Analytics
    // ----------------------------------------------------------------

    @Transactional(readOnly = true)
    public QueueAnalyticsResponse getAnalytics() {
        LocalDateTime startOfToday = LocalDate.now().atStartOfDay();
        QueueSettings settings = queueSettingsService.getOrCreateSettings();

        long totalToday = patientRepository.countByCreatedAtGreaterThanEqual(startOfToday);
        long completedToday = patientRepository.countByStatusAndCreatedAtGreaterThanEqual(
                PatientStatus.COMPLETED, startOfToday);
        long waiting = patientRepository.countByStatus(PatientStatus.WAITING);

        List<Patient> waitingPatients = patientRepository.findByStatusOrderByTokenNumberAsc(PatientStatus.WAITING);
        double avgWait = waitingPatients.stream()
                .mapToInt(p -> calculateTokensAhead(p, settings.getCurrentToken()) * settings.getAverageConsultationTime())
                .average()
                .orElse(0.0);

        double efficiency = totalToday == 0
                ? 100.0
                : Math.round((completedToday * 100.0 / totalToday) * 100) / 100.0;

        return new QueueAnalyticsResponse(
                totalToday,
                completedToday,
                waiting,
                Math.round(avgWait * 100) / 100.0,
                efficiency
        );
    }

    // ----------------------------------------------------------------
    // Helpers
    // ----------------------------------------------------------------

    /**
     * Computes the dynamic ETA fields for a patient and maps it to a
     * {@link PatientResponse}. Only WAITING patients get a meaningful
     * tokensAhead / estimatedWaitMinutes value; others receive null since
     * the concept doesn't apply to them.
     */
    private PatientResponse toPatientResponse(Patient patient, QueueSettings settings) {
        if (patient.getStatus() != PatientStatus.WAITING) {
            return PatientResponse.from(patient);
        }
        int tokensAhead = calculateTokensAhead(patient, settings.getCurrentToken());
        int estimatedWait = tokensAhead * settings.getAverageConsultationTime();
        return PatientResponse.from(patient, tokensAhead, estimatedWait);
    }

    /**
     * Number of WAITING patients with a strictly lower token number than
     * the given patient - i.e. how many people are ahead of them in line.
     * Computed dynamically from the database, never hardcoded or cached.
     */
    private int calculateTokensAhead(Patient patient, Integer currentToken) {
        long aheadCount = patientRepository.countWaitingAheadOf(patient.getTokenNumber());
        return (int) aheadCount;
    }

    /**
     * Computes tokensAhead/ETA for an arbitrary token number, used by the
     * dedicated lookup endpoint for the patient waiting room.
     */
    @Transactional(readOnly = true)
    public PatientResponse getPatientByToken(Integer tokenNumber) {
        Patient patient = patientRepository.findByTokenNumber(tokenNumber)
                .orElseThrow(() -> PatientNotFoundException.byToken(tokenNumber));
        QueueSettings settings = queueSettingsService.getOrCreateSettings();
        return toPatientResponse(patient, settings);
    }

    /**
     * Builds the current status + waiting list and broadcasts it as a
     * {@link QueueUpdateEvent} over WebSocket. Returns the status portion
     * so REST handlers can reuse it for their HTTP response without an
     * extra query.
     */
    private QueueStatusResponse broadcastQueueUpdate(QueueEventType eventType) {
        QueueSettings settings = queueSettingsService.getOrCreateSettings();
        QueueStatusResponse status = buildQueueStatus(settings);

        List<Patient> waiting = patientRepository.findByStatusOrderByTokenNumberAsc(PatientStatus.WAITING);
        List<QueueUpdateEvent.PatientSummary> summaries = waiting.stream()
                .map(p -> new QueueUpdateEvent.PatientSummary(
                        p.getId(),
                        p.getTokenNumber(),
                        p.getPatientName(),
                        p.getStatus().name(),
                        calculateTokensAhead(p, settings.getCurrentToken()),
                        calculateTokensAhead(p, settings.getCurrentToken()) * settings.getAverageConsultationTime()
                ))
                .toList();

        QueueUpdateEvent event = QueueUpdateEvent.of(eventType, status, summaries);
        queueBroadcaster.broadcast(event);
        return status;
    }
}
