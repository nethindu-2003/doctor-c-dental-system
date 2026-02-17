package com.doctorc.identity_service.service;

import com.doctorc.identity_service.entity.Patient;
import com.doctorc.identity_service.entity.Payment;
import com.doctorc.identity_service.repository.PatientRepository;
import com.doctorc.identity_service.repository.PaymentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class PaymentService {

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private PatientRepository patientRepository;

    public List<Payment> getPatientPaymentHistory(Integer patientId) {
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new RuntimeException("Patient not found"));

        return paymentRepository.findByPatientOrderByPaymentDateDesc(patient);
    }
}