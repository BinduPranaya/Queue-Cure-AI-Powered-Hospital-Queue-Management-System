package com.queuecure.repository;

import com.queuecure.entity.Patient;
import com.queuecure.entity.PatientStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface PatientRepository extends JpaRepository<Patient, Long> {

    /** All patients currently in WAITING state, ordered by token number ascending. */
    List<Patient> findByStatusOrderByTokenNumberAsc(PatientStatus status);

    /** The single patient (if any) who is currently being consulted. */
    Optional<Patient> findByStatus(PatientStatus status);

    long countByStatus(PatientStatus status);

    /** Number of WAITING patients whose token number is less than the given token (i.e. ahead in queue). */
    @Query("SELECT COUNT(p) FROM Patient p WHERE p.status = 'WAITING' AND p.tokenNumber < :tokenNumber")
    long countWaitingAheadOf(@Param("tokenNumber") Integer tokenNumber);

    Optional<Patient> findByTokenNumber(Integer tokenNumber);

    /** All patients created on or after the given timestamp - used for "today" analytics. */
    List<Patient> findByCreatedAtGreaterThanEqual(LocalDateTime since);

    long countByCreatedAtGreaterThanEqual(LocalDateTime since);

    long countByStatusAndCreatedAtGreaterThanEqual(PatientStatus status, LocalDateTime since);
}
