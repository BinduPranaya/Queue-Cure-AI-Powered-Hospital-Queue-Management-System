package com.queuecure.service;

import com.queuecure.entity.QueueSettings;
import com.queuecure.repository.QueueSettingsRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class QueueSettingsService {

    private final QueueSettingsRepository queueSettingsRepository;

    @Transactional(readOnly = true)
    public QueueSettings getOrCreateSettings() {

        return queueSettingsRepository.findAll()
                .stream()
                .findFirst()
                .orElseGet(() -> {
                    QueueSettings settings = new QueueSettings();
                    settings.setAverageConsultationTime(10);
                    settings.setCurrentToken(0);
                    settings.setLastGeneratedToken(0);
                    return settings;
                });
    }

    @Transactional
    public QueueSettings save(QueueSettings settings) {
        return queueSettingsRepository.save(settings);
    }
}