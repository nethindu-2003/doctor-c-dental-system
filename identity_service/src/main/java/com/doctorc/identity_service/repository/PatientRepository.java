package com.doctorc.identity_service.repository;

import com.doctorc.identity_service.entity.Patient;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface PatientRepository extends JpaRepository<Patient, Integer> {
    Optional<Patient> findByEmail(String email);
    Optional<Patient> findByVerificationToken(String verificationToken); // Matches field name
    Optional<Patient> findByResetToken(String resetToken);
    boolean existsByEmail(String email);
}