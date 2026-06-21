package com.queuecure.repository;

import com.queuecure.entity.QueueSettings;
import org.springframework.data.jpa.repository.JpaRepository;

public interface QueueSettingsRepository extends JpaRepository<QueueSettings, Long> {
}
