package com.queuecure.service;

import com.queuecure.entity.QueueSettings;
import com.queuecure.repository.QueueSettingsRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Manages the single {@link QueueSettings} row that holds global queue
 * state: average consultation time, the current token, and the last
 * generated token. Ensures a settings row always exists (creating sensible
 * defaults on first use) so the rest of the application can rely on it
 * being present.
 */
@Service
@RequiredArgsConstructor
public class QueueSettingsService {

    private static final int DEFAULT_AVERAGE_CONSULTATION_TIME = 10;

    private final QueueSettingsRepository queueSettingsRepository;

    @Transactional
    public QueueSettings getOrCreateSettings() {
        return queueSettingsRepository.findAll().stream()
                .findFirst()
                .orElseGet(this::createDefaultSettings);
    }

    private QueueSettings createDefaultSettings() {
        QueueSettings settings = QueueSettings.builder()
                .averageConsultationTime(DEFAULT_AVERAGE_CONSULTATION_TIME)
                .currentToken(0)
                .lastGeneratedToken(0)
                .build();
        return queueSettingsRepository.save(settings);
    }

    @Transactional
    public QueueSettings save(QueueSettings settings) {
        return queueSettingsRepository.save(settings);
    }
}
