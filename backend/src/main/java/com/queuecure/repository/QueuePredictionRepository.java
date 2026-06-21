package com.queuecure.repository;

import com.queuecure.entity.QueuePrediction;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface QueuePredictionRepository extends JpaRepository<QueuePrediction, Long> {

    List<QueuePrediction> findByDoctorId(Long doctorId);

    List<QueuePrediction> findByTokenNumber(Integer tokenNumber);

    List<QueuePrediction> findByPredictionDateGreaterThanEqual(LocalDateTime since);
}
