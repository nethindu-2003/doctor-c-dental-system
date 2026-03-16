package com.doctorc.identity_service.repository;

import com.doctorc.identity_service.entity.Patient;
import com.doctorc.identity_service.entity.Treatment;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface TreatmentRepository extends JpaRepository<Treatment, Integer> {
    // Find all treatments for a specific patient, ordered by start date (newest first)
    List<Treatment> findByPatientOrderByStartDateDesc(Patient patient);

    // Assuming Treatment has a relation to Dentist and a status field (like "ONGOING" or "COMPLETED")
    List<Treatment> findByDentist_IdAndStatus(Integer dentistId, String status);

    int countByDentist_IdAndStatus(Integer dentistId, String status);

    // Fetch by Dentist & Status (For Ongoing vs Completed tabs)
    List<Treatment> findByDentist_IdAndStatusOrderByStartDateDesc(Integer dentistId, String status);

    // Filter by Patient ID for the search bar
    List<Treatment> findByDentist_IdAndStatusAndPatient_IdOrderByStartDateDesc(Integer dentistId, String status, Integer patientId);
}