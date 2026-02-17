package com.doctorc.identity_service.repository;

import com.doctorc.identity_service.entity.Patient;
import com.doctorc.identity_service.entity.Treatment;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface TreatmentRepository extends JpaRepository<Treatment, Integer> {
    // Find all treatments for a specific patient, ordered by start date (newest first)
    List<Treatment> findByPatientOrderByStartDateDesc(Patient patient);
}