package com.doctorc.identity_service.repository;

import com.doctorc.identity_service.entity.Patient;
import com.doctorc.identity_service.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface PaymentRepository extends JpaRepository<Payment, Integer> {
    // Get all payments for a user, newest first
    List<Payment> findByPatientOrderByPaymentDateDesc(Patient patient);
}