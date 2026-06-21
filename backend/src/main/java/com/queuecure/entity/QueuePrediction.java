package com.queuecure.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Logs a single AI wait-time prediction made for a patient/token.
 *
 * Storing these lets us later compare predictedWaitTime against the
 * patient's actual measured wait time (once they're called) to monitor
 * and improve model accuracy - the "Predicted vs Actual" comparison.
 */
@Entity
@Table(name = "queue_predictions")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QueuePrediction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long doctorId;

    @Column(nullable = false)
    private Integer patientsAhead;

    @Column(nullable = false)
    private Integer avgConsultationTime;

    @Column(nullable = false)
    private Integer predictedWaitTime;

    /** Model confidence score, 0-100. */
    @Column
    private Integer confidence;

    /** The token this prediction was made for, for later actual-wait comparison. */
    @Column
    private Integer tokenNumber;

    @Column(nullable = false, updatable = false)
    private LocalDateTime predictionDate;

    @PrePersist
    protected void onCreate() {
        this.predictionDate = LocalDateTime.now();
    }
}
