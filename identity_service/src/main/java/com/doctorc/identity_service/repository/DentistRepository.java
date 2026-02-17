package com.doctorc.identity_service.repository;

import com.doctorc.identity_service.entity.Dentist;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface DentistRepository extends JpaRepository<Dentist, Integer> {
    Optional<Dentist> findByEmail(String email);
    Optional<Dentist> findByResetToken(String resetToken);
    Optional<Dentist> findByVerificationToken(String verificationToken);
}