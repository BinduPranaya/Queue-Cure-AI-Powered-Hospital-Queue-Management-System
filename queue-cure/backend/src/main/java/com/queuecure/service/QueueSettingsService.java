package com.queuecure.service;

import com.queuecure.entity.QueueSettings;
import com.queuecure.repository.QueueSettingsRepository;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class QueueSettingsService {

    private static final int DEFAULT_AVERAGE_CONSULTATION_TIME = 10;

    private final QueueSettingsRepository queueSettingsRepository;

    /**
     * Create the default settings row once when the application starts.
     */
    @PostConstruct
    @Transactional
    public void initializeSettings() {

        if (queueSettingsRepository.count() == 0) {

            QueueSettings settings = QueueSettings.builder()
                    .averageConsultationTime(DEFAULT_AVERAGE_CONSULTATION_TIME)
                    .currentToken(0)
                    .lastGeneratedToken(0)
                    .build();

            queueSettingsRepository.save(settings);
        }
    }

    /**
     * Read-only access to the single settings row.
     */
    @Transactional(readOnly = true)
    public QueueSettings getOrCreateSettings() {

        return queueSettingsRepository.findAll()
                .stream()
                .findFirst()
                .orElseThrow(() ->
                        new IllegalStateException(
                                "Queue settings not initialized"));
    }

    @Transactional
    public QueueSettings save(QueueSettings settings) {
        return queueSettingsRepository.save(settings);
    }
}