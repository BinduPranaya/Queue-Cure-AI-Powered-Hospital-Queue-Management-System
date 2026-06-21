package com.queuecure.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Represents a doctor/counter that patients can be queued against.
 *
 * Kept intentionally minimal — Queue Cure is still fundamentally a
 * single-queue system, but a doctor + department association is needed
 * so the AI wait-time prediction service has meaningful per-doctor
 * features to learn from (different doctors naturally have different
 * average consultation speeds).
 */
@Entity
@Table(name = "doctors")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Doctor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 150)
    private String name;

    @Column(nullable = false, length = 100)
    private String department;

    /**
     * Default/expected consultation time for this doctor, in minutes.
     * Falls back to the global QueueSettings average when not set.
     */
    @Column
    private Integer averageConsultationTime;
}
