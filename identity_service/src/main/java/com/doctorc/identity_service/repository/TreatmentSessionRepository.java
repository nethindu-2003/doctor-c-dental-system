package com.doctorc.identity_service.repository;

import com.doctorc.identity_service.entity.TreatmentSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface TreatmentSessionRepository extends JpaRepository<TreatmentSession, Integer> {
    // Get the most recent session for a treatment
    Optional<TreatmentSession> findFirstByTreatmentTreatmentIdOrderByUpdatedAtDesc(Integer treatmentId);

    // Get all sessions for a treatment ordered by date
    List<TreatmentSession> findByTreatmentTreatmentIdOrderBySessionDateDesc(Integer treatmentId);
}