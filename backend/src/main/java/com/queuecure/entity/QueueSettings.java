package com.queuecure.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Singleton-style settings row that tracks the current state of the queue:
 * the average consultation time used for ETA calculations, the token
 * currently being served, and the last token number generated.
 *
 * In practice only one row of this table is expected to exist (id = 1),
 * functioning as the global queue configuration / state holder.
 */
@Entity
@Table(name = "queue_settings")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QueueSettings {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Average time (in minutes) it takes to consult one patient. */
    @Column(nullable = false)
    private Integer averageConsultationTime;

    /**
     * The token number currently being consulted (i.e. status = CURRENT).
     * Null / 0 indicates no patient is currently being served.
     */
    @Column(nullable = false)
    private Integer currentToken;

    /** The most recently generated token number, used to derive the next one. */
    @Column(nullable = false)
    private Integer lastGeneratedToken;
}
